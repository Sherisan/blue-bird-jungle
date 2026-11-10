import { memo, useId } from 'react';
import { Hummingbird, Morpho, ParrotFlock, Toucan } from './Fauna';

/*
 * The blue jungle at night, in layers so the stage can slot the bird and the
 * poacher between them. All layers share the viewBox 0 0 1000 560.
 */

export const PERCH = { x: 520, y: 400 };

// ---- plant kit ------------------------------------------------------------------

type Place = { x: number; y: number; s?: number; r?: number };
const tf = ({ x, y, s = 1, r = 0 }: Place) => `translate(${x} ${y}) rotate(${r}) scale(${s})`;

function Monstera({ fill = '#0b2a26', vein = '#1f5a4a', gap = '#03101a', ...p }: Place & { fill?: string; vein?: string; gap?: string }) {
  return (
    <g transform={tf(p)}>
      <path d="M0 0 C-46 -8 -70 -60 -40 -104 C-20 -130 22 -128 40 -104 C70 -62 46 -8 0 0 Z" fill={fill} />
      <path d="M-2 -22 L-46 -30 M-2 -48 L-60 -62 M-2 -74 L-50 -98 M2 -26 L44 -36 M2 -54 L58 -68 M2 -82 L42 -106" stroke={gap} strokeWidth="4.5" />
      <path d="M0 0 C-2 -40 -2 -80 0 -118" stroke={vein} strokeWidth="2.4" fill="none" />
      <ellipse cx="-22" cy="-60" rx="5" ry="3" fill={gap} />
      <ellipse cx="22" cy="-84" rx="5" ry="3" fill={gap} />
    </g>
  );
}

function BananaLeaf({ fill = '#0d3a2c', vein = '#2a7a56', ...p }: Place & { fill?: string; vein?: string }) {
  return (
    <g transform={tf(p)}>
      <path d="M0 0 C26 -40 34 -130 8 -210 C-14 -130 -22 -40 0 0 Z" fill={fill} />
      <path d="M0 0 C6 -70 8 -140 8 -210" stroke={vein} strokeWidth="2" fill="none" />
      <path d="M4 -60 L24 -70 M6 -110 L26 -124 M4 -150 L18 -166 M2 -84 L-16 -96 M4 -132 L-12 -146" stroke="#03101a" strokeWidth="2.5" />
    </g>
  );
}

function Fern({ fill = '#145a44', ...p }: Place & { fill?: string }) {
  const leaflets = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    const x = t * 90;
    const y = -t * 70 + t * t * 40;
    const len = 18 * (1 - t * 0.7);
    return { x, y, len, a: -50 + t * 30 };
  });
  return (
    <g transform={tf(p)}>
      <path d="M0 0 C30 -40 60 -50 90 -30" stroke={fill} strokeWidth="2.2" fill="none" />
      {leaflets.map((l, i) => (
        <g key={i} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)})`}>
          <ellipse cx="0" cy={-l.len / 2} rx="3.4" ry={l.len / 2} fill={fill} transform={`rotate(${l.a - 40})`} />
          <ellipse cx="0" cy={l.len / 2} rx="3" ry={l.len / 2.4} fill={fill} transform={`rotate(${l.a + 10})`} />
        </g>
      ))}
    </g>
  );
}

function GlowBells({ color = '#5ff0ff', ...p }: Place & { color?: string }) {
  const bells = [
    [-10, -46],
    [6, -58],
    [16, -40],
    [-2, -30],
  ];
  return (
    <g transform={tf(p)}>
      <g opacity=".45">
        <circle cx="2" cy="-44" r="30" fill={color} className="glow-pulse" style={{ filter: 'blur(7px)' }} />
      </g>
      <path d="M0 0 C-2 -20 0 -40 4 -60 M0 -20 C-6 -30 -10 -38 -10 -46 M2 -30 C10 -34 14 -38 16 -40" stroke="#1f6a54" strokeWidth="2" fill="none" />
      {bells.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M-5 0 C-5 -7 5 -7 5 0 L4 4 L1 2 L0 5 L-1 2 L-4 4 Z" fill={color} />
          <circle cx="0" cy="-2" r="1.4" fill="#fff" />
        </g>
      ))}
    </g>
  );
}

function Heliconia(p: Place) {
  const bracts = [0, 1, 2, 3, 4];
  return (
    <g transform={tf(p)}>
      <path d="M0 0 L0 -92" stroke="#1f6a3a" strokeWidth="3" />
      <path d="M0 -10 C-24 -20 -34 -44 -30 -70 C-18 -52 -8 -32 0 -10 Z" fill="#0f3d2a" />
      {bracts.map((i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const y = -40 - i * 11;
        return (
          <g key={i} transform={`translate(0 ${y}) scale(${side} 1)`}>
            <path d="M0 0 C8 -2 18 -6 22 -14 C14 -12 6 -8 0 -6 Z" fill="#ff3d3d" />
            <path d="M14 -10 C18 -11 21 -12 22 -14 C19 -10 16 -8 13 -8 Z" fill="#ffd23f" />
          </g>
        );
      })}
    </g>
  );
}

function Orchid({ color = '#ff5fd2', ...p }: Place & { color?: string }) {
  return (
    <g transform={tf(p)}>
      <g opacity=".5">
        <circle r="16" fill={color} className="glow-pulse" style={{ filter: 'blur(7px)' }} />
      </g>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-7" rx="4.5" ry="8" fill={color} transform={`rotate(${a})`} />
      ))}
      <circle r="3.4" fill="#fff3a8" />
    </g>
  );
}

function Mushroom({ color = '#5ff0ff', ...p }: Place & { color?: string }) {
  return (
    <g transform={tf(p)}>
      <g opacity=".5">
        <circle cx="0" cy="-8" r="14" fill={color} className="glow-pulse" style={{ filter: 'blur(7px)' }} />
      </g>
      <rect x="-1.6" y="-8" width="3.2" height="8" rx="1.5" fill="#d8f6ff" />
      <path d="M-8 -7 C-8 -15 8 -15 8 -7 Z" fill={color} />
      <circle cx="-3" cy="-11" r="1" fill="#fff" />
    </g>
  );
}

function LilyPad({ rx, ry, ...p }: Place & { rx: number; ry: number }) {
  const id = useId().replace(/:/g, '');
  const n = 0.2; // half-angle of the notch, radians
  const pt = (a: number, k = 1) => `${(rx * k * Math.cos(a)).toFixed(1)} ${(ry * k * Math.sin(a)).toFixed(1)}`;
  const veins = [-2.6, -1.9, -1.2, -0.5, 0.6, 1.3, 2, 2.7];
  return (
    <g transform={tf(p)}>
      <defs>
        <radialGradient id={`${id}-lp`} cx=".42" cy=".38" r=".75">
          <stop offset="0" stopColor="#4cc078" />
          <stop offset=".65" stopColor="#24804f" />
          <stop offset="1" stopColor="#14543a" />
        </radialGradient>
      </defs>
      <ellipse cy="2.5" rx={rx + 3} ry={ry + 2} fill="#010b14" opacity=".5" />
      <path d={`M0 0 L${pt(-n)} A${rx} ${ry} 0 1 0 ${pt(n)} Z`} fill={`url(#${id}-lp)`} />
      <g stroke="#8fe6b0" strokeOpacity=".32" strokeWidth=".8">
        {veins.map((v) => (
          <path key={v} d={`M0 0 L${pt(v, 0.84)}`} />
        ))}
      </g>
      <path d={`M${pt(-2.8)} A${rx} ${ry} 0 0 1 ${pt(-0.45)}`} stroke="#b8f5cc" strokeOpacity=".6" strokeWidth="1.1" fill="none" />
      <circle cx={-rx * 0.35} cy={-ry * 0.1} r="1.6" fill="#e8fff2" opacity=".8" />
    </g>
  );
}

