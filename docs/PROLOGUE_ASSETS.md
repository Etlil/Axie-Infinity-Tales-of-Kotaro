# September 2026 prologue assets

All new generated raster assets use the built-in ImageGen tool, not the API/CLI fallback. The original uploads are preserved unchanged. No remote artwork was imported in this update; the existing [Axie reference sources](ASSET_REFERENCES.md) remain available for future work.

## User-supplied files

| Project file | Supplied filename | Use |
| --- | --- | --- |
| `public/assets/kotaro/walk-original.png` | `codex-clipboard-637babfc-2795-4149-b58e-b143b5d345b8.png` | 4×3 grid, 10 directional walking poses |
| `public/assets/kotaro/run-original.png` | `codex-clipboard-b8236803-acc4-4e7a-9fc8-9b1b34620c75.png` | 3×2 grid, six right-facing running poses |
| `public/assets/kotaro/idle-original.png` | `codex-clipboard-6ffa50a7-9d24-4b4e-8513-88f5ec7b62d6.png` | 4×3 grid, twelve right-facing idle poses |
| `public/assets/town/atia-official.png` | `codex-clipboard-e111eda5-981a-4653-bbb7-0da409837d29.png` | Official town background, 3072×2048 |
| `public/assets/prologue/approach-original.png` | `codex-clipboard-33451263-db70-442b-8242-bf0d5c71400d.png` | Original approach path, 1024×931 |

The sprites retain genuine alpha. Runtime atlases use fixed per-sheet scale, a shared foot baseline, and original horizontal registration. Walk frames: right 0–1; up 2–4; left 5–6; down 7–9. Both combat sheets face right; left movement flips the sprite. No attack sheet was supplied, so attacks use the existing procedural effects and brief pose transforms.

## Generated final assets

| Project file | Mode | Generation file |
| --- | --- | --- |
| `public/assets/prologue/stone-table.png` | Generate | `exec-adee5834-a1d1-4340-811e-c286a595b546.png` |
| `public/assets/prologue/moon-pendant.png` | Generate with transparency | `exec-6c59be69-14d9-4229-8bf9-5dcf1588e3fe.png` |
| `public/assets/prologue/kotaro-hand.png` | Generate with transparency | `exec-4bf881a8-9ba6-42fb-833f-526825512c2f.png` |
| `public/assets/prologue/approach-path.png` | Edit original approach | `exec-b1bd9da9-4a80-40fa-992f-501d119c669d.png` |

The cutscene composites the three separate table/pendant/hand layers and animates glow, reach, pickup, and fade in Phaser. The enhanced path retains the original road and obstacle layout; a small interactive broken sign is drawn separately.

## Exact prompts

### stone

```text
Use case: illustration-story. Asset type: game opening cutscene background, landscape 1536x1024. Hand drawn 2D cel-shaded fantasy art with crisp dark outlines, muted moss greens and cool blue moonlight, gentle painterly texture. Close-up angled slightly overhead of an ancient flat oval stone table/slab in a quiet dark forest clearing at night. The table top fills the middle 65% of the composition, its center at 50% width 56% height is completely empty and unobstructed to place an animated pendant separately. Beautiful polished game art matching a colorful outlined adventure village. NO pendant, NO hand, NO characters, NO writing, NO UI, NO border. Soft moonlight shaft from upper left, atmospheric dark forest in the background. Clear horizontal stone surface at the center.
```

### pendant

```text
Use case: illustration-story. Asset type: transparent 2D game cutscene prop. A single silver crescent moon pendant with a tiny turquoise stone and a short loop of dark braided cord, seen from slightly overhead resting flat, isolated at center on a genuinely transparent background. Hand drawn fantasy cel shaded art, crisp dark outlines, subtle cool blue moonlight, polished cartoon adventure game style. Crescent tips pointing up-right. Pendant fills central 70% of square. No cast background, no hand, no table, no letters, no border. Preserve clean transparent alpha for compositing.
```

### hand

```text
Use case: illustration-story. Asset type: transparent 2D game cutscene foreground prop for animation. Isolated white-furred humanoid right hand and forearm emerging diagonally from bottom right and reaching toward upper left, palm angled down and fingers gently curled as though about to grasp a small pendant from a tabletop. The fingertips are near 30% width 30% height and the wrist near 65% width 65% height. The wrist wears a flowing white robe sleeve with a thin dark outline and cool gray cel shading, matching a white-haired white-cloaked anime fantasy wanderer. Crisp dark outlines, polished hand-drawn cartoon adventure game art, slightly overhead camera. Genuinely transparent background. Only one hand with five natural fingers and one robed forearm; no pendant, no table, no full character, no text, no border, no background.
```

### approach

```text
Use case: precise-object-edit
Asset type: finished top-down 2D game approach-path background.
Input image: edit target, the user's original Atia approach road. Keep its whole scene and exact layout.
Primary request: improve resolution, clean line quality, and subtle painted cel-shaded detail so this long path looks crisp in the game.
Invariants: retain the straight vertical tan road at exactly the same relative width and horizontal position, road spanning top to bottom; preserve every fence location, tree cluster location, rock position, all clear walking space, and the original overhead camera and framing. The central road must remain entirely unobstructed. Retain the muted olive green, tan, charcoal-outline art style.
Add only carefully drawn leaf texture, soft grass texture, wood texture, and sharper outlines. Keep the map visually simple and readable, with natural clean hand-drawn outlines and flat shadows.
Output a high resolution version of the same approximately 1.10:1 canvas. No people, characters, sign, building, bridge, new obstacles, UI, text, grid, labels, border or watermark. Do not change road connections or composition.
```
