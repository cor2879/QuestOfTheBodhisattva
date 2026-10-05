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
Town interiors, town residents, and perspective dungeon art still use the
previous original graphics and are the next art work, rather than silently
changing the game's scene sizes or rules. This pass adds no procedural quests.

To edit: change `lantern-atlas.png`, run `python3 tools/compile-art.py` with
Pillow installed, then rebuild normally. The header is committed, so CI and
normal builds require no new imaging dependency or network asset requests.
The runtime embeds artwork and still works in the offline HTML build.