function Lotus(p: Place) {
  const id = useId().replace(/:/g, '');
  return (
    <g transform={tf(p)}>
      <defs>
        <linearGradient id={`${id}-pt`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff86c8" />
          <stop offset=".55" stopColor="#ffc6e6" />
          <stop offset="1" stopColor="#fff6fb" />
        </linearGradient>
      </defs>
      <g opacity=".45">
        <circle cy="-6" r="22" fill="#ff9ad8" className="glow-pulse" style={{ filter: 'blur(7px)' }} />
      </g>
      {[-62, -34, 34, 62].map((a) => (
        <path key={a} d="M0 0 C-6 -6 -6 -16 0 -22 C6 -16 6 -6 0 0 Z" fill={`url(#${id}-pt)`} stroke="#ff6ab8" strokeWidth=".6" transform={`rotate(${a})`} />
      ))}
      {[-16, 0, 16].map((a) => (
        <path key={a} d="M0 0 C-5 -7 -5 -17 0 -24 C5 -17 5 -7 0 0 Z" fill={`url(#${id}-pt)`} stroke="#ff6ab8" strokeWidth=".6" transform={`rotate(${a})`} />
      ))}
      <ellipse cy="-4" rx="4" ry="2.4" fill="#ffd23f" />
    </g>
  );
}

/** A single pointed jungle leaf; points along +x before rotation. */
function Leaf({ fill = '#1f6a48', vein = '#3f9a68', ...p }: Place & { fill?: string; vein?: string }) {
  return (
    <g transform={tf(p)}>
      <path d="M0 0 C6 -6 18 -7 27 0 C18 7 6 6 0 0 Z" fill={fill} />
      <path d="M2 0 L23 0" stroke={vein} strokeWidth=".8" />
    </g>
  );
}

function Vine({ d, leaves }: { d: string; leaves: [number, number, number][] }) {
  return (
    <g className="sway-top">
      <path d={d} stroke="#123d30" strokeWidth="3" fill="none" />
      {leaves.map(([x, y, a], i) => (
        <ellipse key={i} cx={x} cy={y} rx="5" ry="10" fill="#1d5a42" transform={`rotate(${a} ${x} ${y})`} />
      ))}
    </g>
  );
}

function Palm({ fill = '#0a2438', ...p }: Place & { fill?: string }) {
  const fronds = [-168, -140, -112, -70, -40, -12, 14];
  return (
    <g transform={tf(p)}>
      <path d="M0 0 C2 -40 0 -80 8 -120" stroke={fill} strokeWidth="6" fill="none" strokeLinecap="round" />
      {fronds.map((a) => (
        <path key={a} d="M0 0 C20 -12 44 -10 62 8 C42 -2 22 -2 0 5 Z" fill={fill} transform={`translate(8 -120) rotate(${a})`} />
      ))}
    </g>
  );
}

function Bromeliad(p: Place) {
  return (
    <g transform={tf(p)}>
      {[-150, -120, -90, -60, -30].map((a) => (
        <ellipse key={a} cx="0" cy="-11" rx="3.4" ry="12" fill="#1f6a4a" transform={`rotate(${a + 90})`} />
      ))}
      {[-135, -105, -75, -45].map((a) => (
        <ellipse key={a} cx="0" cy="-8" rx="3" ry="9" fill="#ff4a3d" transform={`rotate(${a + 90})`} />
      ))}
      <circle cx="0" cy="-2" r="3" fill="#ffd23f" />
    </g>
  );
}

// ---- sky helpers -----------------------------------------------------------------------

/** Where the moon's centre sits; low enough that wide stages, which crop the sky, still show all of it. */
const MOON = { x: 820, y: 158 };

/** Deterministic 0..1 noise, so the art is identical on every render. */
const rand = (n: number) => {
  const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

const STARS = Array.from({ length: 64 }, (_, i) => ({
  x: Math.round(rand(i) * 1000),
  y: Math.round(rand(i + 100) ** 1.6 * 260),
  r: 0.5 + rand(i + 200) * 1.1,
  o: 0.3 + rand(i + 300) * 0.6,
  tw: rand(i + 400) > 0.72 ? rand(i + 500) * 4 : -1,
})).filter((st) => Math.hypot(st.x - MOON.x, st.y - MOON.y) > 72);

/** Stars for the sky above the frame (y < 0), seen when a tall (phone) stage fits the scene to its width. */
const HIGH_STARS = Array.from({ length: 140 }, (_, i) => ({
  x: Math.round(rand(i + 600) * 1000),
  y: -Math.round(rand(i + 700) * 880),
  r: 0.5 + rand(i + 800) * 1.2,
  o: 0.4 + rand(i + 900) * 0.5,
}));

/** Star dust packed along the Milky Way, a band rising from the left horizon toward the top of the sky (y = 236 - 0.34x). */
const MILKY = Array.from({ length: 320 }, (_, i) => {
  const x = -40 + rand(i + 1000) * 840;
  const off = (rand(i + 1100) + rand(i + 1200) + rand(i + 1300) - 1.5) * 48;
  return {
    x: Math.round(x + off * 0.32),
    y: Math.round(236 - x * 0.34 + off),
    r: 0.35 + rand(i + 1400) * 0.8,
    o: 0.25 + rand(i + 1500) * 0.6,
    c: rand(i + 1600) > 0.82 ? (rand(i + 1700) > 0.5 ? '#ffd9b0' : '#b8d8ff') : '#ffffff',
  };
}).filter((st) => st.y < 300 && Math.hypot(st.x - MOON.x, st.y - MOON.y) > 90);

/** Curtains of light hanging in the aurora: rays rising from a wavering foot, fading out toward the moon. */
const AURORA_RAYS = Array.from({ length: 92 }, (_, i) => {
  const x = -20 + i * 8.6;
  const foot = 176 + Math.sin(x / 96) * 30 + Math.sin(x / 41 + 1.2) * 12;
  const height = 74 + rand(i + 3000) * 66 + Math.sin(x / 130) * 22;
  return {
    d: `M${x.toFixed(1)} ${foot.toFixed(1)} L${(x + 7 + rand(i + 3100) * 6).toFixed(1)} ${(foot - height).toFixed(1)}`,
    o: (0.3 + rand(i + 3200) * 0.45) * Math.min(1, Math.max(0, (720 - x) / 180)),
  };
});

/** Shooting stars: [x, y, delay]; each streaks down to the left every 12s. */
const METEORS: [number, number, number][] = [
  [600, 34, 2.5],
  [330, 22, 8.5],
];

// irregular lunar seas, relative to the moon's centre
const MARIA = [
  'M-22 -16 C-14 -24 -2 -20 -4 -10 C-6 -2 -18 0 -24 -6 C-27 -10 -26 -13 -22 -16 Z',
  'M4 -26 C12 -28 18 -22 14 -16 C10 -12 2 -14 1 -19 C0 -22 1 -25 4 -26 Z',
  'M6 4 C16 0 26 6 22 16 C18 24 6 24 2 16 C0 11 1 7 6 4 Z',
  'M-14 12 C-8 10 -4 16 -8 20 C-12 23 -18 20 -18 16 C-18 14 -16 12 -14 12 Z',
];

const TEMPLE_TIERS: [number, number, number, number][] = [
  [146, 372, 180, 36],
  [164, 346, 144, 26],
  [182, 324, 108, 22],
  [200, 306, 72, 18],
];
const TORCHES: [number, number, number][] = [
  [156, 372, 0],
  [316, 372, 0.7],
  [192, 324, 1.3],
  [280, 324, 0.4],
];

/** A stepped temple in the far jungle: moonlit on the right, torches burning on its terraces, a glowing shrine on top. */
function Temple() {
  return (
    <g>
      <ellipse cx="236" cy="316" rx="150" ry="98" fill="#58c8ff" opacity=".1" style={{ filter: 'blur(18px)' }} />
      {TEMPLE_TIERS.map(([x, y, w, h]) => (
        <g key={y}>
          <rect x={x} y={y} width={w} height={h} fill="#1b5270" />
          <rect x={x + w * 0.6} y={y} width={w * 0.4} height={h} fill="#2f7c9c" />
          <rect x={x} y={y} width={w} height="2.6" fill="#a6e6f4" opacity=".6" />
          <path d={`M${x} ${y + h * 0.36} H${x + w} M${x} ${y + h * 0.7} H${x + w}`} stroke="#0f3a54" strokeOpacity=".7" />
          <path d={`M${x + w * 0.1} ${y + 2} v${h * 0.34} M${x + w * 0.28} ${y + h * 0.36} v${h * 0.34} M${x + w * 0.74} ${y + 2} v${h * 0.34} M${x + w * 0.9} ${y + h * 0.36} v${h * 0.34}`} stroke="#0f3a54" strokeOpacity=".55" />
        </g>
      ))}
      {/* the great stair */}
      <path d="M220 408 L252 408 L244 306 L228 306 Z" fill="#46a0ba" />
      <g stroke="#123f58" strokeOpacity=".75">
        {Array.from({ length: 13 }, (_, i) => {
          const y = 312 + i * 7.6;
          const inset = ((408 - y) / 102) * 8;
          return <path key={i} d={`M${(220 + inset).toFixed(1)} ${y.toFixed(1)} H${(252 - inset).toFixed(1)}`} />;
        })}
      </g>
      {/* shrine */}
      <rect x="216" y="282" width="40" height="24" fill="#2a6f8e" />
      <path d="M210 282 L262 282 L254 270 L218 270 Z" fill="#4aa6c0" />
      <path d="M210 282 H262" stroke="#c6f2fa" strokeOpacity=".7" strokeWidth="1.6" />
      <path d="M229 306 V296 A7 7 0 0 1 243 296 V306 Z" fill="#8ff6ff" className="glow-pulse" />
      <path d="M229 306 V296 A7 7 0 0 1 243 296 V306 Z" fill="#8ff6ff" opacity=".6" style={{ filter: 'blur(5px)' }} />
      {/* creepers */}
      <g stroke="#1f7a58" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".9">
        <path d="M160 346 C158 356 164 362 160 372 M300 324 C304 334 298 340 302 346 M196 306 C194 314 199 318 196 324 M276 346 C280 356 274 362 278 372" />
      </g>
      <g fill="#2fa173">
        <circle cx="162" cy="356" r="3" />
        <circle cx="301" cy="334" r="2.6" />
        <circle cx="277" cy="358" r="2.8" />
        <circle cx="197" cy="315" r="2.4" />
      </g>
      {/* torches throw warm light against the blue night */}
      {TORCHES.map(([x, y, d]) => (
        <g key={x}>
          <path d={`M${x} ${y} V${y - 12}`} stroke="#3a2412" strokeWidth="2.6" />
          <circle className="glow-pulse" cx={x} cy={y - 17} r="13" fill="#ff9a3c" opacity=".55" style={{ filter: 'blur(6px)', animationDelay: `${d}s` }} />
          <path className="glow-pulse" d={`M${x} ${y - 25} C${x + 5} ${y - 19} ${x + 4} ${y - 12} ${x} ${y - 12} C${x - 4} ${y - 12} ${x - 5} ${y - 19} ${x} ${y - 25} Z`} fill="#ffc35a" style={{ animationDelay: `${d}s` }} />
          <path d={`M${x} ${y - 20} C${x + 2} ${y - 17} ${x + 2} ${y - 13.5} ${x} ${y - 13.5} C${x - 2} ${y - 13.5} ${x - 2} ${y - 17} ${x} ${y - 20} Z`} fill="#fff3c0" />
        </g>
      ))}
    </g>
  );
}

/** A little clump of grass blades growing from (x, y). */
function GrassTuft({ x, y, s = 1, fill = '#2a8a5e' }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`} fill={fill}>
      <path d="M-5 0 C-7 -8 -11 -13 -15 -16 C-9 -14 -4 -9 -2 0 Z" />
      <path d="M-2 0 C-3 -11 -3 -18 -2 -24 C1 -18 2 -9 2 0 Z" />
      <path d="M1 0 C4 -8 9 -13 14 -17 C10 -11 6 -5 5 0 Z" />
    </g>
  );
}

function GlowFlower({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`}>
      <path d="M0 0 C-1 5 1 10 0 16" stroke="#1f7a58" strokeWidth="1.6" fill="none" />
      <circle r="10" fill={color} opacity=".35" className="glow-pulse" style={{ filter: 'blur(5px)' }} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="0" cy="-4.4" rx="2.6" ry="4.6" fill={color} transform={`rotate(${a})`} />
      ))}
      <circle r="2.2" fill="#fff3a8" />
    </g>
  );
}

