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
- The user has repeatedly requested committing and pushing completed changes to the designated repository. Preserve unrelated changes and do not force-push.
- Read `docs/ASSET_REFERENCES.md` before asset work. Record imported asset sources in `docs/ASSET_PROVENANCE.md`.
- Preserve user-drawn sprites and maps. Simple shapes are acceptable for dungeon geometry until replacement art arrives.
- Earlier requests for four body-part cards, multiple separate dungeons, and slime enemies are superseded. See current design below.

## Copy this prompt into a new AI conversation

> We are continuing Axie Infinity: Tales of Kotaro. Read HANDOFF.md first, then inspect the relevant current source files. My next change is: [describe what you want]. Keep the change focused, preserve existing saves and unrelated work, and do not run tests/builds/browser QA unless I ask. Explain which files you changed. The repository is https://github.com/Etlil/Axie-Infinity-Tales-of-Kotaro.

If the AI cannot access your repository, attach this guide **and the relevant files from the table below**. This guide provides context, not the full source code. For new artwork, attach the original image files too. Paths into Windows Downloads/Temp on this machine are not accessible to another AI or computer; imported originals are already in `public/assets/`.

## Current game flow

1. Main menu → Start → five save slots.
2. New game: glowing moon pendant on a stone table, hand pickup, then the approach road.
3. Movement tutorial checks directions (WASD / mobile joystick), then sign interaction (F / mobile button). The damaged sign reads `A\_/a VXlxg/`.
4. Enter Atia; camera introduces Buba near the well, followed by the ambush battle.
5. Buba's first rushing attack pauses for a jump tutorial. Battle ends at half his HP, not at zero.
6. Buba tells the village story, asks the player's name, asks for help, and points to his tent. Kotaro receives the pendant and Buba becomes playable.
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
| Battle turn flow, camera, attack animation | `src/scenes/CombatScene.js` | `beginPlayerTurn`, `playCard`, `telegraph`, `startDodge`, `cameraMove`, `onDodgeUpdate`. |
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
| Intro animation / navigation tutorial | `src/scenes/IntroScene.js` | `src/ui/PrologueUI.js`, `src/prologue.css`, `public/assets/prologue/`. |
| Buba story, dialogue, rank rewards | `src/data/story.js` | `src/scenes/DialogueScene.js`, `src/ui/DialogueBox.js`. |
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
