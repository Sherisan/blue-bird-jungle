import { useCallback, useEffect, useRef, useState } from 'react';
import { BetPanel } from './components/BetPanel';
import { Drawer } from './components/Drawer';
import { Footer, Header } from './components/Header';
import { HowToPlay } from './components/HowToPlay';
import { RailTabs } from './components/Panels';
import { SettingsModal } from './components/SettingsModal';
import { Splash } from './components/Splash';
import { Stage } from './components/Stage';
import { loadSettings, saveSettings, type Settings } from './game/settings';
import { useEngine, useGameState } from './game/useGame';

/** Minutes between reality-check reminders. */
const REALITY_CHECK_MIN = 30;

export default function App() {
  const { engine, sfx } = useEngine();
  const s = useGameState(engine);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [help, setHelp] = useState(false);
  const [menu, setMenu] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [sessionStart] = useState(() => Date.now());

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const toggleSound = useCallback(() => {
    sfx.unlock();
    engine.toggleSound();
  }, [engine, sfx]);

  const start = useCallback(
    (withSound: boolean) => {
      if (withSound) {
        sfx.unlock();
        if (!engine.getSnapshot().soundOn) engine.toggleSound();
      }
      setStarted(true);
    },
    [engine, sfx],
  );

  // sound: volume and the ambient jungle loop follow the settings
  useEffect(() => sfx.setVolume(settings.volume), [sfx, settings.volume]);
  useEffect(() => {
    if (started && s.soundOn && settings.ambient) sfx.startAmbient();
    else sfx.stopAmbient();
  }, [sfx, started, s.soundOn, settings.ambient]);

  // reduced motion switches off decorative animation site-wide
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion);
  }, [settings.reducedMotion]);

  // reality check: a gentle reminder every REALITY_CHECK_MIN minutes
  const nextCheck = useRef(REALITY_CHECK_MIN);
  useEffect(() => {
    const id = window.setInterval(() => {
      const mins = (Date.now() - sessionStart) / 60000;
      if (mins >= nextCheck.current) {
        engine.notify(`You've been playing for ${Math.floor(mins)} minutes. Take a break whenever you like.`);
        nextCheck.current += REALITY_CHECK_MIN;
      }
    }, 5000);
    return () => window.clearInterval(id);
  }, [engine, sessionStart]);

  // keyboard shortcuts: Space and 1 drive Bet 1, 2 drives Bet 2
  const overlayOpen = help || menu || settingsOpen || !started;
  useEffect(() => {
    if (!settings.hotkeys || overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.code === 'Space') {
        if (target.closest('button, a')) return; // let a focused button handle its own Space
        e.preventDefault();
        engine.mainAction(0);
      } else if (e.key === '1') engine.mainAction(0);
      else if (e.key === '2') engine.mainAction(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [engine, settings.hotkeys, overlayOpen]);

  const closeHelp = useCallback(() => setHelp(false), []);
  const closeMenu = useCallback(() => setMenu(false), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const dismissToast = useCallback(() => engine.dismissToast(), [engine]);

  return (
    <div className="app">
      <div className="shell">
        <Header
          balance={s.balance}
          soundOn={s.soundOn}
          sessionMs={Date.now() - sessionStart}
          onMenu={() => setMenu(true)}
          onRules={() => setHelp(true)}
          onSettings={() => setSettingsOpen(true)}
          onToggleSound={toggleSound}
          onRefresh={() => void engine.refreshBalance()}
          currency={s.currency}
        />

        <div className="layout">
          <main className="layout__main">
            <Stage
              s={s}
              onDismissToast={dismissToast}
              onOpenFairness={() => setMenu(true)}
              reducedMotion={settings.reducedMotion}
              steering={settings.steering}
            />
          </main>

          <aside className="layout__side" aria-label="Bets and history">
            <div className="slots">
              {s.slots.map((_, i) => (
                <BetPanel key={i} index={i} s={s} engine={engine} hotkey={settings.hotkeys ? (i === 0 ? 'Space' : '2') : null} />
              ))}
            </div>
            <RailTabs rows={s.rows} history={s.history} stats={s.stats} />
          </aside>
        </div>

        <Footer />
      </div>
      {menu && (
        <Drawer
          s={s}
          engine={engine}
          onClose={closeMenu}
          onRules={() => {
            setMenu(false);
            setHelp(true);
          }}
          onSettings={() => {
            setMenu(false);
            setSettingsOpen(true);
          }}
        />
      )}
      {help && <HowToPlay onClose={closeHelp} />}
      {settingsOpen && (
        <SettingsModal settings={settings} soundOn={s.soundOn} onChange={updateSettings} onToggleSound={toggleSound} onClose={closeSettings} />
      )}
      {!started && <Splash onStart={start} />}
    </div>
  );
}
