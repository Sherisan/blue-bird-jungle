import { useId } from 'react';

/*
 * Rato's trophy cage, drawn around the centre of its base at (0, 0). It comes in two parts so a bird
 * can sit between them: `back` (plinth, floor, far bars, swing) and `front` (near bars, door, padlock).
 */

export interface CageProps {
  /** Which half to draw. */
  part?: 'back' | 'front' | 'all';
  /** 1 = swung wide open, 0 = shut. */
  door?: number;
  /** 0 = shackle open, 1 = snapped shut. */
  lock?: number;
  /** Swing angle in degrees. */
  swing?: number;
  /** Cool rim light from the moon. */
  rim?: string;
}

/** Radius of the bars. */
const R = 46;
/** Where the bars meet the base. */
const FOOT = -10;
/** Where the dome starts. */
const SHOULDER = -74;
/** The top of the dome. */
const DOME = -132;
const DOME_H = SHOULDER - DOME;
/** The door spans the middle of the front, hinged on its left. */
const DOOR_K = 0.62;
const HINGE = -R * DOOR_K;
const DOOR_W = 2 * R * DOOR_K;
const DOOR_TOP = SHOULDER + 2;
const DOOR_BOT = FOOT;

const f = (n: number) => n.toFixed(1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Where the padlock hangs, relative to the base. */
export const LOCK_POINT = { x: -HINGE + 5, y: lerp(DOOR_TOP, DOOR_BOT, 0.46) + 13 };

/** One bar: straight up the side, then curving over the dome to the top. */
function meridian(k: number, from = FOOT) {
  const x = k * R;
  if (Math.abs(k) < 0.001) return `M0 ${from} L0 ${DOME}`;
  return `M${f(x)} ${from} L${f(x)} ${SHOULDER} A${f(Math.abs(x))} ${DOME_H} 0 0 ${k < 0 ? 1 : 0} 0 ${DOME}`;
}

/** The near half of a hoop at height y, bowing toward the viewer. */
const hoop = (y: number, rx: number, ry: number) => `M${f(-rx)} ${y} A${f(rx)} ${ry} 0 0 0 ${f(rx)} ${y}`;

const DOME_OUTLINE = `M${-R} ${FOOT} L${-R} ${SHOULDER} A${R} ${DOME_H} 0 0 1 0 ${DOME} A${R} ${DOME_H} 0 0 1 ${R} ${SHOULDER} L${R} ${FOOT} Z`;

const FAR_BARS = [-0.93, -0.74, -0.48, -0.17, 0.17, 0.48, 0.74, 0.93];
const SIDE_BARS = [-1, -0.84, 0.84, 1];
const CROWN_BARS = [-0.62, -0.34, 0, 0.34, 0.62];
const DOOR_BARS = [0.17, 0.34, 0.5, 0.66, 0.83];
const BRASS = '#e6bf72';
const BRASS_DARK = '#4a3210';

function Bar({ d, width = 2.8 }: { d: string; width?: number }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={BRASS_DARK} strokeWidth={width + 1.5} />
      <path d={d} stroke={BRASS} strokeWidth={width} />
    </g>
  );
}

function CageBack({ u, swing }: { u: (n: string) => string; swing: number }) {
  return (
    <g>
      <ellipse cx="0" cy="9" rx="76" ry="10" fill={u('shadow')} />
      {/* dark wooden plinth with brass feet and a name plate */}
      <path d="M-58 -10 C-58 -14 58 -14 58 -10 L61 5 C61 11 -61 11 -61 5 Z" fill={u('wood')} stroke="#1c0f05" strokeWidth="1.2" />
      <path d="M-58 -7 C-40 -2 40 -2 58 -7" stroke="#8a5a30" strokeOpacity=".7" strokeWidth="1.1" fill="none" />
      <path d="M-60 2 C-40 8 40 8 60 2" stroke={BRASS} strokeOpacity=".75" strokeWidth="1.5" fill="none" />
      <g fill={BRASS} stroke={BRASS_DARK} strokeWidth=".7">
        <path d="M-58 5 h14 l-3 7 h-8 Z" />
        <path d="M44 5 h14 l-3 7 h-8 Z" />
      </g>
      <g transform="translate(0 0)">
        <rect x="-19" y="-7" width="38" height="12" rx="2.4" fill={u('brass')} stroke={BRASS_DARK} strokeWidth=".9" />
        <text x="0" y="2" textAnchor="middle" fontFamily="Oxanium, sans-serif" fontWeight="800" fontSize="8.5" letterSpacing="1.6" fill="#3a2608">
          AZUL
        </text>
      </g>

      {/* glassy dark inside, far bars and floor */}
      <path d={DOME_OUTLINE} fill={u('inside')} />
      <g fill="none" stroke="#a8843e" strokeOpacity=".62" strokeWidth="1.5">
        {FAR_BARS.map((k) => (
          <path key={k} d={meridian(k)} />
        ))}
        <path d={`M${-R} ${SHOULDER} A${R} 6 0 0 1 ${R} ${SHOULDER}`} />
      </g>
      <ellipse cx="0" cy={FOOT} rx={R} ry="8" fill={u('floor')} stroke={BRASS_DARK} strokeWidth="1" />
      <g stroke="#d6b06a" strokeWidth="1.1" strokeLinecap="round" opacity=".85">
        <path d="M-30 -9 l8 -2 M-20 -6 l9 2 M-8 -11 l9 -1 M6 -6 l10 1 M18 -10 l9 2 M-14 -13 l6 2" />
      </g>
      <g transform="translate(-24 -9) rotate(78)">
        <path d="M0 0 C4.4 5 4.4 18 0 25 C-4.4 18 -4.4 5 0 0 Z" fill="#3a8dff" stroke="#0d2c80" strokeWidth=".6" />
      </g>
      {/* water dish */}
      <path d="M18 -15 h20 l-3 8 h-14 Z" fill={u('brass')} stroke={BRASS_DARK} strokeWidth=".8" />
      <ellipse cx="28" cy="-15" rx="10" ry="2.4" fill="#7fe3ff" />

      {/* swing, hung from the top of the dome */}
      <g transform={`rotate(${f(swing)} 0 -120)`}>
        <path d="M0 -120 L-19 -34 M0 -120 L19 -34" stroke="#c9a15a" strokeWidth="1.2" strokeDasharray="2.4 1.6" fill="none" />
        <circle cx="0" cy="-120" r="2.6" fill={BRASS} stroke={BRASS_DARK} strokeWidth=".7" />
        <rect x="-23" y="-36" width="46" height="5" rx="2.5" fill={u('wood')} stroke="#1c0f05" strokeWidth=".8" />
      </g>
    </g>
  );
}