/** A point on the top edge of the near bank, 0..1 along it. */
function bankPoint(t: number) {
  const r = 1 - t;
  return { x: 3 * r * r * t * 110 + 3 * r * t * t * 280 + t * t * t * 452, y: r * r * r * 500 + 3 * r * r * t * 484 + 3 * r * t * t * 488 + t * t * t * 514 };
}
const BANK_TUFTS = [0.02, 0.09, 0.15, 0.22, 0.3, 0.37, 0.44, 0.52, 0.6, 0.67, 0.75, 0.82, 0.9, 0.97].map((t, i) => ({ ...bankPoint(t), s: 0.7 + rand(i + 4000) * 0.6 }));
const BANK_FLOWERS = [
  { t: 0.13, c: '#ff8ad8', s: 0.9 },
  { t: 0.27, c: '#ffd86a', s: 0.8 },
  { t: 0.47, c: '#7fe3ff', s: 1 },
  { t: 0.71, c: '#ff8ad8', s: 0.85 },
  { t: 0.86, c: '#ffd86a', s: 0.9 },
].map((f) => ({ ...f, ...bankPoint(f.t) }));

/** Reeds along the far shore of the lagoon, each tipped with a tiny light. */
const SHORE_REEDS = Array.from({ length: 46 }, (_, i): [number, number, string, number] => [
  460 + i * 11.8 + rand(i + 4100) * 6,
  8 + rand(i + 4200) * 16,
  ['#8ff6ff', '#d6ff7a', '#ffb4e6', '#ffe28a'][i % 4],
  +(rand(i + 4300) * 3.2).toFixed(1),
]).filter(([x]) => x < 640 || x > 744);

