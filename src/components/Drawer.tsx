import { useEffect, useRef } from 'react';
import { Logo } from '../art/Tokens';
import type { GameEngine } from '../game/GameEngine';
import type { GameState } from '../game/types';
import { BookIcon, CloseIcon, GearIcon } from './icons';
import { AutoPlayPanel, FairnessPanel } from './Panels';

interface Props {
  s: GameState;
  engine: GameEngine;
  onClose: () => void;
  onRules: () => void;
  onSettings: () => void;
}

/** The ☰ menu: auto-play limits, provably fair seeds, and links to rules and settings. */
export function Drawer({ s, engine, onClose, onRules, onSettings }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="drawer-wrap" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Game menu" onClick={(e) => e.stopPropagation()}>
        <div className="drawer__head">
          <div className="brand">
            <Logo size={36} />
            <span className="brand__name brand__name--sm">Game menu</span>
          </div>
          <button ref={closeRef} className="icon-btn" aria-label="Close menu" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="drawer__links">
          <button className="btn-ghost" onClick={onRules}>
            <BookIcon size={18} /> Rules and help
          </button>
          <button className="btn-ghost" onClick={onSettings}>
            <GearIcon size={18} /> Settings
          </button>
        </div>
        <AutoPlayPanel s={s} engine={engine} />
        <FairnessPanel s={s} />
      </aside>
    </div>
  );
}
