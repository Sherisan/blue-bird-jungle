import type { BirdState } from '../art/Bird';
import { CAPTURE } from './engine';

/** Where the cage stands: the centre of its base in scene units, and its scale. */
export interface CageSpot {
  x: number;
  y: number;
  k: number;
}

export interface CaptureFrame {
  x: number;
  y: number;
  rot: number;
  scale: number;
  /** 1 faces right, -1 left; passes through 0 as Azul turns in the cage. */
  face: number;
  state: BirdState;
  netScale: number;
  netAlpha: number;
  /** Bird is past the door, so it draws behind the bars. */
  inside: boolean;
  door: number;
  lock: number;
  swing: number;
  /** Winch turned so far, in degrees; undefined once the line is released. */
  crank: number | undefined;
  /** Fraction of the line still reaching the net (1 = taut to the net, 0 = fully wound in). */
  line: number;
  /** How slack the line hangs, 0..1. */
  slack: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => v * v * (3 - 2 * v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Azul's size on the swing, relative to the cage. */
const SEAT_SCALE = 0.62;
/** Height of the swing bar and of its hanging point, above the cage's base. */
const SWING_Y = 36;
const SWING_PIVOT_Y = 120;

/** The pull comes in three hauls on the line, with a beat between each. */
function haul(t: number) {
  if (t >= 1) return 1;
  const s = t * 3;
  const i = Math.floor(s);
  return (i + smooth(s - i)) / 3;
}

/** The whole catch, from the net's arrival to the padlock, as a function of seconds since the round ended. */
export function captureFrame(e: number, from: { x: number; y: number }, spot: CageSpot, birdScale: number, face: number): CaptureFrame {
  const C = CAPTURE;
  const k = spot.k;
  const reelT = clamp01((e - C.wrap) / (C.reel - C.wrap));
  const inT = clamp01((e - C.reel) / (C.inside - C.reel));
  const q = haul(reelT);

  // pulled along a sagging curve to a point right in front of the open door
  const mouth = { x: spot.x, y: spot.y - 50 * k };
  const ctrl = { x: lerp(from.x, mouth.x, 0.55), y: Math.min(500, Math.max(from.y, mouth.y) + 26) };
  const r = 1 - q;
  const px = r * r * from.x + 2 * r * q * ctrl.x + q * q * mouth.x;
  const py = r * r * from.y + 2 * r * q * ctrl.y + q * q * mouth.y;

  // then stuffed in and set on the swing, leaning back with its tail hanging down
  const settle = smooth(inT);
  const rotIn = -40;
  const lean = (rotIn * Math.PI) / 180;
  const seat = {
    x: spot.x + 25 * SEAT_SCALE * Math.sin(lean) * k,
    y: spot.y - (SWING_Y + 25 * SEAT_SCALE * Math.cos(lean)) * k,
  };
  const swingT = Math.max(0, e - C.inside);
  const swing = e < C.inside ? 0 : Math.sin(swingT * 5.4) * 7 * Math.exp(-swingT * 0.9);
  const a = (-swing * Math.PI) / 180;
  const arm = seat.y - (spot.y - SWING_PIVOT_Y * k);
  const swungX = seat.x + Math.sin(a) * arm;
  const swungY = seat.y + (Math.cos(a) - 1) * arm;

  const x = lerp(px, swungX, settle);
  const y = lerp(py, swungY, settle) - Math.sin(inT * Math.PI) * 12 * k;
  const mouthScale = Math.max(SEAT_SCALE * k * 1.4, birdScale * 0.7);
  const scale = lerp(lerp(birdScale, mouthScale, q), SEAT_SCALE * k, settle);

  const struggle = Math.sin(e * 11) * 18 * (1 - reelT * 0.5);
  const rot = e < C.net ? -14 : lerp(struggle + q * -10, rotIn, settle);

  const netT = e - C.net;
  const cinch = 1 - 0.14 * smooth(clamp01(netT / (C.wrap - C.net)));
  const netScale = e < C.net ? 0 : Math.min(1, 0.5 + netT * 5) * cinch;
  const netAlpha = e < C.net ? 0 : 1 - smooth(clamp01((e - C.reel) / 0.24));

  const shutT = clamp01((e - C.inside) / (C.shut - C.inside));
  const door = 1 - shutT * shutT * shutT;
  const lock = smooth(clamp01((e - C.shut - 0.05) / (C.lock - C.shut - 0.05)));

  return {
    x,
    y,
    rot,
    scale,
    face: lerp(face, 1, settle),
    state: e < C.net ? 'fly' : inT >= 0.55 ? 'caged' : 'caught',
    netScale,
    netAlpha,
    inside: inT >= 0.55,
    door,
    lock,
    swing,
    crank: e >= C.wrap && e < C.reel ? q * 1080 : undefined,
    line: 1 - smooth(clamp01((e - C.reel) / 0.16)),
    slack: 1 - smooth(clamp01((e - C.net) / (C.wrap - C.net))),
  };
}
