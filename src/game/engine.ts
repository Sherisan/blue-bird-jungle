/** Pure game maths shared by the engine and the stage. */

export const WAIT_MS = 5000;
/** How long a finished round stays on screen: long enough for the catch to play out. */
export const HOLD_MS = 4700;
/** The beats of the catch, in seconds after the round ends: net lands, net closes, reeled to the cage, on the swing, door shut, padlocked. */
export const CAPTURE = { net: 0.28, wrap: 0.62, reel: 1.9, inside: 2.25, shut: 2.6, lock: 2.95 };
export const GROWTH = 0.11;
export const HOUSE_EDGE = 0.01;
export const MAX_MULT = 10000;
export const START_BALANCE = 10000;

/** Multiplier after t seconds of flight (floored to 2 decimals). */
export function multiplierAt(t: number): number {
  return Math.floor(Math.exp(GROWTH * t) * 100) / 100;
}

/** Seconds of flight needed to reach multiplier m. */
export function timeFor(m: number): number {
  return Math.log(m) / GROWTH;
}

/** Crash point from a uniform r in [0, 1): max(1, 0.99 / (1 - r)). */
export function crashFromUniform(r: number): number {
  return Math.min(MAX_MULT, Math.max(1, Math.floor(((1 - HOUSE_EDGE) / (1 - r)) * 100) / 100));
}

/** Uses the first 52 bits of a hex digest as r. */
export function crashFromHash(hex: string): number {
  const r = parseInt(hex.slice(0, 13), 16) / 2 ** 52;
  return crashFromUniform(r);
}

/** Where the bird is in scene coordinates (viewBox 0 0 1000 560). It leaves the perch at (520, 400). */
export function birdPosition(m: number, t: number): { x: number; y: number } {
  const p = Math.min(1, Math.log(m) / Math.log(12));
  return { x: 520 + p * 300, y: 400 - p * 270 + Math.sin(t * 4.2) * 6 * Math.min(1, p * 4) };
}

/**
 * The poacher is drawn at a different size from his art: scaled around his feet and moved here.
 * Phones show the whole scene at once, so he is drawn larger there than on wide screens.
 */
export const POACHER_SCALE = 0.9;
export const POACHER_SCALE_WIDE = 0.52;
export const POACHER_ORIGIN = { x: 196, y: 548 };
export const POACHER_POS = { x: 106, y: 548 };

export function poacherTransform(k: number): string {
  return `translate(${POACHER_POS.x} ${POACHER_POS.y}) scale(${k}) translate(${-POACHER_ORIGIN.x} ${-POACHER_ORIGIN.y})`;
}

/** Gun pivot in world coordinates. The art pivots at (205, 372) in its own space (art/Poacher.tsx). */
export function gunPivot(k: number): { x: number; y: number } {
  return {
    x: POACHER_POS.x + (205 - POACHER_ORIGIN.x) * k,
    y: POACHER_POS.y + (372 - POACHER_ORIGIN.y) * k,
  };
}

/** Gun angle in degrees for a target point, clamped to a natural range. */
export function aimAngle(x: number, y: number, k: number, min = -58, max = -4): number {
  const pivot = gunPivot(k);
  const a = (Math.atan2(y - pivot.y, x - pivot.x) * 180) / Math.PI;
  return Math.max(min, Math.min(max, a));
}

/** How quickly the sight closes on Azul, per second. It rises with the multiplier, so the chase gets faster. */
export function trackRate(m: number): number {
  return 1.3 + 2.6 * Math.min(1, Math.log(m) / Math.log(20)) + Math.max(0, Math.log(m / 20)) * 1.2;
}

/** The sight's inner ring tightens as the multiplier climbs. */
export function sightRadius(m: number): number {
  return 44 - Math.min(0.42, (Math.log(m) / Math.log(60)) * 0.42) * 24;
}

export function winTier(m: number): string | null {
  if (m >= 25) return 'Mega win';
  if (m >= 10) return 'Huge win';
  if (m >= 5) return 'Big win';
  return null;
}

export function chanceFor(target: number): number {
  return ((1 - HOUSE_EDGE) / target) * 100;
}
