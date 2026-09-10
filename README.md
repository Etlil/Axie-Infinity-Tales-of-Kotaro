# Axie Dungeons

A playable Phaser 3 and React prototype: explore Momo’s Lagoon, clear two small encounters, rescue Momo, and welcome her to your village.

## Run locally

```sh
npm install
npm start
```

Open the development server shown in the terminal, normally `http://localhost:3000`.

```sh
npm run build
npm test -- --watch=false --runInBand
```

The production build is written to `build/`. On PowerShell systems that block `npm.ps1`, use `npm.cmd` for these commands.

## Play

1. Click Momo’s Lagoon on the map or **Enter dungeon**.
2. Advance through two clearings and reach Momo’s sanctuary. Health carries between encounters.
3. Play one card each turn, then avoid the incoming wave.
4. Defeat Momo, continue to the village, and return to the map for another expedition.

| Action | Controls |
| --- | --- |
| Enter or advance | On-screen button; Enter; Space or Right Arrow on the dungeon path |
| Play an ability | Click its card or press **1**, **2**, **3** |
| Dodge left | **A**, Left Arrow, or tap the left lane |
| Dodge center | **S**, Down Arrow, or tap the center lane |
| Dodge right | **D**, Right Arrow, or tap the right lane |

A dodge phase lasts three seconds. During its final second, exactly one lane lights up blue. Your position when the wave lands determines the result: an unlit lane avoids all damage. Guard can reduce a hit; Moon Beam restores health up to 100 HP. Momo’s permanent **+5% Dodge Accuracy** bonus extends dodge timing and the warning window by 5%; it never randomly changes an outcome or stacks from rescuing Momo again.

Retrying after defeat restarts the current encounter with full health. Returning to the map and entering again starts a new expedition from the first room. Rescued friends and bonuses last for the current session and survive retries or new expeditions. Refreshing the page starts a fresh session.

## Project structure

- `src/App.js`, `src/App.css`: responsive React interface, ability buttons, navigation, and help.
- `src/main.js`: Phaser configuration and `createGame(parent, onState)` bridge, exposing `command`, `getState`, and `destroy`.
- `src/scenes/`: map, traversal, combat, rescue, village, and defeat scenes.
- `src/entities/DodgeSystem.js`: scene-owned lane input, warning timing, deterministic hit resolution, and cleanup.
- `src/data/`: reusable player cards, enemy definitions, and the three-room dungeon.
- `src/game/state.js`: in-memory expedition progress, village roster, and bonuses.
- `src/game/art.js`: local Phaser vector scenery and Axie illustrations.

Combat follows `PLAYER_TURN → PLAYER_ATTACK_ANIM → BOSS_TELEGRAPH → DODGE_PHASE → RESOLVE_DODGE`. A defeated enemy clears the room immediately; defeating the guardian opens the rescue scene. Zero player health opens defeat.

Tests cover the UI-to-game commands, modal keyboard behavior, combat transitions, lane timing and input, rescue deduplication, and progress across retries. Phaser renders to a 1200 × 660 canvas that scales to its container; React provides additional accessible controls outside the canvas.

This vertical slice contains one dungeon, one boss, one dodge pattern, and one village friend. It intentionally has no backend, wallet, blockchain integration, save system, procedural generation, audio, or PvP.
