# Tales of Kotaro — project handoff and editing guide

Last updated: 2026-09-21. Latest gameplay commit at writing: `248a0f9` (Floating Puff and Frog). This guide describes implemented code, not a claim that it has been playtested. Read the actual files before editing; update this guide when behavior changes.

## Start here (for Claude, ChatGPT, or another developer)

This is **Axie Infinity: Tales of Kotaro**, a React + Phaser browser game targeting Android browsers, landscape first, with portrait support. Kotaro explores Atia, befriends Buba, and enters Aqua Cave to rescue Puffy.

- Repository: https://github.com/Etlil/Axie-Infinity-Tales-of-Kotaro
- Current development branch: `master`.
- Local checkout: `C:/Users/admin/Documents/Projects/axie-vibeathon-2026/axie-dungeon-crawler`
- The old directory/package name is historical; do not rename it just to match the repository.
- Install dependencies with `npm install`; start the development server with `npm start` from the repository root.
- The user prefers small, focused changes and concise explanations to conserve credits.
- **Do not run tests, builds, browser QA, or install testing tools unless the user requests them.** The user wants to playtest personally. Source inspection is fine. Never claim an untested change is verified.
- **Do not push to GitHub.** The user's latest instructions supersede earlier push requests. Preserve unrelated local changes.
- Read `docs/ASSET_REFERENCES.md` before asset work. Record imported asset sources in `docs/ASSET_PROVENANCE.md`.
- Preserve user-drawn sprites and maps. Simple shapes are acceptable for dungeon geometry until replacement art arrives.
- Earlier requests for four body-part cards, multiple separate dungeons, and slime enemies are superseded. See current design below.

## Copy this prompt into a new AI conversation

> We are continuing Axie Infinity: Tales of Kotaro. Read HANDOFF.md first, then inspect the relevant current source files. My next change is: [describe what you want]. Keep the change focused, preserve existing saves and unrelated work, and do not run tests/builds/browser QA unless I ask. Explain which files you changed. The repository is https://github.com/Etlil/Axie-Infinity-Tales-of-Kotaro.

If the AI cannot access your repository, attach this guide **and the relevant files from the table below**. This guide provides context, not the full source code. For new artwork, attach the original image files too. Paths into Windows Downloads/Temp on this machine are not accessible to another AI or computer; imported originals are already in `public/assets/`.

## Current game flow

1. Main menu → Start → five save slots.
2. New game: glowing gold moon amulet on an indoor stone table, horned girl's animated pickup, then the approach road.
3. Movement tutorial checks directions (WASD / mobile joystick), then sign interaction (F / mobile button). The damaged sign reads `A\_/a VXlxg/`.
4. Enter Atia; camera introduces Buba near the well, followed by the ambush battle.
5. Buba's first rushing attack locks jumping until the jump tutorial appears, then pauses for a fresh jump press. The first player turn explains Slash and Bash before card selection. Battle ends at half his HP, not at zero.
6. Buba tells the village story, asks the player's name, asks for help, and presents a sun pendant in a large overlay. Accept closes the overlay and stores it in Buba’s inventory. He points to his tent and becomes playable. The opening pendant stays moon-shaped.
7. Walk around Atia: tent for dialogue/rewards, well for saving, spring for Puffy's healing after rescue, gate for dungeon selection.
8. One dungeon: **Aqua Cave, three floors**. Walk onto keys to collect them; walk into locks to spend them. Blue stairs lead down. Floor three has two keys/two locks and Puffy's northern boss room.
9. Cave enemies appear sequentially, chase through corridors, and start battles on contact. Defeating normal enemies returns to the same floor; it does not clear the dungeon. Puffy's defeat/purification completes Aqua Cave.
10. Purified Puffy becomes the village healer and provides a dodge-time benefit.

## Where do I change something?

Paths below are relative to the repository root.

