# Modular Atia scenery

Village and entry share `src/game/townArt.js`, ground rendering in `src/game/terrainTexture.js`, and active assets in `public/assets/town/props-v3/`. The older `props/` folder is retained but is no longer loaded.

## Editable layers

- Ground and connected roads: one cached canvas texture with sunny grass, pale sand, soft mottled patches and irregular verges (depth -30).
- Cast shadows: separate translucent shapes offset consistently down-right (depth -8/-7).
- Buildings, shrubs and ground props: independent transparent images (depth 0).
- Trees: independent transparent images (depth 1), placed outside walkable paths.

Original town and approach paintings are preserved. New geometry follows the existing town road/collision definitions and building interaction locations. Props keep their aspect ratios. No per-frame image processing is required.

## Previous asset source (superseded by the reference-style update below)

Created with the built-in image-generation tool on 2026-09-27; no CLI/API fallback. Selected second output copied to `public/assets/town/modular-props.png`. Sprites were cropped into separate PNGs retaining the generated alpha channel. Local generation source: `C:/Users/admin/.codex/generated_images/01a08ae6-954c-71a3-b794-209d8cec0862/exec-1d77a4d2-f5b0-4f97-bd9c-c163bdcd0211.png`.

These are new matching modular interpretations, not exact extractions of the user's original painting. The goal is a restrained illustrated look; AI generation does not make them human-authored.

## Prompt used for the selected asset

Initial generation: Create a production 2D top-down RPG scenery atlas, transparent alpha background, 1536x1024 landscape. Exactly 4 equal columns x 2 equal rows, eight isolated objects centered in their own cells with generous 35px padding, nothing crossing cell boundaries. Row 1 left to right: rounded leafy oak tree with visible short trunk; smaller rounded bush; ruined roofless stone building foundation U shape open toward bottom; cream canvas triangular campsite tent with dark entrance facing bottom. Row 2 left to right: low round stone well with two wooden posts; stone arch gate front facing bottom with clear transparent opening; small oval turquoise pond with stone rim; cluster of three small grass tufts and one grey pebble. Unified hand-drawn cozy adventure game aesthetic: crisp slightly irregular dark olive outlines, only 2-3 flat cel shaded tones per material, broad readable silhouettes, restrained detail, no glossy AI gradients, no painterly noise, no text, no labels, no grid lines, no ground rectangles or scenery backdrop. Muted yellow-green leaves, forest-green shade, warm grey stones, cream tent. Perspective is near-overhead 3/4 consistent across all props, for a small abandoned forest village. Light comes upper-left. No large cast shadows (engine adds them separately). Every object must be cleanly isolated on actual transparent background. Original modest indie-game sprite artwork.

Selected edit: Edit the atlas just generated: REMOVE THE ENTIRE DARK GREEN/BROWN GLOWING BACKGROUND. Output genuine transparent alpha in every gap, including inside the ruin and arch opening. NO colored backdrop, NO glow, NO drop shadows, NO checkerboard. Preserve the eight objects and exactly the same positions and 4-column 2-row layout. Simplify overly textured areas to clean flat cel shading with crisp dark outlines. No other composition changes. This is a transparent sprite atlas for a game, not an illustration on a background.

A further extraction variant was generated but not selected. No gameplay testing or build was run, per user preference.

## Ground redesign — 2026-09-27

`src/game/terrainTexture.js` now supplies both locations with moss-green color patches, varied grass blades, sparse tiny flowers, worn dirt, embedded pebbles, scuffs and irregular grassy road edges. It uses the same road rectangles as before, with only a few pixels of visual edge variation. Ground detail is drawn to a cached canvas texture once per location, not generated per frame; scenery props and their shadows remain independent. Edit `addTerrain` for ground appearance. No new AI bitmap generation was used for this revision. No tests/builds or GitHub push were performed.

## Reference-style scenery update — 2026-09-27

Active sprites: `public/assets/town/props-v3/`. User style reference: `C:/Users/admin/AppData/Local/Temp/codex-clipboard-a13753d8-830a-47f0-b32f-210c6b05f10d.png`. No external asset URL was supplied. The screenshot is a visual reference only; none of its UI or characters are imported.

