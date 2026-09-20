# Buba sprite replacement

The user supplied four sheets on 2026-09-20. These replace the old Buba sprites in the village, dungeon exploration, combat, dialogue, and profile portraits. No external artwork was downloaded. Saved Axie references remain in [ASSET_REFERENCES.md](ASSET_REFERENCES.md).

| Saved asset | Source upload | Use |
| --- | --- | --- |
| `public/assets/buba/battle.png` | `codex-clipboard-0dd7d3a6-2cbe-49aa-ae8b-35a9e8e6d278.png` | Sword-ready stance and hurt pose; hurt frame is mirrored to share the stance's facing direction. |
| `public/assets/buba/village.png` | `codex-clipboard-61db8109-84ca-404f-86ef-d4c12e89fc1e.png` | Four columns, eight rows: idle/walk down, left, up, right. Repacked during transparent extraction. |
| `public/assets/buba/avatar.png` | First village frame | Cropped portrait; same transparent art as the village actor. |
| `public/assets/buba/dash.png` | `codex-clipboard-219bc33e-afad-4e1c-8fe5-d872273d8aa4.png` | 18 sword-dash poses, including three wide finishing frames. |
| `public/assets/buba/mushroom.png` | `file_000000002f80820684c54ff683a51a42.png` | Original transparent file, copied unchanged. Throw preparation, projectile rotation, and recovery poses. |

`src/game/bubaSprites.js` measures the irregular frame rectangles, registers compact runtime atlases, and aligns poses to a shared foot baseline. The crossing rush loops the first five clean sword strides; the three wide finishing frames serve the ultimate animation. The mushroom projectile uses the supplied spinning art at the existing collision position. The throwing pose remains visible while the mushroom is in flight, followed by recovery when it returns. Directional village art also applies when Buba is selected for dungeon exploration.

## Transparent extraction

Mode: **built-in ImageGen**. The mushroom sheet already had alpha transparency. The other three sheets required extraction. The original uploaded files were not overwritten. Earlier village extraction attempts retained the background and were rejected; only the final repacked transparent sheet is used.

Final prompt set:

### Village

> Create a production-ready TRANSPARENT sprite atlas using ONLY the 32 Buba character cutouts from this reference. The brown gradient is unwanted scenery: erase it completely. Arrange the cutouts in a NEW tightly packed regular grid, 4 columns x 8 rows, filling the whole image, with equal cell sizes and clear empty transparent margins. Preserve the exact character design and poses. Row order: idle down, walk down, idle left, walk left, idle up (back view), walk up, idle right, walk right. No labels. No background color, no lighting or glow behind characters. Background must be actual transparent alpha, including gaps between the legs and sword. Each sprite must be isolated. Output a portrait 1:2 aspect ratio transparent PNG sprite sheet.

### Battle

> Use case: background-extraction. Edit target: two Buba combat poses. Remove ONLY black background, replacing with true alpha transparency. Preserve both original painted sprites exactly: left battle sword stance facing right and right hurt pose facing left, all gold dust effects, outlines and colors. Keep original wide canvas, poses fully separated, positions and sizes unchanged. No redrawing, cropping, new elements or checkerboard. Output transparent PNG.

### Dash

> Use case: background-extraction. Edit target: Buba sword dash sprite sheet. Remove ONLY the baked-in white and gray checkerboard background, replacing it with genuine alpha transparency. Preserve ALL 18 original poses and gold sword motion effects, outlines, colors, exact positions, scale and layout: five frames in each of first three rows, three wider frames in bottom row. Keep original landscape canvas. No checkerboard, no text, no new poses, no rearranging, no cropping swords or trails. Output transparent PNG.
