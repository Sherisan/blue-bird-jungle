import { useEffect, useRef, useState } from 'react';
import { BirdArt } from '../art/Bird';
import { PoacherArt } from '../art/Poacher';
import { HOUSE_EDGE, MAX_MULT, WAIT_MS } from '../game/engine';
import { CloseIcon } from './icons';

type Tab = 'play' | 'rules' | 'fair' | 'keys';

const TABS: { id: Tab; label: string }[] = [
  { id: 'play', label: 'How to play' },
  { id: 'rules', label: 'Rules' },
  { id: 'fair', label: 'Fair play' },
  { id: 'keys', label: 'Shortcuts' },
];

const STEPS = [
  { title: 'Place a bet', text: 'Set a stake in Bet 1, Bet 2 or both while Azul sits on the branch. Chips add to the stake.' },
  { title: 'Watch it climb', text: 'The multiplier rises while Azul flies. Your stake is worth stake × multiplier.' },
  { title: 'Cash out in time', text: 'Hit Cash out before Rato fires his net. If the net lands first, that bet is lost.' },
];

/** The help window: how to play, the full rules, fairness and keyboard shortcuts. */
export function HowToPlay({ onClose, initialTab = 'play' }: { onClose: () => void; initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rtp = ((1 - HOUSE_EDGE) * 100).toFixed(0);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={onClose}>
      <div className="modal__card" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2 id="help-title">Blue Bird · Help</h2>
          <button ref={closeRef} className="icon-btn" aria-label="Close help" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="tabs" role="tablist" aria-label="Help sections">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tabs__btn${tab === t.id ? ' is-on' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'play' && (
          <div className="help-body" role="tabpanel">
            <div className="modal__art" aria-hidden="true">
              <PoacherArt mood="aim" width={230} cage={false} />
              <BirdArt state="fly" width={150} />
            </div>
            <ol className="steps">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className="steps__n">{i + 1}</span>
                  <div>
                    <strong>{s.title}</strong>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="muted small">
              <strong>Cash-out</strong> collects for you at a multiplier you set. <strong>Auto</strong> repeats a bet every round until a limit in
              the ☰ menu is reached. During a flight you can drag Azul or use the arrow keys to steer, just for fun.
            </p>
          </div>
        )}

        {tab === 'rules' && (
          <div className="help-body rules" role="tabpanel">
            <h3>The round</h3>
            <ul>
              <li>Betting is open for {WAIT_MS / 1000} seconds while Azul is perched. Bets placed during a flight are queued for the next round.</li>
              <li>When Azul takes off, the multiplier starts at 1.00× and rises. It stops when the poacher&rsquo;s net lands: that value is the round&rsquo;s crash point.</li>
              <li>A bet that is cashed out before the crash point pays stake × the multiplier at the moment of cash-out. A bet still open at the crash point is lost.</li>
              <li>The crash point can be 1.00×, in which case every bet in that round is lost.</li>
            </ul>
            <h3>Bets</h3>
            <ul>
              <li>Two independent bets per round (Bet 1 and Bet 2), each with its own stake, auto bet and auto cash-out.</li>
              <li>Minimum stake 0,10. The maximum stake is your current balance.</li>
              <li>Auto cash-out pays at exactly the multiplier you set, as long as the round reaches it.</li>
              <li>Auto play stops when its rounds run out, a profit or loss limit is reached, or the balance is too low.</li>
            </ul>
            <h3>Payout</h3>
            <ul>
              <li>Return to player: {rtp}%. The house edge of {(HOUSE_EDGE * 100).toFixed(0)}% is built into the crash formula.</li>
              <li>Maximum multiplier: {MAX_MULT.toLocaleString('en-ZA')}×.</li>
              <li>Steering Azul is cosmetic and never changes the crash point or any payout.</li>
              <li>A malfunction voids all pays and plays.</li>
            </ul>
            <h3>Demo</h3>
            <ul>
              <li>This build plays with demo credits only. They have no cash value and can be refilled at any time.</li>
            </ul>
          </div>
        )}

        {tab === 'fair' && (
          <div className="help-body rules" role="tabpanel">
            <h3>Provably fair</h3>
            <p>Every crash point is decided before the round starts and can be checked afterwards.</p>
            <ol className="plain-steps">
              <li>Before betting closes, the game shows the SHA-256 hash of a secret server seed.</li>
              <li>The result is SHA-256(server seed : client seed : round number). Its first 52 bits give a number r between 0 and 1.</li>
              <li>Crash point = max(1, 0.99 ÷ (1 − r)), rounded down to two decimals and capped at {MAX_MULT.toLocaleString('en-ZA')}×.</li>
              <li>After the round the server seed is revealed. Hash it yourself to check it matches, or press <strong>Verify</strong> in the ☰ menu.</li>
            </ol>
            <p className="muted small">Because the result is fixed before take-off, nothing during the flight (including steering Azul) can change it.</p>
          </div>
        )}

        {tab === 'keys' && (
          <div className="help-body" role="tabpanel">
            <table className="keys">
              <tbody>
                <tr>
                  <td>
                    <kbd>Space</kbd>
                  </td>
                  <td>Bet 1: place, cancel or cash out</td>
                </tr>
                <tr>
                  <td>
                    <kbd>1</kbd> / <kbd>2</kbd>
                  </td>
                  <td>Bet 1 / Bet 2: place, cancel or cash out</td>
                </tr>
                <tr>
                  <td>
                    <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> or <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>
                  </td>
                  <td>Steer Azul (click the game area first)</td>
                </tr>
                <tr>
                  <td>
                    <kbd>Esc</kbd>
                  </td>
                  <td>Close menus and windows</td>
                </tr>
              </tbody>
            </table>
            <p className="muted small">Shortcuts can be switched off in Settings. They pause while you type in a field.</p>
          </div>
        )}

        <button className="big-btn big-btn--gold modal__cta" onClick={onClose}>
          <span className="big-btn__label">Back to the game</span>
        </button>
      </div>
    </div>
  );
}