- Separate transparent PNGs: tree, pine, bush, stone, stump, fence, fence-side, grass, ruins, well, tent, gate and pond.
- Green foliage replaces the reference's amber trees. Rocks, wood, ruins, well, tent, healing pool and dungeon arch use matching rounded forms and muted outlines.
- Entry fences run beside the approach road and frame the town's southern entrance, leaving the road open.
- Ground uses bright moss grass (#b2c355) and pale sandy paths (#f4d891), soft color variation, irregular feathered edges, sparse tufts, flowers and stones. Code renders it once per location.
- Shadows are separate layers sized from each sprite's fitted display dimensions.
- Edit terrain in `terrainTexture.js`; prop positions/shadows in `townArt.js`; loading paths in `BootScene.js`. Road/collision geometry and interaction positions remain in `townLayout.js`.

Mode: built-in image generation with the supplied screenshot as a reference; no CLI/API fallback. Saved originals:
1. `public/assets/town/modular-props-v3.png` (1254 × 1254); source `C:/Users/admin/.codex/generated_images/01a08ae6-954c-71a3-b794-209d8cec0862/exec-07417120-c62e-4245-ac4d-1c6db6dcc14a.png`.
2. `public/assets/town/pool-v3-original.png`; source `C:/Users/admin/.codex/generated_images/01a08ae6-954c-71a3-b794-209d8cec0862/exec-76927d86-f06c-49e2-b79a-2bbd49b61832.png`.

Sprites were sliced and alpha-trimmed into independent PNGs; generated transparency is preserved. These are generated interpretations of the reference style, not human-authored assets. Prior sources remain available.

### Prop atlas prompt

Use attached screenshot ONLY as a style reference, not a composition to copy. Generate one production RPG environment sprite atlas matching its soft sunny 2D overhead cartoon look: rounded puffy foliage clusters, thin soft olive/brown outlines, warm wood with simple growth rings, gently faceted grey rocks, bright friendly colors, restrained highlights and soft shading. Trees must be GREEN (lime highlights, leaf-green mids, deep olive shade), never amber/orange. Transparent alpha background, isolated cutout objects, NO ground tiles, no ambient colored glow, no labels, no text, no people. Atlas EXACTLY 4 columns x 3 rows, 1536x1536 total, each cell 384 wide x512 high. 32px minimum transparent padding around every object, no overlap/crossing cells. Row1: [1 round broadleaf green tree with exposed trunk and roots] [2 green conifer tree] [3 rounded green bush] [4 large grey stone with small grass at foot]. Row2: [1 cut tree STUMP with visible honey-colored growth rings and brown roots] [2 horizontal rustic two-rail wooden fence segment with three round capped posts] [3 vertical/diagonal-in-depth matching wooden fence segment to flank a north-south path] [4 dense tuft of tall green grass with broad curved blades]. Row3: [1 ruined small roofless house foundation with broken low stone walls and a few brown broken beams, opening toward bottom] [2 round stone WELL with wooden posts, winding beam and little hanging bucket] [3 cream canvas TENT with simple brown poles, dark front opening and ropes] [4 village DUNGEON GATE: friendly weathered grey stone arch with ivy, transparent walk-through opening, not a cave mountain]. Consistent near-overhead three-quarter perspective as the reference. Keep objects visually simple, tactile and polished like authored game sprites. No cast shadows outside objects; game adds shadows.

### Pool prompt

Create one isolated transparent-background RPG sprite of a small oval village healing POOL, rim of smooth irregular grey stones with little moss, clear turquoise water, a couple green lily pads and soft white water ripples. Use attached image only as art STYLE reference: sunny cozy 2D game art, thin muted olive outlines, gently faceted stones, soft hand-painted cel shading, near-overhead three-quarter view. No characters, text, UI, grassy rectangular ground tile or backdrop. Actual transparent alpha outside pool. Center full object with generous padding. Should visually match the reference's little grey rocks and green shrubs. Modest natural village spring rather than ornate fountain. 1024x1024.

No tests, builds, browser playtesting or GitHub push were performed, per user preference.

### Clear roads and hover labels

Village grass sprites are rejected when their full 105×110 bounds overlap a road plus 12 px of clearance (townArt.js). This removes the three road-overlapping patches while retaining meadow grass. addTownArtwork now returns its landmark sprites. VillageScene uses townHover.js for a single fading label card on hover: name, description, and visit/interact hint; ruins also have descriptive labels. Permanent map labels are removed. Touch taps show the card briefly, and nearby keyboard interaction remains available in TownControls. Edit DETAILS and card styling in townHover.js. No tests/builds, browser playtesting, or push.