/** A rainforest giant poking above the far tree line, crown lit from the moon. */
function Emergent({ fill, rim, ...p }: Place & { fill: string; rim: string }) {
  return (
    <g transform={tf(p)}>
      <path d="M-4 0 C-3 -40 -2 -70 -3 -96 L3 -96 C2 -70 3 -40 4 0 Z" fill={fill} />
      <path d="M-2 -86 C-14 -96 -24 -98 -34 -100 M1 -90 C12 -98 22 -100 32 -104" stroke={fill} strokeWidth="3" fill="none" />
      <g fill={fill}>
        <ellipse cx="-30" cy="-106" rx="22" ry="11" />
        <ellipse cx="0" cy="-114" rx="28" ry="14" />
        <ellipse cx="30" cy="-108" rx="22" ry="11" />
        <ellipse cx="-12" cy="-122" rx="16" ry="9" />
        <ellipse cx="16" cy="-124" rx="15" ry="8" />
      </g>
      <path d="M2 -132 C14 -132 24 -128 30 -120 M30 -119 C42 -119 50 -114 52 -106" stroke={rim} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** A row of rounded treetops as one closed silhouette. */
function canopyPath(y: number, seed: number, minR: number, maxR: number, bottom = 470) {
  let d = `M0 ${bottom} L0 ${y}`;
  let x = 0;
  for (let i = 0; x < 1000; i++) {
    const r = minR + rand(seed * 31 + i) * (maxR - minR);
    const nx = Math.min(1000, x + r * 1.6);
    const ny = y + Math.sin(i * 1.7 + seed) * 6;
    d += ` A${r.toFixed(1)} ${(r * 0.85).toFixed(1)} 0 0 1 ${nx.toFixed(1)} ${ny.toFixed(1)}`;
    x = nx;
  }
  return `${d} L1000 ${bottom} Z`;
}

// table-top mountains (tepuis), the signature skyline of the northern Amazon
const TEPUI_TOP =
  'M0 318 L36 316 L48 262 L64 256 L150 252 L168 258 L180 306 L238 312 L276 300 L312 302 L326 250 L344 244 L452 240 L470 246 L482 296 L540 304 L610 296 L690 290 L706 236 L724 230 L826 228 L842 234 L856 288 L920 296 L962 286 L1000 290';
// a hazy range far behind the tepuis, for depth
const FAR_RANGE =
  'M0 300 C60 286 110 274 170 280 C230 286 262 268 330 266 C400 264 432 278 500 274 C560 270 600 258 660 262 C740 268 780 252 850 256 C910 260 950 272 1000 266 L1000 470 L0 470 Z';
const HILLS =
  'M0 372 C60 352 120 360 176 346 L190 314 L206 308 L270 306 L284 312 L296 344 C340 354 400 342 450 350 C520 362 560 340 620 352 C700 366 760 344 840 356 C900 364 950 350 1000 356 L1000 470 L0 470 Z';

// ---- layers ---------------------------------------------------------------------------

/** The sky; `top` is where its gradient starts (above 0 on phones, which show sky above the frame). */
export const SceneSky = memo(function SceneSky({ top = 0 }: { top?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#020512" />
          <stop offset=".24" stopColor="#081436" />
          <stop offset=".44" stopColor="#0c2a5c" />
          <stop offset=".62" stopColor="#0f4c7c" />
          <stop offset=".78" stopColor="#13768c" />
          <stop offset=".9" stopColor="#2aa59e" />
          <stop offset="1" stopColor="#86e4cc" />
        </linearGradient>
        <radialGradient id={`${id}-halo`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#eaf8ff" stopOpacity=".62" />
          <stop offset=".18" stopColor="#a8e0ff" stopOpacity=".24" />
          <stop offset=".5" stopColor="#5fb8ff" stopOpacity=".07" />
          <stop offset="1" stopColor="#5fb8ff" stopOpacity="0" />
        </radialGradient>
        {/* lunar corona: faint rainbow rings around the moon */}
        <radialGradient id={`${id}-corona`} cx=".5" cy=".5" r=".5">
          <stop offset=".5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset=".6" stopColor="#ffe6c0" stopOpacity=".13" />
          <stop offset=".7" stopColor="#ffb8d8" stopOpacity=".07" />
          <stop offset=".8" stopColor="#9fdcff" stopOpacity=".1" />
          <stop offset=".9" stopColor="#8a8cff" stopOpacity=".05" />
          <stop offset="1" stopColor="#8a8cff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-moon`} cx=".38" cy=".34" r=".72">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".45" stopColor="#eef7fd" />
          <stop offset=".85" stopColor="#c4dcee" />
          <stop offset="1" stopColor="#9ec0da" />
        </radialGradient>
        <radialGradient id={`${id}-limb`} cx=".5" cy=".5" r=".5">
          <stop offset=".7" stopColor="#5f84a8" stopOpacity="0" />
          <stop offset="1" stopColor="#5f84a8" stopOpacity=".55" />
        </radialGradient>
        {/* moon rays fade out with distance, so they never end in a hard edge */}
        <radialGradient id={`${id}-ray`} gradientUnits="userSpaceOnUse" cx="860" cy="96" r="470">
          <stop offset="0" stopColor="#cfefff" />
          <stop offset=".55" stopColor="#cfefff" stopOpacity=".4" />
          <stop offset="1" stopColor="#cfefff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-meteor`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="110" y2="-44">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".15" stopColor="#bfeaff" stopOpacity=".8" />
          <stop offset="1" stopColor="#7fd0ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-curtain`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a35cff" stopOpacity="0" />
          <stop offset=".45" stopColor="#6a7dff" stopOpacity=".55" />
          <stop offset=".85" stopColor="#35f0c4" stopOpacity=".95" />
          <stop offset="1" stopColor="#7dffd6" stopOpacity=".5" />
        </linearGradient>
        <linearGradient id={`${id}-range`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5aa6c0" />
          <stop offset=".4" stopColor="#3f88a6" />
          <stop offset="1" stopColor="#3f9aa6" />
        </linearGradient>
        <linearGradient id={`${id}-aurora`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2fe0c8" stopOpacity="0" />
          <stop offset=".3" stopColor="#2fe0c8" stopOpacity=".5" />
          <stop offset=".65" stopColor="#5a7dff" stopOpacity=".4" />
          <stop offset="1" stopColor="#a35cff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-far`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f7598" />
          <stop offset=".45" stopColor="#1f6280" />
          <stop offset="1" stopColor="#2a8a96" />
        </linearGradient>
        <linearGradient id={`${id}-mid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#164a6c" />
          <stop offset="1" stopColor="#125070" />
        </linearGradient>
        <linearGradient id={`${id}-mist`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfefff" stopOpacity="0" />
          <stop offset=".5" stopColor="#bfefff" stopOpacity=".16" />
          <stop offset="1" stopColor="#bfefff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* night sky continuing above the frame, shown when a tall (phone) stage fits the scene to its width */}
      <rect y="-900" width="1000" height="901" fill="#020716" />
      {/* the sky gradient, which on phones stretches up to the top of the stage */}
      <rect y={top} width="1000" height={560 - top} fill={`url(#${id}-sky)`} />
      <g fill="#fff">
        {HIGH_STARS.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.r.toFixed(2)} opacity={st.o.toFixed(2)} />
        ))}
      </g>

      {/* the Milky Way: coloured glow, a bright core split by a dark dust lane, then packed star dust */}
      <g style={{ filter: 'blur(24px)' }}>
        <ellipse cx="380" cy="107" rx="500" ry="50" fill="#4c58ff" opacity=".26" transform="rotate(-18.8 380 107)" />
        <ellipse cx="270" cy="144" rx="260" ry="34" fill="#2fc8ff" opacity=".17" transform="rotate(-18.8 270 144)" />
        <ellipse cx="540" cy="52" rx="230" ry="30" fill="#c06cff" opacity=".17" transform="rotate(-18.8 540 52)" />
        <ellipse cx="140" cy="186" rx="150" ry="26" fill="#ff7ab8" opacity=".09" transform="rotate(-18.8 140 186)" />
      </g>
      <g style={{ filter: 'blur(9px)' }}>
        <ellipse cx="400" cy="100" rx="250" ry="15" fill="#e4ecff" opacity=".17" transform="rotate(-18.8 400 100)" />
        <ellipse cx="410" cy="104" rx="210" ry="4.5" fill="#020818" opacity=".6" transform="rotate(-18.8 410 104)" />
        <ellipse cx="250" cy="152" rx="90" ry="4" fill="#020818" opacity=".45" transform="rotate(-20 250 152)" />
      </g>
      <g>
        {MILKY.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.r.toFixed(2)} fill={st.c} opacity={st.o.toFixed(2)} />
        ))}
      </g>
      {METEORS.map(([x, y, d]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <g className="meteor" style={{ animationDelay: `${d}s` }}>
            <line x1="0" y1="0" x2="110" y2="-44" stroke={`url(#${id}-meteor)`} strokeWidth="1.8" strokeLinecap="round" />
            <circle r="1.8" fill="#fff" />
          </g>
        </g>
      ))}
      <g className="aurora" style={{ filter: 'blur(9px)' }}>
        <path d="M-40 176 C110 96 250 186 410 126 C550 76 650 150 790 98" stroke={`url(#${id}-aurora)`} strokeWidth="24" fill="none" strokeLinecap="round" />
      </g>
      <g className="aurora" style={{ filter: 'blur(3px)', animationDelay: '-4s' }} stroke={`url(#${id}-curtain)`} strokeWidth="9" strokeLinecap="round">
        {AURORA_RAYS.map((ray, i) => (
          <path key={i} d={ray.d} opacity={ray.o.toFixed(2)} />
        ))}
      </g>

      <g fill="#fff">
        {STARS.map((st, i) =>
          st.tw < 0 ? (
            <circle key={i} cx={st.x} cy={st.y} r={st.r.toFixed(2)} opacity={st.o.toFixed(2)} />
          ) : (
            <circle key={i} cx={st.x} cy={st.y} r={st.r.toFixed(2)} className="twinkle" style={{ animationDelay: `${st.tw.toFixed(1)}s` }} />
          ),
        )}
      </g>
      <path d="M150 52 L152.4 61.6 L162 64 L152.4 66.4 L150 76 L147.6 66.4 L138 64 L147.6 61.6 Z" fill="#eaf8ff" className="twinkle" />
      <path d="M640 34 L641.6 40.4 L648 42 L641.6 43.6 L640 50 L638.4 43.6 L632 42 L638.4 40.4 Z" fill="#eaf8ff" className="twinkle" style={{ animationDelay: '1.4s' }} />

      {/* the moon: halo, corona rings, slow rays, then a shaded disc with seas and craters */}
      <g transform={`translate(${MOON.x - 860} ${MOON.y - 96})`}>
      <circle cx="860" cy="96" r="250" fill={`url(#${id}-halo)`} />
      <circle cx="860" cy="96" r="128" fill={`url(#${id}-corona)`} />
      <circle cx="860" cy="96" r="70" fill="none" stroke="#cfefff" strokeOpacity=".12" strokeWidth="1.5" />
      <g className="moonrays" fill={`url(#${id}-ray)`} opacity=".1">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M860 96 L851 -420 L869 -420 Z" transform={`rotate(${i * 30} 860 96)`} />
        ))}
      </g>
      <circle cx="860" cy="96" r="52" fill="#dff4ff" opacity=".22" style={{ filter: 'blur(6px)' }} />
      <circle cx="860" cy="96" r="44" fill={`url(#${id}-moon)`} />
      <g transform="translate(860 96)">
        <g fill="#8fb0ca" opacity=".42" style={{ filter: 'blur(.6px)' }}>
          {MARIA.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g fill="none" stroke="#9cbcd4" strokeOpacity=".55" strokeWidth=".9">
          <circle cx="-26" cy="18" r="4" />
          <circle cx="20" cy="-6" r="2.6" />
          <circle cx="-6" cy="30" r="3" />
          <circle cx="28" cy="24" r="2" />
        </g>
        <g fill="#ffffff" opacity=".7">
          <circle cx="-25" cy="17" r="1.2" />
          <circle cx="-6" cy="29" r="1" />
        </g>
        {/* rays from a bright young crater */}
        <g stroke="#ffffff" strokeOpacity=".22" strokeWidth=".8">
          <path d="M-6 30 L-20 40 M-6 30 L8 42 M-6 30 L-4 16 M-6 30 L-22 26" />
        </g>
      </g>
      <circle cx="860" cy="96" r="44" fill={`url(#${id}-limb)`} />
      <circle cx="860" cy="96" r="43.5" fill="none" stroke="#fff" strokeOpacity=".65" />
      </g>

      {/* a hazy far range, then tepuis in moonlit haze, a distant waterfall, and rolling hills */}
      <path d={FAR_RANGE} fill={`url(#${id}-range)`} opacity=".42" />
      <path d={FAR_RANGE.split(' L1000 470')[0]} stroke="#c8f2ff" strokeOpacity=".18" fill="none" />
      <g style={{ filter: 'blur(22px)' }}>
        <ellipse cx="500" cy="330" rx="640" ry="60" fill="#7ff0dc" opacity=".14" />
      </g>
      <path d={`${TEPUI_TOP} L1000 470 L0 470 Z`} fill={`url(#${id}-far)`} opacity=".9" />
      {/* moonlit cliff faces on the tepuis, brighter on the side facing the moon */}
      <g stroke="#a6e6f4" strokeOpacity=".12" strokeWidth="1">
        <path d="M160 260 L168 300 M440 248 L452 300 M462 246 L476 296 M812 236 L826 286 M834 236 L850 288" />
      </g>
      <path d={TEPUI_TOP} stroke="#bff0fa" strokeOpacity=".42" strokeWidth="1.3" fill="none" />
      <g>
        <path d="M402 242 C401 270 402 300 404 340" stroke="#e8fbff" strokeOpacity=".55" strokeWidth="2" fill="none" />
        <path className="fall" d="M402 242 C401 270 402 300 404 340" stroke="#ffffff" strokeOpacity=".8" strokeWidth="1" strokeDasharray="10 4" fill="none" style={{ animationDuration: '1.4s' }} />
        <ellipse cx="404" cy="338" rx="16" ry="6" fill="#dff8ff" opacity=".3" style={{ filter: 'blur(4px)' }} />
      </g>
      <rect className="mist" x="-100" y="270" width="1200" height="120" fill={`url(#${id}-mist)`} />
      <path d={HILLS} fill={`url(#${id}-mid)`} />
      <path d={HILLS.split(' L1000 470')[0]} stroke="#7fd6e8" strokeOpacity=".16" fill="none" />
      <rect className="mist" x="-100" y="336" width="1200" height="96" fill={`url(#${id}-mist)`} style={{ animationDelay: '-12s' }} />
    </g>
  );
});

