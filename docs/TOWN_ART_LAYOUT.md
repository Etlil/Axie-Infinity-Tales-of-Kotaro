# Official Atia town map

The supplied artwork is `public/assets/town/atia-official.png` (3072×2048). It renders as a 2304×1536 Phaser world: 48 columns × 32 rows of 48 world pixels. One tile equals 64 original image pixels. Tile centers use `(coordinate + 0.5) × tile size`.

| Landmark | Interaction tile (x, y) | Original image center (px) |
| --- | --- | --- |
| Southern entrance | 22, 29 | 1440, 1888 |
| Save well | 23, 16 | 1504, 1056 |
| Buba’s tent | 11, 12 | 736, 800 |
| Northeast dungeon gate | 37, 7 | 2400, 480 |
| Puffy’s spring | 34, 16 | 2208, 1056 |
| Intro meeting with Buba | 25, 15 | 1632, 992 |

Interaction points deliberately lie on the road in front of each landmark. Buildings, the well, pond, and off-road grass block movement. Road rectangles and building footprints live in `src/game/townLayout.js`; rendering lives in `src/game/townArt.js`. The gate’s center is a passage. Town destinations pathfind around the well and stop beside the building before opening its menu.

The town artwork is a single painted background. Adventure Rank upgrades currently update the tent panel’s stage/rewards; replacing the painted tent itself requires separate matching upgrade artwork. Dungeon scenery remains replaceable shapes.
The approach painting continues below the town as decorative camera padding. The camera can keep Kotaro in the center near the southern entrance, clear of portrait touch controls; the playable road bounds remain in townLayout.js.
