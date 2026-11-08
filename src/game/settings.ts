/** Player preferences, remembered in this browser only. */
export interface Settings {
  /** Master volume, 0..1. Sound itself is switched by the engine's soundOn flag. */
  volume: number;
  /** Waterfall, crickets and distant bird calls under the game sounds. */
  ambient: boolean;
  /** Turns off screen shake, flashes and decorative animation. */
  reducedMotion: boolean;
  /** Space / 1 / 2 trigger the bet buttons. */
  hotkeys: boolean;
  /** Drag or arrow keys steer Azul during a flight. */
  steering: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  volume: 0.8,
  ambient: true,
  reducedMotion: false,
  hotkeys: true,
  steering: true,
};

const KEY = 'blue-bird:settings';

export function loadSettings(): Settings {
  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const base = { ...DEFAULT_SETTINGS, reducedMotion: !!prefersReduced };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...base, ...(JSON.parse(raw) as Partial<Settings>) } : base;
  } catch {
    return base;
  }
}

export function saveSettings(s: Settings) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // storage blocked (private window, embedded preview): settings last for this visit only
  }
}
