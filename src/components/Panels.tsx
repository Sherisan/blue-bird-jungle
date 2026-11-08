import { useState } from 'react';
import { Feather } from '../art/Tokens';
import type { GameEngine } from '../game/GameEngine';
import { verifyRound } from '../game/fairness';
import { fmt, fmtSigned, fmtX } from '../game/format';
import type { BetRow, GameState, RoundsOption, Stats } from '../game/types';
import { AutoIcon, ShieldIcon } from './icons';

export function SessionStats({ stats }: { stats: Stats }) {
  const tone = stats.profit > 0 ? 'text-win' : stats.profit < 0 ? 'text-loss' : '';
  return (
    <section className="stats" aria-label="Session">
      <div className="stat">
        <span className="label">Rounds played</span>
        <span className="stat__value num">{stats.rounds}</span>
      </div>
      <div className="stat">
        <span className="label">Wagered</span>
        <span className="stat__value num">{fmt(stats.wagered)}</span>
      </div>
      <div className="stat">
        <span className="label">Profit</span>
        <span className={`stat__value num ${tone}`}>{fmtSigned(stats.profit)}</span>
      </div>
      <div className="stat">
        <span className="label">Best cash-out</span>
        <span className="stat__value num text-gold">{stats.best ? fmtX(stats.best) : '—'}</span>
      </div>
    </section>
  );
}

const ROUND_OPTIONS: RoundsOption[] = [10, 25, 50, 100, 'inf'];

export function AutoPlayPanel({ s, engine }: { s: GameState; engine: GameEngine }) {
  const L = s.lim;
  const status = L.active ? `${L.rounds === 'inf' ? '∞' : L.left} left · net ${L.net >= 0 ? '+' : ''}${fmt(L.net)}` : 'Off';
  return (
    <section className="panel" aria-label="Auto play">
      <div className="panel__head">
        <AutoIcon size={18} className="text-gold" />
        <h2>Auto play limits</h2>
        <span className={`panel__meta num ${L.active ? 'text-win' : ''}`}>{status}</span>
      </div>
      <div className="stack-6">
        <span className="label" id="rounds-label">
          Rounds
        </span>
        <div className="segmented" role="group" aria-labelledby="rounds-label">
          {ROUND_OPTIONS.map((r) => (
            <button
              key={String(r)}
              className={`segmented__btn${L.rounds === r ? ' is-on' : ''}`}
              aria-pressed={L.rounds === r}
              disabled={L.active}
              onClick={() => engine.setRounds(r)}
            >
              {r === 'inf' ? '∞' : r}
            </button>
          ))}
        </div>
      </div>
      <div className="grid-2">
        <div className="stack-6">
          <label className="label" htmlFor="stop-profit">
            Stop on profit
          </label>
          <input id="stop-profit" className="input num" inputMode="decimal" placeholder="Off" value={L.profitStr} onChange={(e) => engine.setLimit('profitStr', e.target.value)} />
        </div>
        <div className="stack-6">
          <label className="label" htmlFor="stop-loss">
            Stop on loss
          </label>
          <input id="stop-loss" className="input num" inputMode="decimal" placeholder="Off" value={L.lossStr} onChange={(e) => engine.setLimit('lossStr', e.target.value)} />
        </div>
      </div>
      <p className="muted small">
        Turn on <strong>Auto</strong> in a bet panel to start. Both panels share these limits.
      </p>
      {L.active && (
        <button className="btn-stop" onClick={() => engine.stopAuto()}>
          Stop auto play
        </button>
      )}
    </section>
  );
}

type RailTab = 'mine' | 'top' | 'stats';

