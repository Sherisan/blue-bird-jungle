const CLOUDS = [
  { x: 120, y: 190, s: 1 },
  { x: 420, y: 120, s: 0.7 },
  { x: 650, y: 214, s: 1.15 },
  { x: 880, y: 160, s: 0.8 },
];

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M-84 2 C-86 -10 -70 -18 -54 -14 C-48 -30 -22 -36 -6 -24 C4 -40 38 -40 48 -20 C64 -26 86 -16 84 2 Z"
        fill="#0f2c56"
        opacity=".78"
      />
      <path d="M-54 -14 C-48 -30 -22 -36 -6 -24 C4 -40 38 -40 48 -20 C64 -26 86 -16 84 2" stroke="#bfe6ff" strokeOpacity=".32" strokeWidth="1.6" fill="none" />
      <ellipse cx="10" cy="-4" rx="60" ry="8" fill="#1a4278" opacity=".55" />
    </g>
  );
}

/** Moonlit clouds that scroll left; the engine speeds them up as the bird climbs. */
export function Clouds({ x }: { x: number }) {
  return (
    <g transform={`translate(${(-x).toFixed(1)} 0)`}>
      {[0, 1000].map((off) => (
        <g key={off} transform={`translate(${off} 0)`}>
          {CLOUDS.map((c) => (
            <Cloud key={c.x} {...c} />
          ))}
        </g>
      ))}
    </g>
  );
}
