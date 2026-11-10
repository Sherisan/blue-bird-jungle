import { useId } from 'react';
import { Cage } from './Cage';

export type PoacherMood = 'idle' | 'aim' | 'cheer' | 'annoyed';

export interface PoacherProps {
  mood: PoacherMood;
  /** Net-gun angle in degrees around the chest pivot (205, 372). Negative = up. */
  aim: number;
  recoil?: number;
  /** Compressed-air puff at the muzzle right after firing. */
  puff?: number;
  bubble?: string | null;
  /** Size of the speech bubble, so it stays readable when Rato is drawn small. */
  bubbleScale?: number;
  /** While reeling a catch in: the winch handle's angle in degrees. His leading hand turns it. */
  reel?: number;
  /** Cool rim light from the moon. */
  rim?: string;
  /** Hide the cage prop (e.g. for portraits). */
  noCage?: boolean;
}

/** Muzzle centre relative to the pivot, before rotation. Keep in sync with the gun drawing. */
export const MUZZLE_OFFSET = { x: 229, y: -6 };

type P = { x: number; y: number };

const PIVOT: P = { x: 205, y: 372 };
const NEAR_SHOULDER: P = { x: 172, y: 354 };
const FAR_SHOULDER: P = { x: 236, y: 352 };
/** Where each hand holds the gun, in gun space. */
const NEAR_GRIP: P = { x: 253, y: 398 };
const FAR_GRIP: P = { x: 318, y: 372 };
/** The winch under the barrel that reels the net back in, in gun space. */
const WINCH: P = { x: 325, y: 391 };
const WINCH_ARM = 14;

const SKIN_D = '#9a6440';
const HAIR = '#1b130e';
const LEATHER = '#74411f';
const LEATHER_D = '#4a2813';
const LEATHER_L = '#a06a3c';
const GLOVE = '#2a1b11';
const GOLD = '#e2b85a';
const FEATHER = 'M0 0 C5 7 5 24 0 34 C-5 24 -5 7 0 0 Z';

const f = (n: number) => n.toFixed(1);

/** A point drawn in gun space, in body space for the current aim and recoil. */
function gunPoint(p: P, aim: number, recoil: number): P {
  const a = (aim * Math.PI) / 180;
  const dx = p.x + recoil - PIVOT.x;
  const dy = p.y - PIVOT.y;
  return { x: PIVOT.x + dx * Math.cos(a) - dy * Math.sin(a), y: PIVOT.y + dx * Math.sin(a) + dy * Math.cos(a) };
}

/** The elbow for a shoulder and hand: two-bone reach, bending downward. */
function elbowAt(s: P, h: P, upper: number, fore: number): P {
  const dx = h.x - s.x;
  const dy = h.y - s.y;
  const len = Math.hypot(dx, dy) || 1;
  const d = Math.min(len, upper + fore - 0.01);
  const reach = (upper * upper - fore * fore + d * d) / (2 * d);
  const off = Math.sqrt(Math.max(0, upper * upper - reach * reach));
  const ux = dx / len;
  const uy = dy / len;
  return { x: s.x + reach * ux - off * uy, y: s.y + reach * uy + off * ux };
}

/** A tapered limb with rounded ends between two points. */
function limb(a: P, b: P, wa: number, wb: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1;
  const nx = -dy / d;
  const ny = dx / d;
  const ra = wa / 2;
  const rb = wb / 2;
  return `M${f(a.x + nx * ra)} ${f(a.y + ny * ra)} L${f(b.x + nx * rb)} ${f(b.y + ny * rb)} A${rb} ${rb} 0 0 0 ${f(b.x - nx * rb)} ${f(b.y - ny * rb)} L${f(a.x - nx * ra)} ${f(a.y - ny * ra)} A${ra} ${ra} 0 0 0 ${f(a.x + nx * ra)} ${f(a.y + ny * ra)} Z`;
}

