import { useEffect, useRef } from 'react';
import { KeyArt } from '../art/KeyArt';
import { Logo } from '../art/Tokens';

/**
 * Title screen. Its Play button is also the click browsers need before they
 * allow sound, so "Play with sound" unlocks audio in the same gesture.
 */
export function Splash({ onStart }: { onStart: (withSound: boolean) => void }) {
  const playRef = useRef<HTMLButtonElement>(null);
  useEffect(() => playRef.current?.focus(), []);

  return (
    <div className="splash" role="dialog" aria-modal="true" aria-labelledby="splash-title">
      <div className="splash__art" aria-hidden="true">
        <KeyArt cover />
      </div>
      <div className="splash__shade" aria-hidden="true" />
      <div className="splash__card">
        <Logo size={84} />
        <span className="kicker">Crash world · Blue jungle</span>
        <h1 id="splash-title" className="splash__title">
          Blue Bird <span className="splash__title-sub">Jungle</span>
        </h1>
        <p className="splash__tag">Azul takes off, the multiplier climbs. Cash out before the poacher&rsquo;s net lands.</p>
        <div className="splash__facts">
          <span className="tag">RTP 99%</span>
          <span className="tag">Up to 10 000×</span>
          <span className="tag">Provably fair</span>
          <span className="tag">2 bets per round</span>
        </div>
        <button ref={playRef} className="big-btn big-btn--gold splash__play" onClick={() => onStart(true)}>
          <span className="big-btn__label">Play with sound</span>
          <span className="big-btn__sub">10 000,00 demo credits</span>
        </button>
        <button className="btn-ghost splash__quiet" onClick={() => onStart(false)}>
          Play muted
        </button>
        <p className="splash__legal">Demo credits only · no cash value · 18+ only · Play responsibly</p>
      </div>
    </div>
  );
}
