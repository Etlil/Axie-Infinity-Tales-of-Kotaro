# Atia asset provenance

Consult [ASSET_REFERENCES.md](ASSET_REFERENCES.md) for the user’s saved reference collection.

## Official Axie materials

All imported files are under `public/assets/atia/`. Axie characters, models, artwork, and animations remain Sky Mavis / Axie Infinity intellectual property. This repository is an Axie Vibeathon project. These are limited-use builder resources, not generally licensed stock art.

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

## Original interface and effects

The React/CSS interface, line icons, route nodes, story writing based on the user’s lore, paint effects, sword effects, and upgrade overlays were created for this project. Source references are retained to make future asset replacement and licensing review straightforward.
