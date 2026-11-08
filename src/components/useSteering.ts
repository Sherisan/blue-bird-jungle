import { useRef } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { PERCH } from '../art/Scene';
import { birdPosition } from '../game/engine';
import type { GameState } from '../game/types';

/**
 * Lets the player steer Azul during a flight by dragging (mouse or touch) or
 * with the arrow keys / WASD. Steering is cosmetic: the catch point is decided
 * by the round's seeds before take-off, so where Azul flies never changes the
 * result. The net simply flies to wherever Azul is when the round ends.
 */

/** Where Azul may be steered, in scene units (viewBox 0 0 1000 560). */
export const STEER_BOX = { minX: 300, maxX: 950, minY: 60, maxY: 440 };
const KEY_SPEED = 340; // scene units per second

const clampX = (v: number) => Math.max(STEER_BOX.minX, Math.min(STEER_BOX.maxX, v));
const clampY = (v: number) => Math.max(STEER_BOX.minY, Math.min(STEER_BOX.maxY, v));

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
}

export function useSteering(s: GameState, enabled = true) {
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
      st.ty = clampY(st.ty + ky * KEY_SPEED * dt);
    } else if (!st.pointer) {
      st.active = false;
    }
    const gx = st.active ? st.tx : auto.x;
    const gy = st.active ? st.ty : auto.y;
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
    return { x: clampX(p.x), y: clampY(p.y) };
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
    dragging: st.pointer,
    steering: st.active,
    used: st.used,
  };
}
