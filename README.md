# Quest of the Bodhisattva — The Lantern Coast

An original browser RPG by David Cole, set in The Lion of God universe.
Repository: https://github.com/cor2879/QuestOfTheBodhisattva

## Chapter 0.3: Open Sosaria migration

The primary browser build now runs Open Sosaria's native C overworld systems,
compiled to WebAssembly/WebGL 2. The Fortune Teller's four-choice reading
reveals one of five Monads and initializes a native player on the Lantern Coast.

This milestone establishes the engine handoff, overworld travel, original
terrain, and native character state. Town interiors, dungeon exploration,
encounters, active Monad powers, and party combat have not yet been adapted.
Haven, the shrine, and the Buried Sanctuary have map markers with introductory
messages. Their doors are not presented as completed areas.

The earlier five-floor JavaScript dungeon remains playable at
**legacy/index.html**, with its separate save format and original rules.
Its powers and encounter mechanics are not yet available in the native build.

## Play

Open **index.html** from a local checkout or static host. Its WebAssembly bytes
are embedded in native/web/quest.js, so it does not fetch a separate Wasm file.
WebGL 2 must be available. No Ultima disks or extracted game assets are needed.

For the standalone downloadable build, open **play.html**. It embeds the card
portraits, UI, and native runtime and works offline without a server.

- Arrows / WASD or the touch pad: move one step.
- E / Enter or Interact: read the current location's introduction.
- Space or Wait: spend a waiting turn.
- Save / Resume / Export / Import: keep a native journey and its character reading.
- New reading: begin another journey, or cancel to keep playing.

Haven lies three steps east of the starting point (40,40). The shrine is at
(47,35), and the sanctuary at (51,47). Grass and forest are passable. Water
requires a vessel, and mountains block travel. Vehicles are not purchasable
in this milestone. Nothing advances while idle or while the ceremony is open.

Each successful walking step consumes 0.5 food and advances native time by 1.
Waiting consumes 0.05 food and advances time by 0.5. Failed movement consumes
neither. Exhausted journeys can still be saved and resumed; start another
reading to travel again. The world currently has a fixed authored layout;
the Fortune Teller's shuffled reading supplies the ceremony's variation.

## Native starting characters

Each Monad starts with 100 vitality, 100 food, 50 gold, and one experience.
Attributes are stored in Open Sosaria's Player structure.

| Monad | Strength | Agility | Stamina | Charisma | Wisdom | Intelligence |
| --- | --- | --- | --- | --- | --- | --- |
| Ariel | 14 | 16 | 20 | 14 | 18 | 14 |
| Samael | 20 | 18 | 16 | 14 | 14 | 16 |
| Raphael | 14 | 14 | 20 | 16 | 18 | 18 |
| Jophiel | 12 | 16 | 14 | 18 | 18 | 20 |
| Lilith | 14 | 20 | 14 | 18 | 16 | 16 |

The UI retains your 24-character name and reading. The upstream native player
name field retains its 15-byte limit. Native and earlier dungeon saves are
separate; importing a dungeon save into this milestone is rejected.

## Source and build

Install and activate Emscripten (this checkpoint uses 6.0.10), then run:

    python3 tools/build.py

That compiles native/web/quest.js, writes index.html, and embeds an offline
play.html. The generated native runtime is tracked for immediate play;
play.html is ignored because it duplicates all portrait bytes.

The older prototype can be rebuilt separately with:

    python3 tools/build-legacy.py

- native/opensosaria/src: upstream source, including retained unported systems.
- native/quest.c: original content/data loader, native player initialization,
  browser API, and frame loop.
- native/Makefile: explicit sources entering the browser build.
- native-host.js: Fortune Teller handoff, controls, native stats, and saves.
- monads.js: ceremony metadata and deterministic reading RNG, not world rules.
- fortune.js / creation-ui.js: illustrated reading and selection UI.
- assets: five card portraits and original reference artwork.
- legacy/index.html and engine.js/game.js: previous dungeon prototype.

The active world uses upstream worldMap.c for map geometry and rendering,
playerOverworld.c for movement/collision/camera/player rendering, and player.c
for resource/time rules and the Player structure. The original disk loader,
Ultima strings, maps, enemy data, font/audio binaries, and original-game scenes
are excluded from the compiled milestone. An original atlas and original map
tables supply the native interfaces instead.

## Provenance and local engine changes

Open Sosaria upstream: https://github.com/delcodigo/open-sosaria
Pinned base: 578828dc506dc9d3dd6931783ab66e1849642bad
MIT license: native/opensosaria/LICENSE

The upstream source is vendored at a pinned checkpoint; this repository is
not represented as a GitHub fork. Local adaptations include WebGL/GLES headers,
shaders, the browser frame loop, original content loading, a declaration exposing
native movement, and wrapped destination lookup before indexing region and
vehicle tables. That lookup fixes negative and cross-region coordinate access.

The new tile atlas is generated from original small pixel patterns in quest.c.
It is a placeholder art pass. Card provenance and prompts are in
assets/ARTWORK.md. No fan texture pack has been added.

## Verification

With Playwright/Chromium installed:

    node tests/native-browser.cjs

CHROMIUM_EXECUTABLE can select a browser binary. Native browser tests cover a
complete reading, all five character presets, native movement and food/time
costs, location introductions, both region seams, terrain blocking, dialogs
preventing actions, saves across reload, invalid imports preserving the current
journey, exhausted saves, and desktop/landscape/portrait layouts. Both the web
entry and standalone HTML are exercised. Physical Safari/iOS testing remains.

Earlier dungeon checks remain available:

    node tests/engine.cjs
    node tests/fortune.cjs
    node tests/expedition.cjs
    node tests/browser.cjs
    node tests/fortune-browser.cjs
    node tests/journey-browser.cjs

## Next native milestones

1. Adapt a town interior with named conversations and a keeper quest.
2. Replace the native item/spell/data tables with original definitions.
3. Adapt the dungeon and encounter systems into the same native save/world state.
4. Add active Monad abilities and consequences to the persistent world.
5. Extend the single-character foundation into party/tactical combat.