| Desired change | Start in | Related files / notes |
|---|---|---|
| Player damage, shield, card names | `src/data/playerCards.js` | Current Slash: 20 damage. Bash: 5 damage + 20 shield. Both playable characters use these two cards. |
| Card UI and shield badge | `src/App.js` | `src/cinematic-game.css`, `src/mobile-game.css`; the green shield-shaped badge displays guard amount. |
| Battle turn flow, camera, attack animation | `src/scenes/CombatScene.js` | `beginPlayerTurn`, `playCard`, `animatePlayerAttack`, `telegraph`, `startDodge`, `cameraMove`, `moveFighter`, `onDodgeUpdate`. |
| Buba jump / attack tutorials | `src/entities/DodgeSystem.js`, `src/scenes/CombatScene.js` | `src/ui/DodgeControls.js`, `src/ui/AttackTutorial.js`, `src/cinematic-game.css`. Tutorial flags reset per encounter, not saved. |
| Enemy HP, names, attack rotation | `src/data/bosses.js` | `dungeonRooms[0]` = Floating Puff, `[1]` = Frog, `[2]` = Puffy. Preserve index mappings or update floor encounters. |
| Attack timing / collision / movement / jumping | `src/entities/DodgeSystem.js` | `attackPlan`, `launch`, `step`, `moveCaveAttack`, `emit`. |
| Warnings, bubbles, impact shapes | `src/game/dodgeWorld.js` | `drawHazards`; visual geometry should agree with collision geometry. |
| Puff/Frog frames and tongue rendering | `src/game/caveEnemies.js` | `SHEETS`, registration, `caveEnemy`, `TongueVisual`; originals in `public/assets/enemies/`. |
| Kotaro sprites and animation frames | `src/game/kotaroSprites.js` | Originals in `public/assets/kotaro/`; combat actor setup in `src/game/world.js`. |
| Buba sprites / mushroom projectile | `src/game/bubaSprites.js` | `docs/BUBA_ASSETS.md`, originals in `public/assets/buba/`. |
| Shared battle actor scale / sprite selection | `src/game/world.js` | Also examine per-phase scales in `CombatScene.js`; changing only one phase causes size jumps. |
| Dungeon rooms, paths, keys, locks, enemy spawns | `src/game/dungeonLayout.js` | `AQUA_FLOORS` is the three-floor array. Tile size 48. Maps use a 45 × 28 drawing grid. |
| Dungeon exploration, chase, contact, stairs | `src/scenes/DungeonMapScene.js` | `move`, `contact`, `drawPuzzle`; enemy body art uses `fighter`. |
| Dungeon selection screen | `src/ui/DungeonSelection.js` | `src/scenes/LevelSelectScene.js`, `src/expedition-map.css`. Only one selectable dungeon now. |
| Dungeon HUD / touch movement | `src/ui/DungeonControls.js` | `src/dungeon.css`; shared `Direction` buttons also support town movement. |
| Village walkable areas, barriers, destinations | `src/game/townLayout.js` | `ROADS`, `BUILDINGS`, `TOWN_PLACES`, `townWalkable`, `townPath`. |
| Village NPCs, interactions, movement | `src/scenes/VillageScene.js` | `src/ui/TownControls.js`, `src/town.css`. |
| Village painting / camera bounds | `src/game/townArt.js` | `public/assets/town/atia-official.png`, `docs/TOWN_ART_LAYOUT.md`. |
| Intro animation / navigation tutorial | `src/game/introCinematic.js`, `src/scenes/IntroScene.js` | `src/ui/PrologueUI.js`, `src/prologue.css`, `public/assets/prologue/`, `docs/PROLOGUE_ASSETS.md`. |
| Buba story, dialogue, rank rewards | `src/data/story.js` | `src/scenes/DialogueScene.js`, `src/ui/DialogueBox.js`. |
| Sun pendant preview / Buba inventory | `src/ui/PrologueUI.js`, `src/game/state.js` | Dialogue type `pendant`, `acceptPendant`, derived `bubaInventory`, `src/prologue.css`, App.js inventory panel; art/provenance in `public/assets/prologue/SUN_PENDANT.md`. |
| Player name entry | `src/ui/PrologueUI.js` | `BubaConversation`: input stops keydown/keyup propagation so Phaser cannot swallow WASD. Validation in `state.js`. |
| Save slots, autosave, progression, rewards | `src/game/state.js`, `src/game/saveSlots.js` | `src/ui/SaveIndicator.js`, `src/ui/MainMenu.js`. |
| Settings, reset save, antialiasing | `src/ui/SettingsContent.js` | Commands wired in `src/main.js`; `src/settings.css`. |
| Menu layout and branding | `src/ui/MainMenu.js`, `src/ui/GameLogo.js` | `src/main-menu.css`, `public/` for favicon/manifest. |
| Puffy healing | `src/ui/PuffyHealer.js` | `state.js` → `healAtVillage`, `VillageScene.js`, `src/puffy-healer.css`. |
| Scene registration / asset loading | `src/main.js`, `src/scenes/BootScene.js` | Importing a new scene is insufficient: add it to the Phaser scene list. |
| Shared panels, menus, React state bridge | `src/App.js` | UI sends `command(action,payload)`; Phaser uses the shared session. |
| Overall styling / responsive layout | `src/App.js` CSS imports | `App.css`, `origins-theme.css`, `mobile-game.css`, then feature styles. Later/more specific rules can override earlier ones. |

