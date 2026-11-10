import { useId } from 'react';

/*
 * Supporting wildlife for the jungle. Each piece is centred on (0, 0) and
 * carries its own idle animation through CSS classes in stage.css.
 * Place them with a wrapping <g transform>, never on the animated group itself.
 */

/** A toco toucan perched, facing left, feet at (0, 24). */
export function Toucan() {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `url(#${id}-${n})`;
  return (
    <g className="toucan">
      <defs>
        <linearGradient id={`${id}-bill`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#8fe84f" />
          <stop offset=".3" stopColor="#ffd23f" />
          <stop offset=".72" stopColor="#ff8a1f" />
          <stop offset="1" stopColor="#e63a2e" />
        </linearGradient>
        <radialGradient id={`${id}-coat`} cx=".72" cy=".18" r=".9">
          <stop offset="0" stopColor="#3a4868" />
          <stop offset=".5" stopColor="#141a28" />
          <stop offset="1" stopColor="#07090f" />
        </radialGradient>
        <linearGradient id={`${id}-bib`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="1" stopColor="#ffd84a" />
        </linearGradient>
      </defs>
      <g stroke="#4f7fd0" strokeLinecap="round" fill="none">
        <path d="M-6 24 L-7 31 M4 24 L5 31" strokeWidth="2.8" />
        <path d="M-7 31 l-5 1 M-7 31 l4 2 M5 31 l-5 1 M5 31 l4 2" strokeWidth="2" />
      </g>
      <path d="M8 2 C20 10 24 30 17 52 C11 44 5 30 0 22 Z" fill="#0b0e15" stroke="#7fe3ff" strokeOpacity=".3" />
      <path d="M-15 8 C-15 -10 -6 -18 3 -17 C14 -16 18 -2 16 12 C14 24 6 30 -2 28 C-10 26 -15 18 -15 8 Z" fill={u('coat')} stroke="#7fe3ff" strokeOpacity=".38" />
      <path d="M4 -10 C14 -6 16 10 12 25 C6 20 0 8 4 -10 Z" fill="#161d2c" stroke="#7fe3ff" strokeOpacity=".2" />
      <ellipse cx="-5" cy="22" rx="9" ry="4.5" fill="#e63a2e" />
      <g className="toucan-head">
        <circle cx="-2" cy="-15" r="12.5" fill={u('coat')} />
        <path d="M-13 -13 C-14 -3 -7 5 3 3 C-2 -3 -5 -9 -3 -16 Z" fill={u('bib')} />
        <path d="M-10 -26 C-32 -32 -52 -25 -60 -9 C-48 -8 -28 -7 -10 -7 Z" fill={u('bill')} stroke="#a8541a" strokeWidth=".7" />
        <path d="M-11 -24 C-26 -28 -42 -26 -53 -18" stroke="#fff3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".85" />
        <path d="M-60 -9 C-57 -14 -53 -18 -48 -20 C-50 -14 -50 -11 -48 -8.5 Z" fill="#14171d" />
        <path d="M-10 -9.6 C-26 -10.4 -44 -10.4 -58 -9.6" stroke="#8a3f10" strokeWidth="1" fill="none" />
        <circle cx="-6" cy="-17" r="5" fill="#3fb8ff" stroke="#ff9a1f" strokeWidth="1.1" />
        <circle cx="-6.4" cy="-17" r="2.4" fill="#0a0a0a" />
        <circle cx="-5.4" cy="-18" r=".9" fill="#fff" />
      </g>
    </g>
  );
}

/** A hummingbird hovering, facing right. */
export function Hummingbird({ hue = '#2fe0b0' }: { hue?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <g className="hummer">
      <defs>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9fff4" />
          <stop offset=".4" stopColor={hue} />
          <stop offset="1" stopColor="#0f5a70" />
        </linearGradient>
      </defs>
      <g fill="#0f3a4a">
        <path d="M-10 2 L-24 -3 L-21 3 Z" />
        <path d="M-10 2 L-25 3 L-21 7 Z" />
        <path d="M-10 3 L-22 10 L-17 11 Z" />
      </g>
      <g className="hummer-wing" opacity=".6">
        <path d="M-4 -4 C-14 -18 -6 -28 0 -12 Z" fill="#cff7ff" />
      </g>
      <path d="M-12 2 C-6 -7 6 -8 13 -3 C8 5 -4 8 -12 2 Z" fill={`url(#${id}-sheen)`} />
      <path d="M-6 4 C0 7 7 5 11 1 C6 3 0 3 -6 4 Z" fill="#effff8" opacity=".85" />
      <circle cx="11" cy="-3.4" r="5.2" fill={`url(#${id}-sheen)`} />
      <path d="M8 0 C10 4 14 4 16 -.5 C13 -1.2 10 -1 8 0 Z" fill="#ff3d7f" />
      <path d="M15 -4.6 L33 -3 L15 -2.4 Z" fill="#1b1f27" />
      <circle cx="12.6" cy="-4.6" r="1.3" fill="#06121c" />
      <circle cx="13" cy="-5" r=".4" fill="#fff" />
      <g className="hummer-wing">
        <path d="M-2 -4 C-9 -20 3 -27 7 -10 Z" fill="#dffaff" opacity=".85" />
        <path d="M-1 -6 C-3 -14 0 -20 4 -14" stroke="#7fd8e8" strokeWidth=".7" fill="none" />
      </g>
    </g>
  );
}

/** A blue morpho butterfly. */
export function Morpho() {
  return (
    <g className="morpho">
      <g className="morpho-wings">
        <path d="M0 0 C-6 -16 -24 -20 -24 -8 C-24 0 -12 4 0 2 Z" fill="#3fb8ff" stroke="#06121c" strokeWidth="1.4" />
        <path d="M0 2 C-12 6 -18 16 -10 18 C-4 18 0 10 0 4 Z" fill="#2a8ff0" stroke="#06121c" strokeWidth="1.4" />
        <path d="M0 0 C6 -16 24 -20 24 -8 C24 0 12 4 0 2 Z" fill="#3fb8ff" stroke="#06121c" strokeWidth="1.4" />
        <path d="M0 2 C12 6 18 16 10 18 C4 18 0 10 0 4 Z" fill="#2a8ff0" stroke="#06121c" strokeWidth="1.4" />
        <circle cx="-16" cy="-10" r="1.6" fill="#e9fbff" />
        <circle cx="16" cy="-10" r="1.6" fill="#e9fbff" />
      </g>
      <ellipse cx="0" cy="4" rx="1.6" ry="8" fill="#06121c" />
      <path d="M-1 -4 L-5 -12 M1 -4 L5 -12" stroke="#06121c" strokeWidth=".9" />
    </g>
  );
}

/** A loose flock of distant parrots crossing the sky, facing the way they fly. */
export function ParrotFlock() {
  const birds = [
    [0, 0, '#3fdc7a'],
    [28, -11, '#ff5a4a'],
    [52, 5, '#3fdc7a'],
    [76, -15, '#ffd23f'],
    [100, -2, '#3fdc7a'],
    [124, -12, '#ff5a4a'],
  ] as const;
  return (
    <g className="flock">
      {birds.map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`} fill={c}>
          <path d="M-15 2 L-5 -1.2 L4 -2 C6.5 -2.4 8.4 -1 10.4 0 C8.4 1 6.5 2 4 2 L-5 1.4 Z" />
          <path d="M10.4 0 L13 .8 L9.6 1.6 Z" fill="#14171d" />
          <g className="flock-bird" style={{ animationDelay: `${i * 0.11}s` }}>
            <path d="M-3 0 C-6 -6 -11 -9 -16 -10 C-12 -5 -7 -1 2 1 Z" />
            <path d="M3 0 C3 -6 1 -10 -3 -13 C-3 -7 -3 -3 -1 1 Z" opacity=".75" />
          </g>
        </g>
      ))}
    </g>
  );
}
