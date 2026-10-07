# Intro artwork v4 — approved and implemented

The user approved implementation with "update my code with that but don't push" and explicitly requested animation. Runtime copies are `../stone-room.png`, `../moon-amulet.png` and `../horned-girl.png` (the corrected chibi version). `src/game/introCinematic.js` animates the glow, approach, reach, attached amulet lift, sway and fade. No GitHub push.

## Figure proportion correction

The user requested the figure match Kotaro's short stature. Approved figure: [horned-girl-chibi.png](horned-girl-chibi.png). This supersedes the taller silhouette; the room and amulet are from v4. Short legs, compact torso and a larger head match Kotaro's chibi proportions. The cinematic uses uniform scaling and separate foot/grip anchors to account for transparent padding.

Mode: built-in image edit, transparent alpha preserved. Source: `exec-2291ee7f-e58f-40cc-aad3-0620ac855688.png` in the same generated-images directory. Inputs: `horned-girl-silhouette.png` and `public/assets/kotaro/walk-original.png`.

Prompt:

Edit reference image 1, the horned girl silhouette. Reference image 2 is Kotaro and is ONLY the HEIGHT/PROPORTION reference. Make the girl short and compact like Kotaro: approximately 2.3 heads tall, large round head, small compact torso, very short legs and small flat boots, similar head-to-body ratio and overall stature to Kotaro's individual sprites. Redraw her proportions, do not merely shrink the same tall slim body. Keep her identity: long flowing hair reaching to her calves, two curved horns, a simple loose robe/dress and sleeves. Keep the same left-facing leaning/reaching pose, one small hand extended left to pick up a pendant from an implied low table. Preserve the solid near-black midnight-navy silhouette with delicate pale blue-white rim highlights, no visible eyes/face or internal detail. Cute compact fantasy-game character proportions, no elongated adult legs or torso, no high heels. One full-body character only, centered with generous padding on genuine transparent alpha. No pendant, background, table, text, comparison figure or spritesheet. The room and pendant are not part of this edit. Square output.

This revision supersedes preview-v3 and the taller v4 figure in the active intro. The approval requirement has been satisfied for this revision. Keep all changes local; no GitHub push.

## Requested changes

- Enclosed dark stone room instead of the outdoor forest; retain the stone table.
- Cartoon gold moon amulet with a burgundy-brown cord, chunky gold fittings and small charms inspired by the supplied necklace.
- Long-haired horned girl shown only in dark silhouette with pale edge lighting, replacing Kotaro in this cutscene concept.

## Sources and saved assets

Necklace reference supplied by the user: `C:/Users/admin/AppData/Local/Temp/codex-clipboard-d3d83ee7-3001-42db-9c98-8806542bcf80.png`. No external source URL was supplied for that image. The reference's inventory border and number were not included.

