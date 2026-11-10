import { memo, useId, useMemo } from 'react';

export type BirdState = 'perch' | 'fly' | 'caught' | 'caged';

/*
 * Azul, an original blue macaw (hyacinth-style: deep cobalt plumage, a bare
 * yellow eye ring and a yellow strip under a big dark hooked beak). Centred on
 * its body at (0, 0), facing right. Animated parts carry CSS classes from
 * stage.css: wing-near, wing-far, tail, blink, head-idle, dizzy, bird-aura.
 */

/** A tapered feather pointing up from (0, 0): length l, half-width w. */
const feather = (l: number, w: number) =>
  `M0 0 C${w} ${-l * 0.22} ${w * 0.75} ${-l * 0.78} 0 ${-l} C${-w * 0.75} ${-l * 0.78} ${-w} ${-l * 0.22} 0 0 Z`;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const BODY = 'M14 -32 C-6 -28 -28 -12 -36 6 C-34 16 -20 23 -6 24 C14 26 34 18 41 2 C44 -8 40 -20 32 -28 C26 -33 20 -33 14 -32 Z';
const HEAD = 'M13 -23 C12 -38 23 -47 35 -46 C47 -45 53 -36 53 -26 C53 -15 46 -7 34 -6 C22 -5 14 -12 13 -23 Z';
const BEAK_TOP = 'M44 -34 C58 -41 73 -29 71 -9 C70 1 64 6 58 4 C61 -5 56 -13 46 -15 C43 -21 42 -29 44 -34 Z';
const BEAK_LOW = 'M45 -15 C52 -14 58 -9 57 -2 C51 3 44 -1 42 -9 Z';
const SHOULDER = 'M-10 2 C-16 -8 -12 -26 0 -40 C6 -47 14 -50 19 -47 C24 -42 22 -34 17 -26 C12 -17 8 -10 4 -2 C0 3 -6 5 -10 2 Z';
const FOLD_CAP = 'M27 -15 C12 -25 -12 -21 -28 -5 C-20 8 4 9 22 0 C29 -5 31 -11 27 -15 Z';

// Graduated tail: drawn outer to inner, so the long middle feathers lie on top.
const TAIL_ROOT = { x: -28, y: 8 };
const TAIL = [
  { a: -133, l: 72, w: 6.5, c: 'tail-dark' },
  { a: -95, l: 78, w: 6.5, c: 'tail-dark' },
  { a: -125, l: 102, w: 7, c: 'tail-dark' },
  { a: -102, l: 106, w: 7, c: 'tail' },
  { a: -117, l: 128, w: 7.5, c: 'tail' },
  { a: -110, l: 140, w: 8, c: 'tail-hi' },
];

// Open wing, drawn with the shoulder at (0, 0). Primaries fan from the wrist, trailing feathers first.
const WRIST = { x: 12, y: -44 };
const PRIMARIES = [
  { a: -58, l: 50 },
  { a: -47, l: 55 },
  { a: -36, l: 60 },
  { a: -25, l: 64 },
  { a: -14, l: 67 },
  { a: -3, l: 68 },
  { a: 8, l: 64 },
  { a: 18, l: 56 },
].map((f, i) => ({ ...f, x: WRIST.x + i * 0.7, y: WRIST.y + (7 - i) * 0.5 }));

const along = (n: number, make: (t: number, i: number) => { x: number; y: number; a: number; l: number }) =>
  Array.from({ length: n }, (_, i) => make(i / (n - 1), i));

const SECONDARIES = along(7, (t) => ({ x: lerp(8, -16, t), y: lerp(-38, -6, t), a: lerp(-66, -108, t), l: lerp(54, 38, t) }));
const GREATER = along(9, (t) => ({ x: lerp(14, -14, t), y: lerp(-40, -6, t), a: lerp(-34, -106, t), l: lerp(26, 22, t) }));
const MEDIAN = along(7, (t) => ({ x: lerp(14, -7, t), y: lerp(-42, -10, t), a: lerp(-28, -100, t), l: 15 }));

