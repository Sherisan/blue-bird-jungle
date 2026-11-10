import { useEffect, useId, useRef, useState } from 'react';
import { Bird, Net, NetShell, type BirdState } from '../art/Bird';
import { Cage, LOCK_POINT } from '../art/Cage';
import { Clouds } from '../art/Clouds';
import { MUZZLE_OFFSET, Poacher, type PoacherMood } from '../art/Poacher';
import { PERCH, SceneBank, SceneFauna, SceneForeground, SceneJungle, SceneLight, SceneNearShore, SceneSky } from '../art/Scene';
import { captureFrame, type CageSpot } from '../game/capture';
import {
  CAPTURE,
  HOLD_MS,
  POACHER_POS,
  POACHER_SCALE,
  POACHER_SCALE_WIDE,
  WAIT_MS,
  aimAngle,
  gunPivot,
  poacherTransform,
  sightRadius,
} from '../game/engine';
import { fmt, fmtX } from '../game/format';
import type { GameState } from '../game/types';
import { CloseIcon, HistoryIcon, ShieldIcon } from './icons';
import { useSteering } from './useSteering';

/** The scene's size in scene units (its viewBox). */
const SCENE_W = 1000;
const SCENE_H = 560;
/** Phones see the whole scene plus a strip of near shore below it, and sky above for the read-outs. */
const PHONE_H = 680;
/** Seconds the net takes to reach the bird after the trigger. */
const NET_T = CAPTURE.net;
/** The top of the branch under Azul's feet, and how far below its body its feet are at full size. */
const BRANCH_Y = 418.5;
const BIRD_FEET = 25;
/** Lagoon surface in scene units; reflections mirror around it. */
const WATER_Y = 456;
/** Where the cage stands: in front of Rato and under his gun. */
const CAGE_WIDE: CageSpot = { x: 262, y: 534, k: 0.78 };
const CAGE_PHONE: CageSpot = { x: 384, y: 546, k: 1.05 };
const SPARK = 'M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z';
/** The multiplier bumps when it passes each of these. */
const MILESTONES = [2, 3, 5, 10, 25, 50, 100, 250, 500, 1000];

function multTier(m: number) {
  if (m >= 10) return 3;
  if (m >= 5) return 2;
  if (m >= 2) return 1;
  return 0;
}

function historyTone(m: number) {
  if (m < 2) return 'pill--low';
  if (m >= 10) return 'pill--high';
  return 'pill--mid';
}