## Architecture and important constraints

- `src/index.js` mounts React; `App.js` calls `createGame` from `main.js`.
- `main.js` creates Phaser and the shared session, handles settings/pause/input and save-slot commands.
- `state.js` owns state transitions and emits snapshots to React. Prefer `session.patch` and session methods over unrelated duplicate React state.
- `SceneBase.js` binds a scene's command handler. UI commands reach the current scene through the session.
- `BootScene.js` loads assets and registers animations before entering the main menu.
- `src/game/art.js`, `src/scenes/DungeonScene.js`, `src/ui/JourneyMap.js` and body-part helpers contain older implementation pieces. **Do not assume an old file is the active path**: inspect imports and the registered scene list first. Some legacy drawing helpers remain in use.
- Existing tests predate multiple gameplay changes. They may refer to old slimes/puzzles/cards. Their presence does not imply the current implementation has passed them.

### Battle details to preserve

- Two player cards only. Legacy `ultimates` exports still exist but are not the current selectable card set.
- Turn sequence: `PLAYER_FOCUS` → `PLAYER_TURN` → `PLAYER_ATTACK_ANIM` → `BOSS_TELEGRAPH` → `DODGE_PHASE` → `RESOLVE_DODGE`.
- Fighters physically move/jump/dash during defense. Do not replace them with an Undertale soul cursor.
- Battle scenery is a **Phaser image inside the same camera as the actors**. A previous separate HTML background did not produce the requested zoom.
- During player attacks the camera keeps a fixed focus and changes zoom only. Do not reintroduce horizontal camera pans or camera shake during attacks without asking. Turn framing and dodge framing have their own behavior.
- Card selection has stance art, gentle bobbing, blackout transition, vignette, and cinematic zoom. Reduced-motion preferences disable camera animation.
- Raised platforms are **Puffy only**. The ground collision remains at `ARENA.floor`, but no visible ground platform is drawn.
- Damage on enemy card definitions is scaled by `projectileDamage` in `DodgeSystem.js` (currently 45%, rounded). Do not assume the card's damage value equals each individual collision hit.
- Changing a hazard should update both its collision logic and its visible warnings/body.

### Current cave enemies

- **Floating Puff**: `puff-spin` gives a spin warning, then short homing movement followed by a committed path. `puff-slam` schedules two separate telegraphed drops.
- **Frog**: `frog-bubble` opens its mouth and launches aimed bubbles. `frog-tongue` extends toward the warned position. Contact switches to `caught`, holds the last supplied attack frame, then triggers a dash and extra hit. A missed tongue must never trigger that follow-up.
- Attack cards alternate by turn. Slimes have been removed from active enemy data, dungeon art, and help text.
- `DodgeSystem.emit` supplies opponent position/action to `CombatScene.onDodgeUpdate`. This keeps the actor art aligned with the attack simulation.
- Sprite originals exceed mobile texture limits in some cases. They load as binary data, then become smaller runtime canvas atlases. Do not upload the 10,833-pixel sheet directly as a single WebGL texture.
- The tongue drawings have white paper backgrounds, masked during atlas preparation; originals are preserved.

### Dungeon and town coordinates

