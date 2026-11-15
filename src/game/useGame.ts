import { useEffect, useRef, useSyncExternalStore } from 'react';
import { GameEngine } from './GameEngine';
import { CAPTURE } from './engine';
import { LiveCrashClient } from '../api/liveCrash';
import { SoundFx } from './sound';

export interface GameHandle {
  engine: GameEngine;
  sfx: SoundFx;
}

/** The multiplier plays a rising run as it passes each of these. */
const MILESTONES = [2, 5, 10, 25, 50, 100];

/** Creates one engine for the app, runs its loop while mounted, and wires sounds. */
export function useEngine(): GameHandle {
  const ref = useRef<GameHandle | null>(null);
  if (!ref.current) {
    const engine = new GameEngine(new LiveCrashClient('blue-bird-jungle'));
    const sfx = new SoundFx();
    const on = () => engine.getSnapshot().soundOn;
    engine.events = {
      launch: () => on() && sfx.squawk(),
      crash: () => {
        if (!on()) return;
        sfx.netShot();
        sfx.capture(CAPTURE);
        // a falling line if one of the player's bets went down with Azul
        if (engine.getSnapshot().slots.some((sl) => sl.result && !sl.result.win)) sfx.loseSting();
      },
      cashout: () => {
        if (!on()) return;
        sfx.chime();
        sfx.winSting();
      },
      bet: () => on() && sfx.knock(),
    };
    // the soundtrack follows the round; the last three seconds of betting tick, and big multipliers ring
    let lastSecond = -1;
    let passed = 0;
    engine.subscribe(() => {
      const st = engine.getSnapshot();
      sfx.setPhase(st.phase, st.mult);
      if (!st.soundOn) return;
      if (st.phase === 'waiting') {
        passed = 0;
        const left = Math.ceil((st.waitEnd - st.now) / 1000);
        if (left !== lastSecond) {
          if (left >= 1 && left <= 3 && lastSecond > left) sfx.knock(true);
          lastSecond = left;
        }
      } else if (st.phase === 'flying') {
        const reached = MILESTONES.filter((k) => st.mult >= k).length;
        if (reached > passed) sfx.milestone(reached);
        passed = reached;
      }
    });
    ref.current = { engine, sfx };
  }
  const { engine } = ref.current;
  useEffect(() => {
    engine.start();
    return () => engine.stop();
  }, [engine]);
  return ref.current;
}

export function useGameState(engine: GameEngine) {
  return useSyncExternalStore(engine.subscribe, engine.getSnapshot);
}
