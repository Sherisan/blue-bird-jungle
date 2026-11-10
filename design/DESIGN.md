# Blue Bird Jungle design guide

Everything visual in the game is code. This guide maps each design piece to the file that draws it, so you can change the look in VS Code. Screenshots of the current build are in `design/screens/`; exported SVGs of every character and token are in `public/assets/`.

## World

A moonlit Brazilian rainforest at night: a deep blue sky with a soft aurora, a full moon with halo rings, table-top mountains (tepuis) in mist, a waterfall pouring off a tepui into a lagoon with giant Amazon water lilies, a leafy perch tree, glowing flowers and mushrooms. Light comes from the moon at the upper right, so lit edges and the brighter leaves face that way. The animals that live there: a toucan, hummingbirds, blue morpho butterflies and a passing parrot flock.

| Piece | File | Notes |
| --- | --- | --- |
| Sky, aurora, moon, stars, tepuis, hills | `src/art/Scene.tsx` → `SceneSky` | Moon at (860, 96); `TEPUI_TOP` and `HILLS` hold the skylines |
| Moving clouds | `src/art/Clouds.tsx` | Scroll faster as the multiplier climbs |
| Parrot flock, morphos | `Scene.tsx` → `SceneFauna` | |
| Tree lines, tepui waterfall, lagoon, perch tree, toucan | `Scene.tsx` → `SceneJungle` | `PERCH` = where Azul waits; `CANOPY` lists the tree's leaf clusters, `FALL_STREAKS` the waterfall's moving streaks |
| Moonbeams | `Scene.tsx` → `SceneLight` | |
| Poacher's bank, flowers, hummingbird | `Scene.tsx` → `SceneBank` | |
| Framing leaves and vines (bottom and top corners) | `Scene.tsx` → `SceneForeground` | Slight blur for depth |
| Plant kit | `Scene.tsx` (top) | `Monstera`, `BananaLeaf`, `Leaf`, `Fern`, `Palm`, `Heliconia`, `GlowBells`, `Orchid`, `Mushroom`, `Bromeliad`, `LilyPad`, `Lotus`, `Vine` |
| Toucan, hummingbird, morpho, flock | `src/art/Fauna.tsx` | |

All scene art shares one coordinate space: `viewBox 0 0 1000 560`.

## Characters

**Azul**, an original blue macaw (`src/art/Bird.tsx`). Deep cobalt plumage, a bare yellow ring around the eye, a yellow strip under a big dark hooked beak, a graduated tail, and glowing cyan feather tips and wing markings.

| State | When | Details |
| --- | --- | --- |
| `perch` | Betting | Wing folded, head tilts, blinks every few seconds, reflected in the lagoon |
| `fly` | Flight | Fanned wings with a full wingbeat, beak open, aura and sparkle trail; you can steer it |
| `caught` | Crash | Wrapped in the net, X eyes, tongue out, spinning stars |
| `caged` | Locked up | On the swing behind the bars, wing folded, one sad tear |

Size on stage: 90% on wide screens, 110% on phones (`dk` in `src/components/Stage.tsx`). Steering: `src/components/useSteering.ts` (`STEER_BOX` sets where Azul may fly).

**Rato the poacher** (`src/art/Poacher.tsx`). Wide bush hat with a leopard band and a stolen blue feather, aviator sunglasses on the crown, handlebar moustache, scar, gold tooth and earring. Long leather coat with a red lining and fur collar, binoculars, a bandolier of red net cartridges, trophy feathers on his belt, and a net cannon with an air tank, charged coils and a winch.

| Mood | When | Speech bubble |
| --- | --- | --- |
| `idle` | Betting | (cigar) |
| `aim` | Flight, and while reeling a catch in | "Gotcha!" once the net lands |
| `annoyed` | Right after you cash out | "Come back here!" |
| `cheer` | Once the cage door shuts | "Locked up!" |

Size and position on stage: `POACHER_SCALE_WIDE`, `POACHER_SCALE`, `POACHER_POS` in `src/game/engine.ts`.

**The cage** (`src/art/Cage.tsx`). A brass trophy cage on a dark wooden plinth with a name plate, a swing inside, a door that swings shut and a padlock that snaps. It draws in two parts so Azul can sit between them. Where it stands: `CAGE_WIDE` and `CAGE_PHONE` in `src/components/Stage.tsx`.

## Colour

Defined as CSS variables in `src/styles/tokens.css`.

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#030a12` | Page background |
| `--surface` / `--raised` | `#0a1a2b` / `#0f2238` | Panels, buttons on panels |
| `--line` / `--line-2` | `#17304d` / `#224468` | Borders |
| `--text` / `--soft` / `--muted` | `#eaf4fb` / `#bfd3e4` / `#8ea7bf` | Text |
| `--game` | `#39d0ff` | The world's accent: kicker, gauge, toggles, glow |
| `--gold` (+ `--gold-2`, `--gold-3`) | `#d9b45a` | **The only action colour**: Place bet, MAX, chips' ring |
| `--win` | `#3fd68a` | **Only means money won**: Cash out, collected, profit |
| `--loss` | `#ff6a5c` | **Only means money lost**: Caught, losses, Stop auto play |

Multiplier tiers while flying: white below 2×, cyan from 2×, gold from 5×, a shimmering rainbow from 10×.

## Type

- **Oxanium** (display): the title, the multiplier, button labels, numbers. Uppercase 800 for big labels.
- **Barlow** (body): everything else.
- Both load from Google Fonts in `index.html`. Numbers use tabular figures (`.num`).

## Interface components

| Component | File |
| --- | --- |
| Top bar (☰ menu, brand lockup, session timer, balance, Rules, Settings, Sound, Full screen) | `src/components/Header.tsx` |
| Stage HUD (history pills, Round button, countdown ring, multiplier tiers, "Caught at", flight graph, stake bar, results stack, toast, steering hint, "CAUGHT!" stamp, corner marks) | `src/components/Stage.tsx` |
| Bet panel (status, Auto and Cash-out toggles, stake, chips, MAX, big button) | `src/components/BetPanel.tsx` |
| Rail tabs (My bets table, Top wins, Stats), auto-play limits, provably fair | `src/components/Panels.tsx` |
| ☰ menu drawer | `src/components/Drawer.tsx` |
| Settings window | `src/components/SettingsModal.tsx` |
| Title screen | `src/components/Splash.tsx` |
| Help window (How to play, Rules, Fair play, Shortcuts) | `src/components/HowToPlay.tsx` |
| Chips, coin, logo, feather | `src/art/Tokens.tsx` |
| Icons | `src/components/icons.tsx` |

Styles: `src/styles/app.css` (layout and panels), `src/styles/stage.css` (stage and SVG animation hooks), `src/styles/global.css` (reset and every `@keyframes`).

## Surfaces

Panels, the top bar, bet panels, the drawer and windows share one glass style: `--glass`, `--glass-line` and `--glass-hi` at the end of `src/styles/app.css`. Change those three to restyle every surface at once.

## Rules that keep it consistent

- Gold is for actions, green is for money won, red is for money lost. Don't use them for anything else.
- Every animated SVG part sits in an inner `<g>` with the CSS class; its position goes on an outer `<g transform>`. A CSS animation that sets `transform` would otherwise erase the SVG `transform` attribute.
- Keep `PERCH` in `Scene.tsx` equal to the start of `birdPosition()` in `engine.ts`, and `MUZZLE_OFFSET` in `Poacher.tsx` on the gun's muzzle.
- After changing art, run `npm run export:assets` to refresh `public/assets/`.