- Dungeon floor data uses rectangle rooms/corridors: `{x,y,w,h}` in tiles. Right/bottom edges are exclusive.
- `start`, `keys`, `locks`, `exit`, and `spawns` are tile positions. All must be on floor geometry.
- Locks should occupy a one-tile choke point; otherwise players can walk around them.
- `spawns` and `encounters` arrays must have matching lengths. One active encounter uses the current `run.defeated` index.
- `run.level` is the selected dungeon (currently always 0); `run.floor` is 0, 1, or 2. **Do not confuse either with Adventure Rank (`state.level`).**
- Each floor resets its keys/locks/defeated count when entered. The expedition itself remains Aqua Cave. Completion belongs to the final boss, not the first floor's last regular enemy.
- Town uses 48-pixel tiles, 48 × 32 tiles, corresponding to the 3072 × 2048 source painting at 64 source pixels per tile.
- Requested town barriers: northern gate road starts at row 7; eastern road ends before column 43. Keep the gate interaction destination reachable.

### Saving and migration

- Five local browser save slots. Slot 1 uses `atia-adventure-v1`; subsequent slots use `atia-adventure-v1-slot-N`.
- Saves persist selected profile fields via `profileKeys` in `state.js`. Adding a field to initial state alone does not make it persistent.
- Autosave status is exposed to `SaveIndicator.js`; the well sets a town checkpoint.
- Unfinished expeditions do not persist floor position: loading returns to town. Do not promise full dungeon resume without implementing it.
- Current dungeon schema marker is `dungeonVersion:2`. Old completion of stage 2 migrates to completion of the single Aqua Cave. Story migration uses `prologueVersion:2`.
- Older Momo rescue records migrate to Puffy. Do not create a separate Momo character.
- Preserve existing slots/progress unless the user explicitly requests a reset. Settings already provides reset controls.

## Recipes for common additions

### Add or rebalance an enemy attack

1. Add/change the enemy card in `data/bosses.js` with a unique `pattern` string.
2. Add its schedule to `attackPlan` and motion/collision to `DodgeSystem`.
3. Add clear warnings/effects to `dodgeWorld.js`; use `emit` for an actual moving enemy body.
4. Map animation names in the appropriate sprite module and `CombatScene` if needed.
5. Account for jump/dash invulnerability, hit count, timing, phase cleanup and touch controls. A warning should show where the attack will actually land.

### Add another enemy type

1. Put original assets under `public/assets/`, recording sources in the provenance document.
2. Implement loading/registration and a fighter factory (use `caveEnemies.js` as a model).
3. Register assets in `BootScene`, route the new ID through `world.js`, and add enemy data.
4. Reference its encounter index and spawn tile in the desired floor data.
5. Ensure phase transitions restore its idle pose and scale. Keep names distinct from Puffy, the story boss.

### Change a floor or add one

1. Edit `AQUA_FLOORS`: sketch rooms first, then corridors and choke-point locks.
2. Place keys before their locks and place stairs behind the intended locks.
3. Adjust grid/camera bounds if coordinates exceed the current drawing grid.
4. For more than three floors, also remove hardcoded three-floor assumptions in `state.js`, `DungeonControls.js`, selection copy, and boss completion conditions. Adding one array item alone is insufficient.

### Add a village interaction

1. Add/update `TOWN_PLACES` and collision geometry in `townLayout.js`.
2. Handle the interaction in `VillageScene.js` and add any panel through `App.js`.
3. Keep the destination on a walkable tile and within interaction distance. Both keyboard and tap-to-walk use the same geometry.

### Replace a sprite or background

1. Identify the active renderer from the table; do not only edit `art.js` by habit.
2. Preserve transparency, frame counts, direction mappings and baseline alignment.
3. Adjust shared scaling carefully: overworld, selection, attack and dodge phases may use different scales.
4. Battle backgrounds belong in Phaser; village art belongs to the town artwork loader. Keep provenance and user art intact.

## Recent history / verification status

- `248a0f9`: replace slimes with Floating Puff and Frog, four attacks, imported enemy sheets.
- `2c57e2b`: single Aqua Cave with three floors, keys/locks and Puffy progression.
- `f52ff4b`: name input accepts WASD; village exit barriers.
- `ea0fbec`: attack camera zooms without panning/shaking.
- `9a69522`: background moved into Phaser to share the cinematic camera.

Recent changes above were committed and pushed, **without tests or builds at the user's request**. Gameplay tuning, visual alignment, and device behavior need the user's playtest feedback. Do not describe them as fully verified. If something fails, inspect the relevant implementation, fix the focused issue, and state exactly what was and was not checked.