const along = (a: P, b: P, t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

function Arm({ s, h, upper, fore, fill, cuff, rim }: { s: P; h: P; upper: number; fore: number; fill: string; cuff: string; rim?: string }) {
  const e = elbowAt(s, h, upper, fore);
  const c0 = along(e, h, 0.66);
  const c1 = along(e, h, 0.9);
  return (
    <g>
      <path d={limb(s, e, 29, 22)} fill={fill} />
      <path d={limb(e, h, 22, 15)} fill={fill} />
      <path d={limb(c0, c1, 23, 21)} fill={cuff} />
      <circle cx={e.x} cy={e.y} r="7" fill="#000" opacity=".18" />
      {rim && <path d={`M${f(s.x + 8)} ${f(s.y - 12)} L${f(e.x + 10)} ${f(e.y - 3)}`} stroke={rim} strokeOpacity=".5" strokeWidth="1.7" strokeLinecap="round" />}
    </g>
  );
}

const CARTRIDGES = [0.1, 0.22, 0.34, 0.46, 0.58, 0.7, 0.82];
const BAND_A: P = { x: 248, y: 342 };
const BAND_B: P = { x: 170, y: 426 };

/**
 * Rato the poacher, drawn in scene coordinates (viewBox 0 0 1000 560): feet on
 * y≈547, net gun pivoting at (205, 372). Use <PoacherArt> for a standalone SVG.
 */
export function Poacher({ mood, aim, recoil = 0, puff = -1, bubble = null, bubbleScale = 1, reel, rim = '#7fe3ff', noCage = false }: PoacherProps) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `url(#${id}-${n})`;
  const gunTransform = `rotate(${aim.toFixed(2)} ${PIVOT.x} ${PIVOT.y}) translate(${recoil.toFixed(2)} 0)`;
  const nearHand = gunPoint(NEAR_GRIP, aim, recoil);
  // when he has his bird he lets go of the barrel and punches the air
  const pumping = mood === 'cheer';
  const reeling = reel !== undefined && !pumping;
  const crank = ((reel ?? 128) * Math.PI) / 180;
  const handle: P = { x: WINCH.x + WINCH_ARM * Math.cos(crank), y: WINCH.y + WINCH_ARM * Math.sin(crank) };
  const farHand = pumping ? { x: 292, y: 276 } : gunPoint(reeling ? handle : FAR_GRIP, aim, recoil);

  return (
    <g className="poacher">
      <defs>
        <radialGradient id={`${id}-shadow`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".62" />
          <stop offset=".7" stopColor="#000" stopOpacity=".34" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-skin`} cx=".68" cy=".34" r=".85">
          <stop offset="0" stopColor="#f0b78b" />
          <stop offset=".55" stopColor="#cf8d5e" />
          <stop offset="1" stopColor="#8a5532" />
        </radialGradient>
        <linearGradient id={`${id}-pants`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3f4a28" />
          <stop offset=".6" stopColor="#5d6a38" />
          <stop offset="1" stopColor="#737f46" />
        </linearGradient>
        <linearGradient id={`${id}-coat`} x1="0" y1="0" x2="1" y2=".25">
          <stop offset="0" stopColor="#4a2813" />
          <stop offset=".55" stopColor="#7c4722" />
          <stop offset="1" stopColor="#a96f3e" />
        </linearGradient>
        <linearGradient id={`${id}-coatdown`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7c4722" />
          <stop offset="1" stopColor="#3f2110" />
        </linearGradient>
        <linearGradient id={`${id}-lining`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9c2c22" />
          <stop offset="1" stopColor="#3c0f0d" />
        </linearGradient>
        <linearGradient id={`${id}-shirt`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8935f" />
          <stop offset="1" stopColor="#dcc792" />
        </linearGradient>
        <linearGradient id={`${id}-hat`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d0a86a" />
          <stop offset=".55" stopColor="#a67f49" />
          <stop offset="1" stopColor="#6e5230" />
        </linearGradient>
        <linearGradient id={`${id}-brim`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6b4f2c" />
          <stop offset=".6" stopColor="#a67f49" />
          <stop offset="1" stopColor="#d4ad70" />
        </linearGradient>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4ebf3" />
          <stop offset=".4" stopColor="#7c8798" />
          <stop offset="1" stopColor="#232832" />
        </linearGradient>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4c5566" />
          <stop offset=".5" stopColor="#2c323e" />
          <stop offset="1" stopColor="#171b22" />
        </linearGradient>
        <linearGradient id={`${id}-red`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0604c" />
          <stop offset=".5" stopColor="#c0392b" />
          <stop offset="1" stopColor="#6e1a13" />
        </linearGradient>
        <linearGradient id={`${id}-boot`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3a24" />
          <stop offset="1" stopColor="#1c120a" />
        </linearGradient>
        <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#123a9e" />
          <stop offset="1" stopColor="#4fa6ff" />
        </linearGradient>
        <radialGradient id={`${id}-lens`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#d6f6ff" />
          <stop offset=".5" stopColor="#3f8ec0" />
          <stop offset="1" stopColor="#0d2238" />
        </radialGradient>
        <pattern id={`${id}-mesh`} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#3a3f4a" />
          <path d="M0 0 L4 4 M4 0 L0 4" stroke="#7fe3ff" strokeOpacity=".75" strokeWidth=".7" />
        </pattern>
        <pattern id={`${id}-leopard`} width="9" height="7" patternUnits="userSpaceOnUse">
          <rect width="9" height="7" fill="#e0ae50" />
          <circle cx="2.2" cy="2.2" r="1.7" fill="#32200e" />
          <circle cx="6.8" cy="5" r="1.4" fill="#32200e" />
        </pattern>
      </defs>

      <ellipse cx="190" cy="548" rx="150" ry="13" fill={u('shadow')} />

      {/* his trophy cage, door open and waiting for Azul (the stage draws its own, in front of him) */}
      {!noCage && (
        <g transform="translate(86 538) scale(.82)">
          <Cage rim={rim} />
        </g>
      )}

      {/* long coat: the red lining flares behind his legs */}
      <g className="rato-coat">
        <path d="M160 404 C150 442 134 480 116 512 C130 526 156 522 178 526 C204 530 246 526 274 506 C262 470 250 438 244 404 Z" fill={u('lining')} />
        <path d="M122 508 C150 520 232 524 268 504" stroke="#d65a48" strokeOpacity=".5" strokeWidth="1.4" fill="none" />
      </g>

      {/* front leg, knee bent */}
      <path d="M204 430 L240 428 C258 448 268 470 266 490 C264 506 260 518 258 530 L232 530 C234 516 234 502 230 492 C220 476 210 456 204 430 Z" fill="#3f4a28" />
      <path d="M262 470 C266 482 265 496 260 516" stroke={rim} strokeOpacity=".35" strokeWidth="1.5" fill="none" />
      <path d="M228 508 L262 506 L264 530 C282 531 300 537 301 547 L224 547 Z" fill={u('boot')} />
      <path d="M264 531 C280 533 294 538 298 544" stroke="#8a6a4a" strokeWidth="1" fill="none" />
      <rect x="222" y="544.5" width="81" height="4" rx="2" fill="#0e0905" />

      {/* back leg with a cargo pocket and a tall laced boot */}
      <path d="M162 430 L220 430 C220 452 214 472 208 490 C202 506 198 520 196 532 L156 532 C156 514 158 500 160 488 C160 466 158 448 162 430 Z" fill={u('pants')} />
      <path d="M170 462 L200 460 L198 488 L172 490 Z" fill="#5a6636" stroke="#333c20" />
      <path d="M169 462 L201 460 L201 468 L170 470 Z" fill="#475230" stroke="#333c20" strokeWidth=".8" />
      <circle cx="185" cy="465" r="1.6" fill={GOLD} />
      <path d="M166 498 C176 504 190 504 202 498 M162 442 C176 450 196 450 214 442" stroke="#2f3820" strokeWidth="1.4" fill="none" opacity=".8" />
      <path d="M218 436 C218 458 212 476 206 492 C200 508 197 520 196 530" stroke={rim} strokeOpacity=".45" strokeWidth="1.8" fill="none" />
      <path d="M152 506 L200 504 L202 529 C222 531 240 537 241 547 L148 547 Z" fill={u('boot')} />
      <path d="M172 510 L190 516 M172 516 L190 510 M172 520 L190 526 M172 526 L190 520 M172 532 L192 532" stroke="#b78e62" strokeWidth="1.2" />
      <rect x="151" y="507" width="50" height="4.5" rx="1.5" fill="#2a1a10" />
      <rect x="154" y="505.5" width="7" height="7.5" rx="1" fill="none" stroke={GOLD} strokeWidth="1.4" />
      <path d="M203 530 C220 532 236 538 238 544" stroke={rim} strokeOpacity=".4" strokeWidth="1.3" fill="none" />
      <rect x="146" y="544.5" width="97" height="4.5" rx="2" fill="#0e0905" />
      <g fill="#6a4c2c" opacity=".85">
        <ellipse cx="224" cy="541" rx="9" ry="3" />
        <ellipse cx="166" cy="541" rx="8" ry="3" />
        <ellipse cx="284" cy="542" rx="9" ry="2.6" />
        <ellipse cx="242" cy="541" rx="7" ry="2.5" />
      </g>

      {/* coat skirts, split at the front and hanging over the legs */}
      <g className="rato-coat">
        <path d="M168 428 C160 454 146 488 126 514 C142 526 170 524 190 514 C196 486 202 456 204 430 Z" fill={u('coatdown')} />
        <path d="M128 512 C144 522 170 520 188 512" stroke="#d4a064" strokeWidth="1" strokeDasharray="3 3" fill="none" />
        <path d="M204 432 C202 456 196 486 190 514" stroke={rim} strokeOpacity=".4" strokeWidth="1.5" fill="none" />
        <path d="M172 440 C164 466 152 490 142 508" stroke="#2c1608" strokeOpacity=".55" strokeWidth="2" fill="none" />
        <path d="M216 430 C222 458 240 486 264 506 C256 516 240 518 228 512 C216 486 210 458 208 430 Z" fill={LEATHER_D} />
        <path d="M222 448 C228 472 240 492 256 506" stroke="#2c1608" strokeOpacity=".5" strokeWidth="1.6" fill="none" />
      </g>

      <g className="rato-breathe">
        {/* fitted coat over a khaki shirt */}
        <path d="M156 354 C160 336 178 330 194 330 L224 330 C242 330 258 338 260 356 C262 380 248 406 240 432 L166 432 C158 406 152 380 156 354 Z" fill={u('coat')} />
        <path d="M190 330 L228 330 L212 432 L198 432 Z" fill={u('shirt')} />
        <path d="M205 344 L205 430" stroke="#8a7648" strokeWidth="1" />
        {[358, 378, 398, 418].map((y) => (
          <circle key={y} cx="205" cy={y} r="1.5" fill="#6e5c38" />
        ))}
        <path d="M188 330 C180 352 188 394 198 430 L186 430 C176 396 168 354 176 334 Z" fill={LEATHER_L} />
        <path d="M230 330 C236 352 226 394 212 430 L224 430 C236 396 246 354 240 334 Z" fill={LEATHER} />
        <path d="M181 340 C176 362 182 398 190 428 M236 340 C240 362 232 398 219 428" stroke="#f0d3a0" strokeOpacity=".6" strokeWidth=".9" strokeDasharray="3 2.6" fill="none" />
        <path d="M258 356 C260 380 246 406 240 430" stroke={rim} strokeOpacity=".55" strokeWidth="1.9" fill="none" />
        <path d="M156 354 C152 380 158 406 166 432 L176 432 C168 406 164 380 168 350 Z" fill="#000" opacity=".26" />

        {/* binoculars */}
        <path d="M196 338 C196 348 198 352 200 354 M220 338 C220 348 218 352 216 354" stroke="#2a1a10" strokeWidth="1.6" fill="none" />
        <g transform="translate(208 362)">
          <rect x="-15" y="-8" width="13" height="19" rx="4" fill="#1f242c" stroke="#0e1116" />
          <rect x="2" y="-8" width="13" height="19" rx="4" fill="#1f242c" stroke="#0e1116" />
          <rect x="-3" y="-4" width="6" height="8" rx="1.5" fill="#3a414e" />
          <circle cx="-8.5" cy="9" r="4.2" fill={u('lens')} />
          <circle cx="8.5" cy="9" r="4.2" fill={u('lens')} />
        </g>

        {/* bandolier of net cartridges */}
        <path d={`M${BAND_A.x} ${BAND_A.y} L${BAND_B.x} ${BAND_B.y}`} stroke="#3a2212" strokeWidth="14" strokeLinecap="round" />
        <path d={`M${BAND_A.x} ${BAND_A.y} L${BAND_B.x} ${BAND_B.y}`} stroke="#6a4326" strokeWidth="10.5" strokeLinecap="round" />
        {CARTRIDGES.map((t) => {
          const p = along(BAND_A, BAND_B, t);
          return (
            <g key={t} transform={`translate(${f(p.x)} ${f(p.y)}) rotate(43)`}>
              <rect x="-3.4" y="-8" width="6.8" height="13" rx="1.8" fill={u('red')} />
              <rect x="-3.4" y="2.5" width="6.8" height="3.4" fill={GOLD} />
              <circle cy="-8" r="1.7" fill="#7ff4ff" className="gun-glow" />
            </g>
          );
        })}

        {/* gun belt cinching the coat */}
        <rect x="162" y="424" width="84" height="14" rx="3" fill="#2d1b0e" />
        <path d="M164 427 H244 M164 435 H244" stroke="#8a5a30" strokeWidth=".8" strokeDasharray="3 2.5" />
        <rect x="194" y="421" width="20" height="20" rx="3.5" fill="#6e5220" stroke={GOLD} strokeWidth="2.4" />
        <path d="M199 431 L209 431" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M204 425 C203 428 203 434 204 437" stroke="#fff6d2" strokeOpacity=".7" strokeWidth="1" fill="none" />
        {/* pouch */}
        <path d="M164 438 H186 V458 C186 462 182 464 175 464 C168 464 164 462 164 458 Z" fill="#553219" stroke="#2c1608" />
        <path d="M164 438 H186 V447 C180 451 170 451 164 447 Z" fill="#6c4324" stroke="#2c1608" strokeWidth=".8" />
        <circle cx="175" cy="447" r="1.8" fill={GOLD} />
        {/* trophy feathers from the ones that didn't get away */}
        <g transform="translate(226 438)">
          <g className="rato-charm">
            <path d="M0 0 V10 M-6 0 V9 M6 0 V8" stroke="#c9b27d" strokeWidth="1.2" />
            <path d={FEATHER} fill={u('blue')} transform="translate(-7 8) rotate(10) scale(.95)" />
            <path d={FEATHER} fill={u('blue')} transform="translate(7 7) rotate(-8) scale(.85)" />
            <path d={FEATHER} fill={u('blue')} transform="translate(0 9)" />
            <path d="M0 10 V42" stroke="#bfe6ff" strokeOpacity=".7" strokeWidth=".8" />
            <ellipse cx="0" cy="38" rx="2.2" ry="5" fill="#8ff6ff" className="gun-glow" />
          </g>
        </g>

        {/* neck, bandana and a shaggy fur collar */}
        <path d="M196 316 L226 316 L228 346 L194 346 Z" fill={SKIN_D} />
        <path d="M188 334 C198 346 226 346 236 334 L238 348 C226 360 198 360 186 348 Z" fill={u('red')} />
        <g fill="#ffd9d0" opacity=".85">
          <circle cx="198" cy="348" r="1.2" />
          <circle cx="208" cy="353" r="1.2" />
          <circle cx="218" cy="353" r="1.2" />
          <circle cx="228" cy="347" r="1.2" />
        </g>
        <path d="M188 340 L172 356 L186 354 L180 368 L194 352 Z" fill="#a52f23" />
        <path d="M192 330 C176 328 160 336 152 354 L164 349 L164 364 L174 352 L180 364 L188 350 L196 342 Z" fill="#33251c" />
        <path d="M228 330 C244 328 260 338 264 354 L254 350 L252 362 L244 350 L238 358 L232 344 L224 338 Z" fill="#46352a" />
        <path d="M228 331 C244 330 258 340 263 353" stroke={rim} strokeOpacity=".6" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        <path d="M172 340 L168 350 M180 336 L178 348 M240 338 L244 350 M250 344 L254 354" stroke="#6e5a48" strokeWidth="1.2" />

        {/* head */}
        <g>
          <ellipse cx="192" cy="300" rx="8.5" ry="12.5" fill="#b5774c" />
          <path d="M189 293 C194 296 195 304 192 308" stroke="#7a4a2c" strokeWidth="1.5" fill="none" />
          <circle cx="191" cy="316" r="4" fill="none" stroke={GOLD} strokeWidth="1.8" />
          <path d="M188 286 C188 264 204 252 224 252 C244 252 257 266 258 286 C259 298 258 312 255 322 C253 336 245 346 232 347 C214 348 192 332 188 286 Z" fill={u('skin')} />
          {/* shading: the side away from the moon, the jaw and the shadow under the brim */}
          <path d="M188 286 C192 318 206 340 228 346 C214 348 192 332 188 286 Z" fill="#000" opacity=".2" />
          <path d="M204 322 C212 340 230 348 242 345 C252 340 256 330 256 318 C248 324 238 330 228 330 C218 330 210 328 204 322 Z" fill="#2b1d14" opacity=".34" />
          <path d="M188 268 C210 278 240 280 262 272 L260 286 C238 290 210 288 189 282 Z" fill="#000" opacity=".26" />
          <path d="M238 335 C240 345 246 353 250 353 C254 349 254 341 252 334 Z" fill={HAIR} />
          <path d="M192 270 C188 288 190 308 200 324 C204 312 202 294 206 276 Z" fill={HAIR} />
          <path d="M256 272 C261 282 262 298 260 312" stroke={rim} strokeOpacity=".55" strokeWidth="1.8" fill="none" />
          <circle cx="232" cy="314" r="8" fill="#d9764f" opacity=".3" />
          <path d="M226 277 L229 285 M235 301 L240 313" stroke="#f3c4a6" strokeWidth="2" strokeLinecap="round" />
          <path d="M235 305 l5 -2 M237 309 l5 -2" stroke="#b5714a" strokeWidth="1" />

          {/* eyes and brows, by mood */}
          {(mood === 'idle' || mood === 'aim') && (
            <g>
              <path d="M222 293 C226 286 238 286 242 293 C238 299 226 299 222 293 Z" fill="#fff" />
              <circle cx="234" cy="293" r={mood === 'aim' ? 4.8 : 4.3} fill="#b0701c" />
              <circle cx="234.6" cy="293" r="2.5" fill="#120b06" />
              <circle cx="236" cy="291.4" r="1" fill="#fff" />
              <path d="M221 293 C226 285 238 285 243 293" stroke="#120b06" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              {mood === 'idle' ? (
                <g>
                  <path d="M248 291 C250 287 257 287 259 291 C257 295 250 295 248 291 Z" fill="#fff" />
                  <circle cx="254.6" cy="291" r="2.8" fill="#120b06" />
                  <path d="M247.5 291 C250 286 257 286 259.5 291" stroke="#120b06" strokeWidth="1.8" fill="none" />
                </g>
              ) : (
                <path d="M248 292 C251 289 256 289 259 292" stroke="#120b06" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              )}
              <path d="M218 282 C226 277 238 279 245 288 L243 291 C236 284 227 283 219 286 Z" fill={HAIR} />
              <path d="M248 287 C251 281 257 280 261 283 L260 286 C257 285 252 286 249 290 Z" fill={HAIR} />
              <g className="rato-blink" transform="scale(1 0)">
                <path d="M221 293 C226 285 238 285 243 293 C238 299 226 299 221 293 Z M247 291 C250 286 257 286 260 291 C257 295 250 295 247 291 Z" fill="#b87a4e" />
              </g>
            </g>
          )}
          {mood === 'cheer' && (
            <g>
              <path d="M222 294 C226 287 237 287 241 294" stroke="#120b06" strokeWidth="2.8" fill="none" strokeLinecap="round" />
              <path d="M247 292 C250 287 256 287 259 292" stroke="#120b06" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M218 278 C226 271 238 271 244 277 L243 281 C236 276 226 276 219 282 Z" fill={HAIR} />
              <path d="M248 276 C251 272 257 272 261 276 L260 279 C257 277 252 277 249 280 Z" fill={HAIR} />
            </g>
          )}
          {mood === 'annoyed' && (
            <g>
              <path d="M222 294 C227 289 237 290 242 295 C237 299 227 299 222 294 Z" fill="#fff" />
              <circle cx="233" cy="294.6" r="3.2" fill="#120b06" />
              <path d="M248 293 C251 290 256 290 259 293 C256 296 251 296 248 293 Z" fill="#fff" />
              <circle cx="254" cy="293.2" r="2" fill="#120b06" />
              <path d="M218 278 C228 281 236 285 245 293 L243 296 C235 290 227 286 218 283 Z" fill={HAIR} />
              <path d="M248 294 C252 288 257 284 262 282 L262 286 C258 287 254 291 251 296 Z" fill={HAIR} />
              <path d="M268 256 c3 -4 7 -4 9 0 M275 247 c3 -4 7 -4 9 0" stroke="#dbe9f2" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".85" />
            </g>
          )}

          {/* hooked nose */}
          <path d="M250 288 C252 298 262 306 270 312 C273 319 266 325 258 324 C252 324 248 320 248 317" fill={u('skin')} stroke="#8a5432" strokeWidth="1.1" />
          <path d="M258 322 C262 322 265 320 266 318" stroke="#6e3f25" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M254 298 C258 304 263 308 268 312" stroke="#ffe0c2" strokeOpacity=".7" strokeWidth="1.3" fill="none" strokeLinecap="round" />

          {/* mouth, by mood */}
          {mood === 'cheer' && (
            <g>
              <path d="M230 330 C238 352 262 352 272 328 Z" fill="#4a1414" />
              <path d="M234 331 L268 330 L265 337 L238 338 Z" fill="#fff" />
              <rect x="252" y="331" width="6" height="6" fill="#f0c040" />
              <path d="M242 345 C250 340 260 341 264 344 C258 350 248 350 242 345 Z" fill="#c0504a" />
            </g>
          )}
          {mood === 'annoyed' && (
            <g>
              <rect x="234" y="329" width="30" height="10" rx="2.4" fill="#fff" stroke="#4a1414" strokeWidth="1.4" />
              <path d="M241 329 V339 M249 329 V339 M257 329 V339" stroke="#4a1414" strokeWidth="1" />
            </g>
          )}
          {(mood === 'idle' || mood === 'aim') && (
            <g>
              <path d="M234 333 C244 338 254 337 262 331" stroke="#5a2a1e" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M258 333 L296 322" stroke="#5e3a1e" strokeWidth="7" strokeLinecap="round" />
              <path d="M258 331 L295 320.5" stroke="#8f5e30" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M268 327.5 L270 334.5" stroke={GOLD} strokeWidth="3" />
              <circle className="rato-ember" cx="297.5" cy="321.5" r="3.6" fill="#ff7a2a" />
              <g fill="#cfe2ee">
                <circle className="rato-smoke" cx="300" cy="312" r="3.4" />
                <circle className="rato-smoke" cx="298" cy="312" r="2.6" style={{ animationDelay: '-1.1s' }} />
                <circle className="rato-smoke" cx="302" cy="312" r="3" style={{ animationDelay: '-2.2s' }} />
              </g>
            </g>
          )}

          {/* handlebar moustache */}
          <path
            d="M254 322 C244 318 232 320 224 326 C218 330 210 328 208 320 C207 315 211 311 215 313 C212 315 212 320 216 322 C222 324 230 316 242 314 C248 313 254 315 258 318 C264 314 272 314 278 317 C286 321 292 317 292 309 C292 305 288 303 285 305 C288 307 287 312 283 313 C277 314 270 319 266 324 C262 328 258 326 254 322 Z"
            fill={HAIR}
          />
          <path d="M244 317 C250 315 256 316 259 319 M226 324 C232 319 238 317 243 316" stroke="#5b4636" strokeWidth="1.2" fill="none" />
        </g>

        {/* wide bush hat: pinned brim, leopard band, a stolen blue feather */}
        <g transform="rotate(-6 214 258)">
          <path d="M136 262 C150 276 280 276 296 260 C290 252 142 252 136 262 Z" fill="#54401f" />
          <ellipse cx="216" cy="258" rx="82" ry="12" fill={u('brim')} />
          <ellipse cx="216" cy="258" rx="74" ry="9" fill="none" stroke="#54401f" strokeWidth="1" strokeDasharray="3.4 3" />
          <path d="M296 258 C276 268 240 270 216 270" stroke={rim} strokeOpacity=".6" strokeWidth="1.5" fill="none" />
          <path d="M178 258 C172 232 184 212 198 206 C208 202 226 202 236 206 C250 212 260 232 254 258 Z" fill={u('hat')} />
          <path d="M198 208 C208 218 226 218 236 208" stroke="#54401f" strokeWidth="2.4" fill="none" />
          <path d="M186 228 C190 240 192 248 192 256 M246 228 C242 240 242 248 242 256" stroke="#54401f" strokeOpacity=".5" strokeWidth="1.6" fill="none" />
          <path d="M248 216 C255 226 258 242 256 254" stroke={rim} strokeOpacity=".6" strokeWidth="1.8" fill="none" />
          <path d="M178 246 C198 251 234 251 254 246 L254 258 C234 263 198 263 178 258 Z" fill={u('leopard')} />
          <path d="M178 246 C198 251 234 251 254 246 M178 258 C198 263 234 263 254 258" stroke="#3a2410" strokeWidth="1.2" fill="none" />
          {/* claws strung on the band */}
          <g fill="#f3ead2" stroke="#6e5c38" strokeWidth=".6">
            <path d="M232 250 C233 256 236 260 239 261 C238 256 237 252 236 250 Z" />
            <path d="M242 249 C243 255 246 259 249 260 C248 255 247 251 246 249 Z" />
          </g>
          {/* pinned side of the brim */}
          <path d="M136 262 C126 240 138 228 152 236 L176 258 Z" fill="#8a6a3c" stroke="#54401f" strokeWidth="1" />
          <circle cx="156" cy="250" r="4" fill={GOLD} stroke="#6e5220" />
          <g transform="translate(150 246) rotate(-24)">
            <path d="M0 0 C13 -18 13 -54 0 -76 C-13 -54 -13 -18 0 0 Z" fill={u('blue')} stroke="#0d2a78" strokeWidth=".8" />
            <path d="M0 0 L0 -70" stroke="#d4f0ff" strokeOpacity=".75" strokeWidth="1" />
            <path d="M0 -20 L8 -28 M0 -32 L9 -40 M0 -44 L8 -52 M0 -20 L-8 -28 M0 -32 L-9 -40 M0 -44 L-8 -52" stroke="#0d2a78" strokeOpacity=".7" strokeWidth=".7" />
            <ellipse className="gun-glow" cx="0" cy="-64" rx="3.4" ry="8" fill="#8ff6ff" />
          </g>
          {/* aviators pushed up on the crown */}
          <g transform="translate(216 233)">
            <path d="M-21 -5 C-21 -11 -5 -11 -3 -5 C-3 4 -9 9 -14 8 C-19 7 -21 1 -21 -5 Z" fill="#14202c" stroke={GOLD} strokeWidth="1.6" />
            <path d="M3 -5 C5 -11 21 -11 21 -5 C21 1 19 7 14 8 C9 9 3 4 3 -5 Z" fill="#14202c" stroke={GOLD} strokeWidth="1.6" />
            <path d="M-3 -6 C-1 -8 1 -8 3 -6" stroke={GOLD} strokeWidth="1.6" fill="none" />
            <path d="M-18 -6 L-11 -7 M6 -6 L14 -7 M8 -2 L13 -3" stroke={rim} strokeWidth="1.4" opacity=".85" />
          </g>
        </g>
      </g>

      {/* the far arm reaches behind the gun */}
      <Arm s={FAR_SHOULDER} h={farHand} upper={58} fore={58} fill={LEATHER_D} cuff="#35200f" />

      {/* the net cannon */}
      <g transform={gunTransform}>
        {/* air hose */}
        <path d="M230 398 C248 408 276 404 296 386" stroke="#1b1f27" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M230 398 C248 408 276 404 296 386" stroke="#c0392b" strokeWidth="1.2" strokeDasharray="4 4" fill="none" />
        {/* butt pad, stock */}
        <rect x="146" y="358" width="13" height="42" rx="5" fill="#14171d" stroke="#000" />
        <path d="M156 362 L236 352 L238 386 L190 394 L176 402 L156 398 Z" fill={u('body')} stroke="#101319" />
        <path d="M162 370 L232 361" stroke="#ff6a2a" strokeWidth="2.6" />
        <path d="M162 376 L232 367" stroke="#ffd23f" strokeWidth="1" />
        {/* air tank and pressure gauge */}
        <rect x="176" y="392" width="58" height="15" rx="7.5" fill={u('steel')} stroke="#161a20" />
        <path d="M188 392 V407 M212 392 V407" stroke="#3a414e" strokeWidth="2" />
        <circle cx="226" cy="399" r="7.4" fill="#f4fbff" stroke="#161a20" strokeWidth="1.6" />
        <path d="M226 399 L230 394.6" stroke="#d23c3c" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M220.5 399 a5.5 5.5 0 0 1 11 0" stroke="#3a414e" strokeWidth=".7" strokeDasharray="1 1.4" fill="none" />
        {/* pistol grip and trigger */}
        <path d="M244 384 L238 414 C238 420 254 422 258 416 L266 384 Z" fill="#20252e" stroke="#101319" />
        <path d="M266 384 C266 398 282 398 284 384" stroke="#2c323e" strokeWidth="2.6" fill="none" />
        <path d="M272 385 C272 389 274 392 276 392" stroke={GOLD} strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* receiver */}
        <rect x="232" y="347" width="78" height="40" rx="8" fill={u('body')} stroke="#101319" strokeWidth="1.2" />
        <rect x="240" y="354" width="40" height="24" rx="4" fill="#20252e" />
        <path d="M246 358 l-4 16 M254 358 l-4 16 M262 358 l-4 16 M270 358 l-4 16" stroke="#4c5566" strokeWidth="2" />
        <rect x="284" y="357" width="20" height="7" rx="1.6" fill="#0d1218" />
        <rect x="285.5" y="358.5" width="10" height="4" rx="1" fill="#3fd68a" className="gun-glow" />
        <circle cx="295" cy="374" r="4.2" fill="#14171d" stroke={GOLD} strokeWidth="1.2" />
        <circle cx="295" cy="374" r="1.5" fill="#ff5a4a" className="gun-glow" />
        <path d="M238 349 H304" stroke="#aeb9c9" strokeOpacity=".7" strokeWidth="1" />
        {/* scope */}
        <path d="M256 347 V340 M286 347 V340" stroke="#2c323e" strokeWidth="5" />
        <rect x="244" y="330" width="56" height="12" rx="5.5" fill={u('body')} stroke="#101319" />
        <path d="M250 332 H294" stroke="#aeb9c9" strokeOpacity=".6" strokeWidth=".9" />
        <rect x="240" y="331.5" width="6" height="9" rx="2" fill="#14171d" />
        <rect x="298" y="329" width="7" height="14" rx="2.5" fill="#2c323e" />
        <ellipse cx="305" cy="336" rx="2.6" ry="6" fill={rim} className="gun-glow" />
        {/* barrel with cooling ribs */}
        <rect x="306" y="357" width="106" height="18" rx="3" fill={u('steel')} />
        <rect x="306" y="357" width="106" height="2.4" fill="#f3f7fb" />
        <g fill="#2c323e">
          {[338, 345, 352].map((x) => (
            <rect key={x} x={x} y="356" width="3" height="20" rx="1" />
          ))}
        </g>
        {/* charged coils */}
        <rect x="360" y="359" width="42" height="14" fill="#7ff4ff" className="gun-glow" opacity=".85" />
        <g fill="#d09a44" stroke="#6e5220" strokeWidth=".7">
          {[360, 368, 376, 384, 392, 400].map((x) => (
            <rect key={x} x={x} y="354" width="4.6" height="24" rx="2" />
          ))}
        </g>
        {/* net canister */}
        <path d="M352 376 V380 M396 376 V380" stroke="#2c323e" strokeWidth="5" />
        <rect x="340" y="380" width="68" height="20" rx="10" fill={u('red')} stroke="#6e1a13" />
        <path d="M352 380 V400 M396 380 V400" stroke={GOLD} strokeWidth="2.6" />
        <rect x="360" y="384.5" width="28" height="11" rx="2" fill="#6e1a13" />
        <text x="374" y="393" textAnchor="middle" fontFamily="Oxanium, sans-serif" fontWeight="800" fontSize="8" fill="#ffd23f">
          NET
        </text>
        <path d="M346 383 H402" stroke="#ffc2b4" strokeOpacity=".65" strokeWidth="1.2" strokeLinecap="round" />
        {/* flared muzzle holding the coiled net */}
        <path d="M410 353 L436 340 L436 392 L410 379 Z" fill={u('body')} stroke="#101319" />
        <path d="M410 353 L436 340" stroke="#aeb9c9" strokeOpacity=".8" strokeWidth="1.2" />
        <ellipse cx="436" cy="366" rx="6.5" ry="27" fill={u('mesh')} stroke={GOLD} strokeWidth="2.6" />
        <g fill="#c9d2de" stroke="#3a414e" strokeWidth=".8">
          <circle cx="437" cy="340" r="3.6" />
          <circle cx="441" cy="353" r="3.6" />
          <circle cx="441" cy="379" r="3.6" />
          <circle cx="437" cy="392" r="3.6" />
        </g>

        {/* the winch: its line runs up the barrel and out through the muzzle */}
        <circle cx={WINCH.x} cy={WINCH.y} r="10.5" fill={u('body')} stroke="#101319" />
        <circle cx={WINCH.x} cy={WINCH.y} r="6.6" fill="none" stroke="#d6b06a" strokeWidth="3" strokeDasharray="2.4 1.6" />
        <path d={`M${WINCH.x} ${WINCH.y} L${f(handle.x)} ${f(handle.y)}`} stroke="#c9d2de" strokeWidth="3.4" strokeLinecap="round" />
        <circle cx={WINCH.x} cy={WINCH.y} r="2.8" fill={GOLD} />
        <circle cx={f(handle.x)} cy={f(handle.y)} r="3.6" fill="#ff6a2a" stroke="#101319" />

        {reeling && (
          <g transform={`translate(${f(handle.x)} ${f(handle.y)})`}>
            <rect x="-9.5" y="-9" width="19" height="18" rx="7" fill={GLOVE} />
            <path d="M-9.5 -1 H9.5 M-3.5 -9 V0 M3 -9 V0" stroke="#6e5240" strokeWidth="1.1" />
          </g>
        )}
        {!pumping && !reeling && (
          <g>
            {/* leading hand wrapped round the barrel */}
            <path d="M304 376 C304 366 322 362 332 370 C336 380 330 390 318 391 C310 391 304 386 304 376 Z" fill={GLOVE} />
            <g stroke={GLOVE} strokeWidth="6.4" strokeLinecap="round" fill="none">
              <path d="M310 372 C310 362 314 356 318 356" />
              <path d="M317 372 C317 362 321 355 325 355" />
              <path d="M324 373 C324 364 328 357 332 357" />
            </g>
            <path d="M318 354 h1 M325 353 h1 M332 355 h1" stroke="#6e5240" strokeWidth="3.4" strokeLinecap="round" />
          </g>
        )}
        {puff >= 0 && (
          <g opacity={Math.max(0, 1 - puff)}>
            <circle cx={440 + puff * 34} cy="366" r={12 + puff * 34} fill="#7ff4ff" fillOpacity=".14" stroke="#e8f6ff" strokeWidth={3.4 * (1 - puff) + 0.5} />
            <path d={`M442 348 l${18 + puff * 34} -12 M442 384 l${18 + puff * 34} 12 M444 366 l${28 + puff * 40} 0`} stroke="#e8f6ff" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        )}
      </g>

      {pumping && (
        <g transform={`translate(${farHand.x} ${farHand.y})`}>
          <rect x="-13" y="-15" width="26" height="28" rx="9" fill={GLOVE} />
          <path d="M-13 -5 H13 M-5 -15 V-3 M3 -15 V-3" stroke="#6e5240" strokeWidth="1.3" />
          <path d="M-9 -14 H8" stroke={rim} strokeOpacity=".6" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      {/* near arm over the stock, hand on the grip */}
      <Arm s={NEAR_SHOULDER} h={nearHand} upper={60} fore={60} fill={LEATHER} cuff={LEATHER_L} rim={rim} />
      <path d="M154 348 C160 336 182 334 192 346 C194 360 184 372 170 372 C158 372 150 360 154 348 Z" fill={u('coat')} />
      <path d="M158 348 C165 340 180 340 188 348" stroke="#f0d3a0" strokeOpacity=".55" strokeWidth=".9" strokeDasharray="3 2.6" fill="none" />
      <g transform={gunTransform}>
        <path d="M239 392 C241 384 262 382 268 390 C271 402 264 412 252 412 C243 412 237 402 239 392 Z" fill={GLOVE} />
        <path d="M245 390 V405 M252 388 V408 M259 389 V406" stroke="#000" strokeOpacity=".55" strokeWidth="1.1" />
        <path d="M243 388 C249 383 259 383 265 388" stroke="#6e5240" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M265 388 C271 387 275 389 276 391" stroke={GLOVE} strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>

      {bubble && (
        <g transform={`translate(250 196) scale(${bubbleScale.toFixed(2)})`}>
          <g key={bubble} className="speech-bubble">
            <rect x="0" y="-40" width={bubble.length * 10.5 + 28} height="36" rx="14" fill="#f4fbff" stroke="#06121c" strokeWidth="1.6" />
            <path d="M14 -6 L6 14 L30 -6 Z" fill="#f4fbff" stroke="#06121c" strokeWidth="1.6" strokeLinejoin="round" />
            <rect x="12" y="-8" width="20" height="4" fill="#f4fbff" />
            <text x="14" y="-16" fontFamily="Oxanium, sans-serif" fontWeight="800" fontSize="17" fill="#06121c" letterSpacing=".5">
              {bubble}
            </text>
          </g>
        </g>
      )}
    </g>
  );
}

export function PoacherArt({ mood = 'idle', aim = -20, width = 380, cage = true }: { mood?: PoacherMood; aim?: number; width?: number; cage?: boolean }) {
  const x0 = cage ? 30 : 130;
  const w = 470 - x0;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`${x0} 170 ${w} 386`} width={width} height={(width * 386) / w} role="img" aria-label="Rato the poacher with his net launcher">
      <Poacher mood={mood} aim={aim} noCage={!cage} />
    </svg>
  );
}
