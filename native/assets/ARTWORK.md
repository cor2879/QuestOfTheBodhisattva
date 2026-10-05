# Lantern Coast production art — pass 1

Original artwork for Quest of the Bodhisattva. Generated with the built-in
image-generation tool, using the approved Lantern Coast visual study as a
reference. No Ultima textures, sprites, or fan asset packs are included.

## Art direction / prompt specifications

The initial study specified a VGA-era, flat overhead coastal RPG scene with
muted jade grass, pine woodland, indigo sea, slate ruins, an ivory/gold pilgrim,
an amber traveler, a gold-lit sanctuary, turquoise relic, and violet cyclopean
horror. It was a visual reference, not an engine screenshot.

The production prompt requested an exact four-column, four-row square atlas,
no gutters or labels, coarse pixel clusters, readable silhouettes, two opaque
terrain rows and two transparent sprite rows. The sixteen cells are listed
below. The terrain revision requested quiet, darker sage/jade grass without
dark tufts, restrained navy water with two teal wavelets, muted ochre paths,
and unchanged structures and sprite identities. This revision followed actual
phone/desktop rendering inspection; the first texture was too busy when tiled.

The generated atlas was mechanically sliced on its regular cell boundaries
and packed into 28×32 source pixels per cell with nearest-neighbor sampling.
The path's usable interior was packed across the cell width so paths connect
in either direction. Terrain is opaque; sprite alpha is thresholded to binary
for the native shader. The final sprite rows retain the first production draft.
`lantern-atlas.png` is the editable production source; `tools/compile-art.py`
compiles its pixels into the committed C header without changing their colors.

## Atlas mapping

| Cell | Content | First-pass use |
|---|---|---|
| 0 | Water | Overworld terrain 0 |
| 1 | Grass | Overworld terrain 1 |
| 2 | Pine woodland | Overworld terrain 2 |
| 3 | Mountain | Overworld terrain 3 |
| 4 | Path | Passable coast routes |
| 5 | Shrine | Shrine landmark |
| 6 | Town gate | Haven / Vesper landmarks |
| 7 | Sanctuary arch | Sanctuary / Archive landmarks |
| 8 | Ivory pilgrim | Shared overworld player sprite |
| 9 | Amber traveler | Sable / Tessera |
| 10 | Spring | Fivefold Spring |
| 11 | Relic pedestal | Fallen vessel |
| 12 | Veil scavenger | First wandering horror |
| 13 | Cyclopean wanderer | Second wandering horror |
| 14 | Hollow sentinel | Third wandering horror |
| 15 | Ruined pillar | Reserved for subsequent content |

## Engine contract

Native map cells remain 14×16 logical units. The drawing buffer is 560×384,
with the same 280×192 camera, so each source art pixel renders distinctly.
Nearest-neighbor texture filtering and CSS pixel rendering are retained.
Higher artwork resolution changes no movement, collision, camera framing,
food costs, save format, or quest positions. Paths use the already passable
native terrain ID 4 and have normal walking costs. Grass orientation varies
deterministically to reduce repetition.

World terrain, the player and trail objects share the same source sheet.
At pass 1, town interiors and perspective dungeon art retained the previous
graphics. Pass 2 below extends this style without changing scene sizes or rules.
Neither art pass adds procedural quests.

To edit: change `lantern-atlas.png`, run `python3 tools/compile-art.py` with
Pillow installed, then rebuild normally. The header is committed, so CI and
normal builds require no new imaging dependency or network asset requests.
The runtime embeds artwork and still works in the offline HTML build.

# Interior art — pass 2

The approved overworld artwork is retained. `interior-atlas.png` extends its
palette and character proportions, generated with the built-in image tool.
The production prompt specified an exact 4×4 sheet, 28×32 logical source cells,
quiet opaque top-down floor/wall textures in the first two rows and transparent,
front-facing full-body resident/object sprites in the last two rows. Requested
subjects: slate masonry, flagstones, wood planks, gold temple mosaic, flower
garden, violet memorial stone, dark dungeon masonry/floor, six resident
archetypes, a supply chest with turquoise clasp, and a benevolent bound memory.
The sheet was packed mechanically with nearest-neighbor sampling and binary
alpha; the generated header's SHA256 records the editable PNG it compiles.

| Cell | Content | Use |
|---|---|---|
| 0 | Slate masonry | Town walls |
| 1 | Warm flagstones | Haven paths / clinic / hall |
| 2 | Wood planks | Homes / outfitter |
| 3 | Gold temple mosaic | Haven's central temple floor |
| 4 | Flower garden | Haven southeast garden |
| 5 | Violet memorial paving | Vesper paths / memorial / hall |
| 6 | Dark stone masonry | Dungeon walls |
| 7 | Dark flagstones | Perspective dungeon floor / dim ceiling |
| 8 | Ivory/gold keeper | Meriel / Maera |
| 9 | Teal healer | Tavian / Thalen |
| 10 | Plum outfitter | Iona / Ysra |
| 11 | Russet witness | Caldus / Neris |
| 12 | Green gardener | Senna / Oren |
| 13 | Blue cartographer | Aster / Ilyan |
| 14 | Supply chest | Pilgrim caches |
| 15 | Benevolent memory | Listener / Choir chamber |

Town backgrounds are 560×384 textures covering the existing 280×192 camera.
NPCs and the player draw as 10×12 logical billboards, centered over the same
7×7 collision cells and anchored to the cell's bottom. Billboards sort by their
feet so adjacent characters overlap naturally. Larger drawn bodies do
not block extra tiles or change interaction range. Vesper's original layout
receives a cooler palette and memorial paving; Haven has the warmer mosaic
and flowers. South gates, resident coordinates and all conversations remain.

`native/art-dungeon.c` adds original textured surfaces and sprites to upstream
Open Sosaria's dungeon renderer. Its native perspective tables determine wall
polygons, shading and visible cells. Walls hide sprites behind them; objects
are composited from far to near after stone surfaces. The three horrors reuse
the overworld designs. A collected cache disappears. A benevolent memory marks
the goal chamber; gold steps mark the current exit cell. The original minimap
colors remain. Original-content builds bypass Apple II artifact coloring and
wireframe creatures; non-original upstream builds retain their existing path.
Movement, collision, turn costs, rewards, seeded layouts and save format are
unchanged. No WebGL scene library or separate JavaScript dungeon engine was
introduced. Artwork remains embedded in the runtime and offline HTML.

`tools/compile-art.py` now compiles both atlases. Normal native/CI builds consume
the committed headers and require no imaging dependency or external image load.
Browser verification covers both town palettes, real dungeon sprite rendering,
wall occlusion, cache removal, exit visibility, and save/resume, alongside the
existing complete quest, combat, equipment, rescue and generated-Archive tests.
