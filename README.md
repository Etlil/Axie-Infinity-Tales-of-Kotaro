# Atia — Echoes of a Lost Village

A playable Axie Vibeathon adventure built with React and Phaser. Arrive as Kotaro, the white wanderer, earn Buba’s trust, and help restore Atia after the nightmare raid.

## Run on your computer

```sh
npm install
npm start
```

Open **http://localhost:3000**. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

## Play on Android over Wi-Fi

Connect the phone and computer to the same Wi-Fi network. Start the development server from this project:

```powershell
$env:HOST = "0.0.0.0"
$env:BROWSER = "none"
npm.cmd start
```

On the Android phone, open Chrome and enter `http://YOUR-COMPUTER-IP:3000`. Find your computer’s Wi-Fi IPv4 address using `ipconfig`; **localhost on a phone refers to the phone**, so use the computer’s address. If Windows asks, allow Node on your private network.

At the time of this build, this computer’s address was **http://192.168.1.25:3000**. Your router may assign a different address later.

The game supports portrait and landscape, touch cards and lane controls, and desktop keyboard controls. Landscape provides a larger view of the village. The fullscreen button appears where screen space permits. Browser progress is stored per device and site address; saves do not sync between your PC and phone.

For a public web release, run `npm run build` and serve the `build/` directory through an HTTPS static host. No backend is required. The manifest supports a standalone home-screen window; offline play and a service worker are not included.

## The journey

1. Follow the arrival story and fight Buba in Atia’s clearing.
2. Listen to his account of the raid, accept his handmade amulet, and unlock Buba as a playable companion.
3. Explore the village hub. Buba’s tent contains Adventure Rank rewards; the gate opens a winding stage map.
4. Clear Whispering Woods, the Hollow Crossing, and Momo’s Lagoon in order.
5. Weaken Momo, then **Use the amulet** to reverse the corruption and bring Momo home.
6. Replay cleared stages to earn more XP. At ranks 3 and 5, Buba improves his tent into a mended shelter and then a lodge.

| Action | Touch / mouse | Keyboard |
| --- | --- | --- |
| Story | Continue button | Enter |
| Ability | Tap one of three cards | 1, 2, 3 |
| Ultimate | Tap the charged ultimate | 4 |
| Dodge | Tap Left, Center, or Right | A / S / D, or Left / Down / Right |
| Stage | Select a node and Enter encounter | Enter selected stage |
| Close a panel | Close button or backdrop | Escape |

Each enemy attack has a three-second dodge phase. The danger lane is revealed in the final second; move to an unmarked lane before impact to take no damage. Guard reduces a hit and recovery abilities heal up to the character’s maximum HP. Three abilities charge an ultimate: Kotaro’s **Moonlit Eclipse** or Buba’s paintbrush **Paintstorm**.

Momo’s blessing adds 5% to the dodge phase and warning window. It is deterministic, permanent in this browser’s save, and never stacks from repeat rescues.

## Progress and rewards

Adventure Rank thresholds are 0, 50, 140, 280, and 460 total XP. Buba’s encounter grants 60 XP once. First clears grant 30 / 45 / 90 XP; repeat clears grant 20 XP. Each rank’s supplies can be claimed once. Coins, timber, and essence are collected for the restoration prototype; tent improvements currently follow rank automatically.

The local save key is `atia-adventure-v1`. Story checkpoints, companions, claims, cleared stages, resources, and rescued villagers survive reloads. An unfinished encounter restarts from the village (or Buba’s introduction before the prologue is complete). Retry restores full health at the same encounter. Clearing site data starts a new story. If browser storage is blocked, a notice explains that progress lasts only for the current session.

## Validate

```sh
npm test -- --watch=false --runInBand
npx playwright install chromium --only-shell
npm run test:e2e
npm run build
```

Browser checks exercise the full prologue and rescue loop, defeat/retry, save restoration, one-time rewards, and Android touch emulation in portrait and landscape. Screenshots are written to `test-results/` (git-ignored).

## Source and assets

- `src/App.js`, `src/App.css`: story, village HUD, touch controls, accessible panels, and responsive layouts.
- `src/origins-theme.css`: cartoon interface, Origins parchment/wood artwork, and locally hosted Changa One / Nunito fonts. Changa One is a visual match; the exact Origins font has not been verified. Font and artwork sources are recorded in the asset provenance document.
- `src/main.js`: Phaser lifecycle and React bridge.
- `src/scenes/`: loading, arrival, Buba’s dialogue, village, winding route, combat, rescue, and defeat.
- `src/game/state.js`: validated local saves, unlocks, ranks, rewards, and encounter state.
- `src/entities/DodgeSystem.js`: lane timing, deterministic damage resolution, and input cleanup.
- `src/game/world.js`: animated fighters, weapon effects, village upgrades, and route rendering.
- `src/game/art.js`: existing vector scenery and corrupted creature illustrations.
- `src/data/`: cards, enemy definitions, route nodes, lore, and rank thresholds.
- `tools/bake-assets.cjs`: optional reproducible model-to-spritesheet baking. Run `node tools/bake-assets.cjs` after installing Playwright’s Chromium. Three.js and Spine are used only by this offline development tool; the playable game uses PNG sprite animations.

Read the [saved Axie references](docs/ASSET_REFERENCES.md) and [asset sources, licenses, and village generation prompt](docs/ASSET_PROVENANCE.md) before further art work. Imported Axie materials remain Sky Mavis IP and are limited to Axie Vibeathon / approved programs, as described by the included notices.

This prototype includes one story chapter, two playable companions, three dungeon stages, five Adventure Ranks, and one rescuable guardian. Later map regions are visibly locked. Audio, additional regions, wallet integration, multiplayer, cloud saves, and offline play are outside this slice.