## 2026-09-27 — shared village and entry scenery (local changes)

The latest instruction is **do not push to GitHub**. Keep these changes local unless the user explicitly changes that instruction. Tests/builds were not run.

`src/game/townArt.js` now draws both the village and approach road using the same palette and road renderer. `addTownArtwork` is shared by village scenes; `addApproachArtwork` is used by the entry tutorial. The old flattened paintings are retained in assets but no longer draw these exploration areas.

Props live in `public/assets/town/props/`: tree, bush, ruins, tent, well, gate, pond and grass. Each is an independent transparent PNG. Ground, road, cast shadows and props are separate Phaser objects/layers. Change `SCENERY` for colors, `ground` for ground detail, `prop` for size/shadow behavior, and placement arrays for foliage. Building positions continue to come from `townLayout.js`; road geometry is exported there as `ROADS`. Do not move interaction zones without updating their corresponding props. Prop aspect ratios are preserved.

The new art was created with the built-in image-generation tool, aiming for crisp outlines and restrained cel shading; it is not claimed to be human-drawn. The source atlas and prompt record are documented in `docs/TOWN_SCENERY.md`. Menu and battle artwork were outside this scenery change.

### Grass and path texture update

The shared ground renderer is now `src/game/terrainTexture.js` (`addTerrain`), called by `townArt.js`. It paints grass patches/blades, sparse flowers, worn soil, pebbles, scuffs and uneven road verges into a cached texture per location. Props/shadows stay separate, and collision roads are unchanged. Changes remain local; no tests/builds or push requested.

### Latest: reference-style village scenery

Active props now live in `public/assets/town/props-v3/` and load in `BootScene.js` under the existing `town-*` keys. The old `props/` directory is retained as a previous version. Thirteen separate transparent sprites cover green broadleaf/conifer trees, bushes, stones, stumps, horizontal/side fences, grass, ruins, well, tent, gate and pool. Entry fence wings and roadside fencing are placed in `townArt.js`; they leave the walking road open. Shadows use the fitted sprite dimensions.