/** Flock, butterflies and the high wildlife layer (behind the bird). */
export const SceneFauna = memo(function SceneFauna() {
  return (
    <g>
      <g transform="translate(0 150)">
        <g className="flock-path">
          <ParrotFlock />
        </g>
      </g>
      <g transform="translate(600 300)">
        <g className="drift-a">
          <Morpho />
        </g>
      </g>
      <g transform="translate(770 410) scale(.8)">
        <g className="drift-b">
          <Morpho />
        </g>
      </g>
    </g>
  );
});

const TREELINE_FAR = canopyPath(404, 3, 14, 28);
const TREELINE_NEAR = canopyPath(432, 7, 12, 22);

const BIO_COLORS = ['#5ff0ff', '#9dff7a', '#7fb8ff', '#ff8ad8'];
/** Glowing specks in the tree line: [x, y, colour, twinkle delay]; kept off the tepui and waterfall. */
const BIOLUME: [number, number, string, number][] = Array.from({ length: 30 }, (_, i): [number, number, string, number] => [
  Math.round(rand(i + 2000) * 1000),
  Math.round(424 + rand(i + 2100) * 34),
  BIO_COLORS[i % 4],
  +(rand(i + 2200) * 3.2).toFixed(1),
]).filter(([x]) => x < 578 || x > 846);

/** The moonbow over the plunge pool: [radius, colour], outermost first. */
const MOONBOW: [number, string][] = [
  [128, '#ff7a7a'],
  [123, '#ffc46a'],
  [118, '#f4ff8a'],
  [113, '#7cffaa'],
  [108, '#6ad0ff'],
  [103, '#9a86ff'],
];

// gentle wave lines across the lagoon: [y, x offset, dash, opacity]
const WAVES: [number, number, string, number][] = [
  [466, 0, '60 40 20 50', 0.16],
  [478, 30, '90 60 30 40', 0.13],
  [492, 10, '40 70 80 50', 0.11],
  [508, 50, '120 80 40 60', 0.1],
  [526, 20, '70 90 50 70', 0.08],
  [546, 60, '140 100 60 80', 0.07],
];

// [x, width, opacity, delay, dash, duration]: dash periods divide 56 so the loop is seamless
const FALL_STREAKS: [number, number, number, number, string, number][] = [
  [665, 1.4, 0.7, 0, '16 12', 0.8],
  [671, 2.4, 0.9, -0.3, '20 8', 0.7],
  [679, 1.2, 0.6, -0.5, '8 6', 0.9],
  [687, 3, 0.95, -0.1, '22 6', 0.65],
  [695, 1.6, 0.7, -0.4, '12 16', 0.8],
  [703, 2.4, 0.85, -0.6, '18 10', 0.7],
  [711, 1.4, 0.65, -0.2, '16 12', 0.85],
  [716, 1, 0.5, -0.7, '8 6', 0.95],
];

// [x, y, width, stroke, delay]: moon and waterfall glints on the lagoon
const GLINTS: [number, number, number, number, number][] = [
  [816, 470, 60, 2.4, 0],
  [826, 482, 44, 2, 0.4],
  [812, 494, 54, 1.8, 0.8],
  [824, 506, 30, 1.6, 1.2],
  [816, 518, 40, 1.5, 0.2],
  [828, 530, 22, 1.3, 0.6],
  [818, 542, 30, 1.2, 1],
  [690, 484, 40, 2, 0.3],
  [692, 500, 54, 1.6, 0.9],
  [688, 516, 30, 1.3, 1.5],
];

const PLATEAU: [number, number, number][] = [
  [604, 246, 14],
  [622, 240, 16],
  [642, 238, 13],
  [734, 236, 14],
  [756, 232, 18],
  [780, 234, 15],
  [802, 238, 13],
  [818, 248, 10],
];

const CANOPY: [number, number, number][] = [
  [356, 234, 28],
  [388, 214, 36],
  [428, 206, 40],
  [466, 222, 30],
  [402, 182, 30],
  [442, 176, 26],
  [374, 196, 24],
  [488, 238, 18],
  [336, 248, 18],
  [412, 238, 30],
  [450, 246, 22],
];

const CANOPY_TIPS: [number, number, number][] = [
  [328, 258, 110],
  [348, 264, 80],
  [370, 268, 108],
  [392, 270, 76],
  [416, 272, 100],
  [438, 270, 70],
  [460, 268, 104],
  [480, 260, 78],
  [500, 250, 60],
  [372, 172, -120],
  [398, 152, -96],
  [436, 148, -74],
  [464, 164, -52],
];

const FIREFLIES: [number, number, number][] = [
  [480, 360, 0],
  [560, 440, 1.1],
  [760, 400, 2],
  [340, 420, 0.5],
  [880, 300, 1.6],
  [620, 380, 2.6],
  [520, 470, 3.1],
  [300, 380, 1.9],
  [940, 380, 0.8],
  [700, 330, 3.6],
];

const CLUMP_ANGLES = [-160, -120, -80, -40, 0, 40, 80, 120, 160];

/** Leaves facing the moon (upper right) catch the light. */
function leafTone(angle: number) {
  const a = ((angle % 360) + 540) % 360 - 180; // -180..180, 0 = pointing right, -90 = up
  if (a > -100 && a < 10) return '#1f6e4e';
  if (a <= -100 || a > 150) return '#0f4436';
  return '#0a3329';
}

