# Atia asset provenance

Consult [ASSET_REFERENCES.md](ASSET_REFERENCES.md) for the user’s saved reference collection.

## Official Axie materials

Imported character and world files are under `public/assets/atia/`; interface artwork is under `src/assets/ui/`. Axie characters, models, artwork, and animations remain Sky Mavis / Axie Infinity intellectual property. This repository is an Axie Vibeathon project. These are limited-use builder resources, not generally licensed stock art.

Keep the included [Origins license](../public/assets/atia/licenses/origins-LICENSE.md), [Origins third-party notices](../public/assets/atia/licenses/origins-Third-Party-Notices.md), and [3D asset permission](../public/assets/atia/licenses/3d-RIGHTS.md) with the assets.

| Local file | Source |
| --- | --- |
| `kotaro.glb` | [Kotaro model and animation](https://github.com/jaatster/axie-3d-assets/blob/main/assets/mascots/kotaro.glb) |
| `kotaro-sword.glb` | [Kotaro sword equipment](https://github.com/jaatster/axie-3d-assets/blob/main/assets/equipment/kotaro-sword.glb) (source equipment reference; not fetched by the game) |
| `buba.json`, `buba.atlas`, `1.png` | [Buba / starter 1 animation source](https://github.com/axieinfinity/axie-origins-asset-kit/tree/main/Assets/OriginsKit/PvE/Starters/1) |
| `buba-avatar.png` | [Buba / starter 1 avatar](https://github.com/axieinfinity/axie-origins-asset-kit/blob/main/Assets/OriginsKit/PvE/Avatars/starters/1.png) |
| `momo-avatar.png` | [Momo / starter 12 avatar](https://github.com/axieinfinity/axie-origins-asset-kit/blob/main/Assets/OriginsKit/PvE/Avatars/starters/12.png) |
| `beast-arena.jpg` | [Beast arena](https://github.com/axieinfinity/axie-origins-asset-kit/blob/main/Assets/OriginsKit/PvE/Backgrounds/class/bg-beast.jpg) |
| `forest-arena.jpg` | [Plant / forest arena](https://github.com/axieinfinity/axie-origins-asset-kit/blob/main/Assets/OriginsKit/PvE/Backgrounds/class/bg-plant.jpg) |
| `lagoon-arena.jpg` | [Aquatic arena](https://github.com/axieinfinity/axie-origins-asset-kit/blob/main/Assets/OriginsKit/PvE/Backgrounds/class/bg-aquatic.jpg) |
| `kotaro-sheet.png` | Rendered from the Kotaro model above using `tools/bake-assets.cjs` |
| `buba-sheet.png` | Rendered from the Buba animation source above using `tools/bake-assets.cjs` |

The user supplied white-Axie screenshots as visual references on 2026-09-11, including `Screenshot 2026-09-11 120419.png`. Kotaro’s supplied model matches this white fur, blue horns, yellow eyes, red forehead marks, and sword silhouette.

Sprite sheets contain 12 columns × 6 rows of 256 × 256 frames: idle, attack, ultimate, hit, run, and greeting. Kotaro is rendered using Three.js; Buba’s existing skeleton is rendered by the Phaser Spine development plugin. The game loads only baked PNG animations, not a Spine runtime or Three.js. Any future distribution of Spine runtime code must satisfy the upstream Spine license. Weapon props, sword arcs, guard rings, paint particles, and shelter upgrades are implemented in local Phaser graphics.

The existing vector Momo battle representation and Aqua dodge mechanics are retained from the user’s original prototype specification. The official avatar is used for Momo’s village resident icon.

## Original Atia village illustration

- Final asset: [public/assets/atia/village.png](../public/assets/atia/village.png)
- Created on 2026-09-11 with the built-in ImageGen tool.
- Original generation: `01a08ae6-954c-71a3-b794-209d8cec0862/exec-77bc16d6-bc18-4a53-8510-331b900bc4b6.png`.
- 1536 × 1024 PNG, no UI or characters baked into the landscape.
- Design references: [Axie Origins](https://app.axieinfinity.com/) for the landscape menu/HUD relationship and Pokémon Mystery Dungeon: Red Rescue Team’s village for the plaza, buildings, and destination-based navigation. No Pokémon art was imported.

### Generation prompt

Use case: stylized-concept. Asset type: production 2D game village hub background, landscape 3:2, no user interface or text. Create Atia, an abandoned Axie village in a sunlit forest, six months after a nightmare raid. High oblique top-down game camera, coherent walkable village layout inspired by the intimate central village square in Pokemon Mystery Dungeon Red Rescue Team, with the soft richly painted storybook fantasy environment finish of Axie Origins. Large circular sandy plaza at center (50% x,60% y), warm circular flagstones and a tiny old stone well. A homemade small warm ochre triangular canvas tent and campfire on the left (28% x,53% y), wooden supplies and paint pots nearby. A large moss-covered stone-and-wood village gate on the upper right (77% x,38% y), with a winding trail disappearing into the woodland beyond it. Two small abandoned cottages with broken terracotta roofs and creeping ivy at upper left and upper middle. Abundant rounded trees, ferns, flower patches, weathered fence posts, tiny turquoise brook bottom-right with wooden footbridge. Faint dark violet corruption crystals only along far forest edge. Beautiful warm afternoon sunlight shafts, deep forest-green shadows, golden lime foliage, softly textured brushwork, detailed charming little environment props. Clear empty central plaza for animated creatures which will be added in code. Framing: full scene filling canvas, important tent/gate/plaza within central 80%, softly leafy border. No characters, no people, no Pokemon creatures, no letters, no words, no labels, no game HUD, no logos, no watermarks. The village must feel abandoned but hopeful, not populated or bustling.

The generated tent and gate positions were used to place interactive game hotspots. Rank-based tent/lodge changes are drawn above the background in Phaser.

## Origins interface artwork

Imported unchanged from the official Origins asset kit on 2026-09-12. These files use the same [Origins license](../public/assets/atia/licenses/origins-LICENSE.md) and [third-party notices](../public/assets/atia/licenses/origins-Third-Party-Notices.md) as the other imported materials. CSS scales the original images and slices the panel border; no game screenshots are embedded as interface controls.

| Local file | Original source |
| --- | --- |
| `src/assets/ui/avatar-frame.png` | [PvE character portrait frame](https://github.com/axieinfinity/axie-origins-asset-kit/blob/main/Assets/OriginsKit/PvE/UI/InBattle/avatar_frame.png) |
| `src/assets/ui/name-panel.png` | [Wooden name panel](https://github.com/axieinfinity/axie-origins-asset-kit/blob/main/Assets/OriginsKit/PvE/UI/InBattle/name_panel.png) |
| `src/assets/ui/paper-texture.png` | [Panel background texture](https://github.com/axieinfinity/axie-origins-asset-kit/blob/main/Assets/OriginsKit/PvE/UI/Frames/frame_back.png) |
| `src/assets/ui/paper-frame.png` | [Panel border](https://github.com/axieinfinity/axie-origins-asset-kit/blob/main/Assets/OriginsKit/PvE/UI/Frames/frame_border.png) |
| `src/assets/ui/rank-medal.png` | [Star medal](https://github.com/axieinfinity/axie-origins-asset-kit/blob/main/Assets/OriginsKit/PvE/UI/Frames/star.png) |

## Locally hosted fonts

The public Origins kit contained no font files when checked on 2026-09-12. The exact Origins game typeface has not been verified. **Changa One** is a chosen visual match for rounded cartoon headings, buttons, and Phaser canvas labels; **Nunito** is used for dialogue and smaller interface text. These are substitutes, not a claim that either is the official Axie font. Replace the local font faces and display/body tokens in `src/origins-theme.css` if an authorized exact font becomes available; keep the canvas family in `src/scenes/SceneBase.js` and the font readiness check in `src/scenes/BootScene.js` in sync.

- `src/assets/fonts/ChangaOne-Regular.ttf`: [Google Fonts source](https://github.com/google/fonts/blob/main/ofl/changaone/ChangaOne-Regular.ttf), with [OFL license](../public/assets/atia/licenses/ChangaOne-OFL.txt).
- `src/assets/fonts/Nunito.ttf`: [Google Fonts variable font source](https://github.com/google/fonts/blob/main/ofl/nunito/Nunito%5Bwght%5D.ttf), with [OFL license](../public/assets/atia/licenses/Nunito-OFL.txt).
- Both original fonts are included unchanged under the SIL Open Font License 1.1. Font requests stay on the game's own host.
- The license files are also copied into the production build from `public/assets/atia/licenses/`.

## Original interface and effects

The React/CSS layouts, illustrated button treatment, SVG icons, route nodes, story writing based on the user’s lore, paint effects, sword effects, and upgrade overlays were created for this project. The imported interface artwork above supplies the parchment frames, wooden sign, portrait ring, and rank medal. Source references are retained to make future asset replacement and licensing review straightforward.

The 2026-09-12 mobile layout reuses these same assets. `src/ui/WorldView.js` frames and pans the village without modifying its bitmap. Combat/story backgrounds are displayed by the full-screen HTML layer, with animated characters and effects on a separately framed Phaser canvas. The portrait route in `src/ui/JourneyMap.js` is original SVG/CSS work using the existing stage names and character sprite sheets. No additional external artwork was imported for this layout.

The four body-part ability icons and the horn, bite, back-weapon, and tail effects in `src/game/bodyPartAttacks.js` are original SVG/Phaser drawings. Their names are prototype abilities created for Kotaro and Buba, not imported official card names. Attachment points in `src/game/world.js` follow the existing character sprites; Buba's paintbrush tail also launches Paintstorm. This update adds no external artwork.
