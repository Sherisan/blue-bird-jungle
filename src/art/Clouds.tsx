import { useId } from 'react';

const CLOUDS = [
  { x: 120, y: 190, s: 1 },
  { x: 420, y: 120, s: 0.7 },
  { x: 650, y: 214, s: 1.15 },
  { x: 880, y: 160, s: 0.8 },
];

const PUFF = 'M-84 2 C-86 -10 -70 -18 -54 -14 C-48 -30 -22 -36 -6 -24 C4 -40 38 -40 48 -20 C64 -26 86 -16 84 2 C56 12 24 8 2 11 C-24 14 -58 11 -84 2 Z';
const PUFF_TOP = 'M-54 -14 C-48 -30 -22 -36 -6 -24 C4 -40 38 -40 48 -20 C64 -26 86 -16 84 2';

/** A moonlit cloud: a soft back puff for volume, a body lit from above, and a silver lining on the moon side. */
function Cloud({ x, y, s, id }: { x: number; y: number; s: number; id: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={PUFF} fill="#0b2148" opacity=".45" transform="translate(-14 6) scale(1.18 1.1)" />
      <path d={PUFF} fill={`url(#${id}-body)`} opacity=".86" />
      <path d={PUFF_TOP} stroke={`url(#${id}-rim)`} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M-4 -26 C6 -38 34 -38 44 -22" stroke="#e8f6ff" strokeOpacity=".35" strokeWidth="1" fill="none" />
      <ellipse cx="10" cy="-2" rx="64" ry="7" fill="#08193a" opacity=".5" />
    </g>
  );
}

/** Moonlit clouds that scroll left; the engine speeds them up as the bird climbs. */
export function Clouds({ x }: { x: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <g transform={`translate(${(-x).toFixed(1)} 0)`}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a6ca4" />
          <stop offset=".45" stopColor="#1a3f72" />
          <stop offset="1" stopColor="#0c2350" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#bfe6ff" stopOpacity=".15" />
          <stop offset="1" stopColor="#e8f8ff" stopOpacity=".75" />
        </linearGradient>
      </defs>
      {[0, 1000].map((off) => (
        <g key={off} transform={`translate(${off} 0)`}>
          {CLOUDS.map((c) => (
            <Cloud key={c.x} {...c} id={id} />
          ))}
        </g>
      ))}
    </g>
  );
}