Earlier lighting/staging reference: [Hollow Knight — Nailsmith Cutscene](https://www.youtube.com/watch?v=FiSAhmnvleY&list=PLzeAGiVjD7qLS3Ke2_fmOwbUnVETU0ujy&index=4). No video artwork/audio is shipped.

Generated with the built-in image-generation tool (no CLI/API fallback). Originals remain under `C:/Users/admin/.codex/generated_images/01a08ae6-954c-71a3-b794-209d8cec0862/`. Copies in this directory:
- [stone-room.png](stone-room.png) — generated source `exec-a7b40685-4de7-495d-860a-3249520419c7.png`.
- [moon-amulet.png](moon-amulet.png) — generated source `exec-76e987e8-eaeb-4951-8997-d9da015aee94.png`.
- [horned-girl-silhouette.png](horned-girl-silhouette.png) — generated source `exec-519255a6-88d4-44a3-85e0-d2016b6b78d3.png`.

The room is opaque; the amulet and figure preserve their generated transparent backgrounds. Prior preview assets are retained. All three images were inspected visually. No game tests/builds or push were performed.

## Exact prompts

### stone-room.png

Mode: built-in image generation with local reference input. Transparency: false.

Input: `C:/Users/admin/Documents/Projects/axie-vibeathon-2026/axie-dungeon-crawler/public/assets/prologue/preview-v3/stone-table.png`.

Edit the supplied scene into a DARK ENCLOSED INDOOR ROOM. Preserve the stone table's side-on camera, scale, location and empty tabletop; preserve open space on the right for a separate reaching figure. Replace ALL trees, bushes, outdoor mist, grass and forest scenery with the inside of an ancient stone chamber: faint broad block walls, one understated arch-shaped wall recess and a worn flagstone floor, all fading into deep navy darkness. No view outside, no trees, no open sky, no plants. Crisp simplified 2D cartoon fantasy cutscene art, bold readable shapes, limited two-tone cel shading, deep midnight blue shadows and restrained pale-blue edge highlights. Quiet mysterious mood. No photorealism, no 3D render, no detailed painterly noise. Thin cool edge illumination on the tabletop, overall dim but clear silhouette readability. Less detail than before, hand-drawn cartoon contour lines and simple stone facets. Landscape 16:9. No character, pendant, hand, text, UI or watermarks. This is only a static artwork proposal, not animation.

### moon-amulet.png

Mode: built-in image generation with local reference input. Transparency: true.

Input: `C:/Users/admin/AppData/Local/Temp/codex-clipboard-d3d83ee7-3001-42db-9c98-8806542bcf80.png`.

Use the uploaded necklace icon as a DESIGN reference, not a background to retain. Create a crisp cartoon MOON version of that necklace, isolated on genuine transparent alpha. Keep the handmade dark burgundy-brown cord forming an open oval, the small chunky gold cord beads/clasps and a couple of little gold side charms, with a wrapped brown cord attachment at the bottom. Replace the large central leaf/arrow-shaped pendant with a clearly recognizable chunky GOLD CRESCENT MOON pendant: a clean C-shaped gold crescent with a simple engraved smaller crescent line, warm pale yellow face, ochre side shadow, softly rounded points. Change the two small side charms into tiny gold moon crescents as well. No turquoise jewel. Slightly angled overhead view as a necklace resting on a table; entire cord and all charms in frame with padding. Crisp simplified 2D cartoon fantasy cutscene art, bold readable shapes, limited two-tone cel shading, deep midnight blue shadows and restrained pale-blue edge highlights. Quiet mysterious mood. No photorealism, no 3D render, no detailed painterly noise. Here the gold is warm yellow rather than blue; use dark brown outlines and only two or three flat shading tones. Icon-like, clean, simple, charming and readable. No grey background, no cyan border, no number 10, no text, no square tile, no glow halo or drop shadow. Square composition, transparent outside and inside cord loop.

### horned-girl-silhouette.png

Mode: built-in image generation with local reference input. Transparency: true.

Input: `C:/Users/admin/Documents/Projects/axie-vibeathon-2026/axie-dungeon-crawler/public/assets/prologue/preview-v3/kotaro-silhouette.png`.

Replace the reference figure with a mysterious LONG-HAIRED HORNED GIRL silhouette. Reference is for silhouette rendering, pale rim lighting and reaching-left pose ONLY. Completely change character identity: no Kotaro spiky hair, mask, scarf, sword or male outfit. Crisp simplified 2D cartoon fantasy cutscene art, bold readable shapes, limited two-tone cel shading, deep midnight blue shadows and restrained pale-blue edge highlights. Quiet mysterious mood. No photorealism, no 3D render, no detailed painterly noise. One young adult girl with very long flowing hair down to the calves, two gracefully curved horns rising from her head, a simple loose long-sleeved knee-length robe/dress, small boots. Modest gentle stylized cartoon proportions, a smaller head than the reference and a natural feminine silhouette. FULL BODY, facing LEFT, leaning forward slightly, one arm reaching left to pick up a pendant from an implied waist-high table; hand open in a gentle pinching pose. Other arm relaxed close to body. Her entire body, face and hair are one solid deep-navy near-black silhouette with only a subtle cool-white rim at selected outer edges. NO face, eyes, lips, visible skin, clothing texture or internal hair strands. Long flowing hair and both horns must be unmistakable in the silhouette. Keep a clear hand silhouette separated from the long hair. No pendant, no table, no scenery, no cast shadow, no glow. Single centered full pose with generous padding, genuine transparent alpha background, square canvas.
