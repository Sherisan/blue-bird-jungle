import { useRef } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { PERCH } from '../art/Scene';
import { birdPosition, trackRate } from '../game/engine';
import type { GameState } from '../game/types';

/**
 * Lets the player steer Azul during a flight by dragging (mouse or touch) or
 * with the arrow keys / WASD. Steering is cosmetic: the catch point is decided
 * by the round's seeds before take-off, so where Azul flies never changes the
 * result. The net simply flies to wherever Azul is when the round ends.
 */

/** Where Azul may be steered, in scene units (viewBox 0 0 1000 560). */
export const STEER_BOX = { minX: 40, maxX: 950, minY: 60, maxY: 440 };
/** Left of maxX, Azul has to stay above maxY, so it can't fly through Rato and the cage. */
const OVER_RATO = { maxX: 320, maxY: 250 };
const KEY_SPEED = 340; // scene units per second

const clampX = (v: number) => Math.max(STEER_BOX.minX, Math.min(STEER_BOX.maxX, v));
const clampY = (v: number, x: number, top: number) => Math.max(top, Math.min(x < OVER_RATO.maxX ? OVER_RATO.maxY : STEER_BOX.maxY, v));

const KEY_MAP: Record<string, 'L' | 'R' | 'U' | 'D'> = {
  ArrowLeft: 'L',
  ArrowRight: 'R',
  ArrowUp: 'U',
  ArrowDown: 'D',
  a: 'L',
  d: 'R',
  w: 'U',
  s: 'D',
  A: 'L',
  D: 'R',
  W: 'U',
  S: 'D',
};

export interface PathSample {
  x: number;
  y: number;
  t: number;
}

interface SteerState {
  x: number;
  y: number;
  tx: number;
  ty: number;
  active: boolean;
  pointer: boolean;
  keys: Set<'L' | 'R' | 'U' | 'D'>;
  face: 1 | -1;
  vy: number;
  last: number;
  nonce: number;
  phase: GameState['phase'];
  enabled: boolean;
  path: PathSample[];
  crash: { x: number; y: number } | null;
  used: boolean;
  /** Where the poacher's sight is: it chases Azul rather than sitting on it. */
  aimX: number;
  aimY: number;
  hunt: number;
}

/**
 * `aimFrom` is where the sight waits between rounds (the muzzle). With `calm` (reduced motion) the
 * sight tracks Azul directly instead of also sweeping around it. `cropTop` is how much of the sky a
 * wide stage cuts off, so Azul stays in view.
 */