export const SceneJungle = memo(function SceneJungle() {
  const id = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#145f86" />
          <stop offset=".3" stopColor="#0b4266" />
          <stop offset="1" stopColor="#020c18" />
        </linearGradient>
        <linearGradient id={`${id}-fall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2fdff" />
          <stop offset=".35" stopColor="#b8f0ff" stopOpacity=".95" />
          <stop offset=".75" stopColor="#6fd2f5" stopOpacity=".9" />
          <stop offset="1" stopColor="#3aa8d8" stopOpacity=".85" />
        </linearGradient>
        <linearGradient id={`${id}-reflect`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bff4ff" stopOpacity=".42" />
          <stop offset="1" stopColor="#bff4ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-rock`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0a1f33" />
          <stop offset=".65" stopColor="#0f2d47" />
          <stop offset="1" stopColor="#1d5070" />
        </linearGradient>
        <linearGradient id={`${id}-bark`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0e181a" />
          <stop offset=".45" stopColor="#273836" />
          <stop offset=".78" stopColor="#3a524d" />
          <stop offset="1" stopColor="#16211f" />
        </linearGradient>
        <linearGradient id={`${id}-branch`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a605a" />
          <stop offset=".5" stopColor="#2a3a37" />
          <stop offset="1" stopColor="#141e1d" />
        </linearGradient>
        <clipPath id={`${id}-lagoon`}>
          <rect x="0" y="456" width="1000" height="104" />
        </clipPath>
      </defs>

      {/* an ancient temple rising out of the far jungle */}
      <Temple />

      {/* far jungle tree lines in haze, with rainforest giants above them */}
      <Emergent x={64} y={412} s={0.95} fill="#0f3a58" rim="#6fc6e0" />
      <Emergent x={968} y={410} s={0.8} r={3} fill="#0f3a58" rim="#6fc6e0" />
      <Emergent x={540} y={410} s={0.62} r={-2} fill="#0f3a58" rim="#6fc6e0" />
      <path d={TREELINE_FAR} fill="#0d3350" />
      <path d={TREELINE_FAR.split(' L1000 470')[0].replace('M0 470 L0', 'M0')} stroke="#5fb8d0" strokeOpacity=".22" fill="none" />
      <Palm x={500} y={408} s={0.7} r={-4} fill="#0d3350" />
      <Palm x={548} y={410} s={0.56} r={6} fill="#0d3350" />
      <Palm x={880} y={410} s={0.74} r={-6} fill="#0d3350" />
      <Palm x={936} y={408} s={0.6} r={5} fill="#0d3350" />
      <Palm x={120} y={410} s={0.62} r={-3} fill="#0d3350" />
      <path d={TREELINE_NEAR} fill="#092840" />
      <rect x="0" y="370" width="1000" height="90" fill="#4fc4b4" opacity=".06" />
      {/* bioluminescence deep in the forest */}
      {BIOLUME.map(([x, y, c, d], i) => (
        <g key={i} className="twinkle" fill={c} style={{ animationDelay: `${d}s` }}>
          <circle cx={x} cy={y} r="4.4" opacity=".26" />
          <circle cx={x} cy={y} r={i % 3 ? 1.1 : 1.6} />
        </g>
      ))}

      {/* the tepui and its waterfall */}
      <path
        d="M580 470 L584 312 C586 282 594 258 606 246 L652 240 L662 244 L718 244 L726 238 L798 240 C814 246 826 264 830 292 L842 470 Z"
        fill={`url(#${id}-rock)`}
      />
      <g stroke="#04121f" strokeOpacity=".55" strokeWidth="1.4" fill="none">
        <path d="M598 262 L594 470 M616 252 L614 470 M636 248 L638 470 M650 250 L648 470" />
        <path d="M742 246 L744 470 M760 244 L758 470 M782 246 L786 470 M806 254 L812 470 M822 274 L828 470" />
      </g>
      <g stroke="#3f8fb0" strokeOpacity=".26" strokeWidth="1" fill="none">
        <path d="M606 262 L604 470 M626 252 L626 470 M750 246 L750 470 M772 246 L774 470 M796 250 L800 470" />
      </g>
      <g fill="#071a2a">
        <path d="M588 352 L652 348 L650 356 L590 360 Z" />
        <path d="M730 330 L814 334 L816 342 L730 338 Z" />
      </g>
      <g fill="#1f6c4c">
        <ellipse cx="612" cy="348" rx="18" ry="4" />
        <ellipse cx="772" cy="330" rx="22" ry="4" />
      </g>
      <path d="M606 246 L652 240 M726 238 L798 240 C814 246 826 264 830 292 L842 470" stroke="#7fd0ec" strokeOpacity=".55" strokeWidth="1.6" fill="none" />
      <g fill="#082e25">
        {PLATEAU.map(([x, y, r]) => (
          <circle key={x} cx={x} cy={y} r={r * 0.85} />
        ))}
      </g>
      {PLATEAU.map(([x, y, r]) =>
        CLUMP_ANGLES.map((ang, j) => (
          <Leaf key={`${x}-${j}`} x={x} y={y - 2} r={ang + (x % 13)} s={(r * (j % 2 ? 0.8 : 1)) / 27} fill={leafTone(ang + (x % 13))} vein="#0a3328" />
        )),
      )}
      <Palm x={634} y={238} s={0.32} r={-6} fill="#0b3a2e" />
      <Palm x={792} y={234} s={0.36} r={8} fill="#0b3a2e" />
      <Vine d="M600 256 C596 290 604 320 598 350" leaves={[[598, 284, 30], [602, 318, -30], [598, 346, 20]]} />
      <Vine d="M824 270 C830 300 822 330 828 370" leaves={[[828, 300, -30], [824, 336, 30], [828, 366, -20]]} />

      <g style={{ filter: 'blur(16px)' }}>
        <rect x="640" y="250" width="100" height="220" fill="#7fe6ff" opacity=".16" />
      </g>
      <path d="M662 244 C662 300 657 384 650 462 L730 462 C723 384 718 300 718 244 Z" fill={`url(#${id}-fall)`} />
      <g fill="none" strokeLinecap="round">
        <path d="M677 252 C676 320 673 400 669 462" stroke="#3d9fcc" strokeWidth="6" opacity=".28" />
        <path d="M704 252 C705 320 708 400 712 462" stroke="#3d9fcc" strokeWidth="5" opacity=".24" />
      </g>
      <g stroke="#ffffff" strokeLinecap="round" fill="none">
        {FALL_STREAKS.map(([x, w, o, delay, dash, dur]) => (
          <path
            key={x}
            className="fall"
            d={`M${x} 248 C${x} 320 ${(x + (x - 690) * 0.12).toFixed(1)} 400 ${(x + (x - 690) * 0.3).toFixed(1)} 460`}
            strokeWidth={w}
            opacity={o}
            strokeDasharray={dash}
            style={{ animationDelay: `${delay}s`, animationDuration: `${dur}s` }}
          />
        ))}
      </g>
      <path d="M662 244 C662 300 657 384 650 462" stroke="#fff" strokeOpacity=".75" strokeWidth="1.6" fill="none" />
      <path d="M718 244 C718 300 723 384 730 462" stroke="#dff8ff" strokeOpacity=".45" strokeWidth="1.2" fill="none" />
      <path d="M654 246 C668 234 712 234 726 246 C712 252 668 252 654 246 Z" fill="#f4feff" />
      <path d="M662 242 C676 236 704 236 718 242" stroke="#ffffff" strokeWidth="1.4" fill="none" />

      {/* a moonbow arching through the spray, and the spray cloud rising off the plunge pool */}
      <g style={{ filter: 'blur(2.4px)', mixBlendMode: 'screen' }} opacity=".5" fill="none">
        {MOONBOW.map(([r, c]) => (
          <path key={r} d={`M${690 - r} 462 A${r} ${r} 0 0 1 ${690 + r} 462`} stroke={c} strokeWidth="5" strokeOpacity=".55" />
        ))}
      </g>
      <g style={{ filter: 'blur(14px)' }} fill="#dff8ff">
        <circle className="foam" cx="666" cy="436" r="30" opacity=".16" style={{ animationDuration: '4s' }} />
        <circle className="foam" cx="716" cy="428" r="34" opacity=".14" style={{ animationDuration: '5s', animationDelay: '-1.5s' }} />
        <circle className="foam" cx="690" cy="410" r="26" opacity=".1" style={{ animationDuration: '4.5s', animationDelay: '-3s' }} />
      </g>

      {/* toucan on a branch at the right edge, clear of the flight path */}
      <path d="M1004 296 C966 302 924 310 852 320" stroke="#1d2a2c" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M1004 293 C966 299 924 307 852 317" stroke="#5f8f8a" strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <Leaf x={858} y={316} r={150} s={0.7} />
      <Leaf x={944} y={302} r={-30} s={0.65} />
      <Leaf x={900} y={310} r={70} s={0.55} />
      <g transform="translate(886 286)">
        <Toucan />
      </g>

      {/* lagoon */}
      <rect x="0" y="456" width="1000" height="104" fill={`url(#${id}-water)`} />
      {/* upside-down reflections of the tree line, tepui and waterfall, broken up by the water */}
      <g clipPath={`url(#${id}-lagoon)`}>
        <g transform="matrix(1 0 0 -1 0 912)" style={{ filter: 'blur(2px)' }}>
          <path d={TREELINE_NEAR} fill="#041a2c" opacity=".55" />
          <path
            d="M580 470 L584 312 C586 282 594 258 606 246 L652 240 L662 244 L718 244 L726 238 L798 240 C814 246 826 264 830 292 L842 470 Z"
            fill="#06203a"
            opacity=".7"
          />
          <path d="M662 244 C662 300 657 384 650 462 L730 462 C723 384 718 300 718 244 Z" fill="#9fe6ff" opacity=".22" />
        </g>
      </g>
      <rect x="0" y="456" width="1000" height="16" fill="#03142a" opacity=".35" />
      <g stroke="#bff0ff" strokeWidth="1" fill="none">
        {WAVES.map(([y, off, dash, o]) => (
          <line key={y} x1={-off} x2={1000} y1={y} y2={y} strokeDasharray={dash} strokeOpacity={o} />
        ))}
      </g>
      <line x1="0" y1="456.5" x2="1000" y2="456.5" stroke="#a8ecff" strokeOpacity=".35" />
      <g fill="none">
        {SHORE_REEDS.map(([x, h, c, d]) => (
          <g key={x}>
            <path d={`M${x.toFixed(1)} 458 q${h % 2 > 1 ? 2 : -2} ${(-h / 2).toFixed(1)} ${h % 2 > 1 ? 3 : -3} ${(-h).toFixed(1)}`} stroke="#0b3a38" strokeWidth="1.5" />
            <g className="twinkle" fill={c} style={{ animationDelay: `${d}s` }}>
              <circle cx={(x + (h % 2 > 1 ? 3 : -3)).toFixed(1)} cy={(458 - h).toFixed(1)} r="5" opacity=".28" />
              <circle cx={(x + (h % 2 > 1 ? 3 : -3)).toFixed(1)} cy={(458 - h).toFixed(1)} r="1.8" />
            </g>
          </g>
        ))}
      </g>
      <g style={{ filter: 'blur(5px)' }}>
        <rect x="650" y="462" width="80" height="84" fill={`url(#${id}-reflect)`} />
        <ellipse cx={MOON.x} cy="506" rx="34" ry="54" fill="#bfe8ff" opacity=".12" />
      </g>
      <g stroke="#e8f8ff" strokeLinecap="round">
        {GLINTS.map(([x, y, w, sw, d]) => (
          <line key={`${x}-${y}`} className="shimmer" x1={x - w / 2} x2={x + w / 2} y1={y} y2={y} strokeWidth={sw} style={{ animationDelay: `${d}s` }} />
        ))}
      </g>
      <g fill="none" stroke="#bfefff" opacity=".5">
        <ellipse className="ripple" cx="690" cy="470" rx="44" ry="6" strokeWidth="1.4" />
        <ellipse className="ripple" cx="690" cy="470" rx="44" ry="6" strokeWidth="1.4" style={{ animationDelay: '1.2s' }} />
      </g>
      <g style={{ filter: 'blur(7px)' }} fill="#e8fbff">
        <ellipse cx="690" cy="466" rx="70" ry="12" opacity=".32" />
        <circle className="foam" cx="656" cy="460" r="12" />
        <circle className="foam" cx="674" cy="454" r="17" style={{ animationDelay: '.5s' }} />
        <circle className="foam" cx="694" cy="451" r="20" style={{ animationDelay: '.2s' }} />
        <circle className="foam" cx="714" cy="455" r="17" style={{ animationDelay: '.8s' }} />
        <circle className="foam" cx="732" cy="461" r="12" style={{ animationDelay: '1.1s' }} />
      </g>
      <g fill="#ffffff">
        {[
          [664, 0],
          [676, 0.5],
          [690, 0.25],
          [704, 0.9],
          [718, 0.6],
          [684, 1.2],
          [700, 1.5],
        ].map(([x, d]) => (
          <circle key={x} className="spray" cx={x} cy="456" r="1.6" style={{ animationDelay: `${d}s` }} />
        ))}
      </g>
      {/* bioluminescent plankton glowing around the lily pads */}
      <g style={{ filter: 'blur(7px)' }} fill="#3ff0ff">
        <ellipse className="glow-pulse" cx="560" cy="496" rx="64" ry="14" opacity=".2" />
        <ellipse className="glow-pulse" cx="648" cy="532" rx="80" ry="16" opacity=".2" style={{ animationDelay: '-1s' }} />
        <ellipse className="glow-pulse" cx="900" cy="512" rx="60" ry="12" opacity=".18" style={{ animationDelay: '-2s' }} />
        <ellipse className="glow-pulse" cx="792" cy="549" rx="44" ry="9" opacity=".16" style={{ animationDelay: '-.5s' }} />
      </g>
      <g fill="#bffcff">
        {[
          [512, 500, 0],
          [604, 490, 1.1],
          [586, 540, 2.2],
          [716, 528, 0.6],
          [760, 512, 1.8],
          [846, 520, 2.6],
          [956, 516, 0.3],
          [826, 552, 1.4],
          [470, 520, 2.9],
        ].map(([x, y, d]) => (
          <circle key={`p${x}`} className="twinkle" cx={x} cy={y} r="1.3" style={{ animationDelay: `${d}s` }} />
        ))}
      </g>
      <LilyPad x={560} y={494} rx={46} ry={9} />
      <LilyPad x={648} y={530} rx={58} ry={11} r={4} />
      <LilyPad x={900} y={510} rx={42} ry={8} r={-4} />
      <LilyPad x={792} y={548} rx={30} ry={6} r={8} />
      <Lotus x={642} y={526} />
      <Lotus x={908} y={506} s={0.75} />
      <rect className="mist" x="-120" y="440" width="1240" height="40" fill="#bfefff" opacity=".06" />

      {/* the perch tree */}
      <path d="M366 534 C382 520 392 504 398 482 L410 490 C404 510 392 526 380 538 Z" fill="#121c1d" />
      <path d="M472 534 C456 520 446 504 440 484 L430 492 C436 510 448 526 460 538 Z" fill="#121c1d" />
      <path
        d="M386 528 C396 502 401 470 402 430 C403 372 404 300 410 232 L438 230 C434 300 431 372 433 430 C434 470 442 502 456 528 Z"
        fill={`url(#${id}-bark)`}
      />
      <g stroke="#0a1213" strokeOpacity=".6" strokeWidth="1.2" fill="none">
        <path d="M412 250 C410 300 412 360 410 420 C409 460 404 490 398 520" />
        <path d="M425 248 C425 310 423 380 425 440 C427 480 433 506 441 524" />
        <path d="M417 300 C418 330 416 350 418 380" />
      </g>
      <path d="M438 230 C434 300 431 372 433 430 C434 470 442 502 456 528" stroke="#8fd0e0" strokeOpacity=".32" strokeWidth="1.6" fill="none" />
      <path
        d="M402 470 C414 456 430 452 434 436 M404 380 C414 372 428 368 432 356 M408 300 C418 296 430 288 434 276"
        stroke="#2c4f3e"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <g fill="#2a7a50">
        <ellipse cx="404" cy="462" rx="7" ry="4" />
        <ellipse cx="434" cy="404" rx="6" ry="3" />
        <ellipse cx="406" cy="340" rx="6" ry="3" />
      </g>
      <path d="M430 433 C470 427 522 418 598 409 L600 415 C522 426 472 438 432 450 Z" fill={`url(#${id}-branch)`} />
      <path d="M430 433 C470 427 522 418 598 409" stroke="#3f9a62" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".85" />
      <path d="M470 428 C500 423 530 419 562 415" stroke="#a8e6f0" strokeOpacity=".35" strokeWidth="1" fill="none" />
      <path d="M560 418 C574 404 586 396 602 392" stroke="#2a3836" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Leaf x={600} y={392} r={-34} s={0.7} />
      <Leaf x={600} y={393} r={18} s={0.6} fill="#185a3e" />
      <Leaf x={590} y={404} r={42} s={0.55} />
      <Leaf x={598} y={412} r={-6} s={0.55} fill="#185a3e" />
      <Leaf x={472} y={432} r={64} s={0.5} />
      <Bromeliad x={416} y={318} s={1.1} />
      <g className="sway-top" stroke="#2f6a5a" strokeWidth="1.6" fill="none" opacity=".85">
        <path d="M478 429 C476 438 480 446 477 456 M486 428 C489 436 485 444 488 450 M548 420 C546 429 550 437 547 447 M556 418 C558 425 555 431 557 437" />
      </g>
      <Mushroom x={402} y={360} r={-80} s={0.9} />
      <Mushroom x={436} y={396} r={80} s={0.8} color="#ff9ad8" />

      {/* canopy, lit from the moon at the upper right */}
      <g fill="#06261f">
        {CANOPY.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </g>
      {CANOPY_TIPS.map(([x, y, a]) => (
        <Leaf key={`${x}-${y}`} x={x} y={y} r={a} s={0.95} fill={a < 0 ? '#0d3b2f' : '#06261f'} vein="#134436" />
      ))}
      {CANOPY.map(([x, y, r]) =>
        CLUMP_ANGLES.map((ang, j) => (
          <Leaf
            key={`${x}-${y}-${j}`}
            x={x + 3}
            y={y - 4}
            r={ang + ((x + y) % 17)}
            s={(r * (j % 2 ? 0.86 : 1.04)) / 27}
            fill={leafTone(ang + ((x + y) % 17))}
            vein="#0a3328"
          />
        )),
      )}
      <g fill="#2f8a5e" opacity=".55">
        {CANOPY.map(([x, y, r]) => (
          <ellipse key={`${x}-${y}`} cx={x + r * 0.35} cy={y - r * 0.42} rx={r * 0.22} ry={r * 0.1} transform={`rotate(-30 ${x + r * 0.35} ${y - r * 0.42})`} />
        ))}
      </g>
      <g className="sway-top">
        <path d="M352 252 C350 268 356 282 352 298 M470 250 C474 258 470 266 474 274" stroke="#123d30" strokeWidth="2.4" fill="none" />
        <Orchid x={352} y={300} s={0.7} />
        <Orchid x={474} y={276} s={0.6} color="#7fe3ff" />
      </g>

      {/* drifting pollen motes */}
      <g fill="#dff7ff">
        {[
          [300, 470, 0],
          [470, 500, 1.4],
          [540, 380, 2.6],
          [610, 470, 0.8],
          [760, 450, 3.2],
          [850, 400, 1.9],
          [930, 470, 4.1],
          [380, 330, 3.6],
        ].map(([x, y, d]) => (
          <circle key={`m${x}`} className="mote" cx={x} cy={y} r="1.4" style={{ animationDelay: `${d}s` }} />
        ))}
      </g>

      {/* fireflies, each with a soft glow */}
      <g fill="#d6ff7a">
        {FIREFLIES.map(([x, y, d]) => (
          <g key={`${x}-${y}`} className="firefly" style={{ animationDelay: `${d}s` }}>
            <circle cx={x} cy={y} r="7" opacity=".26" />
            <circle cx={x} cy={y} r="2.2" />
          </g>
        ))}
      </g>
    </g>
  );
});

/** Soft moonbeams falling through the jungle; drawn over the mid layers. */
export const SceneLight = memo(function SceneLight() {
  const id = useId().replace(/:/g, '');
  const beams = [
    { d: 'M806 166 L834 166 L600 560 L520 560 Z', delay: 0 },
    { d: 'M796 172 L816 172 L390 560 L330 560 Z', delay: 1.6 },
    { d: 'M832 170 L850 170 L820 560 L760 560 Z', delay: 3.1 },
  ];
  return (
    <g style={{ mixBlendMode: 'screen' }} pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfefff" stopOpacity=".16" />
          <stop offset=".7" stopColor="#8fd6ff" stopOpacity=".05" />
          <stop offset="1" stopColor="#8fd6ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {beams.map((b) => (
        <path key={b.d} className="beam" d={b.d} fill={`url(#${id}-beam)`} style={{ animationDelay: `${b.delay}s` }} />
      ))}
    </g>
  );
});

