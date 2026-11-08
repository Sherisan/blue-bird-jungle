import { useId } from 'react';
import { Bird, Net, NetShell, type BirdState } from '../art/Bird';
import { Clouds } from '../art/Clouds';
import { MUZZLE_OFFSET, Poacher, type PoacherMood } from '../art/Poacher';
import { PERCH, SceneBank, SceneFauna, SceneForeground, SceneJungle, SceneLight, SceneSky } from '../art/Scene';
import { GUN_PIVOT, HOLD_MS, POACHER_POS, POACHER_SCALE, POACHER_TRANSFORM, WAIT_MS, aimAngle } from '../game/engine';
import { fmt, fmtX } from '../game/format';
import type { GameState } from '../game/types';
import { CloseIcon, HistoryIcon, ShieldIcon } from './icons';
import { useSteering } from './useSteering';

/** Seconds the net takes to reach the bird after the trigger. */
const NET_T = 0.28;
/** Azul's size on the stage. */
const BIRD_SCALE = 0.9;
/** Lagoon surface in scene units; reflections mirror around it. */
const WATER_Y = 456;
/** Circumference of the countdown ring (r = 52). */
const RING_LEN = 2 * Math.PI * 52;
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

function muzzleAt(aim: number) {
  const a = (aim * Math.PI) / 180;
  const x = MUZZLE_OFFSET.x * POACHER_SCALE;
  const y = MUZZLE_OFFSET.y * POACHER_SCALE;
  return { x: GUN_PIVOT.x + x * Math.cos(a) - y * Math.sin(a), y: GUN_PIVOT.y + x * Math.sin(a) + y * Math.cos(a) };
}

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
  const steer = useSteering(s, steering);
  // Where the round ended on screen: wherever Azul actually was (it may have been steered).
  const cx = steer.crash?.x ?? s.crashX;
  const cy = steer.crash?.y ?? s.crashY;
  const face = steer.face;

  // --- bird -----------------------------------------------------------------
  let bx: number, by: number, rot: number, birdState: BirdState;
  if (ph === 'waiting') {
    bx = PERCH.x;
    by = PERCH.y - 4 + Math.sin(now / 420) * 1.5;
    rot = -8;
    birdState = 'perch';
  } else if (ph === 'flying') {
    bx = steer.x;
    by = steer.y + Math.sin(t * 4.2) * 3;
    rot = -14 + steer.tilt * face;
    birdState = 'fly';
  } else {
    const f = Math.max(0, e - 0.45);
    bx = cx + f * 40 * face;
    by = Math.min(452, cy + 300 * f * f);
    rot = e < NET_T ? -14 : Math.sin(e * 7) * 14 * Math.max(0, 1 - f);
    birdState = e < NET_T ? 'fly' : 'caught';
  }
  const netOpen = ph === 'crashed' && e >= NET_T;
  const netScale = netOpen ? Math.min(1, 0.5 + (e - NET_T) * 5) : 0;

  // --- poacher --------------------------------------------------------------
  const aimBase = ph === 'waiting' ? -6 : ph === 'flying' ? aimAngle(bx, by) : aimAngle(cx, cy);
  const kick = ph === 'crashed' && e < 0.2 ? 1 - e / 0.2 : 0;
  const aim = aimBase - kick * 4;
  let mood: PoacherMood = 'idle';
  let bubble: string | null = null;
  if (ph === 'crashed') {
    mood = e < NET_T ? 'aim' : 'cheer';
    if (e > NET_T && e < 2.9) bubble = 'Gotcha!';
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
    const mz = muzzleAt(aimBase);
    const q = e / NET_T;
    shell = { x: mz.x + (cx - mz.x) * q, y: mz.y + (cy - mz.y) * q - Math.sin(q * Math.PI) * 18, r: q * 540 };
  }

  // the path Azul actually flew (steered or not)
  const trail = ph === 'waiting' ? '' : steer.path.map((q) => `${q.x.toFixed(0)},${q.y.toFixed(0)}`).join(' ');

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
  const reflect = Math.max(0, Math.min(1, 1 - (WATER_Y - by) / 260)) * 0.32;

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

  const shake = !reducedMotion && ph === 'crashed' && fe > 0 && fe < 0.4 ? 1 - fe / 0.4 : 0;
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
    sub = 'Bets close when Azul takes off';
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

  const showCurve = (ph === 'flying' && t > 1) || ph === 'crashed';
  let curve = '';
  let curveTime = '';
  let curveEnd = 1;
  let curveMax = 2;
  if (showCurve && s.points.length > 1) {
    const lp = s.points[s.points.length - 1];
    const tmax = Math.max(6, lp.t);
    const mmax = Math.max(2, lp.m);
    curveMax = mmax;
    curve = s.points
      .map((q) => `${((q.t / tmax) * 202 + 1).toFixed(1)},${(61 - (Math.log(q.m) / Math.log(mmax)) * 58).toFixed(1)}`)
      .join(' ');
    curveEnd = (lp.t / tmax) * 202 + 1;
    curveTime = `${lp.t.toFixed(1)}s`;
  }

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
          viewBox="0 0 1000 560"
          preserveAspectRatio="xMidYMax slice"
          role="img"
          aria-label="Azul the blue macaw over a moonlit jungle lagoon while Rato the poacher aims a net launcher"
        >
          <SceneSky />
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
              <g transform={`translate(${bx.toFixed(1)} ${(2 * WATER_Y - by).toFixed(1)}) scale(${face * BIRD_SCALE} ${-BIRD_SCALE}) rotate(${rot.toFixed(1)})`}>
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
          <g transform={`translate(${bx.toFixed(1)} ${by.toFixed(1)}) scale(${face * BIRD_SCALE} ${BIRD_SCALE}) rotate(${rot.toFixed(1)})`}>
            <Bird state={birdState} aura={birdState === 'fly'} />
            {netOpen && (
              <g transform={`scale(${netScale.toFixed(2)})`}>
                <Net r={46} />
              </g>
            )}
          </g>
          {ph === 'flying' && (
            <g transform={`translate(${bx.toFixed(1)} ${(by - 14).toFixed(1)})`} opacity=".85">
              <g className="reticle">
                <circle r="52" fill="none" stroke="#ff6a5c" strokeWidth="1.6" strokeDasharray="14 10" />
              </g>
              <path d="M-66 0 H-54 M54 0 H66 M0 -66 V-54 M0 54 V66" stroke="#ffd0c8" strokeWidth="2" strokeLinecap="round" />
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
          {ph === 'crashed' && fe > 0 && fe < 1.8 && (
            <g transform={`translate(${cx.toFixed(1)} ${Math.max(60, cy - 84).toFixed(1)}) rotate(-9)`}>
              <g className="stamp" opacity={Math.min(1, (1.8 - fe) * 2)}>
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
          <SceneBank />
          <ellipse cx={POACHER_POS.x + 4} cy={POACHER_POS.y - 4} rx="58" ry="7" fill="#010a0c" opacity=".45" />
          <g transform={POACHER_TRANSFORM} style={{ filter: 'drop-shadow(2px -1px 0 rgba(150, 220, 255, 0.35))' }}>
            <Poacher mood={mood} aim={aim} recoil={-9 * kick} puff={ph === 'crashed' && e < 0.5 ? e / 0.5 : -1} bubble={bubble} />
          </g>
          <SceneForeground />
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
        {ph === 'waiting' ? (
          <div className="ring" role="timer" aria-label={`Take-off in ${waitLeft.toFixed(0)} seconds`}>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <defs>
                <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fff1c4" />
                  <stop offset=".5" stopColor="#f4d78e" />
                  <stop offset="1" stopColor="#d9a23a" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="52" className="ring__track" />
              <circle
                cx="60"
                cy="60"
                r="52"
                className="ring__fill"
                strokeDasharray={RING_LEN}
                strokeDashoffset={RING_LEN * (1 - waitLeft / (WAIT_MS / 1000))}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <span className="ring__value num">{waitLeft.toFixed(1)}</span>
            <span className="ring__unit">sec</span>
          </div>
        ) : (
          <span key={`${ph}-${milestone}`} className={`stage__mult num stage__mult--${ph}${ph === 'flying' ? ` tier-${multTier(m)}${milestone > 0 ? ' bump' : ''}` : ''}`}>
            {fmtX(m)}
          </span>
        )}
        <span className="stage__sub num">{sub}</span>
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

      {showCurve && (
        <div className="curve">
          <div className="curve__head">
            <span>Flight</span>
            <span className="num">
              {curveTime} · peak {fmtX(m)}
            </span>
          </div>
          <svg width="244" height="78" viewBox="0 0 244 78" aria-hidden="true">
            <defs>
              <linearGradient id={`${clipId}-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={ph === 'crashed' ? '#ff6a5c' : '#39d0ff'} stopOpacity=".35" />
                <stop offset="1" stopColor={ph === 'crashed' ? '#ff6a5c' : '#39d0ff'} stopOpacity="0" />
              </linearGradient>
            </defs>
            <g transform="translate(38 4)">
              <line x1="0" y1="62" x2="204" y2="62" stroke="#26405a" />
              <line x1="0" y1="31" x2="204" y2="31" stroke="#1c3550" strokeDasharray="3 4" />
              <line x1="0" y1="0" x2="0" y2="62" stroke="#26405a" />
              {curve && <polygon points={`1,61 ${curve} ${curveEnd},61`} fill={`url(#${clipId}-area)`} />}
              <polyline points={curve} fill="none" stroke={ph === 'crashed' ? '#ff6a5c' : '#f4d78e'} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
            </g>
            <text x="34" y="10" textAnchor="end" className="curve__axis">
              {fmtX(curveMax)}
            </text>
            <text x="34" y="68" textAnchor="end" className="curve__axis">
              1×
            </text>
          </svg>
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
