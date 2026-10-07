# Horned girl pickup spritesheet

Generated with the built-in image-generation tool, with genuine transparent alpha. No CLI/API fallback.

- Runtime asset: [girl-pickup-sheet.png](girl-pickup-sheet.png), 1448 × 1086, 12 poses arranged in 4 columns and 3 rows.
- Generated source: C:/Users/admin/.codex/generated_images/01a08ae6-954c-71a3-b794-209d8cec0862/exec-4387d9ff-998b-47fc-beb7-838d947981e4.png. Copied unchanged; original preserved.
- Identity reference: [horned-girl.png](horned-girl.png), the approved short figure.
- Necklace reference: [moon-amulet.png](moon-amulet.png).
- Original artwork provenance and necklace upload: [preview-v4/README.md](preview-v4/README.md).
- Project references: [Axie asset references](../../../docs/ASSET_REFERENCES.md). No external artwork was imported for this sheet.

## Runtime notes

BootScene loads the image under `intro-girl-pickup`. `src/game/introCinematic.js` registers measured rectangles with per-frame boot pivots because the generated gutters are uneven. All poses use the same 1.22 scale; the hair bounds cannot resize or move her feet. Keep the original sheet and adjust `POSES` if replacing artwork.

The girl takes a short step, pauses, anticipates with a small crouch, reaches, grasps the cord, lifts the moon, and settles. The pickup uses poses 3, 5, 4, 6–11 (zero-based): the low crouch precedes the high reach to align the grasp with the tabletop. Poses 6–11 include the necklace. The separate tabletop amulet disappears on entry into pose 6. Motion durations use a 1.6× multiplier. The final hold lasts about two seconds including the completion delay, then IntroScene fades out and holds a completely black screen for five seconds before the movement tutorial. The black-screen timer starts on camerafadeoutcomplete; captions and story controls are hidden during it. The full intro takes about 13.2 seconds including the fade and black-screen hold. Scene-owned animation, timers and tweens pause together. Skip stops pending work and bypasses the five-second hold.

No tests/builds or browser playtesting run for this request; no GitHub push.

## Exact prompt

Use case: stylized-concept
Asset type: production 2D game animation sprite sheet, true transparent background.
Input image 1: approved character identity/proportions/rendering reference. Input image 2: exact gold crescent moon necklace design reference.
Create ONE sprite sheet showing this SAME short chibi horned girl carefully PICKING UP the necklace from an implied table to her left. 12 sequential full-body frames in an exact 4-column by 3-row grid, read left to right then top to bottom. Landscape 4:3 canvas ideally 2048x1536, equal square cells. No visible grid lines, labels, numbers, words, border, scenery, table, floor, shadows or background. All pixels outside characters and the held necklace must be genuine transparent alpha.
Preserve the approved short Kotaro-like proportions: large head, tiny compact torso, VERY short legs, small flat boots, roughly 2.3 heads tall excluding horns. Long flowing hair to calves, two curved horns, loose knee-length robe with wide sleeves. Entire girl is dark midnight-navy silhouette with delicate cool pale-blue/white rim highlights. NO eyes or face details. Consistent side view facing LEFT in EVERY frame, absolutely no rotation toward camera. Same outfit, same horn shape, same scale and ground level in every cell. Fit each complete figure and horns in its cell with at least 8% padding; don't cross cell borders. Keep planted feet around 84% cell height, hips around 64% cell width. Necklace reach is to the left, about 20% cell width at 56% cell height.
Make this a real drawn pose animation, clearly changing arms, knees, head tilt, hair and sleeve shapes, NOT twelve near-identical copies or rotated cutouts.
Frame 1: idle standing, both hands close to body, left boot slightly forward.
Frame 2: one small cautious step forward, one heel raised, hair trails back.
Frame 3: both feet planted, head inclines curiously toward the implied tabletop.
Frame 4: anticipates pickup, knees soften and reaching elbow begins to rise.
Frame 5: torso bends gently forward, arm reaches left, fingers open.
Frame 6: deepest gentle lean, fingers reach all the way left to the implied table surface, fingertips open.
Frame 7: fingers close around the burgundy cord, necklace just begins lifting from implied table.
Frame 8: arm lifts the necklace, wrist and elbow rise, cord droops under gravity; gold crescent hangs below hand.
Frame 9: torso straightens, lifts necklace toward chest height and closer to face.
Frame 10: looks down at the gold crescent suspended from her hand, hair swings softly forward.
Frame 11: shoulders settle, hand stays raised, hair and sleeves follow through, necklace sways slightly.
Frame 12: calm final hold pose, chest-height pendant with clear gold crescent.
Frames 1-6 contain ONLY the girl with empty reaching hand. Frames 7-12 include the SAME small necklace hanging from her fingertips, faithful to image 2: burgundy cord and chunky gold crescent, a couple of small gold fittings. Necklace is small enough to fit fully inside the cell. Warm golden edge light on fingers only in holding frames. No loose duplicated necklace anywhere. No glow halo. Crisp flat cartoon artwork, clean silhouettes, readable distinct poses, uniform frame registration.




