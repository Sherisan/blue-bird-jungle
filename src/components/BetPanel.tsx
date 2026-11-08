import { Chip, Coin, Feather } from '../art/Tokens';
import { chanceFor } from '../game/engine';
import type { GameEngine } from '../game/GameEngine';
import { fmt, fmtX, parseAmount, parseNum } from '../game/format';
import type { GameState } from '../game/types';
import { AutoIcon, CashOutIcon } from './icons';

type Variant = 'gold' | 'win' | 'raised' | 'done';
type Tone = 'idle' | 'gold' | 'live' | 'win' | 'loss' | 'auto';

interface ButtonState {
  label: string;
  sub: string;
  variant: Variant;
  disabled?: boolean;
}

const CHIPS = [10, 50, 100, 500];
const SLOT_COLORS = ['#39d0ff', '#ffd23f'];

export function BetPanel({ index, s, engine, hotkey = null }: { index: number; s: GameState; engine: GameEngine; hotkey?: string | null }) {
  const sl = s.slots[index];
  const a = parseAmount(sl.amountStr);
  const b = sl.bet;
  const ph = s.phase;
  const waitLeft = Math.max(0, (s.waitEnd - s.now) / 1000).toFixed(1);
  const title = `Bet ${index + 1}`;

  let btn: ButtonState;
  if (b && ph === 'flying' && b.cashedAt === null) btn = { label: 'Cash out', sub: fmt(b.amount * s.mult), variant: 'win' };
  else if (b && b.cashedAt !== null && ph === 'flying' && !sl.autoOn)
    btn = sl.queued
      ? { label: 'Cancel queued', sub: `Collected at ${fmtX(b.cashedAt)}`, variant: 'raised' }
      : { label: 'Bet next round', sub: `Collected +${fmt(b.amount * b.cashedAt - b.amount)}`, variant: 'gold' };
  else if (b && b.cashedAt !== null)
    btn = { label: 'Collected', sub: `+${fmt(b.amount * b.cashedAt - b.amount)} at ${fmtX(b.cashedAt)}`, variant: 'done' };
  else if (b && ph === 'waiting')
    btn = { label: b.auto ? 'Cancel auto' : 'Cancel bet', sub: `${fmt(b.amount)} placed · launch in ${waitLeft}s`, variant: 'raised' };
  else if (sl.autoOn) btn = { label: 'Auto bet on', sub: `${fmt(a)} next round`, variant: 'raised', disabled: true };
  else if (ph === 'waiting') btn = { label: 'Place bet', sub: `${fmt(a)} · launch in ${waitLeft}s`, variant: 'gold' };
  else if (sl.queued) btn = { label: 'Cancel queued', sub: `${fmt(a)} · next round`, variant: 'raised' };
  else btn = { label: 'Bet next round', sub: `${fmt(a)} · queue for launch`, variant: 'gold' };

  // status line under the title
  let status = 'Ready';
  let tone: Tone = 'idle';
  if (b && ph === 'flying' && b.cashedAt === null) [status, tone] = ['In flight', 'live'];
  else if (b && b.cashedAt !== null) [status, tone] = [`Collected at ${fmtX(b.cashedAt)}`, 'win'];
  else if (b && ph === 'crashed') [status, tone] = ['Caught', 'loss'];
  else if (b) [status, tone] = ['Bet placed', 'gold'];
  else if (sl.queued) [status, tone] = ['Queued', 'gold'];
  else if (sl.autoOn) [status, tone] = ['Auto bet', 'auto'];

  const live = !!b && ph === 'flying' && b.cashedAt === null;
  const tg = parseNum(sl.targetStr);
  const odds = tg >= 1.01 ? `${chanceFor(tg).toFixed(1)}% · wins ${fmt(a * tg)}` : 'Enter 1.01× or more';

  return (
    <section className={`bp${live ? ' bp--live' : ''}${sl.autoOn ? ' bp--auto' : ''}`} aria-label={title}>
      <header className="bp__head">
        <span className="bp__icon">
          <Feather color={SLOT_COLORS[index]} />
        </span>
        <div className="bp__title">
          <strong>{title}</strong>
          <span className={`bp__status bp__status--${tone}`}>
            <i aria-hidden="true" />
            {status}
          </span>
        </div>
        <div className="bp__toggles">
          <button className="toggle" aria-pressed={sl.autoOn} onClick={() => engine.toggleAuto(index)} title="Bet every round automatically">
            <AutoIcon size={14} /> Auto <i aria-hidden="true" />
          </button>
          <button className="toggle" aria-pressed={sl.cashOn} onClick={() => engine.toggleCashOut(index)} title="Cash out automatically at a multiplier">
            <CashOutIcon size={14} /> Cash-out <i aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="bp__stake">
        <Coin size={26} />
        <div className="bp__field">
          <label htmlFor={`amt-${index}`}>Stake</label>
          <input
            id={`amt-${index}`}
            className="num"
            inputMode="decimal"
            value={sl.amountStr}
            onChange={(ev) => engine.setAmountText(index, ev.target.value)}
            onBlur={() => engine.normalizeAmount(index)}
          />
        </div>
        <button className="step" aria-label={`Halve ${title}`} onClick={() => engine.setAmount(index, engine.amountOf(index) / 2)}>
          ½
        </button>
        <button className="step" aria-label={`Double ${title}`} onClick={() => engine.setAmount(index, engine.amountOf(index) * 2)}>
          2×
        </button>
      </div>

      {sl.cashOn && (
        <div className="bp__target">
          <label htmlFor={`tgt-${index}`}>Cash out at</label>
          <div className="bp__target-field">
            <input
              id={`tgt-${index}`}
              className="num"
              inputMode="decimal"
              value={sl.targetStr}
              onChange={(ev) => engine.setTargetText(index, ev.target.value)}
            />
            <span>×</span>
          </div>
          <span className="bp__odds num">{odds}</span>
        </div>
      )}

      <div className="bp__chips">
        {CHIPS.map((v) => (
          <button key={v} className="chip" aria-label={`Add ${v}`} onClick={() => engine.setAmount(index, engine.amountOf(index) + v)}>
            <Chip value={v} size={40} />
          </button>
        ))}
        <button className="chip-max" aria-label="Bet maximum" onClick={() => engine.setAmount(index, s.balance)}>
          MAX
        </button>
      </div>

      <button className={`big-btn big-btn--${btn.variant}`} onClick={() => engine.mainAction(index)} disabled={btn.disabled}>
        <span className="big-btn__label">{btn.label}</span>
        <span className="big-btn__sub num">{btn.sub}</span>
        {hotkey && !btn.disabled && (
          <kbd className="big-btn__key" aria-hidden="true">
            {hotkey}
          </kbd>
        )}
        <svg className="big-btn__mark" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M24 2v12M24 34v12M2 24h12M34 24h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </button>
    </section>
  );
}