/** The bank the poacher stands on. */
export const SceneBank = memo(function SceneBank() {
  const id = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-bank`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#123a30" />
          <stop offset="1" stopColor="#041210" />
        </linearGradient>
      </defs>
      <Fern x={-6} y={506} s={1.1} fill="#0f4a38" />
      <Fern x={300} y={516} s={0.9} r={-4} fill="#0f4a38" />
      <path d="M0 500 C110 484 280 488 452 514 L452 560 L0 560 Z" fill={`url(#${id}-bank)`} />
      <path d="M0 500 C110 484 280 488 452 514" stroke="#2f7a5a" strokeWidth="2" fill="none" opacity=".8" />
      {/* mossy stones, grass and small glowing flowers along the bank */}
      <g fill="#20483f" stroke="#3f8a70" strokeOpacity=".5">
        <ellipse cx="196" cy="512" rx="13" ry="6" />
        <ellipse cx="412" cy="524" rx="17" ry="7" />
        <ellipse cx="330" cy="538" rx="11" ry="5" />
      </g>
      {BANK_TUFTS.map((g) => (
        <GrassTuft key={g.x} x={g.x} y={g.y + 2} s={g.s} />
      ))}
      {BANK_FLOWERS.map((g) => (
        <GlowFlower key={g.x} x={g.x} y={g.y - 12} s={g.s} color={g.c} />
      ))}
      <Heliconia x={332} y={522} s={0.95} />
      <GlowBells x={420} y={516} />
      <GlowBells x={24} y={520} s={0.8} color="#7fe3ff" />
      <Mushroom x={392} y={530} />
      <Mushroom x={186} y={534} s={0.8} color="#ff9ad8" />
      <g transform="translate(372 452)">
        <g className="hover-a">
          <Hummingbird />
        </g>
      </g>
    </g>
  );
});

