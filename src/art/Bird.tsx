import { useId } from 'react';

export type BirdState = 'perch' | 'fly' | 'caught';

/*
 * Azul, an original blue macaw (hyacinth-style: deep cobalt plumage, a bare
 * yellow eye ring and a yellow strip under a big dark hooked beak). Centred on
 * its body at (0, 0), facing right. Animated parts carry CSS classes from
 * stage.css: wing-near, wing-far, tail, blink, head-idle, dizzy, bird-aura.
 */

/** A tapered feather pointing up from (0, 0): length l, half-width w. */
const feather = (l: number, w: number) =>
  `M0 0 C${w} ${-l * 0.22} ${w * 0.75} ${-l * 0.78} 0 ${-l} C${-w * 0.75} ${-l * 0.78} ${-w} ${-l * 0.22} 0 0 Z`;

// Graduated tail: the middle feathers are the longest.
const TAIL = [
  { x: -24, y: 6, a: -118, l: 78, w: 6.5, c: 'tail-dark' },
  { x: -24, y: 2, a: -112, l: 104, w: 7, c: 'tail' },
  { x: -24, y: -2, a: -106, l: 112, w: 7, c: 'tail' },
  { x: -24, y: -4, a: -100, l: 84, w: 6.5, c: 'tail-dark' },
];

// Open wing: primaries fan from the wrist, secondaries line the trailing edge.
const PRIMARIES = [
  { x: 9, y: -48, a: 2, l: 52 },
  { x: 11, y: -47, a: 15, l: 50 },
  { x: 13, y: -45, a: 28, l: 46 },
  { x: 15, y: -42, a: 41, l: 41 },
  { x: 16, y: -38, a: 54, l: 34 },
];
const SECONDARIES = [
  { x: 4, y: -42, a: -12, l: 30 },
  { x: -2, y: -34, a: -18, l: 30 },
  { x: -8, y: -25, a: -24, l: 28 },
  { x: -13, y: -16, a: -30, l: 26 },
];

// Folded wing: flight feathers lie back along the body.
const FOLDED = [
  { x: -4, y: -4, a: -104, l: 46 },
  { x: -8, y: -1, a: -100, l: 44 },
  { x: -12, y: 2, a: -96, l: 38 },
];

const CROWN = [
  { x: 16, y: -35, a: -48, l: 12 },
  { x: 20, y: -38, a: -36, l: 13 },
  { x: 24, y: -39, a: -24, l: 11 },
];

function OpenWing({ u, dark = false }: { u: (n: string) => string; dark?: boolean }) {
  const prim = dark ? '#0a1f60' : u('prim');
  const sec = dark ? '#0d2672' : u('sec');
  const cov = dark ? '#10307f' : u('cov');
  return (
    <g>
      {SECONDARIES.map((f, i) => (
        <path key={`s${i}`} d={feather(f.l, 6.5)} fill={sec} stroke={dark ? 'none' : '#0a2468'} strokeWidth=".8" transform={`translate(${f.x} ${f.y}) rotate(${f.a})`} />
      ))}
      {PRIMARIES.map((f, i) => (
        <g key={`p${i}`} transform={`translate(${f.x} ${f.y}) rotate(${f.a})`}>
          <path d={feather(f.l, 6.8)} fill={prim} stroke={dark ? 'none' : '#081d58'} strokeWidth=".8" />
          {!dark && <path d={`M0 -3 L0 ${-f.l + 6}`} stroke="#86c4ff" strokeWidth=".7" opacity=".55" />}
          {!dark && <ellipse className="glowtip" cx="0" cy={-f.l + 7} rx="2.2" ry="5" fill="#8ff6ff" />}
        </g>
      ))}
      <path d="M-18 -8 C-16 -28 -4 -44 12 -51 C21 -47 23 -38 19 -28 C13 -18 7 -12 3 -8 Z" fill={cov} stroke={dark ? 'none' : '#0d2c80'} strokeWidth="1" />
      {!dark && (
        <g>
          <path d="M-12 -14 C-8 -30 2 -42 14 -48 C10 -36 6 -24 4 -12 Z" fill="#5fe6ff" opacity=".2" />
          <path d="M-15 -12 C-12 -30 -2 -44 12 -50" stroke="#c4ebff" strokeWidth="1.8" fill="none" opacity=".6" strokeLinecap="round" />
          <path d="M-9 -16 q3 3 6 0 q3 3 6 0 q3 3 6 0 M-5 -27 q3 3 6 0 q3 3 6 0 q3 3 6 0 M1 -38 q3 3 6 0 q3 3 6 0" stroke="#8cc8ff" strokeWidth="1" fill="none" opacity=".75" />
          <g className="glowtip" fill="#8ff6ff">
            <path d="M-8 -24 l2 3 l-2 3 l-2 -3 Z" />
            <path d="M-1 -35 l2 3 l-2 3 l-2 -3 Z" />
            <path d="M7 -44 l2 3 l-2 3 l-2 -3 Z" />
          </g>
        </g>
      )}
    </g>
  );
}

