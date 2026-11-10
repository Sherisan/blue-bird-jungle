# Blue Bird Jungle: crash game front end

A crash-style betting game built in **React 18 + TypeScript + Vite**, reskinned from Duck Season into a moonlit **blue jungle**.

**Azul**, a cobalt-blue macaw, takes off from a branch over a jungle lagoon. While Azul flies, the multiplier climbs. **Rato the poacher** tracks the bird with a net launcher; cash out before he fires, because when his net lands the round is over.

Everything is drawn as SVG in React components: the macaw, the poacher and his brass trophy cage, the waterfall, the giant Amazon water lilies, glowing flowers and mushrooms, a toucan, hummingbirds, blue morpho butterflies and a passing parrot flock. There are no image files to manage, and every piece scales cleanly. Sounds (a macaw squawk, the net launcher, the cash-out chime) are synthesised with Web Audio.

> Rounds come from the **GameEngineAPI** (`./GameEngineAPI`, its own git repo). The server draws every crash point, takes the bets, pays cash-outs and keeps the balance. See "Game server" below.

## Play it right now

`release/blue-bird-jungle.html` is a finished, minified build of the whole game in one file. Double-click it to play in your browser, no install needed (an internet connection loads the fonts). To publish it, upload that one file to any web host.

## Open it in Visual Studio Code

