/*
 * Supporting wildlife for the jungle. Each piece is centred on (0, 0) and
 * carries its own idle animation through CSS classes in stage.css.
 * Place them with a wrapping <g transform>, never on the animated group itself.
 */

/** A toco toucan perched, facing left, feet at (0, 24). */
export function Toucan() {
  return (
    <g className="toucan">
      <path d="M-6 24 L-6 30 M4 24 L4 30" stroke="#5b6170" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M8 -4 C18 6 20 26 12 42 C8 34 4 26 0 22 Z" fill="#0c0f16" />
      <ellipse cx="0" cy="6" rx="15" ry="20" fill="#11151e" stroke="#7fe3ff" strokeOpacity=".35" />
      <ellipse cx="-4" cy="20" rx="8" ry="4" fill="#d23c3c" />
      <g className="toucan-head">
        <circle cx="-2" cy="-14" r="11" fill="#11151e" />
        <path d="M-12 -12 C-12 -4 -6 2 2 2 C-2 -4 -4 -10 -2 -16 Z" fill="#f6f1e2" />
        <path d="M-10 -22 C-30 -26 -48 -20 -54 -10 C-44 -10 -26 -10 -10 -8 Z" fill="#ff9a1f" />
        <path d="M-10 -22 C-24 -25 -36 -23 -44 -18 C-32 -18 -20 -18 -10 -16 Z" fill="#ffd23f" />
        <path d="M-50 -14 C-52 -12 -54 -10 -54 -10 C-50 -10 -46 -10 -44 -10 Z" fill="#11151e" />
        <path d="M-10 -9 C-26 -9 -40 -10 -52 -10" stroke="#c96a10" strokeWidth="1" fill="none" />
        <circle cx="-6" cy="-16" r="4.2" fill="#3fb8ff" />
        <circle cx="-6.4" cy="-16" r="2" fill="#0a0a0a" />
        <circle cx="-5.6" cy="-16.8" r=".7" fill="#fff" />
      </g>
    </g>
  );
}

/** A hummingbird hovering, facing right. */
export function Hummingbird({ hue = '#2fe0b0' }: { hue?: string }) {
  return (
    <g className="hummer">
      <path d="M-10 2 L-20 -2 L-19 6 Z" fill="#0f3a4a" />
      <ellipse cx="0" cy="0" rx="11" ry="5.5" fill={hue} />
      <ellipse cx="2" cy="2.5" rx="7" ry="3" fill="#e9fff8" opacity=".75" />
      <circle cx="10" cy="-2" r="4.6" fill={hue} />
      <path d="M8 1 C10 3 13 3 14 1" stroke="#ff3d7f" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M14 -2 L28 -1" stroke="#1b1f27" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="11.5" cy="-3" r="1" fill="#06121c" />
      <g className="hummer-wing">
        <path d="M-2 -4 C-8 -18 2 -24 6 -10 Z" fill="#cff7ff" opacity=".7" />
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

/** A loose flock of distant parrots crossing the sky. */
export function ParrotFlock() {
  const birds = [
    [0, 0, '#3fdc7a'],
    [26, -10, '#ff5a4a'],
    [48, 4, '#3fdc7a'],
    [70, -14, '#ffd23f'],
    [92, -2, '#3fdc7a'],
  ] as const;
  return (
    <g className="flock">
      {birds.map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g className="flock-bird" style={{ animationDelay: `${i * 0.11}s` }}>
            <path d="M-8 0 C-4 -5 -1 -4 0 0 C1 -4 4 -5 8 0" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </g>
        </g>
      ))}
    </g>
  );
}