export function Bird({ state, aura = false }: { state: BirdState; aura?: boolean }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `url(#${id}-${n})`;
  const flying = state === 'fly';
  const folded = state !== 'fly';

  return (
    <g className="bird">
      <defs>
        <radialGradient id={`${id}-body`} cx=".66" cy=".28" r=".85">
          <stop offset="0" stopColor="#82c6ff" />
          <stop offset=".42" stopColor="#3179f2" />
          <stop offset="1" stopColor="#163fa8" />
        </radialGradient>
        <linearGradient id={`${id}-cov`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#2058d2" />
          <stop offset="1" stopColor="#4d95ff" />
        </linearGradient>
        <linearGradient id={`${id}-prim`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2b6be8" />
          <stop offset="1" stopColor="#0b2876" />
        </linearGradient>
        <linearGradient id={`${id}-sec`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2a66e0" />
          <stop offset="1" stopColor="#123a9e" />
        </linearGradient>
        <linearGradient id={`${id}-tail`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3077f0" />
          <stop offset="1" stopColor="#0c2570" />
        </linearGradient>
        <linearGradient id={`${id}-tail-dark`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1f58cc" />
          <stop offset="1" stopColor="#091d5a" />
        </linearGradient>
        <linearGradient id={`${id}-beak`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#737b8c" />
          <stop offset=".5" stopColor="#2b303b" />
          <stop offset="1" stopColor="#101217" />
        </linearGradient>
        <radialGradient id={`${id}-ring`} cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#fff3a6" />
          <stop offset="1" stopColor="#ffbe1c" />
        </radialGradient>
        <radialGradient id={`${id}-aura`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#7fdcff" stopOpacity=".4" />
          <stop offset="1" stopColor="#7fdcff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {aura && (
        <g className="bird-aura">
          <circle r="66" fill={u('aura')} />
        </g>
      )}

      {/* far wing */}
      {flying && (
        <g transform="translate(-10 0) scale(.88)">
          <g className="wing wing-far">
            <OpenWing u={u} dark />
          </g>
        </g>
      )}

      {/* graduated tail */}
      <g className={flying ? 'tail' : undefined}>
        {TAIL.map((f, i) => (
          <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${f.a})`}>
            <path d={feather(f.l, f.w)} fill={u(f.c)} stroke="#081a52" strokeWidth=".8" />
            <path d={`M0 -4 L0 ${-f.l + 8}`} stroke="#8fcbff" strokeWidth=".8" opacity=".5" />
            <ellipse className="glowtip" cx="0" cy={-f.l + 8} rx="2.2" ry="6" fill="#8ff6ff" />
          </g>
        ))}
        <path d="M-28 -2 C-56 8 -84 20 -112 32" stroke="#5fe6ff" strokeWidth="2" fill="none" opacity=".28" strokeLinecap="round" />
      </g>

      {/* body */}
      <path
        d="M-32 4 C-30 -14 -8 -24 14 -23 C32 -22 42 -10 40 4 C37 20 12 26 -8 22 C-22 19 -32 14 -32 4 Z"
        fill={u('body')}
        stroke="#cfeeff"
        strokeOpacity=".6"
        strokeWidth="1.3"
      />
      <path d="M-10 17 C4 21 24 16 36 5 C33 18 16 26 0 25 C-6 24 -10 21 -10 17 Z" fill="#8cc6ff" opacity=".45" />
      <ellipse cx="25" cy="-4" rx="10" ry="6" fill="#fff" opacity=".13" />
      <path
        d="M10 -2 q3 3 6 0 q3 3 6 0 M6 6 q3 3 6 0 q3 3 6 0 q3 3 6 0 M2 14 q3 3 6 0 q3 3 6 0 q3 3 6 0"
        stroke="#1a49b8"
        strokeWidth=".9"
        fill="none"
        opacity=".5"
      />
      <path d="M-26 -6 C-16 -17 0 -22 14 -22" stroke="#a6ecff" strokeWidth="2" fill="none" opacity=".5" strokeLinecap="round" />

      {/* folded wing (perched / caught) */}
      {folded && (
        <g>
          {FOLDED.map((f, i) => (
            <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${f.a})`}>
              <path d={feather(f.l, 7)} fill={u('prim')} stroke="#081d58" strokeWidth=".8" />
              <ellipse className="glowtip" cx="0" cy={-f.l + 7} rx="2.2" ry="5" fill="#8ff6ff" />
            </g>
          ))}
          <path d="M24 -15 C10 -22 -10 -18 -28 -4 C-16 0 6 -1 24 -5 Z" fill={u('cov')} stroke="#0d2c80" strokeWidth="1" />
          <path d="M22 -14 C12 -18 0 -16 -10 -10 C0 -10 12 -10 22 -8 Z" fill="#82c6ff" opacity=".5" />
          <path d="M8 -11 q3 2.5 6 0 q3 2.5 6 0 M-4 -6 q3 2.5 6 0 q3 2.5 6 0 q3 2.5 6 0" stroke="#a6d6ff" strokeWidth="1" fill="none" opacity=".7" />
        </g>
      )}

      {/* head */}
      <g transform={state === 'perch' ? 'rotate(20 20 -12)' : undefined}>
        <g className={state === 'perch' ? 'head-idle' : undefined}>
          {CROWN.map((f, i) => (
            <path key={i} d={feather(f.l, 4)} fill="#2f78f0" transform={`translate(${f.x} ${f.y}) rotate(${f.a})`} />
          ))}
          <circle cx="30" cy="-23" r="17" fill={u('body')} stroke="#cfeeff" strokeOpacity=".55" strokeWidth="1.2" />
          <path d="M18 -35 C25 -40 35 -40 42 -35" stroke="#e2f4ff" strokeWidth="2" fill="none" opacity=".6" strokeLinecap="round" />
          <ellipse cx="27" cy="-13" rx="9" ry="5" fill="#5aa6ff" opacity=".45" />

          {/* beak: the lower half drops open in flight, like a squawk */}
          <g transform={flying ? 'rotate(14 42 -14)' : undefined}>
            <path d="M44 -14 C51 -13 55 -8 54 -3 C48 0 43 -3 41 -9 Z" fill="#262a33" />
            {flying && <path d="M45 -12 C49 -11 51 -8 51 -5" stroke="#d4575a" strokeWidth="2.4" strokeLinecap="round" fill="none" />}
          </g>
          <path d="M42 -29 C56 -33 66 -22 64 -8 C63 -2 59 0 56 0 C57 -8 53 -14 44 -15 Z" fill={u('beak')} />
          <path d="M46 -28 C55 -28 61 -22 62 -14" stroke="#b0b9ca" strokeWidth="1.3" fill="none" opacity=".75" strokeLinecap="round" />
          <ellipse cx="44.5" cy="-25" rx="2.4" ry="1.6" fill="#4a5060" />
          <path d="M39 -13 C43 -6 49 -5 53 -8" stroke="#ffd23f" strokeWidth="3.8" fill="none" strokeLinecap="round" />

          {/* eye */}
          <circle cx="36" cy="-26" r="7.6" fill={u('ring')} />
          <circle cx="36" cy="-26" r="7.6" fill="none" stroke="#e09a10" strokeWidth=".8" />
          {state === 'caught' ? (
            <path d="M33 -29 L39 -23 M39 -29 L33 -23" stroke="#140d04" strokeWidth="2.2" strokeLinecap="round" />
          ) : (
            <g>
              <circle cx="36.8" cy="-26" r="4.8" fill="#140d04" />
              <circle cx="36.8" cy="-26" r="3.1" fill="#2a1a08" />
              <circle cx="38.4" cy="-28" r="1.8" fill="#fff" />
              <circle cx="35" cy="-24.2" r=".7" fill="#fff" opacity=".8" />
              {state === 'perch' && (
                <g className="blink" transform="scale(1 0)">
                  <ellipse cx="36" cy="-26" rx="7.8" ry="7.8" fill="#2f78f0" />
                </g>
              )}
            </g>
          )}
          {flying && <path d="M28 -34 C33 -35.5 38 -35 43 -32.5" stroke="#0e2f86" strokeWidth="2.6" fill="none" strokeLinecap="round" />}
          {state === 'perch' && <path d="M29 -35 C33 -36.5 38 -36 42 -34" stroke="#1a49b8" strokeWidth="2" fill="none" strokeLinecap="round" />}
        </g>
      </g>

      {/* open near wing, set over the back so the face stays clear */}
      {flying && (
        <g transform="translate(-6 2)">
          <g className="wing wing-near">
            <OpenWing u={u} />
          </g>
        </g>
      )}

      {/* feet */}
      {state === 'perch' ? (
        <g stroke="#6b7282" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M-6 20 L-7 25 M-7 25 C-10 28 -12 28 -14 27 M-7 25 C-4 29 -1 29 1 28" />
          <path d="M6 20 L6 25 M6 25 C3 28 1 28 -1 27 M6 25 C9 29 12 29 14 28" />
        </g>
      ) : (
        <g stroke="#6b7282" strokeWidth="2.6" strokeLinecap="round">
          <path d="M-5 20 l-6 6 M2 20 l-3 8" />
        </g>
      )}

      {state === 'caught' && (
        <g className="dizzy" fill="#ffd23f">
          <path d="M20 -52 l2 4 4 .5 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -.5 Z" />
          <path d="M44 -58 l1.6 3 3 .4 -2.3 2 .7 3 -3 -1.5 -3 1.5 .7 -3 -2.3 -2 3 -.4 Z" />
          <path d="M30 -64 l1.2 2.4 2.4 .3 -1.8 1.6 .5 2.4 -2.3 -1.2 -2.3 1.2 .5 -2.4 -1.8 -1.6 2.4 -.3 Z" />
        </g>
      )}
    </g>
  );
}

/** The weighted capture net, centred on (0, 0). */
export function Net({ r = 44 }: { r?: number }) {
  const id = useId().replace(/:/g, '');
  const lines = [];
  for (let k = -r * 2; k <= r * 2; k += 9) {
    lines.push(`M${k - r} ${-r} L${k + r} ${r}`, `M${k + r} ${-r} L${k - r} ${r}`);
  }
  return (
    <g className="net">
      <defs>
        <clipPath id={`${id}-c`}>
          <circle r={r} />
        </clipPath>
      </defs>
      <circle r={r} fill="rgba(210,200,160,.08)" />
      <path d={lines.join(' ')} stroke="#e6dcb8" strokeWidth="1.3" clipPath={`url(#${id}-c)`} opacity=".9" />
      <circle r={r} fill="none" stroke="#b89a5a" strokeWidth="3" />
      {[45, 135, 225, 315].map((a) => {
        const x = Math.cos((a * Math.PI) / 180) * (r + 4);
        const y = Math.sin((a * Math.PI) / 180) * (r + 4);
        return <circle key={a} cx={x} cy={y} r="4.5" fill="#3a3f4a" stroke="#9aa3b5" strokeWidth="1" />;
      })}
    </g>
  );
}

/** The folded net in flight, before it opens. */
export function NetShell() {
  return (
    <g>
      <circle r="8" fill="#cbbf96" stroke="#7a6a3e" strokeWidth="1.5" />
      <path d="M-6 -3 L6 3 M-6 3 L6 -3 M0 -8 L0 8" stroke="#7a6a3e" strokeWidth="1" />
      {[0, 90, 180, 270].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 12} cy={Math.sin((a * Math.PI) / 180) * 12} r="3" fill="#3a3f4a" />
      ))}
    </g>
  );
}

export function BirdArt({ state = 'fly', width = 240 }: { state?: BirdState; width?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-130 -110 200 170" width={width} height={(width * 170) / 200} role="img" aria-label="Azul the blue macaw">
      <Bird state={state} />
    </svg>
  );
}