The latest terrain palette is sunny moss-green (#b2c355) and pale sand (#f4d891), with soft color patches and feathered irregular path edges. Edit `terrainTexture.js` for grass/path appearance and `townArt.js` for prop placement, scale and shadows. Ground is cached once per location. Original collision geometry and interaction positions remain in `townLayout.js`.

See `docs/TOWN_SCENERY.md` for the screenshot reference, exact generation prompts, saved source images and replacement instructions. No tests, builds, browser playtesting or GitHub push were run. Keep these changes local unless the user explicitly requests otherwise.

## 2026-09-28 — smoother exploration movement

Village and dungeon player walking use `src/game/gridWalk.js` instead of independent per-tile tweens and input cooldowns. Movement runs at constant speed, carrying unused frame time into the next tile without an idle gap; `stepMs` (default 180 ms per 48px tile) controls speed. Held keyboard/touch directions and village auto-walk share it. The logical grid still controls walls, keys, locks, encounters and saved positions. Arrival callbacks commit each reached tile. Opening a panel freezes an in-progress step and resumes it on closing. The intro already uses continuous pixel movement; all exploration follow cameras now allow subpixel positions.

Scene integration lives in `VillageScene.js` and `DungeonMapScene.js`. Village automatic interactions happen on arrival rather than a delayed timer. No tests/builds or gameplay checks were run at the user's request. Do not push these changes to GitHub.

## Earlier intro artwork proposal — superseded

Older previews remain in `public/assets/prologue/preview-v3/` for provenance. They have been superseded by the approved v4 room, amulet and corrected chibi girl below. Their original pending-approval notes are historical.

### Latest revision — v4 artwork with girl pickup spritesheet

The user approved the v4 artwork, then requested a girl pickup spritesheet. Active assets are `public/assets/prologue/stone-room.png`, `moon-amulet.png`, and the generated transparent `girl-pickup-sheet.png` (1448×1086, 12 poses; texture key `intro-girl-pickup`). The standalone `horned-girl.png` is retained as an archived source/reference and is no longer loaded. The sheet adds crouch, reach, grasp, and lift poses to the indoor amulet pickup before the existing movement tutorial. Buba's dialogue also uses the gold amulet. Menu art and original source files remain intact.

Edit `src/game/introCinematic.js` for frame sequencing, timing, figure placement, and amulet alignment. Measured `POSES` rectangles and boot pivots use fixed `SIZE=1.22`; pickup frames play 3, 5, 4, 6–11. The tabletop amulet hides at frame 6, when the necklace drawn into the remaining poses takes over. `IntroScene.js` starts/stops the sequence; Skip and shutdown cancel pending cinematic motion. See [the girl pickup record](public/assets/prologue/GIRL_PICKUP.md) for its exact prompt and runtime notes, [the v4 asset record](public/assets/prologue/preview-v4/README.md) for the original artwork, and `docs/PROLOGUE_ASSETS.md` for active intro notes. No tests/builds/browser playtesting were run at the user's request. **Do not push.**

The completed intro now holds a black screen for five seconds after fade-out completes (IntroScene.leaveCinematic). INTRO_FADE_OUT/INTRO_BLACKOUT hide story UI; Skip bypasses the hold. The roadside sign uses public/assets/prologue/ruined-sign.png instead of a drawn polygon, with its existing interaction and dialogue. Art source and prompt: [RUINED_SIGN.md](public/assets/prologue/RUINED_SIGN.md). No tests or GitHub push.

Village labels are now hover-only cards in src/game/townHover.js (name, description, action hint); touch taps reveal them briefly. VillageScene binds them to the landmark sprites returned by addTownArtwork. Static DUNGEONS/BUBA/SPRING/SAVE markers are removed. townArt.js keeps full grass sprite bounds 12 px clear of roads. See docs/TOWN_SCENERY.md. No tests or push.

### Smooth battle framing

CombatScene now pulls back for 280 ms after card confirmation before the attack rush, retaining the fixed camera focus during attacks. Enemy telegraph pulls back for 850 ms while both fighters smoothly move/scale to the exact dodge starting poses; DodgeSystem starts only after camera completion plus a 150 ms settling beat, preserving the full dodge timer and warnings. The return to card selection uses a synchronized 760 ms camera/actor transition, with stance bobbing and card input enabled afterward. Buba's opening also pulls back. Reduced-motion preferences retain instant framing and the existing 650 ms telegraph. No tests/builds or browser playtesting run, and no push.

Pose order: `prepareTurnPose` switches Kotaro to stance before the zoom into card selection, and idle before the pullback into dodging. A 120 ms beat shows the new pose at the existing scale, then actor and camera movement start together. The stance no longer switches at zoom completion. Reduced motion skips the beat. No tests/builds/browser QA or push.

### Buba lessons and stronger hits

The opening Buba rush rejects keyboard/touch jumps until its pause lesson appears; early presses are not buffered. The touch Jump button reads WAIT while locked. A fresh jump resumes the protected first crossing, with any active dash cleared. Later jumps work normally. On the first player turn, AttackTutorial explains Slash (20 damage) and Bash (5 damage + 20 shield through the next dodge phase). Click “Got it” or press X to unlock card selection; attacks cannot fire while the lesson is open. Repeated X/number key events are ignored. Both lessons restart on a retry.

Buba's enemy card damage is now 50 for sword rush and 60 for mushroom: the existing 45% collision multiplier yields **23 / 27 damage per hit**, before shield. Other enemies and playable Buba's cards are unchanged. Tutorial flags live in session state and are not save-profile fields. Source inspected only; no tests/build/browser playtesting or GitHub push.

### Sun and moon pendants

The opening girl keeps the moon pendant. Buba’s gift is now the matching gold sun pendant (`public/assets/prologue/sun-amulet.png`). At dialogue index 13 (`type: 'pendant'`), PrologueUI shows a large responsive preview over a dark backdrop; no handover sprite or tween remains. Only Accept advances this step. `acceptPendant` atomically saves `amulet: true` and the next dialogue index; restoreProfile retains acceptance during the unfinished conversation. `derive` maps that existing flag to `bubaInventory: ['sun-pendant']`, so older completed saves retain the item and no duplicate save field is needed. The town Inventory button opens Buba’s inventory with the pendant artwork and description. Purification still uses the existing amulet flag. Generated art was visually reviewed; no tests/build/browser QA or push.