function muzzleAt(aim: number, k: number) {
  const a = (aim * Math.PI) / 180;
  const x = MUZZLE_OFFSET.x * k;
  const y = MUZZLE_OFFSET.y * k;
  const pivot = gunPivot(k);
  return { x: pivot.x + x * Math.cos(a) - y * Math.sin(a), y: pivot.y + x * Math.sin(a) + y * Math.cos(a) };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (v: number) => {
  const c = Math.max(0, Math.min(1, v));
  return c * c * (3 - 2 * c);
};
/** Overshoots a little and settles: 0 to 1. */
const easeOutBack = (v: number) => 1 + 2.70158 * (v - 1) ** 3 + 1.70158 * (v - 1) ** 2;

interface StageProps {
  s: GameState;
  onDismissToast: () => void;
  onOpenFairness: () => void;
  reducedMotion?: boolean;
  steering?: boolean;
}

export function Stage({ s, onDismissToast, onOpenFairness, reducedMotion = false, steering = true }: StageProps) {
  const clipId = useId().replace(/:/g, '') + '-water';
  const { phase: ph, now, mult: m } = s;
  const t = ph === 'flying' ? (now - s.t0) / 1000 : 0;
  const e = ph === 'crashed' ? (now - s.crashAt) / 1000 : 0;
  const waitLeft = Math.max(0, (s.waitEnd - now) / 1000);
  // Three ways to fit the scene, as in Duck Season: a wide stage fills the frame and crops some sky,
  // a slightly taller one shows the whole scene, and a phone also shows near shore and extra sky.
  const [fit, setFit] = useState<'slice' | 'meet' | 'phone'>('slice');
  // the scene y of the top of the stage on taller stages, where the night sky starts
  const [skyTop, setSkyTop] = useState(0);
  // how much sky a wide stage cuts off the top of the scene
  const [cropTop, setCropTop] = useState(0);
  const wide = fit !== 'phone';
  const hk = wide ? POACHER_SCALE_WIDE : POACHER_SCALE;
  const dk = wide ? 0.9 : 1.1;
  const cage = wide ? CAGE_WIDE : CAGE_PHONE;
  const steer = useSteering(s, steering, muzzleAt(-10, hk), reducedMotion, cropTop);
  useEffect(() => {
    const svg = steer.svgRef.current;
    if (!svg) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const r = width > 0 ? height / width : 0;
      const phone = r > PHONE_H / SCENE_W;
      setFit(phone ? 'phone' : r > SCENE_H / SCENE_W ? 'meet' : 'slice');
      setSkyTop(phone ? Math.floor(PHONE_H - r * SCENE_W) : r > SCENE_H / SCENE_W ? Math.floor(SCENE_H - r * SCENE_W) : 0);
      setCropTop(r > 0 && r < SCENE_H / SCENE_W ? Math.ceil(SCENE_H - r * SCENE_W) : 0);
    });
    ro.observe(svg);
    return () => ro.disconnect();
  }, [steer.svgRef]);
  // Where the round ended on screen: wherever Azul actually was (it may have been steered).
  const cx = steer.crash?.x ?? s.crashX;
  const cy = steer.crash?.y ?? s.crashY;
  const face = steer.face;
  const waitT = (now - (s.waitEnd - WAIT_MS)) / 1000;
  const cap = ph === 'crashed' ? captureFrame(e, { x: cx, y: cy }, cage, dk, face) : null;

  // --- bird -----------------------------------------------------------------
  let bx: number, by: number, rot: number, birdState: BirdState;
  let birdScale = dk;
  let birdFace: number = face;
  if (cap) {
    bx = cap.x;
    by = cap.y;
    rot = cap.rot;
    birdState = cap.state;
    birdScale = cap.scale;
    birdFace = cap.face;
  } else if (ph === 'waiting') {
    bx = PERCH.x;
    by = BRANCH_Y - BIRD_FEET * dk + Math.sin(now / 420) * 1.5;
    rot = -8;
    birdState = 'perch';
    // a fresh bird pops onto the branch at the start of each round
    birdScale = dk * easeOutBack(Math.max(0, Math.min(1, waitT / 0.35)));
  } else {
    bx = steer.x;
    by = steer.y + Math.sin(t * 4.2) * 3;
    rot = -14 + steer.tilt * face;
    birdState = 'fly';
  }
  const netOpen = !!cap && cap.netScale > 0 && cap.netAlpha > 0;

  // the cage's door swings back open for the next round
  const cageDoor = cap ? cap.door : ph === 'waiting' ? Math.max(0, Math.min(1, waitT / 0.5)) : 1;
  const lockT = cap ? e - CAPTURE.lock : -1;

  // --- the sight ------------------------------------------------------------
  // it chases Azul through the flight, and snaps on as the net flies
  const snap = ph === 'crashed' ? smooth((e / NET_T) * 1.5) : 0;
  const sightX = lerp(steer.aimX, cx, snap);
  const sightY = lerp(steer.aimY, cy, snap);
  const ring = sightRadius(Math.max(1, m));
  const showSight = ph === 'flying' || (ph === 'crashed' && e < NET_T);

  // --- poacher --------------------------------------------------------------
  const aimTarget =
    ph === 'waiting'
      ? -10
      : ph === 'flying'
        ? aimAngle(sightX, sightY, hk)
        : e < NET_T
          ? aimAngle(cx, cy, hk)
          : e < CAPTURE.reel
            ? aimAngle(bx, by, hk, -58, 22)
            : -12;
  // the gun swings to its target rather than jumping there
  const aimRef = useRef({ angle: -10, at: 0 });
  const aimDt = aimRef.current.at ? Math.min(0.1, Math.max(0, (now - aimRef.current.at) / 1000)) : 0;
  aimRef.current.at = now;
  aimRef.current.angle += (aimTarget - aimRef.current.angle) * (1 - Math.exp(-aimDt * (ph === 'crashed' && e < NET_T ? 40 : 16)));
  const aimBase = aimRef.current.angle;
  const kick = ph === 'crashed' && e < 0.2 ? 1 - e / 0.2 : 0;
  const aim = aimBase - kick * 4;
  let mood: PoacherMood = 'idle';
  let bubble: string | null = null;
  if (ph === 'crashed') {
    if (e < CAPTURE.shut) {
      mood = 'aim';
      if (e > NET_T) bubble = 'Gotcha!';
    } else {
      mood = 'cheer';
      if (e > CAPTURE.lock) bubble = 'Locked up!';
    }
  } else if (ph === 'flying') {
    const sinceCash = (now - s.lastCashAt) / 1000;
    if (s.lastCashAt > s.t0 && sinceCash < 1.5) {
      mood = 'annoyed';
      bubble = 'Come back here!';
    } else mood = 'aim';
  }

  // net shell in flight
  let shell: { x: number; y: number; r: number } | null = null;
  if (ph === 'crashed' && e < NET_T) {
    const mz = muzzleAt(aimAngle(cx, cy, hk), hk);
    const q = e / NET_T;
    shell = { x: mz.x + (cx - mz.x) * q, y: mz.y + (cy - mz.y) * q - Math.sin(q * Math.PI) * 18, r: q * 540 };
  }

  // the line from the gun to the net: pays out behind the shell, goes taut, then winds back in
  let line: { d: string; end: { x: number; y: number } } | null = null;
  if (cap && cap.line > 0) {
    const mz = muzzleAt(aim, hk);
    const gapX = mz.x - bx;
    const gapY = mz.y - by;
    const gap = Math.hypot(gapX, gapY) || 1;
    const reach = Math.min(gap, 50 * birdScale);
    const tipX = shell ? shell.x : bx + (gapX / gap) * reach;
    const tipY = shell ? shell.y : by + (gapY / gap) * reach;
    const endX = lerp(mz.x, tipX, cap.line);
    const endY = lerp(mz.y, tipY, cap.line);
    const hum = cap.crank !== undefined ? Math.sin(now / 16) * 1.2 : 0;
    const sag = 4 + cap.slack * 52;
    line = {
      d: `M${mz.x.toFixed(1)} ${mz.y.toFixed(1)} Q${((mz.x + endX) / 2).toFixed(1)} ${((mz.y + endY) / 2 + sag + hum).toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`,
      end: { x: endX, y: endY },
    };
  }

  // the path Azul actually flew (steered or not)
  const trail = ph === 'flying' || (ph === 'crashed' && e < NET_T) ? steer.path.map((q) => `${q.x.toFixed(0)},${q.y.toFixed(0)}`).join(' ') : '';

  // sparkle trail behind Azul while flying
  const sparks =
    ph === 'flying'
      ? steer.path.slice(-16, -1).map((q, i) => {
          const age = t - q.t;
          return {
            x: q.x - face * (40 + age * 46) + Math.sin(i * 12.9) * 10,
            y: q.y + 18 + age * 34 + Math.cos(i * 7.3) * 10,
            o: Math.max(0, 1 - age / 1.8),
            k: 0.8 + ((i * 7) % 5) / 5,
            c: i % 3 === 0 ? '#ffd23f' : '#bff4ff',
          };
        })
      : [];
  // only over the lagoon: once Azul is hauled over the bank there is no water beneath it
  const reflect = bx > 470 && !cap?.inside ? Math.max(0, Math.min(1, 1 - (WATER_Y - by) / 260)) * 0.32 : 0;

  const milestone = ph === 'flying' ? MILESTONES.filter((k) => m >= k).length : 0;
  const fe = e - NET_T;
  const feathers =
    ph === 'crashed' && fe > 0 && fe < 1.6
      ? Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2 + 0.4;
          return {
            x: cx + Math.cos(a) * fe * 90,
            y: cy + Math.sin(a) * fe * 55 + fe * fe * 60,
            r: i * 40 + fe * 240,
            o: Math.max(0, 1 - fe / 1.6),
            c: i % 3 === 0 ? '#ffd23f' : '#3a8dff',
          };
        })
      : [];

  // the screen jolts as the net lands, and again when the cage door slams and the padlock snaps
  const slamT = e - CAPTURE.shut;
  const jolt = (at: number, len: number, strength: number) => (at > 0 && at < len ? (1 - at / len) * strength : 0);
  const shake = !reducedMotion && ph === 'crashed' ? Math.max(jolt(fe, 0.4, 1), jolt(slamT, 0.24, 0.6), jolt(lockT, 0.18, 0.4)) : 0;
  const shakeX = shake ? (Math.random() - 0.5) * 14 * shake : 0;
  const shakeY = shake ? (Math.random() - 0.5) * 10 * shake : 0;
  const danger = ph === 'flying' ? Math.min(0.42, (Math.log(m) / Math.log(60)) * 0.42) : 0;

  // --- overlay copy ---------------------------------------------------------
  const live = s.slots.filter((x) => x.bet && x.bet.cashedAt === null);
  const placed = ph === 'waiting' ? s.slots.reduce((sum, x) => sum + (x.bet?.amount ?? 0), 0) : 0;
  const stake = live.reduce((sum, x) => sum + (x.bet?.amount ?? 0), 0);
  let kicker: string, kickerClass: string, sub: string;
  if (ph === 'waiting') {
    kicker = 'Place your bets';
    kickerClass = 'kicker--gold';
    sub = `Azul takes off in ${waitLeft.toFixed(1)}s`;
  } else if (ph === 'flying') {
    kicker = 'Bird in flight';
    kickerClass = 'kicker--game';
    sub = live.length ? `Your ${fmt(stake)} is worth ${fmt(stake * m)}` : 'Watching this round';
  } else {
    kicker = 'Caught at';
    kickerClass = 'kicker--loss';
    sub = `Next round in ${Math.max(0, HOLD_MS / 1000 - e).toFixed(1)}s`;
  }
  const results = ph === 'waiting' ? [] : s.slots.filter((x) => x.result).map((x) => x.result!);

  const be = (now - s.burstAt) / 1300;
  const coins =
    s.burstAt && be >= 0 && be < 1
      ? Array.from({ length: 16 }, (_, j) => {
          const a = (j / 16) * Math.PI * 2 + 0.3;
          const d = (70 + (j % 4) * 30) * Math.min(1, be * 2.4);
          return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.7 + 240 * be * be, o: 1 - be, r: (j * 47 + be * 720) % 360 };
        })
      : [];
  const cel = s.celebrate && now - s.celebrate.at < 3000 ? s.celebrate : null;

  const cageTransform = `translate(${cage.x} ${cage.y}) scale(${cage.k})`;
  const birdNode = (
    <g transform={`translate(${bx.toFixed(1)} ${by.toFixed(1)}) scale(${(birdFace * birdScale).toFixed(3)} ${birdScale.toFixed(3)}) rotate(${rot.toFixed(1)})`}>
      <Bird state={birdState} aura={birdState === 'fly'} />
      {netOpen && cap && (
        <g transform={`translate(14 -6) scale(${cap.netScale.toFixed(2)})`} opacity={cap.netAlpha.toFixed(2)}>
          <Net r={60} />
        </g>
      )}
    </g>
  );

  return (
    <section
      className={`stage${ph === 'flying' ? ' stage--steerable' : ''}${steer.dragging ? ' is-dragging' : ''}`}
      aria-label="Game stage. During a flight, drag Azul or use the arrow keys to steer."
      tabIndex={0}
      {...steer.handlers}
    >
      <div className="stage__camera" style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
        <svg
          ref={steer.svgRef}
          className="stage__svg"
          viewBox={`0 0 ${SCENE_W} ${fit === 'phone' ? PHONE_H : SCENE_H}`}
          preserveAspectRatio={`xMidYMax ${fit === 'slice' ? 'slice' : 'meet'}`}
          role="img"
          aria-label="Azul the blue macaw over a moonlit jungle lagoon while Rato the poacher aims a net launcher"
        >
          <SceneSky top={skyTop} />
          <Clouds x={s.cloudX} />
          <SceneFauna />
          <SceneJungle />
          <SceneLight />
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y={WATER_Y} width="1000" height={560 - WATER_Y} />
            </clipPath>
          </defs>
          {reflect > 0.01 && (
            <g clipPath={`url(#${clipId})`} opacity={reflect} style={{ filter: 'blur(1.2px)' }}>
              <g transform={`translate(${bx.toFixed(1)} ${(2 * WATER_Y - by).toFixed(1)}) scale(${(birdFace * birdScale).toFixed(3)} ${(-birdScale).toFixed(3)}) rotate(${rot.toFixed(1)})`}>
                <Bird state={birdState} />
              </g>
            </g>
          )}
          {trail && (
            <polyline points={trail} fill="none" stroke="#8fe6ff" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" opacity=".6" />
          )}
          {ph === 'flying' && m > 3 && (
            <g stroke="#dff7ff" strokeLinecap="round" opacity={Math.min(0.6, (m - 3) / 10)}>
              <path d={`M${bx - 90} ${by - 6} h-40 M${bx - 84} ${by + 8} h-56 M${bx - 96} ${by + 20} h-30`} strokeWidth="2" />
            </g>
          )}
          {sparks.map((p, i) => (
            <path
              key={i}
              d={SPARK}
              fill={p.c}
              stroke="#ffffff"
              strokeWidth=".8"
              opacity={p.o}
              style={{ filter: 'drop-shadow(0 0 4px #7fdcff)' }}
              transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${(p.k * (0.4 + p.o)).toFixed(2)}) rotate(${(i * 30 + t * 120).toFixed(0)})`}
            />
          ))}
          <SceneBank />
          <SceneNearShore />
          <g transform={cageTransform}>
            <Cage part="back" swing={cap?.swing ?? 0} />
          </g>
          {cap?.inside && birdNode}
          <g transform={cageTransform}>
            <Cage part="front" door={cageDoor} lock={cap?.lock ?? 0} />
          </g>
          {!cap?.inside && birdNode}
          {showSight && (
            <g transform={`translate(${sightX.toFixed(1)} ${sightY.toFixed(1)})`} opacity=".92">
              <g className="reticle">
                <circle r="52" fill="none" stroke="rgba(5, 8, 16, 0.45)" strokeWidth="5" strokeDasharray="56 25.7" />
                <circle r="52" fill="none" stroke="#ff6a5c" strokeWidth="2.2" strokeDasharray="56 25.7" />
              </g>
              <circle r={ring.toFixed(1)} fill="none" stroke="rgba(5, 8, 16, 0.4)" strokeWidth="4" />
              <circle r={ring.toFixed(1)} fill="none" stroke="#ffd0c8" strokeWidth="1.3" />
              <g strokeLinecap="round">
                <path d="M-66 0 H-20 M20 0 H66 M0 -66 V-20 M0 20 V66" stroke="rgba(5, 8, 16, 0.45)" strokeWidth="4" />
                <path d="M-66 0 H-20 M20 0 H66 M0 -66 V-20 M0 20 V66" stroke="#ffd0c8" strokeWidth="1.6" />
              </g>
              <circle r="2.4" fill="#ff6a5c" />
            </g>
          )}
          {line && (
            <g fill="none" strokeLinecap="round">
              <path d={line.d} stroke="#20180a" strokeOpacity=".75" strokeWidth="4.4" />
              <path d={line.d} stroke="#e6d6a4" strokeWidth="2.4" />
              <path d={line.d} stroke="#8a6a34" strokeWidth="2.4" strokeDasharray="3 4" />
              {!shell && <circle cx={line.end.x.toFixed(1)} cy={line.end.y.toFixed(1)} r="5" fill="#d6b06a" stroke="#20180a" strokeWidth="1.4" />}
            </g>
          )}
          {shell && (
            <g transform={`translate(${shell.x.toFixed(1)} ${shell.y.toFixed(1)}) rotate(${shell.r.toFixed(0)})`}>
              <NetShell />
            </g>
          )}
          {feathers.map((f, i) => (
            <g key={i} transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${f.r.toFixed(0)})`} opacity={f.o}>
              <path d="M-10 0 C-4 -5 6 -5 11 0 C6 4 -4 4 -10 0 Z" fill={f.c} />
              <path d="M-10 0 L11 0" stroke="#0c2470" strokeWidth="1" />
            </g>
          ))}
          {ph === 'crashed' && fe > 0 && fe < 1.3 && (
            <g transform={`translate(${cx.toFixed(1)} ${Math.max(cropTop + 52, cy - 84).toFixed(1)}) rotate(-9)`}>
              <g className="stamp" opacity={Math.min(1, (1.3 - fe) * 3)}>
                <rect x="-74" y="-24" width="148" height="46" rx="9" fill="rgba(40,6,6,.55)" stroke="#ff6a5c" strokeWidth="3" />
                <text y="10" textAnchor="middle" fontFamily="Oxanium, sans-serif" fontWeight="800" fontSize="28" letterSpacing="2" fill="#ff8d82">
                  CAUGHT!
                </text>
              </g>
            </g>
          )}
          {ph === 'crashed' && fe > 0 && fe < 0.7 && (
            <circle cx={cx} cy={cy} r={14 + fe * 120} fill="none" stroke="#dff7ff" strokeWidth="3" opacity={1 - fe / 0.7} />
          )}
          {lockT > 0 && lockT < 0.55 && (
            <g transform={`translate(${(cage.x + LOCK_POINT.x * cage.k).toFixed(1)} ${(cage.y + LOCK_POINT.y * cage.k).toFixed(1)})`}>
              <circle r={8 + lockT * 90} fill="none" stroke="#fff1c4" strokeWidth="3" opacity={1 - lockT / 0.55} />
              <path d={SPARK} fill="#fff6d2" transform={`scale(${(2.6 * (1 - lockT / 0.55) + 0.6).toFixed(2)}) rotate(${(lockT * 200).toFixed(0)})`} />
            </g>
          )}
          {lockT > 0 && (
            <g transform={`translate(${cage.x} ${Math.max(70, cage.y - 186 * cage.k).toFixed(1)}) rotate(-6)`}>
              <g className="stamp">
                <rect x="-70" y="-21" width="140" height="40" rx="9" fill="rgba(36,24,4,.68)" stroke="#f4d78e" strokeWidth="2.8" />
                <text y="8" textAnchor="middle" fontFamily="Oxanium, sans-serif" fontWeight="800" fontSize="23" letterSpacing="2" fill="#ffe7a8">
                  LOCKED!
                </text>
              </g>
            </g>
          )}
          <ellipse cx={POACHER_POS.x + 8} cy={POACHER_POS.y - 2} rx={80 * hk + 14} ry="7" fill="#010a0c" opacity=".45" />
          <g transform={poacherTransform(hk)} style={{ filter: 'drop-shadow(2px -1px 0 rgba(150, 220, 255, 0.35))' }}>
            <Poacher
              mood={mood}
              aim={aim}
              recoil={-9 * kick + (cap?.crank !== undefined ? -1.6 * Math.abs(Math.sin((cap.crank * Math.PI) / 180)) : 0)}
              puff={ph === 'crashed' && e < 0.5 ? e / 0.5 : -1}
              bubble={bubble}
              bubbleScale={wide ? 0.72 / hk : 1.5}
              reel={cap?.crank}
              noCage
            />
          </g>
          <SceneForeground canopy={fit === 'slice'} />
        </svg>
      </div>

      <div className="stage__vignette" aria-hidden="true" />
      <div className="stage__danger" aria-hidden="true" style={{ opacity: danger }} />
      <div className="stage__flash" aria-hidden="true" style={{ opacity: !reducedMotion && ph === 'crashed' && fe > 0 && fe < 0.2 ? 0.35 * (1 - fe / 0.2) : 0 }} />
      <div className="hud-corners" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="stage__top">
        <span className="stage__icon">
          <HistoryIcon size={16} />
        </span>
        <div className="stage__history">
          {s.history.length === 0 && <span className="stage__hint">Round results appear here</span>}
          {s.history.slice(0, 14).map((h, i) => (
            <span key={`${s.nonce}-${i}`} className={`pill num ${historyTone(h)}`}>
              {fmtX(h)}
            </span>
          ))}
        </div>
        <button className="stage__round num" onClick={onOpenFairness} title="Provably fair: see this round's seeds">
          <ShieldIcon size={14} /> Round #{s.nonce}
        </button>
      </div>

      <div className="stage__center">
        <span className={`stage__kicker ${kickerClass}`}>{kicker}</span>
        <span key={`${ph}-${milestone}`} className={`stage__mult num stage__mult--${ph}${ph === 'flying' ? ` tier-${multTier(m)}${milestone > 0 ? ' bump' : ''}` : ''}`}>
          {ph === 'waiting' ? '1.00×' : fmtX(m)}
        </span>
        {ph === 'waiting' && (
          <div className="countdown" aria-hidden="true">
            <div className="countdown__fill" style={{ width: `${100 - (waitLeft / (WAIT_MS / 1000)) * 100}%` }} />
          </div>
        )}
        <span className="stage__sub num">{sub}</span>
      </div>

      <div className="gauge">
        <span className="gauge__label">Altitude</span>
        <div className="gauge__track">
          <div className="gauge__fill" style={{ width: `${Math.min(100, (Math.log(Math.max(1, m)) / Math.log(100)) * 100)}%` }} />
          <span className="gauge__tick" style={{ left: '15%' }} />
          <span className="gauge__tick" style={{ left: '50%' }} />
        </div>
        <span className="gauge__scale num">2× · 10× · 100×</span>
      </div>

      {coins.map((c, i) =>
        i % 3 === 0 ? (
          <svg
            key={i}
            className="coin-burst"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ left: `calc(50% + ${c.x - 13}px)`, top: `calc(26% + ${c.y}px)`, opacity: c.o, transform: `rotate(${c.r}deg)` }}
          >
            <path d="M19 3 C10 4 5 10 5 19 C12 19 18 13 19 3 Z" fill={i % 2 ? '#ffd23f' : '#3a8dff'} />
            <path d="M5 19 L15 8" stroke="#0c2470" strokeWidth="1.2" />
          </svg>
        ) : (
        <svg
          key={i}
          className="coin-burst"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          aria-hidden="true"
          style={{ left: `calc(50% + ${c.x - 11}px)`, top: `calc(26% + ${c.y}px)`, opacity: c.o, transform: `rotate(${c.r}deg)` }}
        >
          <circle cx="11" cy="11" r="10" fill="#e9c46a" stroke="#8a6420" strokeWidth="1.4" />
          <circle cx="11" cy="11" r="6.4" fill="none" stroke="#fff1c4" strokeWidth="1.2" />
          <circle cx="8" cy="7" r="1.6" fill="#fff8de" />
        </svg>
        ),
      )}

      {cel && (
        <div className="celebrate" aria-live="polite">
          <svg className="celebrate__rays" width="440" height="440" viewBox="0 0 420 420" aria-hidden="true">
            <g fill="#f4d78e" opacity=".35">
              {Array.from({ length: 8 }, (_, i) => (
                <path key={i} d="M210 210 L200 0 L220 0 Z" transform={`rotate(${i * 45} 210 210)`} />
              ))}
            </g>
          </svg>
          <div className="celebrate__plaque">
            <span className="celebrate__label">{cel.label}</span>
            <span className="celebrate__total num">+{fmt(cel.total * Math.min(1, (now - cel.at) / 1000))}</span>
            <span className="celebrate__at">collected at {fmtX(cel.mult)}</span>
          </div>
        </div>
      )}

      {s.toast && (
        <div className="stage__toast" role="status">
          <span>{s.toast}</span>
          <button className="icon-btn icon-btn--sm" aria-label="Dismiss" onClick={onDismissToast}>
            <CloseIcon size={16} />
          </button>
        </div>
      )}

      {ph === 'flying' && steering && !steer.used && (
        <div className="steer-hint" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />
          </svg>
          <span>
            Drag or use the arrow keys to steer Azul. <em>For fun: the catch point is fixed at take-off.</em>
          </span>
        </div>
      )}

      <div className="hud-bl" aria-live="polite">
        {results.map((r, i) => (
          <span key={i} className={`result num ${r.win ? 'result--win' : 'result--loss'}`}>
            {r.text}
          </span>
        ))}
      {(placed > 0 || ph === 'flying') && (
        <div className="stakebar num">
          {ph === 'flying' && live.length > 0 ? (
            <>
              <span className="stakebar__label">In play</span>
              <strong>{fmt(stake)}</strong>
              <span className="stakebar__arrow" aria-hidden="true">
                →
              </span>
              <strong className="stakebar__value">{fmt(stake * m)}</strong>
            </>
          ) : ph === 'flying' ? (
            <span className="stakebar__label">No open bets this round</span>
          ) : (
            <>
              <span className="stakebar__label">Bets placed</span>
              <strong>{fmt(placed)}</strong>
            </>
          )}
        </div>
      )}
      </div>
    </section>
  );
}
