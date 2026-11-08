/** Small illustrated assets: casino chips, the credit coin and the game logo. */

export const CHIP_COLORS: Record<number, [string, string]> = {
  10: ['#2f7de1', '#2466bd'],
  50: ['#d23c3c', '#a92b2b'],
  100: ['#1f9a5a', '#157a45'],
  500: ['#6a3fc8', '#5430a3'],
};

export function Chip({ value, size = 40 }: { value: number; size?: number }) {
  const [outer, inner] = CHIP_COLORS[value] ?? ['#555', '#333'];
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r="20" fill={outer} />
      <circle cx="22" cy="22" r="20" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="6 9.7" opacity=".92" />
      <circle cx="22" cy="22" r="13.5" fill={inner} stroke="rgba(255,255,255,.6)" strokeWidth="1.2" strokeDasharray="2 2" />
      <path d="M9 14 A16 16 0 0 1 22 6" stroke="#fff" strokeWidth="1.4" fill="none" opacity=".35" strokeLinecap="round" />
      <text x="22" y="26" textAnchor="middle" fontFamily="Oxanium, sans-serif" fontWeight="800" fontSize="11" fill="#fff">
        {value}
      </text>
    </svg>
  );
}

export function Coin({ size = 24 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill="#d9b45a" stroke="#8a6420" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="7.2" fill="none" stroke="#fff1c4" strokeWidth="1.2" opacity=".8" />
      <path d="M12 7.5l1.3 2.8 3 .3-2.3 2 .7 3-2.7-1.6-2.7 1.6.7-3-2.3-2 3-.3z" fill="#8a6420" />
      <path d="M5.5 9 A7 7 0 0 1 10 4.6" stroke="#fff8de" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}

/** Game mark: the macaw's head inside a leaf-green ring. */
export function Logo({ size = 44 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r="20" fill="#071a2a" stroke="#39d0ff" strokeWidth="1.5" />
      <path d="M6 30 C10 22 14 20 18 22" stroke="#2fb57a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="20" cy="22" r="10" fill="#2f78f0" />
      <path d="M12 16 l-4 -5 l6 2 M15 13 l-1 -6 l4 4" stroke="#2f78f0" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="23" cy="20" r="3.6" fill="#ffd23f" />
      <circle cx="23.4" cy="20" r="2" fill="#0a0a0a" />
      <path d="M28 17 C35 15 39 21 37 29 C36 31 34 31 33 30 C34 25 32 22 28 22 Z" fill="#20242c" />
      <path d="M27 24 C29 27 32 28 34 27" stroke="#ffd23f" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Feather mark used on the bet panels. */
export function Feather({ color = '#39d0ff', size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3 C10 4 5 10 5 19 C12 19 18 13 19 3 Z" fill={color} />
      <path d="M5 19 L15 8 M8 16 L8 12 M10.5 13.5 L10.5 10 M8 16 L12 16 M10.5 13.5 L14 13.5" stroke="#06121c" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