// Folded wing (perched / caught): flight feathers lie back along the body.
const FOLD_PRIMARIES = [
  { x: -4, y: -5, a: -116, l: 58 },
  { x: -6, y: -3, a: -111, l: 62 },
  { x: -8, y: -1, a: -106, l: 62 },
  { x: -10, y: 1, a: -101, l: 56 },
  { x: -12, y: 3, a: -96, l: 48 },
];
const FOLD_SECONDARIES = [
  { x: 6, y: -8, a: -108, l: 38 },
  { x: 2, y: -6, a: -103, l: 38 },
  { x: -2, y: -4, a: -98, l: 35 },
  { x: -6, y: -2, a: -93, l: 31 },
];

const CROWN = [
  { x: 15, y: -36, a: -72, l: 17 },
  { x: 19, y: -41, a: -58, l: 20 },
  { x: 24, y: -44, a: -44, l: 20 },
  { x: 30, y: -46, a: -30, l: 16 },
  { x: 36, y: -46, a: -16, l: 11 },
];

type Quill = { x: number; y: number; a: number; l: number };
const at = (f: Quill) => `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${f.a.toFixed(1)})`;

const OpenWing = memo(function OpenWing({ id, dark = false }: { id: string; dark?: boolean }) {
  const u = (n: string) => `url(#${id}-${n})`;
  const prim = dark ? '#0a1f60' : u('prim');
  const sec = dark ? '#0c2468' : u('sec');
  const cov = dark ? '#10307f' : u('cov');
  const edge = dark ? '#071850' : '#071a52';
  return (
    <g>
      {SECONDARIES.map((f, i) => (
        <path key={`s${i}`} d={feather(f.l, 7.2)} fill={sec} stroke={edge} strokeWidth=".8" transform={at(f)} />
      ))}
      {PRIMARIES.map((f, i) => (
        <g key={`p${i}`} transform={at(f)}>
          <path d={feather(f.l, 7)} fill={prim} stroke={edge} strokeWidth=".8" />
          {!dark && <path d={`M0 -3 L0 ${-f.l + 6}`} stroke="#9fd2ff" strokeWidth=".8" opacity=".6" />}
        </g>
      ))}
      {GREATER.map((f, i) => (
        <path key={`g${i}`} d={feather(f.l, 6.4)} fill={dark ? '#0e2a74' : u('grt')} stroke={edge} strokeWidth=".7" transform={at(f)} />
      ))}
      {MEDIAN.map((f, i) => (
        <path key={`m${i}`} d={feather(f.l, 5.6)} fill={cov} stroke={dark ? 'none' : '#0d2c80'} strokeWidth=".6" transform={at(f)} />
      ))}
      <path d={SHOULDER} fill={cov} stroke={dark ? 'none' : '#0d2c80'} strokeWidth="1" />
      {!dark && (
        <g>
          <path d={SHOULDER} fill={u('scale')} opacity=".75" />
          <path d="M-9 -2 C-13 -18 -6 -34 6 -44 C13 -49 19 -47 20 -42" stroke="#d6f0ff" strokeWidth="2" fill="none" opacity=".7" strokeLinecap="round" />
          <g className="glowtip" fill="#8ff6ff">
            {PRIMARIES.map((f, i) => (
              <ellipse key={i} cx="0" cy={-f.l + 8} rx="2.4" ry="6" transform={at(f)} />
            ))}
            <path d="M-4 -14 l2.4 3.4 l-2.4 3.4 l-2.4 -3.4 Z" />
            <path d="M2 -26 l2.4 3.4 l-2.4 3.4 l-2.4 -3.4 Z" />
            <path d="M10 -37 l2.4 3.4 l-2.4 3.4 l-2.4 -3.4 Z" />
          </g>
        </g>
      )}
    </g>
  );
});