1. Get the code: clone this repository, or on GitHub click **Code → Download ZIP** and unzip it. You get a folder called `blue-bird-jungle`.
2. In VS Code: **File → Open Folder…** and choose that `blue-bird-jungle` folder.
3. Install [Node.js](https://nodejs.org) 18 or newer if you don't have it.
4. Open the terminal (**Terminal → New Terminal**) and run `npm install` once.
5. Run `npm run dev`. The game opens at http://localhost:5173 and reloads as you save files.

The folder comes set up for VS Code:

- `.vscode/tasks.json`: **Terminal → Run Task…** has *Blue Bird Jungle: install*, *dev server*, *production build*, *type-check* and *export SVG assets*. The dev server is the default build task (Ctrl/Cmd+Shift+B).
- `.vscode/launch.json`: press **F5** to start the dev server and open the game in Chrome or Edge with breakpoints in your TypeScript.
- `.vscode/settings.json`: format on save with Prettier, and the project's own TypeScript.
- `.vscode/extensions.json`: VS Code offers to install Prettier.
- `design/DESIGN.md`: the design guide (world, characters, colours, type, components, and which file draws what). `design/screens/` has screenshots of the current build.

## Quick start

You need Node.js 18 or newer.

```bash
npm install
npm run dev          # opens http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-checks, then builds to `dist/` (upload that folder to any static host) |
| `npm run preview` | Serves the production build |
| `npm run typecheck` | TypeScript only |
| `npm run export:assets` | Re-renders the art components to SVG files in `public/assets/` |

## Professional features

- **Top bar**: brand lockup, session timer, balance with a Demo badge, and a toolbar for Rules, Settings, Sound and Full screen. No placeholder buttons: every control works.
- **Settings** (gear icon, remembered in this browser): sound effects, volume, jungle ambience (waterfall, crickets, distant bird calls), keyboard shortcuts, steering on/off, and reduce motion.
- **Keyboard shortcuts**: `Space` or `1` = Bet 1, `2` = Bet 2 (place, cancel or cash out). The key is shown on each bet button. Shortcuts pause while you type in a field.
- **Help window** with tabs: How to play, full Rules (round, bets, payout, demo), Fair play (the provably-fair method step by step), and Shortcuts.
- **Stage HUD**: a countdown ring while bets are open, a "Caught at" crash readout, a flight graph with an area fill and axis labels, an "In play → value" stake bar, results stacked bottom-left, HUD corner marks, and a Round button that opens the fairness seeds.
- **Right-hand column tabs**: *My bets* (a table of your bets), *Top wins* (your best cash-outs this session) and *Stats* (session totals plus a chart of the last 30 crash points).
- **Responsible play**: a session timer, and a reminder every 30 minutes of play (`REALITY_CHECK_MIN` in `App.tsx`).

## What's in this build

- **Title screen** with the full key art: *Play with sound* (also unlocks browser audio) or *Play muted*.
- **Multiplier colour tiers**: white below 2×, glowing cyan from 2×, gold from 5×, and a shimmering rainbow from 10×. It bumps every time it passes a milestone (2×, 3×, 5×, 10×, 25×, 50×, 100× and up).
- **"CAUGHT!" stamp** that slams in over the net at the crash; win bursts throw blue and gold feathers along with the coins.
- **Scene depth**: a hazy far tree line with palms and kapok trees, moonbeams, a bromeliad and hanging moss on Azul's tree, soft-focus foreground leaves, drifting pollen.
- **Rato** is drawn at 52% of his art size on wide screens and 90% on phones (`POACHER_SCALE_WIDE` and `POACHER_SCALE` in `engine.ts`), in a long leather coat with aviator sunglasses on his hat, binoculars, gloved hands and muddy boots. His net cannon has an air tank, pressure gauge and the winch that reels a catch in.
- **Azul, redrawn** (drawn at 90% on wide screens and 110% on phones, in `Stage.tsx`): tapered feathers throughout, a fanned wing with spread primaries, a graduated tail, swept-back crown feathers, a glossy eye in a gold ring, and a beak that opens in flight. A glowing aura and sparkle trail in flight, and a reflection in the lagoon.
- **Steer Azul**: during a flight, drag Azul (mouse or touch) or use the arrow keys / WASD while the stage has focus. Azul eases toward your pointer, turns to face the way it flies and tilts into dives; let go and it drifts back to its own path. The poacher's crosshair chases Azul, closing faster as the multiplier climbs (`trackRate` in `engine.ts`), his gun follows the crosshair, and the net flies to wherever Azul is when the round ends. Steering and the chase are cosmetic: the catch point comes from the round's seeds before take-off, so it can't change the result or the 99% RTP. The code is in `components/useSteering.ts` (`STEER_BOX` sets where Azul may fly).

## Layout

- **Top bar**: ☰ menu, logo, title, RTP / max / volatility tags, balance, help, sound, previous / next game.
- **Stage** (left, fills the screen height): the jungle scene, history pills, round number, the big multiplier with countdown, results, flight-curve chart, altitude gauge and toasts.
- **Right-hand column**: **Bet 1** and **Bet 2**, then **Your last bets**. Each bet panel has:
  - a status line (Ready, Bet placed, In flight, Collected, Caught, Queued, Auto bet)
  - **Auto** and **Cash-out** toggles
  - the stake field with ½ and 2×
  - the 10 / 50 / 100 / 500 chips and MAX
  - the big action button
- **☰ menu drawer**: session stats, auto-play limits (rounds, stop on profit or loss), the last-30-rounds chart, and the provably-fair seeds with a *Verify* button.
- Below 1180 px the column moves under the stage, with the bets side by side; below 760 px everything stacks.

## What happens in a round

| Moment | Azul | Rato |
| --- | --- | --- |
| Betting (5 s) | Perched on the branch, blinking and tilting its head, reflected in the lagoon | Relaxed, cigar smoking |
| Flight | Flaps up over the waterfall with a glowing aura and a sparkle trail; a red crosshair chases it, faster and faster; clouds speed up as the multiplier climbs | Squints and swings the net launcher after the crosshair |
| You cash out | Keeps flying | Grits his teeth: **"Come back here!"** |
| Crash | The net shell flies on its line, opens and wraps the bird; feathers burst and the screen shakes; Azul is winched in, put on the swing in the cage, the door slams and the padlock snaps (`CAPTURE` in `engine.ts` sets the beats) | Cranks the winch: **"Gotcha!"**, then punches the air, gold tooth showing: **"Locked up!"** |

## Project structure

```
src/
  main.tsx, App.tsx        Entry and page layout (stage + right-hand column + drawer)
  api/
    liveCrash.ts           SignalR client for the GameEngineAPI /livecrashhub
  game/
    GameEngine.ts          Game loop and player actions (framework-free)
    engine.ts              Maths: multiplier curve, crash formula, bird flight path, aim
    useGame.ts             React hooks (useSyncExternalStore) + sound wiring
    capture.ts             The catch as a function of time: net, reel, cage door, padlock
    sound.ts               Web Audio: squawk, netShot, capture, chime
    settings.ts            Player settings, saved in this browser
    format.ts, types.ts
  art/
    Bird.tsx               Azul: <Bird state="perch|fly|caught|caged"/>, <Net/>, <NetShell/>, <BirdArt/>
    Poacher.tsx            Rato: <Poacher mood aim recoil puff bubble reel/>, <PoacherArt/>, MUZZLE_OFFSET
    Cage.tsx               The trophy cage: <Cage part door lock swing/>
    Scene.tsx              Jungle layers: SceneSky, SceneFauna, SceneJungle, SceneBank, SceneNearShore, SceneForeground + plant kit
    Fauna.tsx              Toucan, Hummingbird, Morpho, ParrotFlock
    Clouds.tsx             Scrolling moonlit clouds
    KeyArt.tsx             Full-scene still for lobby cards and banners
    Tokens.tsx             Chips, coin, logo, feather
  components/
    Stage.tsx              Composes the scene, the net shot and all stage overlays
    useSteering.ts         Drag / arrow-key steering of Azul (cosmetic)
    BetPanel.tsx           One bet panel (right-hand column)
    Panels.tsx             Rail tabs (My bets, Top wins, Stats), auto-play limits, fairness
    Drawer.tsx             ☰ menu (auto-play limits, provably fair, links)
    SettingsModal.tsx      Settings window
    Splash.tsx             Title screen
    Header.tsx             Top bar and footer
    HowToPlay.tsx          Help window: How to play, Rules, Fair play, Shortcuts
    icons.tsx
  styles/
    tokens.css             Colours, type, radii, shadows
    global.css             Reset, utilities, all keyframes
    app.css                Layout, top bar, bet panels, drawer, modal
    stage.css              Stage overlays and SVG animation hooks
release/blue-bird-jungle.html    Ready-to-play single-file build
design/                   DESIGN.md (design guide) and screens/ (screenshots)
.vscode/                  Tasks, debug launch, editor settings, extension tips
public/assets/             Exported SVGs: poacher-*.svg, bird-*.svg, chip-*.svg, coin, feather, logo, key-art
scripts/export-assets.tsx  Builds public/assets from the React art
```

## Customising

- **Colours**: `src/styles/tokens.css`. `--game` is the cyan accent and the surfaces are deep jungle blue. Gold stays the only action colour; green only means money won and red only means money lost.
- **Layout**: the same layout as Duck Season. In `app.css`, `.layout__main` (the stage, `flex: 999 1 640px`) and `.layout__side` (the bets column, `flex: 1 1 300px`) sit side by side and the column drops below the stage when the window is too narrow. The stage keeps the scene's 1000 × 560 shape (`.stage` in `stage.css`); on phones (560px and below) it runs edge to edge and fits the whole scene with sky above, and each bet panel becomes one slim row.
- **Timings and maths**: `src/game/engine.ts` (`WAIT_MS`, `HOLD_MS`, `GROWTH`, `HOUSE_EDGE`, `MAX_MULT`). The server's own timings are in `GameEngineAPI/appsettings.json` under `blue-bird-jungle`.
- **Where the bird perches and flies**: `PERCH` in `art/Scene.tsx` and `birdPosition()` in `game/engine.ts` (keep the start point equal to `PERCH`).
- **The poacher's size and spot**: `POACHER_SCALE_WIDE`, `POACHER_SCALE`, `POACHER_POS` and `POACHER_ORIGIN` in `engine.ts`. `gunPivot()` is derived from them, so the aim and the net shot follow automatically.
- **The gun**: if you redraw the net launcher, keep `MUZZLE_OFFSET` in `art/Poacher.tsx` pointing at the muzzle and its pivot at `(205, 372)` in the art; the net shell launches from there.
- **SVG animation rule**: a CSS animation that sets `transform` overrides an SVG `transform` attribute. Put the position on an outer `<g transform>` and the animation class on an inner `<g>` (every animated piece in `Scene.tsx` and `Fauna.tsx` does this).
- After changing art, run `npm run export:assets`.

## Provably fair

The GameEngineAPI draws each crash point before betting opens and shows the SHA-256 hash of its server seed and the round's nonce. When it replaces the seed, the old seed is revealed in the ☰ menu so past rounds can be checked. 1% house edge, capped at 10 000×.

## Game server

The GameEngineAPI runs every round (the `blue-bird-jungle` LiveCrash game): it draws the crash point with its provably fair RNG (Target model, 1% house edge, up to 10 000×, growth 0.11), runs the clock, takes bets, pays cash-outs (by hand or automatic) and keeps the wallet. The game talks to it over SignalR at `/livecrashhub` (`src/api/liveCrash.ts`). Steering Azul is only for show.

Run it locally:

1. Keep `GameEngineAPI/appsettings.Development.json` as `{"ConnectionStrings":{"DefaultConnection":""}}`, so it uses an in-memory wallet. Never commit passwords.
2. `cd GameEngineAPI && DOTNET_ROLL_FORWARD=Major ASPNETCORE_ENVIRONMENT=Development dotnet run --no-launch-profile --urls http://localhost:5003`
3. `npm run dev`. With no `?token=` in the address, the game fetches a demo token from the API's `/api/dev-token`.

The game looks for the API at `http://localhost:5003`. Set `VITE_GAME_API_URL` to use another address.

Real money also needs a licence in your jurisdiction, age and identity checks, and responsible-gambling tools (deposit limits, self-exclusion, reality checks). Adjust the footer helpline for your market.

## Notes

- Sound starts off (browsers block audio until a click); the speaker button turns it on.
- Animations respect `prefers-reduced-motion`.