/** The bottom of the right-hand column: your bets, your best wins, and round stats. */
export function RailTabs({ rows, history, stats }: { rows: BetRow[]; history: number[]; stats: Stats }) {
  const [tab, setTab] = useState<RailTab>('mine');
  const top = rows
    .filter((r) => r.win)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);
  return (
    <section className="panel panel--flush rail__bets" aria-label="Bets and stats">
      <div className="tabs tabs--rail" role="tablist" aria-label="Bets and stats">
        {(
          [
            ['mine', 'My bets'],
            ['top', 'Top wins'],
            ['stats', 'Stats'],
          ] as [RailTab, string][]
        ).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={`tabs__btn${tab === id ? ' is-on' : ''}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="rail__body" role="tabpanel">
        {tab === 'mine' && <BetRows rows={rows} empty="No bets yet. Place one and watch Azul fly." />}
        {tab === 'top' && <BetRows rows={top} empty="Your best cash-outs this session will show here." />}
        {tab === 'stats' && <RoundStats history={history} stats={stats} />}
      </div>
    </section>
  );
}

function BetRows({ rows, empty }: { rows: BetRow[]; empty: string }) {
  if (rows.length === 0)
    return (
      <div className="empty-state">
        <span className="empty-state__ring">
          <Feather size={26} />
        </span>
        <p>{empty}</p>
      </div>
    );
  return (
    <table className="bet-table">
      <thead>
        <tr>
          <th scope="col">Round</th>
          <th scope="col">Stake</th>
          <th scope="col">Result</th>
          <th scope="col" className="num-col">
            Profit
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="num muted">
              #{r.round}
              <span className="bet-table__slot">B{r.slot}</span>
            </td>
            <td className="num">{fmt(r.bet)}</td>
            <td>
              <span className={`mini-pill num ${r.win ? 'mini-pill--win' : 'mini-pill--loss'}`}>
                {r.win ? 'Out' : 'Caught'} {fmtX(r.at)}
              </span>
            </td>
            <td className={`num num-col ${r.win ? 'text-win' : 'text-loss'}`}>{fmtSigned(r.profit)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RoundStats({ history, stats }: { history: number[]; stats: Stats }) {
  const items = history.slice(0, 30).reverse();
  const max = Math.log(Math.max(10, ...items));
  const avg = items.length ? items.reduce((a, b) => a + b, 0) / items.length : 0;
  const under2 = items.filter((h) => h < 2).length;
  return (
    <div className="stats-tab">
      <SessionStats stats={stats} />
      <div className="stack-6">
        <div className="panel__head">
          <span className="label">Last {items.length || 30} crash points</span>
          <span className="panel__meta num">{items.length ? `${under2} under 2×` : 'No rounds yet'}</span>
        </div>
        <div className="bars" role="img" aria-label={`Crash points of the last ${items.length} rounds`}>
          {items.length === 0 && <span className="muted small">Bars appear as rounds finish.</span>}
          {items.map((h, i) => (
            <span
              key={i}
              className={`bars__bar ${h < 2 ? 'is-low' : h >= 10 ? 'is-high' : 'is-mid'}`}
              style={{ height: `${Math.max(6, (Math.log(Math.max(1.01, h)) / max) * 100)}%` }}
              title={fmtX(h)}
            />
          ))}
        </div>
        {items.length > 0 && <p className="muted small num">Average {fmtX(avg)} · highest {fmtX(Math.max(...items))}</p>}
      </div>
    </div>
  );
}

export function FairnessPanel({ s }: { s: GameState }) {
  const [check, setCheck] = useState<{ nonce: number; text: string; ok: boolean } | null>(null);
  const rev = s.revealed;

  const verify = async () => {
    if (!rev) return;
    try {
      const crash = await verifyRound(rev.serverSeed, s.clientSeed, rev.nonce);
      const ok = crash === rev.crash;
      setCheck({ nonce: rev.nonce, ok, text: ok ? `Verified: seeds give ${fmtX(crash)}` : `Mismatch: seeds give ${fmtX(crash)}` });
    } catch {
      setCheck({ nonce: rev.nonce, ok: false, text: 'Verification needs https or localhost.' });
    }
  };

  return (
    <section className="panel" aria-label="Provably fair">
      <div className="panel__head">
        <ShieldIcon size={18} className="text-gold" />
        <h2>Provably fair</h2>
        <span className="panel__meta">Round #{s.nonce}</span>
      </div>
      <div className="stack-4">
        <span className="label">Server seed hash</span>
        <code className="seed">{s.nextHash || 'Generating…'}</code>
      </div>
      <div className="stack-4">
        <span className="label">Client seed</span>
        <code className="seed">{s.clientSeed}</code>
      </div>
      {rev && (
        <div className="stack-4">
          <span className="label">
            Revealed · #{rev.nonce} · {fmtX(rev.crash)}
          </span>
          <code className="seed">{rev.serverSeed}</code>
          <div className="verify">
            <button className="btn-ghost" onClick={verify}>
              Verify round #{rev.nonce}
            </button>
            {check && check.nonce === rev.nonce && (
              <span className={`small ${check.ok ? 'text-win' : 'text-loss'}`} role="status">
                {check.text}
              </span>
            )}
          </div>
        </div>
      )}
      <p className="muted small">Result = SHA-256(server seed : client seed : nonce). Crash point = max(1, 0.99 ÷ (1 − r)). 1% house edge.</p>
    </section>
  );
}