export function Bird({ state, aura = false }: { state: BirdState; aura?: boolean }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `url(#${id}-${n})`;
  const flying = state === 'fly';
  const seated = state === 'perch' || state === 'caged';
  const tailTransform = state === 'caged' ? 'translate(-28 8) scale(.5) translate(28 -8)' : state === 'perch' ? 'rotate(-12 -28 8)' : undefined;
  const headTransform = state === 'perch' ? 'rotate(14 20 -12)' : state === 'caged' ? 'rotate(10 20 -12)' : undefined;
  const beakOpen = flying ? 'rotate(16 43 -14)' : state === 'caught' ? 'rotate(24 43 -14)' : undefined;

  return (
    <g className="bird">
      <defs>
        <radialGradient id={`${id}-body`} cx=".68" cy=".26" r=".9">
          <stop offset="0" stopColor="#9fd6ff" />
          <stop offset=".36" stopColor="#3f8bff" />
          <stop offset=".72" stopColor="#1f55d0" />
          <stop offset="1" stopColor="#12358f" />
        </radialGradient>
        <linearGradient id={`${id}-cov`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#2158d6" />
          <stop offset=".6" stopColor="#3f8bff" />
          <stop offset="1" stopColor="#7cc2ff" />
        </linearGradient>
        <linearGradient id={`${id}-grt`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3f8bff" />
          <stop offset="1" stopColor="#1a49c0" />
        </linearGradient>
        <linearGradient id={`${id}-prim`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2f76f0" />
          <stop offset=".55" stopColor="#1a47c0" />
          <stop offset="1" stopColor="#0c1f6b" />
        </linearGradient>
        <linearGradient id={`${id}-sec`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2a66e0" />
          <stop offset="1" stopColor="#103492" />
        </linearGradient>
        <linearGradient id={`${id}-tail`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3480f6" />
          <stop offset=".6" stopColor="#1c4fc8" />
          <stop offset="1" stopColor="#0c2570" />
        </linearGradient>
        <linearGradient id={`${id}-tail-hi`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#5aa2ff" />
          <stop offset=".55" stopColor="#2563e0" />
          <stop offset="1" stopColor="#10308a" />
        </linearGradient>
        <linearGradient id={`${id}-tail-dark`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1f58cc" />
          <stop offset="1" stopColor="#091d5a" />
        </linearGradient>
        <linearGradient id={`${id}-beak`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a94a8" />
          <stop offset=".42" stopColor="#343a48" />
          <stop offset="1" stopColor="#0e1015" />
        </linearGradient>
        <radialGradient id={`${id}-ring`} cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#fff6b8" />
          <stop offset=".7" stopColor="#ffd23f" />
          <stop offset="1" stopColor="#f0a812" />
        </radialGradient>
        <radialGradient id={`${id}-iris`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#3a2208" />
          <stop offset=".55" stopColor="#8a4e12" />
          <stop offset="1" stopColor="#2a1606" />
        </radialGradient>
        <radialGradient id={`${id}-aura`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#7fdcff" stopOpacity=".42" />
          <stop offset=".6" stopColor="#5a9cff" stopOpacity=".16" />
          <stop offset="1" stopColor="#7fdcff" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-scale`} width="8" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-16)">
          <path d="M0 1 q4 6 8 0 M-4 5.5 q4 6 8 0 M4 5.5 q4 6 8 0" fill="none" stroke="#c9ebff" strokeOpacity=".5" strokeWidth=".85" />
        </pattern>
      </defs>

      {aura && (
        <g className="bird-aura">
          <circle r="92" fill={u('aura')} />
        </g>
      )}

      {/* far wing */}
      {flying && (
        <g transform="translate(-9 -16) scale(.9)">
          <g className="wing wing-far">
            <OpenWing id={id} dark />
          </g>
        </g>
      )}

      {/* graduated tail with glowing tips */}
      <g className={flying ? 'tail' : undefined} transform={flying ? undefined : tailTransform}>
        {TAIL.map((f, i) => (
          <g key={i} transform={`translate(${TAIL_ROOT.x} ${TAIL_ROOT.y}) rotate(${f.a})`}>
            <path d={feather(f.l, f.w)} fill={u(f.c)} stroke="#071a52" strokeWidth=".8" />
            <path d={`M0 -4 L0 ${-f.l + 8}`} stroke="#a8d8ff" strokeWidth=".9" opacity=".6" />
          </g>
        ))}
        <g className="glowtip" fill="#8ff6ff">
          {TAIL.map((f, i) => (
            <ellipse key={i} cx="0" cy={-f.l + 9} rx="2.5" ry="7" transform={`translate(${TAIL_ROOT.x} ${TAIL_ROOT.y}) rotate(${f.a})`} />
          ))}
        </g>
      </g>

      {/* body: lit from the moon at the upper right, with rows of breast feathers */}
      <path d={BODY} fill={u('body')} stroke="#d6f0ff" strokeOpacity=".65" strokeWidth="1.2" />
      <path d={BODY} fill={u('scale')} opacity=".6" />
      <path d="M-12 18 C4 24 26 18 39 4 C36 18 16 27 0 26 C-6 25 -10 22 -12 18 Z" fill="#8fd0ff" opacity=".5" />
      <ellipse cx="27" cy="-6" rx="11" ry="7" fill="#fff" opacity=".14" />
      <path d="M-30 -4 C-20 -18 -2 -28 14 -30" stroke="#b8ecff" strokeWidth="2" fill="none" opacity=".55" strokeLinecap="round" />
      {/* soft thigh feathers */}
      <path d="M-20 16 C-14 28 12 28 18 18 C8 22 -8 22 -20 16 Z" fill="#163fa8" opacity=".65" />

      {/* folded wing (perched / caught / caged) */}
      {!flying && (
        <g>
          {FOLD_PRIMARIES.map((f, i) => (
            <path key={`fp${i}`} d={feather(f.l, 7.2)} fill={u('prim')} stroke="#071a52" strokeWidth=".8" transform={at(f)} />
          ))}
          {FOLD_SECONDARIES.map((f, i) => (
            <path key={`fs${i}`} d={feather(f.l, 7)} fill={u('grt')} stroke="#0a2468" strokeWidth=".8" transform={at(f)} />
          ))}
          <g className="glowtip" fill="#8ff6ff">
            {FOLD_PRIMARIES.map((f, i) => (
              <ellipse key={i} cx="0" cy={-f.l + 7} rx="2.2" ry="5.2" transform={at(f)} />
            ))}
          </g>
          <path d={FOLD_CAP} fill={u('cov')} stroke="#0d2c80" strokeWidth="1" />
          <path d={FOLD_CAP} fill={u('scale')} opacity=".85" />
          <path d="M25 -15 C12 -22 -8 -20 -24 -7" stroke="#d6f0ff" strokeWidth="1.8" fill="none" opacity=".65" strokeLinecap="round" />
        </g>
      )}

      {/* head */}
      <g transform={headTransform}>
        <g className={seated ? 'head-idle' : undefined}>
          {CROWN.map((f, i) => (
            <path key={i} d={feather(f.l, 4.4)} fill={u('grt')} stroke="#0d2c80" strokeWidth=".6" transform={at(f)} />
          ))}
          {/* neck ruff over the join with the body */}
          <path d="M12 -20 q3 8 7 4 q3 8 7 4 q3 7 7 3 q3 6 7 2 q3 4 8 -1 L50 -14 C44 -5 20 -3 12 -20 Z" fill="#2a66e0" />
          <path d={HEAD} fill={u('body')} stroke="#d6f0ff" strokeOpacity=".6" strokeWidth="1.1" />
          <path d={HEAD} fill={u('scale')} opacity=".45" />
          <path d="M19 -41 C27 -48 40 -47 48 -39" stroke="#eef9ff" strokeWidth="2.2" fill="none" opacity=".7" strokeLinecap="round" />
          <ellipse cx="28" cy="-14" rx="10" ry="5.5" fill="#6cb4ff" opacity=".45" />

          {/* beak: the lower half drops open in flight, like a squawk */}
          <g transform={beakOpen}>
            <path d={BEAK_LOW} fill="#23272f" stroke="#0b0d11" strokeWidth=".6" />
            {flying && <path d="M46 -12 C50 -11 52 -8 52 -5" stroke="#e0686c" strokeWidth="2.6" strokeLinecap="round" fill="none" />}
            {state === 'caught' && <path d="M47 -9 C52 -7 57 -2 56 4 C54 8 49 7 48 3 Z" fill="#ea7a86" stroke="#a33d4a" strokeWidth=".7" />}
          </g>
          <path d={BEAK_TOP} fill={u('beak')} stroke="#0b0d11" strokeWidth=".7" />
          <path d="M48 -34 C58 -36 67 -28 68 -14" stroke="#c8d2e2" strokeWidth="1.5" fill="none" opacity=".8" strokeLinecap="round" />
          <ellipse cx="47.5" cy="-29.5" rx="2.4" ry="1.5" fill="#5a6172" />
          <path d="M38 -15 C41 -6 49 -4 54 -7" stroke="#ffd23f" strokeWidth="4.2" fill="none" strokeLinecap="round" />
          <path d="M40 -13 C43 -8 48 -6 52 -7.5" stroke="#fff3a8" strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* eye */}
          <circle cx="37" cy="-28" r="8.8" fill={u('ring')} />
          <circle cx="37" cy="-28" r="8.8" fill="none" stroke="#d68a0c" strokeWidth=".8" />
          {state === 'caught' ? (
            <path d="M33.5 -31.5 L40.5 -24.5 M40.5 -31.5 L33.5 -24.5" stroke="#140d04" strokeWidth="2.5" strokeLinecap="round" />
          ) : (
            <g>
              <circle cx="37.8" cy="-28" r="5.5" fill={u('iris')} />
              <circle cx="37.9" cy="-28" r="3.3" fill="#080503" />
              <circle cx="39.6" cy="-30.2" r="2" fill="#fff" />
              <circle cx="35.8" cy="-25.8" r=".8" fill="#fff" opacity=".85" />
              {state === 'perch' && (
                <g className="blink" transform="scale(1 0)">
                  <ellipse cx="37" cy="-28" rx="9" ry="9" fill="#2f78f0" />
                </g>
              )}
              {state === 'caged' && <path d="M28 -30 C31 -36.5 43 -36.5 46 -30 C42 -32.5 33 -32.5 28 -30 Z" fill="#2563e0" />}
            </g>
          )}
          {flying && <path d="M29 -37 C34 -39 40 -38 45 -34" stroke="#0e2f86" strokeWidth="2.8" fill="none" strokeLinecap="round" />}
          {state === 'perch' && <path d="M30 -37.5 C34 -39 39 -38.5 43 -36" stroke="#1a49b8" strokeWidth="2" fill="none" strokeLinecap="round" />}
          {state === 'caged' && (
            <g>
              <path d="M29 -34 C33 -39 38 -40 45 -39" stroke="#0e2f86" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <path className="glowtip" d="M33 -18 c-2.6 3.6 -2.6 6 0 6.6 c2.6 -.6 2.6 -3 0 -6.6 Z" fill="#a8f4ff" />
            </g>
          )}
        </g>
      </g>

      {/* open near wing, set over the back so the face stays clear */}
      {flying && (
        <g transform="translate(-2 -12)">
          <g className="wing wing-near">
            <OpenWing id={id} />
          </g>
        </g>
      )}

      {/* feet: two toes forward and two back, gripping the branch */}
      {seated ? (
        <g fill="none" strokeLinecap="round">
          <g stroke="#5a6272" strokeWidth="3.2">
            <path d="M-7 20 L-8 25 M-8 25 C-5 28 -1 29 2 28 M-8 25 C-6 29 -3 31 0 31 M-8 25 C-11 28 -14 28 -16 27" />
            <path d="M6 20 L6 25 M6 25 C9 28 13 29 16 28 M6 25 C8 29 11 31 14 31 M6 25 C3 28 0 28 -2 27" />
          </g>
          <g stroke="#14171d" strokeWidth="1.8">
            <path d="M2 28 l2.4 -.4 M0 31 l2.4 .2 M16 28 l2.4 -.4 M14 31 l2.4 .2 M-16 27 l-2.2 -.6 M-2 27 l-2.2 -.6" />
          </g>
        </g>
      ) : (
        <g strokeLinecap="round" fill="none">
          <path d="M-5 21 l-7 6 M3 22 l-4 8" stroke="#5a6272" strokeWidth="2.8" />
          <path d="M-12 27 l-3 1 M-1 30 l-2.4 2" stroke="#14171d" strokeWidth="1.8" />
        </g>
      )}

      {(state === 'caught' || state === 'caged') && (
        <g className="dizzy" fill="#ffd23f">
          <path d="M20 -58 l2 4 4 .5 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -.5 Z" />
          <path d="M46 -64 l1.6 3 3 .4 -2.3 2 .7 3 -3 -1.5 -3 1.5 .7 -3 -2.3 -2 3 -.4 Z" />
          <path d="M31 -72 l1.2 2.4 2.4 .3 -1.8 1.6 .5 2.4 -2.3 -1.2 -2.3 1.2 .5 -2.4 -1.8 -1.6 2.4 -.3 Z" />
        </g>
      )}
    </g>
  );
}

/** A diamond-mesh net wrapped round a ball: front strands, faint back strands and a knot at each crossing. */
function buildNet(r: number) {
  const N = 12;
  const STEP = 360 / N;
  const TWIST = 1;
  const RAD = Math.PI / 180;
  const RX = r * 1.12;
  const project = (lat: number, lon: number) => ({
    x: RX * Math.cos(lat * RAD) * Math.sin(lon * RAD),
    y: r * Math.sin(lat * RAD),
    front: Math.cos(lon * RAD) > 0,
  });
  const front: string[] = [];
  const back: string[] = [];
  for (let i = 0; i < N; i++) {
    for (const sign of [1, -1]) {
      let run = '';
      let side: boolean | null = null;
      for (let lat = -84; lat <= 84; lat += 6) {
        const p = project(lat, i * STEP + sign * (lat + 84) * TWIST);
        const xy = `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
        if (side !== null && side !== p.front) {
          (side ? front : back).push(run + ` L${xy}`);
          run = '';
        }
        run += run ? ` L${xy}` : `M${xy}`;
        side = p.front;
      }
      if (run && side !== null) (side ? front : back).push(run);
    }
  }
  const knots: { x: number; y: number }[] = [];
  for (let m = 0; ; m++) {
    const lat = -84 + (m * STEP) / (2 * TWIST);
    if (lat > 84) break;
    for (let q = 0; q < N; q++) {
      const p = project(lat, (m * STEP) / 2 + q * STEP);
      if (p.front) knots.push({ x: p.x, y: p.y });
    }
  }
  return { front: front.join(' '), back: back.join(' '), knots };
}

const WEIGHT_ANGLES = [24, 62, 100, 138, 176, 214, 318, 356];

/** The weighted capture net, centred on (0, 0). */
export function Net({ r = 44 }: { r?: number }) {
  const id = useId().replace(/:/g, '');
  const mesh = useMemo(() => buildNet(r), [r]);
  const rx = r * 1.12;
  return (
    <g className="net">
      <defs>
        <radialGradient id={`${id}-sheen`} cx=".62" cy=".3" r=".8">
          <stop offset="0" stopColor="#dff7ff" stopOpacity=".16" />
          <stop offset="1" stopColor="#7fe3ff" stopOpacity=".05" />
        </radialGradient>
        <radialGradient id={`${id}-pod`} cx=".36" cy=".3" r=".8">
          <stop offset="0" stopColor="#f4f8fc" />
          <stop offset=".55" stopColor="#7c8798" />
          <stop offset="1" stopColor="#232832" />
        </radialGradient>
      </defs>
      <ellipse rx={rx} ry={r} fill={`url(#${id}-sheen)`} />
      <path d={mesh.back} fill="none" stroke="#cdbb86" strokeOpacity=".32" strokeWidth=".9" />
      <path d={mesh.front} fill="none" stroke="#1d1608" strokeOpacity=".6" strokeWidth="3" strokeLinejoin="round" />
      <path d={mesh.front} fill="none" stroke="#f6ebc8" strokeWidth="1.45" strokeLinejoin="round" />
      <g fill="#ffe9a8">
        {mesh.knots.map((k, i) => (
          <circle key={i} cx={k.x.toFixed(1)} cy={k.y.toFixed(1)} r={i % 5 === 0 ? 2.1 : 1.5} fill={i % 5 === 0 ? '#7ff4ff' : undefined} />
        ))}
      </g>
      {/* twisted rim rope */}
      <ellipse rx={rx} ry={r} fill="none" stroke="#3a2c12" strokeWidth="5.4" />
      <ellipse rx={rx} ry={r} fill="none" stroke="#d6b06a" strokeWidth="3.6" />
      <ellipse rx={rx} ry={r} fill="none" stroke="#7a5c28" strokeWidth="3.6" strokeDasharray="3 3.4" />
      {/* weights swinging on short lines */}
      {WEIGHT_ANGLES.map((a) => {
        const c = Math.cos((a * Math.PI) / 180);
        const s = Math.sin((a * Math.PI) / 180);
        const x0 = rx * c;
        const y0 = r * s;
        const x1 = (rx + 9) * c;
        const y1 = (r + 9) * s + 3;
        return (
          <g key={a}>
            <path d={`M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}`} stroke="#d6b06a" strokeWidth="1.5" />
            <circle cx={x1.toFixed(1)} cy={y1.toFixed(1)} r="5.2" fill={`url(#${id}-pod)`} stroke="#14171d" strokeWidth=".9" />
            <circle cx={x1.toFixed(1)} cy={y1.toFixed(1)} r="1.6" fill="#7ff4ff" />
          </g>
        );
      })}
    </g>
  );
}

/** The folded net in flight, before it opens: a spinning canister trailing its weights. */
export function NetShell() {
  const id = useId().replace(/:/g, '');
  const pods = [0, 90, 180, 270];
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-core`} cx=".36" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffb4a4" />
          <stop offset=".5" stopColor="#d6452f" />
          <stop offset="1" stopColor="#6e1a13" />
        </radialGradient>
      </defs>
      <circle r="24" fill="#7ff4ff" opacity=".16" />
      <circle r="17" fill="none" stroke="#7ff4ff" strokeOpacity=".6" strokeWidth="1.2" strokeDasharray="5 4" />
      {pods.map((a) => {
        const x = Math.cos((a * Math.PI) / 180) * 18;
        const y = Math.sin((a * Math.PI) / 180) * 18;
        return (
          <g key={a}>
            <path d={`M0 0 L${x.toFixed(1)} ${y.toFixed(1)}`} stroke="#e6d6a4" strokeWidth="1.5" />
            <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="4" fill="#aeb9c9" stroke="#14171d" strokeWidth=".9" />
          </g>
        );
      })}
      <circle r="11" fill={`url(#${id}-core)`} stroke="#3e0e0a" strokeWidth="1.2" />
      <path d="M-10 -3.5 H10 M-10 3.5 H10" stroke="#ffd23f" strokeWidth="1.8" />
      <circle r="3" fill="#7ff4ff" />
    </g>
  );
}

export function BirdArt({ state = 'fly', width = 240 }: { state?: BirdState; width?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-150 -135 240 200" width={width} height={(width * 200) / 240} role="img" aria-label="Azul the blue macaw">
      <Bird state={state} />
    </svg>
  );
}
