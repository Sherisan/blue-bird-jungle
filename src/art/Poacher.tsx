import { useId } from 'react';

export type PoacherMood = 'idle' | 'aim' | 'cheer' | 'annoyed';

export interface PoacherProps {
  mood: PoacherMood;
  /** Net-gun angle in degrees around the chest pivot (205, 372). Negative = up. */
  aim: number;
  recoil?: number;
  /** Compressed-air puff at the muzzle right after firing. */
  puff?: number;
  bubble?: string | null;
  /** Cool rim light from the moon. */
  rim?: string;
  /** Hide the cage prop (e.g. for portraits). */
  noCage?: boolean;
}

/** Muzzle centre relative to the pivot, before rotation. Keep in sync with the gun drawing. */
export const MUZZLE_OFFSET = { x: 229, y: -6 };

const SKIN_D = '#9a6440';
const HAIR = '#1b130e';
const KHAKI = '#c3ad78';
const KHAKI_D = '#a08b58';
const OLIVE = '#56603a';

const CAGE_BARS = Array.from({ length: 9 }, (_, i) => 54 + i * 8);
const domeTop = (x: number) => 470 - 34 * Math.sqrt(Math.max(0, 1 - ((x - 86) / 38) ** 2));

/**
 * Rato the poacher, drawn in scene coordinates (viewBox 0 0 1000 560): feet on
 * y≈547, net gun pivoting at (205, 372). Use <PoacherArt> for a standalone SVG.
 */
