import { useEffect, useState } from 'react';
import { Coin, Logo } from '../art/Tokens';
import { fmt } from '../game/format';
import { BookIcon, ClockIcon, ExpandIcon, GearIcon, MenuIcon, MuteIcon, ShrinkIcon, SoundIcon } from './icons';

interface Props {
  balance: number;
  soundOn: boolean;
  sessionMs: number;
  onMenu: () => void;
  onRules: () => void;
  onSettings: () => void;
  onToggleSound: () => void;
  onRefill: () => void;
}

function clock(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function useFullscreen() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  const toggle = () => {
    const req = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
    void req?.catch(() => undefined);
  };
  const supported = typeof document !== 'undefined' && !!document.fullscreenEnabled;
  return { on, toggle, supported };
}

export function Header({ balance, soundOn, sessionMs, onMenu, onRules, onSettings, onToggleSound, onRefill }: Props) {
  const fs = useFullscreen();
  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="icon-btn icon-btn--accent" aria-label="Open game menu" onClick={onMenu}>
          <MenuIcon />
        </button>
        <div className="brand">
          <Logo size={44} />
          <div className="brand__text">
            <span className="brand__name">Blue Bird Jungle</span>
            <span className="brand__sub">Crash game · RTP 99% · up to 10 000×</span>
          </div>
        </div>
      </div>

      <div className="topbar__right">
        <span className="session" title="Time played this session">
          <ClockIcon size={16} />
          <span className="num">{clock(sessionMs)}</span>
        </span>
        <div className="balance">
          <Coin size={28} />
          <div className="balance__text">
            <span className="balance__value num">{fmt(balance)}</span>
            <span className="balance__unit">
              <span className="demo-badge">Demo</span> credits
            </span>
          </div>
          {balance < 100 && (
            <button className="btn-ghost btn-ghost--sm" onClick={onRefill}>
              Refill
            </button>
          )}
        </div>
        <div className="toolbar" role="toolbar" aria-label="Game controls">
          <button className="icon-btn" aria-label="Rules and help" title="Rules and help" onClick={onRules}>
            <BookIcon />
          </button>
          <button className="icon-btn" aria-label="Settings" title="Settings" onClick={onSettings}>
            <GearIcon />
          </button>
          <button
            className={`icon-btn${soundOn ? ' is-on' : ''}`}
            aria-label={soundOn ? 'Mute sound' : 'Turn sound on'}
            title={soundOn ? 'Mute sound' : 'Turn sound on'}
            aria-pressed={soundOn}
            onClick={onToggleSound}
          >
            {soundOn ? <SoundIcon /> : <MuteIcon />}
          </button>
          {fs.supported && (
            <button className="icon-btn fs-btn" aria-label={fs.on ? 'Exit full screen' : 'Full screen'} title={fs.on ? 'Exit full screen' : 'Full screen'} onClick={fs.toggle}>
              {fs.on ? <ShrinkIcon /> : <ExpandIcon />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <span>Demo credits only · no cash value · 18+ only · Provably fair</span>
      <span>
        Play responsibly. South African Responsible Gambling helpline: <span className="footer__tel">0800 006 008</span>
      </span>
    </footer>
  );
}