function Padlock({ lock, u }: { lock: number; u: (n: string) => string }) {
  const open = 1 - lock;
  return (
    <g>
      <g transform={`translate(0 ${f(open * -4)}) rotate(${f(open * -42)} -5.4 -6)`}>
        <path d="M-5.4 -5 L-5.4 -12 A5.4 5.4 0 0 1 5.4 -12 L5.4 -5" fill="none" stroke="#3a414e" strokeWidth="5" strokeLinecap="round" />
        <path d="M-5.4 -5 L-5.4 -12 A5.4 5.4 0 0 1 5.4 -12 L5.4 -5" fill="none" stroke="#dfe7f0" strokeWidth="3" strokeLinecap="round" />
      </g>
      <rect x="-10.5" y="-7" width="21" height="17" rx="3.6" fill={u('brass')} stroke={BRASS_DARK} strokeWidth="1.2" />
      <path d="M-8.5 -4.8 H8.5" stroke="#fff6d2" strokeOpacity=".8" strokeWidth="1.2" strokeLinecap="round" />
      <circle cy="0.8" r="2.4" fill="#22160a" />
      <path d="M-1.1 1.6 L-1.8 6.4 H1.8 L1.1 1.6 Z" fill="#22160a" />
    </g>
  );
}

function CageFront({ u, door, lock, rim }: { u: (n: string) => string; door: number; lock: number; rim: string }) {
  // the door swings out toward the viewer, so its free edge grows as it opens
  const angle = (door * 118 * Math.PI) / 180;
  const freeX = HINGE + DOOR_W * Math.cos(angle);
  const lift = DOOR_W * Math.sin(angle);
  const freeTop = DOOR_TOP - lift * 0.1;
  const freeBot = DOOR_BOT + lift * 0.14;
  const pt = (t: number, v: number) => ({
    x: lerp(HINGE, freeX, t),
    y: lerp(lerp(DOOR_TOP, freeTop, t), lerp(DOOR_BOT, freeBot, t), v),
  });
  const seg = (t0: number, v0: number, t1: number, v1: number) => {
    const a = pt(t0, v0);
    const b = pt(t1, v1);
    return `M${f(a.x)} ${f(a.y)} L${f(b.x)} ${f(b.y)}`;
  };
  const latch = pt(1, 0.46);

  return (
    <g>
      {/* side bars run full height; above the door the middle bars rise into the dome */}
      {CROWN_BARS.map((k) => (
        <Bar key={k} d={meridian(k, SHOULDER)} />
      ))}
      {SIDE_BARS.map((k) => (
        <Bar key={k} d={meridian(k)} width={Math.abs(k) === 1 ? 3.8 : 2.8} />
      ))}
      <path d={meridian(0.84)} fill="none" stroke={rim} strokeOpacity=".6" strokeWidth="1" />
      <path d={meridian(1)} fill="none" stroke={rim} strokeOpacity=".75" strokeWidth="1.3" />

      {/* hoops */}
      <Bar d={hoop(FOOT, R, 8)} width={5} />
      <Bar d={hoop(SHOULDER, R, 7)} width={4.4} />
      <Bar d={hoop(-104, R * 0.83, 6)} width={2.6} />
      <g fill={BRASS} stroke={BRASS_DARK} strokeWidth=".6">
        {[-30, -15, 0, 15, 30].map((x) => {
          const y = SHOULDER + 7 * Math.sqrt(1 - (x / R) ** 2);
          return <path key={x} d={`M${x} ${f(y - 4)} l3.4 4 l-3.4 4 l-3.4 -4 Z`} />;
        })}
      </g>

      {/* crown and hanging ring */}
      <path d={`M-15 ${DOME + 3} C-11 ${DOME - 11} 11 ${DOME - 11} 15 ${DOME + 3} C8 ${DOME + 7} -8 ${DOME + 7} -15 ${DOME + 3} Z`} fill={u('brass')} stroke={BRASS_DARK} strokeWidth="1" />
      <path d={`M-9 ${DOME - 2} C-5 ${DOME - 8} 5 ${DOME - 8} 10 ${DOME - 3}`} stroke="#fff6d2" strokeOpacity=".75" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <circle cy={DOME - 13} r="4.2" fill={u('brass')} stroke={BRASS_DARK} strokeWidth=".9" />
      <circle cy={DOME - 24} r="7.4" fill="none" stroke={BRASS_DARK} strokeWidth="4.6" />
      <circle cy={DOME - 24} r="7.4" fill="none" stroke={BRASS} strokeWidth="3" />

      {/* trophy tag tied to a bar */}
      <g transform={`rotate(-10 ${f(R * 0.52)} -92)`}>
        <path d={`M${f(R * 0.52)} -96 L${f(R * 0.52 - 3)} -88`} stroke="#c9a15a" strokeWidth="1" />
        <rect x={R * 0.52 - 14} y="-88" width="23" height="14" rx="2" fill="#f2e6c2" stroke="#a08b58" strokeWidth=".8" />
        <path d={`M${R * 0.52 - 10} -83.6 h15 M${R * 0.52 - 10} -79 h10`} stroke="#8a5a30" strokeWidth="1" />
      </g>

      {/* the door */}
      <g fill="none" strokeLinecap="round">
        {DOOR_BARS.map((t) => (
          <Bar key={t} d={seg(t, 0, t, 1)} width={2.4} />
        ))}
        <Bar d={seg(0, 0.5, 1, 0.5)} width={2.2} />
        <Bar d={seg(0, 0, 1, 0)} width={3.6} />
        <Bar d={seg(0, 1, 1, 1)} width={3.6} />
        <Bar d={seg(0, 0, 0, 1)} width={3.4} />
        <Bar d={seg(1, 0, 1, 1)} width={3.4} />
      </g>
      <g fill={BRASS} stroke={BRASS_DARK} strokeWidth=".8">
        <rect x={HINGE - 3.4} y={DOOR_TOP + 7} width="6.8" height="9" rx="1.6" />
        <rect x={HINGE - 3.4} y={DOOR_BOT - 16} width="6.8" height="9" rx="1.6" />
      </g>
      <circle cx={f(latch.x)} cy={f(latch.y)} r="3.4" fill={BRASS} stroke={BRASS_DARK} strokeWidth=".9" />

      {/* the padlock hangs ready on the frame; it snaps once the door is home */}
      <rect x={-HINGE - 2.6} y={lerp(DOOR_TOP, DOOR_BOT, 0.46) - 5} width="9" height="10" rx="1.6" fill={BRASS} stroke={BRASS_DARK} strokeWidth=".8" />
      <g transform={`translate(${f(LOCK_POINT.x)} ${f(LOCK_POINT.y)}) scale(1.2)`}>
        <Padlock lock={lock} u={u} />
      </g>
    </g>
  );
}

export function Cage({ part = 'all', door = 1, lock = 0, swing = 0, rim = '#7fe3ff' }: CageProps) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `url(#${id}-${n})`;
  return (
    <g className="cage">
      <defs>
        <radialGradient id={`${id}-shadow`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".62" />
          <stop offset=".7" stopColor="#000" stopOpacity=".3" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a2412" />
          <stop offset=".6" stopColor="#6b4324" />
          <stop offset="1" stopColor="#8c5a30" />
        </linearGradient>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c4" />
          <stop offset=".45" stopColor="#e2b85a" />
          <stop offset="1" stopColor="#8a6420" />
        </linearGradient>
        <radialGradient id={`${id}-inside`} cx=".5" cy=".55" r=".65">
          <stop offset="0" stopColor="#123a5c" stopOpacity=".55" />
          <stop offset="1" stopColor="#040e1c" stopOpacity=".62" />
        </radialGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2c1a0c" />
          <stop offset="1" stopColor="#6a4526" />
        </linearGradient>
      </defs>
      {part !== 'front' && <CageBack u={u} swing={swing} />}
      {part !== 'back' && <CageFront u={u} door={door} lock={lock} rim={rim} />}
    </g>
  );
}
