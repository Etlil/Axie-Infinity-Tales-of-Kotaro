# Intro art preview — awaiting user approval

These are static asset proposals, not an implemented animation. The user explicitly requested seeing and confirming the artwork before animation. Do not replace the active intro or push to GitHub without their subsequent instruction.

## Art direction and reference

Reference: [Hollow Knight — Nailsmith Cutscene](https://www.youtube.com/watch?v=FiSAhmnvleY&list=PLzeAGiVjD7qLS3Ke2_fmOwbUnVETU0ujy&index=4). Browser inspection informed the dark silhouette staging, restrained cool palette and bright focal prop. No video frames, Hollow Knight characters or audio are included in these assets.

Kotaro outline reference: the user's existing `public/assets/kotaro/walk-original.png`. The proposed figure is a dark silhouette with pale edge lighting, retaining the recognizable hair/horn/scarf outline. The moon pendant has simplified cartoon proportions. The table scene uses broad shadow shapes and a moonlit surface.

Generated with the built-in image-generation tool on 2026-09-28; no API/CLI fallback. New preview files are separate from the live assets:
- [stone-table.png](stone-table.png) — source generation `exec-ae989480-4c03-4eb4-9689-5d2c66109589.png`.
- [moon-pendant.png](moon-pendant.png) — source generation `exec-00779863-11a9-4a59-849b-54d72a97e4a7.png`.
- [kotaro-silhouette.png](kotaro-silhouette.png) — source generation `exec-6365c3b2-9d95-4b25-b283-493cacf87738.png`.

Default generation directory: `C:/Users/admin/.codex/generated_images/01a08ae6-954c-71a3-b794-209d8cec0862/`. The PNGs above are copied into the project with the pendant and figure alpha preserved.

## Proposed animation after approval

Pendant glows on the table; the silhouette reaches in and lifts it; the scene fades to black. Final placement, timing and layered glow are intentionally pending approval. Existing gameplay and intro remain unchanged. No tests, builds or push.

## Exact generation prompts

### stone-table.png

Use case: illustration-story. Asset type: static game intro background awaiting art approval. Original 2D cartoon indie-game cutscene art with bold clean organic contours, extremely simple two-tone shapes, deep midnight navy shadows, desaturated blue atmosphere and selective pale cyan-white highlights. Quiet mysterious silhouette staging inspired by the lighting/composition language of Hollow Knight's Nailsmith cutscene, but no Hollow Knight characters, objects or scenery copied. Not photorealistic, no 3D render, no detailed painterly texture or glossy realism. A wide 16:9 side-on close view of a simple rounded ancient stone table in a very dark forest clearing. Table extends from 15% to 65% of canvas width, its oval top at 66% canvas height. Empty clear tabletop, a thin cool moonlight edge on its upper plane. A few distant broad tree silhouettes, mostly lost in darkness; restrained soft blue mist, black foreground corners. Leave the right third empty for a separate silhouetted character reaching left, and leave open space above the tabletop for lifting a pendant. Clear restrained cartoon shape design; table only 2 or 3 flat stone tones with a couple cracks. NO pendant, NO character, NO hand, NO text, no UI, no extra decorations. Landscape 1536x864. Full opaque background.

Transparent background: false.

### moon-pendant.png

Use case: stylized-concept. Asset type: isolated cartoon moon pendant sprite for a dark 2D game intro, approval preview. Original 2D cartoon indie-game cutscene art with bold clean organic contours, extremely simple two-tone shapes, deep midnight navy shadows, desaturated blue atmosphere and selective pale cyan-white highlights. Quiet mysterious silhouette staging inspired by the lighting/composition language of Hollow Knight's Nailsmith cutscene, but no Hollow Knight characters, objects or scenery copied. Not photorealistic, no 3D render, no detailed painterly texture or glossy realism. One chunky rounded ivory-silver crescent pendant with softly blunted tips, a small simple turquoise inset on the lower curve, a sturdy little hanging loop and short dark cord forming a relaxed loop above. Side-on slightly angled view, simple iconic silhouette. Thick dark-blue outer outline, one pale-blue shadow shape, one white highlight. Cute readable cartoon proportions, no tiny engravings, no realistic metal, no face. Center the complete prop with generous clear padding, crescent and cord only. Genuine transparent background; NO shadow, no table, no glow halo, no sparkle particles; glow will be animated separately after approval. Square 1024x1024.

Transparent background: true.

### kotaro-silhouette.png

Use case: stylized-concept. Asset type: one isolated full-body silhouette cutscene sprite, static approval preview. Reference image role: character OUTLINE reference only, the user's Kotaro sheet; do not make a spritesheet. Original 2D cartoon indie-game cutscene art with bold clean organic contours, extremely simple two-tone shapes, deep midnight navy shadows, desaturated blue atmosphere and selective pale cyan-white highlights. Quiet mysterious silhouette staging inspired by the lighting/composition language of Hollow Knight's Nailsmith cutscene, but no Hollow Knight characters, objects or scenery copied. Not photorealistic, no 3D render, no detailed painterly texture or glossy realism. Kotaro, the white-haired horned wanderer in the reference, shown ONLY as a solid near-black deep-navy silhouette with a very thin pale blue-white rim on the left-facing contour. Preserve his recognizable spiky swept-back hair, two long swept horns, small pointed ear, short scarf, loose robe and small boots in the outline, but NO eyes, face, mask color, clothing details, internal outlines or white skin fill. Three-quarter side view FACING LEFT, standing on the right half of the image, leaning forward to pick up a small object from an implied waist-high table. One arm reaches toward the left, fingers softly pinched with empty space between fingertip and thumb; fingertips around 22% width and 58% height. Other arm kept close to body. Entire silhouette fully visible with padding. No pendant, no table, no scenery, no floating FX. Actual transparent alpha background. One single pose, square 1024x1024.

Transparent background: true.
