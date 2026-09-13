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

The game is designed **landscape first**, with a full-screen village, a compact edge HUD, touch cards, and a separate ultimate button. Portrait is also playable: drag the village sideways or use Camp / Square / Gate to explore, and use the four-way touch pad to explore the dungeon. Desktop keyboard controls remain available. Fullscreen is available in Settings and the guide. Open Settings with the gear on story and village screens, or through the battle pause menu. Browser progress is stored per device and site address; saves do not sync between your PC and phone.

For a public web release, run `npm run build` and serve the `build/` directory through an HTTPS static host. No backend is required. The manifest supports a standalone home-screen window; offline play and a service worker are not included.

## The journey

1. Follow the arrival story and fight Buba in Atia’s clearing.
2. Listen to his account of the raid, accept his handmade amulet, and unlock Buba as a playable companion.
3. Explore the village hub. Buba’s tent contains Adventure Rank rewards; the gate enters the Sunken Halls dungeon.
4. Walk through the Mossy Hall and Sunken Passage. One slime appears at a time; contact starts a turn-based battle. Win, then choose Continue journey to resume exploring.
5. Defeat both slimes to unlock the final chamber. Walk up to Puffy to start the boss fight, weaken Puffy, then **Use the amulet** to reverse the corruption and bring Puffy home.
6. Exit to Atia and enter again to replay the dungeon and earn more XP. At ranks 3 and 5, Buba improves his tent into a mended shelter and then a lodge.

| Action | Touch / mouse | Keyboard |
| --- | --- | --- |
| Story | Tap to reveal, then continue | X / Enter |
| Ability | Tap Horn, Mouth, Back, or Tail | A / D selects, X confirms; 1, 2, 3, 4 shortcuts |
| Ultimate | Tap the charged ultimate | 5 |
| Run | Hold Left / Right | A / D or Left / Right |
| Jump | Tap Jump while moving | Space / W / Up |
| Dash | Tap Dash | Shift |
| Explore dungeon | Hold the four-way pad | WASD / arrow keys |
| Close a panel | Close button or backdrop | Escape |
| Pause battle | Pause button at the top right | Focus the pause button and press Enter |
| Resume / retreat | Choose an action in the pause menu | Tab to the action and press Enter |

The pause menu freezes the encounter, including dodge timers, animations, and queued attacks. Battles also pause when the browser tab becomes hidden; resume when you return. Panel headers stay visible while their contents scroll, including rank rewards on short landscape screens. Touch controls respect display safe areas.

Each companion has four body-part attacks, with matching attachment-point animations:

| Part | Kotaro | Buba |
| --- | --- | --- |
| Horn | Horn Lance | Leaf Horn |
| Mouth | Moon Fang (heal 8) | Beast Bite |
| Back | Blade Guard (14 shield) | Shield Bash (16 shield) |
| Tail | Tail Sweep | Brush Tail (heal 6) |

The four cards sit side by side in landscape and form a compact two-by-two hand in portrait. The ultimate remains a separate charged ability.

The dungeon has three connected chambers, narrow corridors, solid walls, a following camera, and a sealed boss entrance. The two slimes move one tile for every two steps you take. Puffy waits in the final chamber. Exploration pauses during contact transitions and battles. Leaving the dungeon or reloading returns you to the village; completed encounters, XP, rescues, and rewards remain saved.

Dungeon scenery and overworld characters use simple replaceable shapes. Change `src/scenes/DungeonMapScene.js` for visuals and `src/game/dungeonLayout.js` for tiles/spawns. Combat uses the existing ability and dodge system with shape-based slimes and a stone-room backdrop.

Each enemy attack has a 6.5-second dodge phase. Move your Axie, jump onto ledges, and dash through the actual projectiles. Guard reduces a hit and recovery abilities heal up to the character’s maximum HP. Three abilities charge an ultimate: Kotaro’s **Moonlit Eclipse** or Buba’s paintbrush **Paintstorm**.

Puffy’s blessing adds 5% to the dodge phase and warning window. It is deterministic, permanent in this browser’s save, and never stacks from repeat rescues.

