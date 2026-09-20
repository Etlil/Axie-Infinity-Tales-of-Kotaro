# Kotaro combat poses

User-supplied transparent PNGs, copied unchanged from Downloads:

- `public/assets/kotaro/jump-original.png`: `jump.png`, four airborne frames.
- `public/assets/kotaro/stance-original.png`: `stance.png`, attack-selection and rush pose.
- `public/assets/kotaro/attack-original.png`: `attack.png`, sword-drawn impact pose.

Runtime atlases keep these large originals out of mobile GPU textures. Static poses use a wider frame for the sword and omit the detached marks at the bottom of the source canvas. No image generation was used.

The player has two moves: Slash (20 damage) and Bash (5 damage, 20 shield). Raised platforms and their collisions are enabled only when the opponent is Puffy. Attack selection stops combat simulation while the fighters gently bob; reduced-motion mode disables bobbing and the black flash.
