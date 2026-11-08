import { useEffect, useRef } from 'react';
import type { Settings } from '../game/settings';
import { CloseIcon } from './icons';

interface Props {
  settings: Settings;
  soundOn: boolean;
  onChange: (patch: Partial<Settings>) => void;
  onToggleSound: () => void;
  onClose: () => void;
}

function Row({ id, title, text, checked, onChange }: { id: string; title: string; text: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="setting" htmlFor={id}>
      <span className="setting__text">
        <strong>{title}</strong>
        <span>{text}</span>
      </span>
      <span className="switch">
        <input id={id} type="checkbox" checked={checked} onChange={onChange} />
        <span className="switch__track" aria-hidden="true">
          <span className="switch__knob" />
        </span>
      </span>
    </label>
  );
}

export function SettingsModal({ settings, soundOn, onChange, onToggleSound, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={onClose}>
      <div className="modal__card modal__card--narrow" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2 id="settings-title">Settings</h2>
          <button ref={closeRef} className="icon-btn" aria-label="Close settings" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <section className="settings-group" aria-label="Sound">
          <h3 className="label">Sound</h3>
          <Row id="set-sound" title="Sound effects" text="Squawk on take-off, the net shot and the cash-out chime." checked={soundOn} onChange={onToggleSound} />
          <div className="setting setting--slider">
            <label htmlFor="set-volume" className="setting__text">
              <strong>Volume</strong>
              <span className="num">{Math.round(settings.volume * 100)}%</span>
            </label>
            <input
              id="set-volume"
              className="slider"
              type="range"
              min={0}
              max={100}
              step={5}
              value={Math.round(settings.volume * 100)}
              onChange={(e) => onChange({ volume: Number(e.target.value) / 100 })}
              disabled={!soundOn}
            />
          </div>
          <Row
            id="set-ambient"
            title="Jungle ambience"
            text="Waterfall, crickets and distant bird calls while you play."
            checked={settings.ambient}
            onChange={() => onChange({ ambient: !settings.ambient })}
          />
        </section>

        <section className="settings-group" aria-label="Gameplay">
          <h3 className="label">Gameplay</h3>
          <Row
            id="set-hotkeys"
            title="Keyboard shortcuts"
            text="Space: Bet 1 · 1 and 2: Bet 1 and Bet 2 (bet, cancel or cash out)."
            checked={settings.hotkeys}
            onChange={() => onChange({ hotkeys: !settings.hotkeys })}
          />
          <Row
            id="set-steering"
            title="Steer Azul"
            text="Drag or use the arrow keys during a flight. For fun only; it never changes the result."
            checked={settings.steering}
            onChange={() => onChange({ steering: !settings.steering })}
          />
        </section>

        <section className="settings-group" aria-label="Display">
          <h3 className="label">Display</h3>
          <Row
            id="set-motion"
            title="Reduce motion"
            text="No screen shake or flashes, and calmer background animation."
            checked={settings.reducedMotion}
            onChange={() => onChange({ reducedMotion: !settings.reducedMotion })}
          />
        </section>
      </div>
    </div>
  );
}