/** The strip of shore below the scene, which only phones show (the stage's viewBox runs to y = 680 there). */
export const SceneNearShore = memo(function SceneNearShore() {
  const id = useId().replace(/:/g, '');
  const tufts = Array.from({ length: 22 }, (_, i) => ({ x: 12 + i * 46 + rand(i + 4400) * 18, s: 0.8 + rand(i + 4500) * 0.7 }));
  const flowers = [
    { x: 150, c: '#ff8ad8' },
    { x: 330, c: '#ffd86a' },
    { x: 560, c: '#7fe3ff' },
    { x: 760, c: '#ff8ad8' },
    { x: 910, c: '#ffd86a' },
  ];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-shore`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#123a30" />
          <stop offset="1" stopColor="#020a09" />
        </linearGradient>
      </defs>
      <rect x="0" y="558" width="1000" height="130" fill="#020c18" />
      <path d="M0 556 H452 C486 588 470 612 420 620 L0 640 Z" fill="#041210" />
      <path d="M0 628 C130 604 270 616 430 606 C570 598 650 624 790 612 C880 606 950 616 1000 608 V690 H0 Z" fill={`url(#${id}-shore)`} />
      <path d="M0 628 C130 604 270 616 430 606 C570 598 650 624 790 612 C880 606 950 616 1000 608" stroke="#2f7a5a" strokeWidth="2" fill="none" opacity=".8" />
      {tufts.map((g) => (
        <GrassTuft key={g.x} x={g.x} y={622} s={g.s} />
      ))}
      {flowers.map((g) => (
        <GlowFlower key={g.x} x={g.x} y={616} color={g.c} />
      ))}
    </g>
  );
});

/**
 * Dark leaves, vines and glowing flowers that frame the shot. `canopy` hangs leaves and vines from
 * the top corners; tall (phone) stages leave it off, since open sky continues above the scene there.
 */
export const SceneForeground = memo(function SceneForeground({ canopy = true }: { canopy?: boolean }) {
  return (
    <g>
      {canopy && (
        <>
          {/* canopy hanging into the top corners, slightly soft for depth */}
          <g style={{ filter: 'blur(1.3px)' }}>
            <BananaLeaf x={40} y={-34} r={152} s={0.78} fill="#04140f" vein="#0c2c22" />
            <Monstera x={130} y={-50} r={196} s={0.62} fill="#051812" vein="#0e3328" />
            <BananaLeaf x={994} y={-30} r={204} s={0.74} fill="#04140f" vein="#0c2c22" />
          </g>
          <Vine d="M40 0 C46 50 34 100 42 160" leaves={[[44, 40, 30], [38, 80, -30], [42, 124, 30], [42, 158, -20]]} />
          <Vine d="M96 0 C92 30 100 60 94 92" leaves={[[94, 30, -30], [96, 64, 30], [94, 90, -20]]} />
          <Vine d="M968 0 C960 60 974 120 962 210" leaves={[[964, 50, 30], [970, 110, -30], [964, 170, 30], [962, 208, -10]]} />
        </>
      )}
      {/* the nearest leaves are slightly soft, for depth of field */}
      <g style={{ filter: 'blur(1.4px)' }}>
        <BananaLeaf x={1010} y={560} r={-28} s={1.1} fill="#061a16" vein="#0f3a2c" />
        <Monstera x={930} y={566} r={-18} s={1.15} fill="#071d18" vein="#123d30" />
      </g>
      <Heliconia x={980} y={540} s={1.1} />
      <GlowBells x={900} y={548} s={1.1} />
      <Orchid x={952} y={456} s={0.9} />
      <g transform="translate(930 430)">
        <g className="hover-b">
          <Hummingbird hue="#ff5fd2" />
        </g>
      </g>
      <g style={{ filter: 'blur(1.4px)' }}>
        <Monstera x={-14} y={572} r={28} s={0.9} fill="#071d18" vein="#123d30" />
      </g>
    </g>
  );
});