export function Poacher({ mood, aim, recoil = 0, puff = -1, bubble = null, rim = '#7fe3ff', noCage = false }: PoacherProps) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `url(#${id}-${n})`;

  return (
    <g className="poacher">
      <defs>
        <radialGradient id={`${id}-skin`} cx=".62" cy=".36" r=".8">
          <stop offset="0" stopColor="#e2a57a" />
          <stop offset=".6" stopColor="#c48356" />
          <stop offset="1" stopColor="#8f5a36" />
        </radialGradient>
        <linearGradient id={`${id}-pants`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5d5b31" />
          <stop offset="1" stopColor="#7c7944" />
        </linearGradient>
        <linearGradient id={`${id}-shirt`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8935f" />
          <stop offset=".7" stopColor="#cdb782" />
          <stop offset="1" stopColor="#b8a26c" />
        </linearGradient>
        <linearGradient id={`${id}-hat`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b08c55" />
          <stop offset="1" stopColor="#7a5c32" />
        </linearGradient>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d2de" />
          <stop offset=".45" stopColor="#5e6878" />
          <stop offset="1" stopColor="#232832" />
        </linearGradient>
        <linearGradient id={`${id}-boot`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3020" />
          <stop offset="1" stopColor="#1c120a" />
        </linearGradient>
        <pattern id={`${id}-stubble`} width="3" height="3" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r=".5" fill="#4a2e1e" opacity=".55" />
        </pattern>
        <pattern id={`${id}-mesh`} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#8f8460" />
          <path d="M0 0 L4 4 M4 0 L0 4" stroke="#d8cda2" strokeWidth=".7" />
        </pattern>
        <pattern id={`${id}-leopard`} width="8" height="6" patternUnits="userSpaceOnUse">
          <rect width="8" height="6" fill="#d9a94e" />
          <circle cx="2" cy="2" r="1.3" fill="#3a2410" />
          <circle cx="6" cy="4.5" r="1.1" fill="#3a2410" />
        </pattern>
      </defs>

      <ellipse cx="170" cy="548" rx="120" ry="9" fill="#000" opacity=".45" />

      {/* bamboo cage, door open, waiting */}
      {!noCage && (
        <g>
          <rect x="44" y="528" width="84" height="16" rx="4" fill="#5a3a1e" stroke="#2e1d0d" />
          <path d="M48 530 L48 470 C48 428 124 428 124 470 L124 530" fill="rgba(4,10,18,.35)" stroke="#d6ad5c" strokeWidth="3" />
          {CAGE_BARS.map((x) => (
            <path key={x} d={`M${x} 530 L${x} ${domeTop(x).toFixed(1)}`} stroke="#c99a4a" strokeWidth="2" />
          ))}
          <path d="M48 500 L124 500" stroke="#c99a4a" strokeWidth="2.5" />
          <circle cx="86" cy="430" r="6" fill="none" stroke="#d6ad5c" strokeWidth="2.5" />
          <path d="M124 478 L150 466 L150 512 L124 520" fill="rgba(4,10,18,.25)" stroke="#d6ad5c" strokeWidth="2" />
          <path d="M131 475 L131 517 M139 471 L139 515 M146 468 L146 513" stroke="#c99a4a" strokeWidth="1.6" />
          <rect x="120" y="494" width="8" height="10" rx="2" fill="#9aa3b5" />
          <path d="M121 494 C121 488 127 488 127 494" stroke="#9aa3b5" strokeWidth="1.6" fill="none" />
          <path d="M86 436 L80 452" stroke="#c99a4a" strokeWidth="1" />
          <rect x="70" y="450" width="18" height="10" rx="2" fill="#e8d9b0" transform="rotate(-12 79 455)" />
        </g>
      )}

      {/* far leg */}
      <path d="M164 430 L190 430 L186 520 L167 520 Z" fill="#4c4a27" />
      <path d="M161 513 L189 513 L191 532 C205 533 213 538 213 547 L159 547 Z" fill={u('boot')} />

      {/* near leg */}
      <path d="M192 430 L224 430 L219 522 L196 522 Z" fill={u('pants')} />
      <rect x="203" y="458" width="17" height="20" rx="2" fill="#6c6a38" stroke="#4c4a27" />
      <path d="M203 463 L220 463" stroke="#4c4a27" strokeWidth="1.5" />
      <path d="M200 492 C204 498 212 498 216 494" stroke="#4c4a27" strokeWidth="1.2" fill="none" />
      <path d="M222 436 C224 466 222 496 219 520" stroke={rim} strokeOpacity=".45" strokeWidth="1.8" fill="none" />
      <path d="M193 513 L221 513 L223 532 C239 533 248 538 248 547 L190 547 Z" fill={u('boot')} />
      <path d="M200 518 L214 524 M200 524 L214 518 M200 530 L216 530" stroke="#8a6a4a" strokeWidth="1.1" />
      <rect x="188" y="545" width="62" height="3.5" rx="1.5" fill="#0e0905" />
      <g fill="#5a4026" opacity=".8">
        <ellipse cx="236" cy="541" rx="7" ry="3" />
        <ellipse cx="200" cy="540" rx="5" ry="2.5" />
        <ellipse cx="176" cy="542" rx="6" ry="2.6" />
      </g>

      {/* torso: shirt, vest, belt, bandolier */}
      <path d="M164 336 C157 360 157 402 162 430 L228 430 C233 402 233 362 224 336 Z" fill={u('shirt')} />
      <path d="M164 338 C157 362 157 404 163 428 L190 428 L193 344 Z" fill={OLIVE} />
      <path d="M207 344 L209 428 L228 428 C233 402 231 362 222 340 Z" fill={OLIVE} />
      <rect x="168" y="384" width="18" height="16" rx="2" fill="#4a5330" stroke="#3a4226" />
      <rect x="168" y="384" width="18" height="5" rx="1" fill="#3f4729" />
      <rect x="211" y="388" width="15" height="16" rx="2" fill="#4a5330" stroke="#3a4226" />
      <path d="M164 338 C157 362 157 404 163 428 L176 428 C171 400 171 364 178 340 Z" fill="#000" opacity=".22" />
      <path d="M226 344 C232 370 232 404 228 428" stroke={rim} strokeOpacity=".5" strokeWidth="1.8" fill="none" />
      {/* binoculars on a neck strap */}
      <path d="M190 338 C186 350 186 362 190 370 M210 338 C212 350 210 362 206 370" stroke="#2a1a10" strokeWidth="1.6" fill="none" />
      <g transform="translate(198 378)">
        <rect x="-14" y="-8" width="12" height="18" rx="4" fill="#1f242c" stroke="#0e1116" />
        <rect x="2" y="-8" width="12" height="18" rx="4" fill="#1f242c" stroke="#0e1116" />
        <rect x="-3" y="-4" width="6" height="8" rx="1.5" fill="#3a414e" />
        <circle cx="-8" cy="9" r="4" fill={rim} opacity=".55" />
        <circle cx="8" cy="9" r="4" fill={rim} opacity=".55" />
      </g>
      <rect x="160" y="424" width="70" height="10" rx="2" fill="#3a2414" />
      <rect x="191" y="423" width="11" height="12" rx="2" fill="none" stroke="#d9b45a" strokeWidth="2" />
      <rect x="164" y="430" width="14" height="16" rx="3" fill="#4a3020" />
      <path d="M220 340 L166 420" stroke="#5a3a1e" strokeWidth="9" strokeLinecap="round" />
      {[0.14, 0.27, 0.4, 0.53, 0.66, 0.79].map((t) => {
        const x = 220 + (166 - 220) * t;
        const y = 340 + (420 - 340) * t;
        return (
          <g key={t} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(34)`}>
            <rect x="-3" y="-7" width="6" height="11" rx="1.5" fill="#d23c3c" />
            <rect x="-3" y="2" width="6" height="3" fill="#d9b45a" />
          </g>
        );
      })}

      {/* neck and bandana */}
      <rect x="194" y="316" width="18" height="24" rx="4" fill={SKIN_D} />
      <path d="M184 330 C194 338 208 338 218 330 L218 342 C207 350 195 350 184 342 Z" fill="#c0392b" />
      <g fill="#f3d5cf" opacity=".85">
        <circle cx="192" cy="338" r="1.1" />
        <circle cx="200" cy="343" r="1.1" />
        <circle cx="209" cy="338" r="1.1" />
      </g>
      <path d="M184 334 L172 346 L182 346 Z" fill="#a52f23" />

      {/* head */}
      <ellipse cx="181" cy="296" rx="6.5" ry="9.5" fill="#b5774c" />
      <path d="M176 292 C176 266 192 254 210 256 C230 258 241 274 241 292 C241 312 233 330 215 334 C197 336 178 322 176 292 Z" fill={u('skin')} />
      <path d="M196 316 C204 330 222 333 234 322 C239 314 239 306 237 300 C229 308 214 311 198 309 Z" fill={u('stubble')} />
      <path d="M176 268 C198 276 224 277 244 270 L243 280 C222 285 198 284 177 278 Z" fill="#000" opacity=".2" />
      <path d="M186 312 C190 324 200 332 212 334" stroke="#7a4a2c" strokeWidth="1.4" fill="none" opacity=".6" />
      <path d="M174 280 C170 296 172 312 180 320 C183 306 183 292 186 282 Z" fill={HAIR} />
      <path d="M232 268 C239 278 242 290 240 302" stroke={rim} strokeOpacity=".5" strokeWidth="1.8" fill="none" />
      <path d="M232 283 C245 289 250 302 241 307 C237 308 233 306 232 302" fill="#b5774c" stroke="#8a5432" strokeWidth="1" />
      <circle cx="214" cy="306" r="6" fill="#d9764f" opacity=".35" />

      {/* mouth sits under the moustache */}
      {mood === 'cheer' && (
        <g>
          <path d="M218 314 C226 330 244 330 252 312 Z" fill="#4a1414" />
          <path d="M220 315 L250 314 L248 319 L222 320 Z" fill="#fff" />
          <rect x="236" y="314.5" width="5" height="5" fill="#f0c040" />
        </g>
      )}
      {mood === 'annoyed' && (
        <g>
          <rect x="222" y="314" width="24" height="8" rx="2" fill="#fff" stroke="#4a1414" strokeWidth="1.4" />
          <path d="M228 314 V322 M234 314 V322 M240 314 V322" stroke="#4a1414" strokeWidth="1" />
        </g>
      )}
      {(mood === 'idle' || mood === 'aim') && (
        <g>
          <path d="M222 318 C230 322 238 321 245 315" stroke="#5a2a1e" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M243 316 L266 309" stroke="#e8cf9a" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}
      <path d="M222 309 C228 305 236 305 242 309 C249 305 255 303 260 298 C258 307 249 313 240 312 C233 313 227 313 222 309 Z" fill={HAIR} />

      {/* eyes and brows */}
      {mood === 'idle' && (
        <g>
          <ellipse cx="222" cy="287" rx="4.5" ry="4" fill="#fff" />
          <circle cx="224" cy="288" r="2.6" fill="#1b130e" />
          <path d="M217 285 C220 283 225 283 227.5 285" stroke="#5a3a22" strokeWidth="2.6" fill="none" />
          <ellipse cx="236.5" cy="285.5" rx="2.6" ry="3.4" fill="#fff" />
          <circle cx="237.5" cy="286.5" r="1.8" fill="#1b130e" />
          <path d="M213 278 C219 274 226 274 230 278 L229 281 C224 279 219 279 214 281 Z" fill={HAIR} />
          <path d="M233 277 C236 274 240 275 242 278 L241 280 C238 279 236 279 234 280 Z" fill={HAIR} />
        </g>
      )}
      {mood === 'aim' && (
        <g>
          <ellipse cx="222" cy="287" rx="5" ry="5" fill="#fff" />
          <circle cx="224.5" cy="287.5" r="3" fill="#1b130e" />
          <circle cx="225.4" cy="286.3" r=".9" fill="#fff" />
          <path d="M232 286 C235 284 239 284 241 286" stroke="#1b130e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M212 281 C218 278 226 280 231 285 L230 287 C225 284 219 283 213 284 Z" fill={HAIR} />
          <path d="M232 283 C235 279 240 279 243 281 L242 283 C239 282 236 283 233 285 Z" fill={HAIR} />
        </g>
      )}
      {mood === 'cheer' && (
        <g>
          <path d="M217 289 C220 284.5 225 284.5 228 289" stroke="#1b130e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M233 288 C235.5 284.5 239.5 284.5 241.5 288" stroke="#1b130e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M213 276 C219 270 226 270 230 275 L229 278 C224 275 219 275 214 279 Z" fill={HAIR} />
          <path d="M233 274 C236 271 240 271 242 274 L241 276 C238 275 236 275 234 277 Z" fill={HAIR} />
        </g>
      )}
      {mood === 'annoyed' && (
        <g>
          <ellipse cx="222" cy="288" rx="4" ry="3" fill="#fff" />
          <circle cx="223" cy="288" r="2.2" fill="#1b130e" />
          <ellipse cx="237" cy="287" rx="2.4" ry="2.4" fill="#fff" />
          <circle cx="237.5" cy="287.2" r="1.6" fill="#1b130e" />
          <path d="M212 278 C220 280 226 283 231 288 L229 290 C223 286 218 284 212 282 Z" fill={HAIR} />
          <path d="M233 288 C236 283 240 280 244 279 L244 282 C240 283 237 286 235 290 Z" fill={HAIR} />
          <path d="M250 254 c3 -4 7 -4 9 0 M256 246 c3 -4 7 -4 9 0" stroke="#dbe9f2" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".8" />
        </g>
      )}

      {/* bush hat, one side pinned up, leopard band */}
      <g transform="rotate(-6 210 262)">
        <ellipse cx="212" cy="264" rx="60" ry="10" fill="#6e5230" />
        <ellipse cx="212" cy="262" rx="58" ry="8" fill={u('hat')} />
        <path d="M154 264 C148 244 158 236 168 244 L174 264 Z" fill="#8a6a3c" stroke="#5e4424" strokeWidth="1" />
        <path d="M180 263 C178 240 190 228 212 228 C234 228 246 240 244 263 Z" fill={u('hat')} />
        <path d="M197 234 C207 240 217 240 227 234" stroke="#5e4424" strokeWidth="2" fill="none" />
        <path d="M180 255 C200 260 224 260 244 255 L244 263 C224 268 200 268 180 263 Z" fill={u('leopard')} />
        <path d="M238 236 C243 244 245 252 244 260" stroke={rim} strokeOpacity=".5" strokeWidth="1.6" fill="none" />
        <circle cx="166" cy="254" r="3" fill="#d9b45a" />
        <g transform="translate(212 244)">
          <path d="M-18 -4 C-18 -9 -4 -9 -3 -4 C-3 3 -9 7 -13 6 C-17 5 -18 0 -18 -4 Z" fill="#14202c" stroke="#d9b45a" strokeWidth="1.2" />
          <path d="M3 -4 C4 -9 18 -9 18 -4 C18 0 17 5 13 6 C9 7 3 3 3 -4 Z" fill="#14202c" stroke="#d9b45a" strokeWidth="1.2" />
          <path d="M-3 -5 C-1 -7 1 -7 3 -5" stroke="#d9b45a" strokeWidth="1.2" fill="none" />
          <path d="M-15 -5 L-10 -6 M6 -5 L11 -6" stroke={rim} strokeWidth="1.2" opacity=".8" />
        </g>
        <path d="M150 248 C142 232 146 218 156 210 C156 224 158 236 162 250 Z" fill="#2fb5a5" />
        <path d="M152 246 C147 232 150 222 156 214" stroke="#0e5a52" strokeWidth=".9" fill="none" />
      </g>

      {/* arms and the net launcher */}
      <g transform={`rotate(${aim.toFixed(2)} 205 372) translate(${recoil.toFixed(2)} 0)`}>
        <path d="M178 346 C194 370 222 380 246 378" stroke={KHAKI_D} strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M244 378 C266 376 288 374 306 372" stroke={SKIN_D} strokeWidth="10" strokeLinecap="round" fill="none" />
        {/* stock and body */}
        <path d="M158 364 L234 356 L238 382 L170 392 C160 388 155 374 158 364 Z" fill="#2c313b" stroke="#161a20" strokeWidth="1" />
        <path d="M166 370 L230 364" stroke="#e05a2a" strokeWidth="2.4" />
        <rect x="232" y="350" width="72" height="32" rx="6" fill="#363c48" stroke="#161a20" strokeWidth="1" />
        <rect x="178" y="388" width="52" height="12" rx="6" fill={u('steel')} stroke="#161a20" />
        <circle cx="222" cy="394" r="5" fill="#f4fbff" stroke="#161a20" />
        <path d="M222 394 L225 391" stroke="#d23c3c" strokeWidth="1.2" />
        <path d="M230 394 C238 396 242 392 246 384" stroke="#161a20" strokeWidth="2" fill="none" />
        <path d="M240 356 L296 356" stroke="#5e6878" strokeWidth="1" />
        <circle cx="290" cy="368" r="2.2" fill="#3fd68a" />
        <path d="M244 382 L252 402 L264 402 L258 382 Z" fill="#2a2f38" />
        <path d="M262 382 C262 394 276 394 276 382" stroke="#2a2f38" strokeWidth="2.2" fill="none" />
        <rect x="248" y="340" width="46" height="9" rx="4" fill="#1b1f27" />
        <circle cx="295" cy="344.5" r="4" fill={rim} opacity=".9" />
        {/* barrel, net canister, flared muzzle */}
        <rect x="302" y="356" width="110" height="16" rx="3" fill={u('steel')} />
        <rect x="302" y="356" width="110" height="2" fill="#e1e7ee" />
        <rect x="300" y="372" width="64" height="17" rx="8" fill="#c0392b" stroke="#7a1f16" />
        <path d="M312 372 V389 M352 372 V389" stroke="#ffd23f" strokeWidth="2" />
        <rect x="318" y="376" width="28" height="9" rx="2" fill="#7a1f16" />
        <text x="332" y="383.3" textAnchor="middle" fontFamily="Oxanium, sans-serif" fontWeight="800" fontSize="7" fill="#ffd23f">
          NET
        </text>
        <path d="M408 352 L434 342 L434 390 L408 380 Z" fill="#2a2f38" stroke="#161a20" />
        <ellipse cx="434" cy="366" rx="5" ry="22" fill={u('mesh')} stroke="#161a20" />
        {/* hands */}
        <path d="M298 368 C300 362 314 360 318 366 C320 374 314 380 306 380 C300 380 296 374 298 368 Z" fill="#3a2a1e" />
        <path d="M302 364 C303 359 307 358 309 362 M308 362 C309 357 313 357 315 361" stroke={SKIN_D} strokeWidth="3.4" strokeLinecap="round" fill="none" />
        <path d="M222 338 C208 362 210 388 238 390" stroke={KHAKI} strokeWidth="16" strokeLinecap="round" fill="none" />
        <path d="M236 390 L256 388" stroke={SKIN_D} strokeWidth="10" strokeLinecap="round" />
        <path d="M250 384 C252 378 266 377 270 383 C272 391 266 397 258 397 C252 397 248 391 250 384 Z" fill="#3a2a1e" />
        <path d="M264 380 C266 376 266 373 263 372" stroke={SKIN_D} strokeWidth="3.4" strokeLinecap="round" fill="none" />
        <path d="M254 386 L266 386 M254 391 L265 391" stroke="#24180f" strokeWidth="1" />
        {puff >= 0 && (
          <g opacity={Math.max(0, 1 - puff)}>
            <circle cx={440 + puff * 30} cy="366" r={10 + puff * 30} fill="none" stroke="#e8f6ff" strokeWidth={3 * (1 - puff) + 0.5} />
            <path d={`M440 352 l${18 + puff * 30} -10 M440 380 l${18 + puff * 30} 10 M442 366 l${24 + puff * 36} 0`} stroke="#e8f6ff" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </g>

      {bubble && (
        <g transform="translate(250 196)">
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`${x0} 196 ${w} 360`} width={width} height={(width * 360) / w} role="img" aria-label="Rato the poacher with his net launcher">
      <Poacher mood={mood} aim={aim} noCage={!cage} />
    </svg>
  );
}