Puffy is the aquatic guardian, using the official Origins starter artwork and animations. Purifying Puffy removes the corruption effect and unlocks **Atia’s village healer**. After returning injured, tap Puffy’s spring or **Puffy** in the village dock, then **Restore health** to recover all missing HP for free. Puffy uses healing water and bubbles, and the panel shows your current/max HP. Healing is available only in the village after the rescue. Existing fresh-health encounter/retry rules still apply. Saves from the earlier Momo prototype automatically retain their rescue, blessing, ranks, and rewards under Puffy’s name.

## Progress and rewards

Adventure Rank thresholds are 0, 50, 140, 280, and 460 total XP. Buba’s encounter grants 60 XP once. First clears grant 30 / 45 / 90 XP; repeat clears grant 20 XP. Each rank’s supplies can be claimed once. Coins, timber, and essence are collected for the restoration prototype; tent improvements currently follow rank automatically.

The local save key is `atia-adventure-v1`. Story checkpoints, companions, claims, cleared stages, resources, and rescued villagers survive reloads. An unfinished encounter restarts from the village (or Buba’s introduction before the prologue is complete). Retry restores full health at the same encounter. If browser storage is blocked, a notice explains that progress lasts only for the current session.

To replay from the beginning, choose **Settings → Reset save data → Delete save and restart**. Confirmation clears this browser’s Atia progress and restarts the intro as Kotaro, including when an encounter is paused. **Keep my save** cancels without deleting anything. Other browser data is untouched. The new adventure saves normally; a failed deletion keeps your current adventure and shows an error.

## Validate

```sh
npm test -- --watchAll=false --runInBand
npx playwright install chromium --only-shell
npm run test:e2e
npm run build
```

Browser checks exercise the prologue, contact-triggered dungeon battles through Puffy’s rescue, save restoration, one-time rewards, village healing, and Android touch emulation in portrait and landscape. Unit tests cover lethal hits and encounter state. They also check an actual touch drag across the village, camp navigation, simultaneous movement and jump touches, a frozen dodge timer in the pause menu, and identical canvas frames while choosing an attack. Screenshots are written to `test-results/` (git-ignored).

## Source and assets

- `src/App.js`, `src/App.css`: story, village HUD, touch controls, accessible panels, and responsive layouts.
- `src/origins-theme.css`: cartoon interface, Origins parchment/wood artwork, and locally hosted Changa One / Nunito fonts. Changa One is a visual match; the exact Origins font has not been verified. Font and artwork sources are recorded in the asset provenance document.
- `src/mobile-game.css`, `src/ui/WorldView.js`, `src/ui/JourneyMap.js`: full-screen world composition, safe-area HUD, village panning, portrait stage route, scrolling panels, and compact battle controls. The CSS owns the canvas display bounds; Phaser refreshes its input scale from those measured bounds.
- `src/main.js`: Phaser lifecycle and React bridge.
- `src/scenes/`: loading, arrival, Buba’s dialogue, village, tile-based dungeon exploration, combat, rescue, and defeat.
- `src/game/state.js`: validated local saves, unlocks, ranks, rewards, and encounter state.
- `src/entities/DodgeSystem.js`: fixed-step movement, jumps, ledge collisions, dashes, attack patterns, projectile collisions, and input cleanup.
- `src/game/dodgeWorld.js`: arena ledges, attack telegraphs, and projectile rendering.
- `src/ui/DialogueBox.js`, `src/ui/DodgeControls.js`, `src/cinematic-game.css`: portrait dialogue, multi-touch arena controls, and cinematic presentation.
- `src/game/world.js`: animated fighters, weapon effects, village upgrades, and route rendering.
- `src/game/art.js`: existing vector scenery and corrupted creature illustrations.
- `src/data/`: cards, enemy definitions, route nodes, lore, and rank thresholds.
- `tools/bake-assets.cjs`: optional reproducible model-to-spritesheet baking. Run `node tools/bake-assets.cjs` after installing Playwright’s Chromium. Three.js and Spine are used only by this offline development tool; the playable game uses PNG sprite animations.

Read the [saved Axie references](docs/ASSET_REFERENCES.md) and [asset sources, licenses, and village generation prompt](docs/ASSET_PROVENANCE.md) before further art work. Imported Axie materials remain Sky Mavis IP and are limited to Axie Vibeathon / approved programs, as described by the included notices.

This prototype includes one story chapter, two playable companions, three dungeon stages, five Adventure Ranks, and one rescuable guardian. Later map regions are visibly locked. Audio, additional regions, wallet integration, multiplayer, cloud saves, and offline play are outside this slice.