export function useSteering(s: GameState, enabled = true, aimFrom: { x: number; y: number } = PERCH, calm = false, cropTop = 0) {
  const top = Math.max(STEER_BOX.minY, cropTop + 60);
  const svgRef = useRef<SVGSVGElement>(null);
  const ref = useRef<SteerState>({
    x: PERCH.x,
    y: PERCH.y,
    tx: PERCH.x,
    ty: PERCH.y,
    active: false,
    pointer: false,
    keys: new Set(),
    face: 1,
    vy: 0,
    last: 0,
    nonce: -1,
    phase: 'waiting',
    enabled: true,
    path: [],
    crash: null,
    used: false,
    aimX: aimFrom.x,
    aimY: aimFrom.y,
    hunt: 0,
  });
  const st = ref.current;
  const { phase: ph, now } = s;

  // Advance the smoothed position once per frame. dt is 0 on a repeated
  // render of the same frame, so this stays stable under React StrictMode.
  const dt = st.last ? Math.min(0.1, Math.max(0, (now - st.last) / 1000)) : 0;
  st.last = now;
  st.phase = ph;
  st.enabled = enabled;
  if (!enabled) {
    st.keys.clear();
    st.pointer = false;
  }
  if (st.nonce !== s.nonce) {
    st.nonce = s.nonce;
    st.path = [];
    st.crash = null;
  }

  if (ph === 'waiting') {
    st.x = PERCH.x;
    st.y = PERCH.y;
    st.face = 1;
    st.vy = 0;
    st.active = false;
    st.pointer = false;
    st.path = [];
    st.crash = null;
    st.aimX = aimFrom.x;
    st.aimY = aimFrom.y;
    st.hunt = 0;
  } else if (ph === 'flying') {
    const t = (now - s.t0) / 1000;
    const auto = birdPosition(s.mult, t);
    if (st.keys.size) {
      if (!st.active) {
        st.tx = st.x;
        st.ty = st.y;
      }
      st.active = true;
      st.used = true;
      const kx = (st.keys.has('R') ? 1 : 0) - (st.keys.has('L') ? 1 : 0);
      const ky = (st.keys.has('D') ? 1 : 0) - (st.keys.has('U') ? 1 : 0);
      st.tx = clampX(st.tx + kx * KEY_SPEED * dt);
      st.ty = clampY(st.ty + ky * KEY_SPEED * dt, st.tx, top);
    } else if (!st.pointer) {
      st.active = false;
    }
    const gx = st.active ? st.tx : auto.x;
    const gy = st.active ? st.ty : Math.max(top, auto.y);
    const k = 1 - Math.exp(-dt * (st.active ? 7 : 2.4));
    const nx = st.x + (gx - st.x) * k;
    const ny = st.y + (gy - st.y) * k;
    if (dt > 0) {
      const vx = (nx - st.x) / dt;
      st.vy = (ny - st.y) / dt;
      if (vx < -60) st.face = -1;
      else if (vx > 60) st.face = 1;
    }
    st.x = nx;
    st.y = ny;
    const lastSample = st.path[st.path.length - 1];
    if (!lastSample || t - lastSample.t > 0.08) st.path = [...st.path.slice(-60), { x: nx, y: ny, t }];

    // The sight chases Azul and closes faster as the multiplier climbs. It also sweeps around
    // Azul, widely at first and then tighter and quicker. None of this affects when the net fires.
    const closing = Math.min(1, Math.log(Math.max(1, s.mult)) / Math.log(8));
    st.hunt += dt * (1.6 + 3.2 * closing);
    const sweep = calm ? 0 : 12 + 52 * (1 - closing);
    const huntX = nx + Math.cos(st.hunt) * sweep;
    const huntY = ny + Math.sin(st.hunt * 1.37 + 0.6) * sweep * 0.7;
    const follow = 1 - Math.exp(-trackRate(s.mult) * dt);
    st.aimX += (huntX - st.aimX) * follow;
    st.aimY += (huntY - st.aimY) * follow;
  } else if (!st.crash) {
    // Freeze the catch where Azul actually was on screen.
    st.crash = st.path.length ? { x: st.x, y: st.y } : { x: s.crashX, y: s.crashY };
    st.active = false;
    st.pointer = false;
  }

  const toScene = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const p = pt.matrixTransform(ctm.inverse());
    const x = clampX(p.x);
    return { x, y: clampY(p.y, x, top) };
  };

  const handlers = {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      const r = ref.current;
      if (r.phase !== 'flying' || !r.enabled) return;
      if ((e.target as Element).closest('button, a, input')) return;
      const p = toScene(e.clientX, e.clientY);
      if (!p) return;
      r.pointer = true;
      r.active = true;
      r.used = true;
      r.tx = p.x;
      r.ty = p.y;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const r = ref.current;
      if (!r.pointer) return;
      const p = toScene(e.clientX, e.clientY);
      if (!p) return;
      r.tx = p.x;
      r.ty = p.y;
    },
    onPointerUp() {
      ref.current.pointer = false;
    },
    onPointerCancel() {
      ref.current.pointer = false;
    },
    onKeyDown(e: KeyboardEvent<HTMLElement>) {
      const key = KEY_MAP[e.key];
      if (!key || ref.current.phase !== 'flying' || !ref.current.enabled) return;
      e.preventDefault();
      ref.current.keys.add(key);
    },
    onKeyUp(e: KeyboardEvent<HTMLElement>) {
      const key = KEY_MAP[e.key];
      if (key) ref.current.keys.delete(key);
    },
    onBlur() {
      ref.current.keys.clear();
      ref.current.pointer = false;
    },
  };

  return {
    svgRef,
    handlers,
    x: st.x,
    y: st.y,
    face: st.face,
    tilt: Math.max(-25, Math.min(25, st.vy * 0.06)),
    path: st.path,
    crash: st.crash,
    aimX: st.aimX,
    aimY: st.aimY,
    dragging: st.pointer,
    steering: st.active,
    used: st.used,
  };
}
