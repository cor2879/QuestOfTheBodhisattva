# Quest of the Bodhisattva — The Lantern Coast

An original browser RPG by David Cole, set in The Lion of God universe.
Repository: https://github.com/cor2879/QuestOfTheBodhisattva

## Chapter 0.5: The Bound Listener

The primary browser build now runs Open Sosaria's native C overworld systems,
compiled to WebAssembly/WebGL 2. The Fortune Teller's four-choice reading
reveals one of five Monads and initializes a native player on the Lantern Coast.

The native overworld now connects to Haven's original town interior. Meet six
residents: Meriel the keeper, Tavian the healer, Iona the outfitter, Caldus the
witness, Senna the gardener, and Aster the traveler. Stand beside a resident
and interact to converse. The south gate returns to the same overworld tile.

Meriel's Fading Light quest asks you to investigate the northeast shrine and
the southeast sanctuary's surface inscription, then return to Haven. Choose
a listening vigil or a guarded expedition. Both choices complete the quest,
award 25 experience and 30 gold once, and preserve the town's response.
Exploring the inscriptions before accepting the quest is supported.

Tavian offers free healing and tonics for 10 gold (pouch limit five). Iona gives
first provisions once, then sells 20 food for 5 gold, capped at 100. Conversations
and transactions do not advance time; town movement uses upstream food/time
rules. After the investigation, interact with the sanctuary stone to enter a
native first-person labyrinth. Three cyclopean veil horrors guard its passages.
Find the cache at (3,3), then the Listener at (9,1). Release its name or offer a
protective ward; each Monad supplies a different interpretation. Rewards are
once only: 12 XP/8 gold per horror, 15 gold/one tonic from the cache, and 40 XP/20
gold for the Listener. Return to Meriel for the remembered response.

Dungeon movement and rotation reuse upstream playerDungeon.c; perspective
walls, ladders, chests and vector creatures use upstream dungeonRenderer.c.
Original native C encounter rules replace the disk-dependent original combat.
Successful steps/turns/strikes cost 0.1 food and one time unit. Horrors act only
on successful movement, rotation, attacks, waiting, or tonic use. Each adjacent
horror deals four vitality per action; attacks ahead deal 8 + Strength/5.
Blocked movement and attacks without a target spend no turn. The plan at the
bottom shows you in cyan, horrors red, entrance gold, cache green, Listener
violet. Idle time never advances combat. At zero vitality or food, E recalls
you to Haven with at least 50 vitality/20 food for up to ten gold, keeping all progress.
Active Monad abilities, procedural floors, equipment and party combat are future work.

The earlier five-floor JavaScript dungeon remains playable at
**legacy/index.html**, with its separate save format and original rules.
Its powers and encounter mechanics are not yet available in the native build.

## Play

Open **index.html** from a local checkout or static host. Its WebAssembly bytes
are embedded in native/web/quest.js, so it does not fetch a separate Wasm file.
WebGL 2 must be available. No Ultima disks or extracted game assets are needed.

For the standalone downloadable build, open **play.html**. It embeds the card
portraits, UI, and native runtime and works offline without a server.

- Arrows / WASD or the touch pad: move one step on the coast/in town.
  In the dungeon: up goes forward, left/right turn, down turns around.
- E / Enter or Interact: enter Haven, read an inscription, or talk beside a resident.
- F / Strike ahead: attack an adjacent horror you face.
- R / Release or B / Ward: choose at the Listener’s chamber.
- Space or Wait: spend a waiting turn.
- H or Tonic: restore 25 vitality, spending one tonic and a waiting turn.
- Save / Resume / Export / Import: keep a native journey and its character reading.
- New reading: begin another journey, or cancel to keep playing.

Haven lies three steps east of the starting point (40,40). The shrine is at
(47,35), and the sanctuary at (51,47). Grass and forest are passable. Water
requires a vessel, and mountains block travel. Vehicles are not purchasable
in this milestone. Nothing advances while idle or while the ceremony is open.

Each successful walking step consumes 0.5 food and advances native time by 1.
Town steps consume 0.01 food and advance time by 0.1.
Waiting consumes 0.05 food and advances time by 0.5. Failed movement consumes
neither. Exhausted journeys can still be saved and resumed. Interact or use Rescue to
Haven to recover anywhere, including the coast and town, even with no gold.
Food and vitality remain visible beside the map; food at ten or below triggers
a supply warning. Rescue preserves your character, quests and dungeon state. The world currently has a fixed authored layout;
the Fortune Teller's shuffled reading supplies the ceremony's variation.

## Automatic builds and phone testing

GitHub Actions rebuilds the C/WebAssembly game with Emscripten 6.0.10 on each
push to main. It runs the Fortune Teller, overworld, Haven, sanctuary, and
project-prefix browser checks before publishing the staged site to GitHub Pages.
Pull requests run the same checks without deploying. The Actions tab also offers
**Run workflow** for a manual rebuild. Each successful build retains an offline
play.html artifact for fourteen days.

Live test link: https://cor2879.github.io/QuestOfTheBodhisattva/
Workflow: .github/workflows/browser.yml

Repository Settings → Pages → Build and deployment → Source must be
**GitHub Actions**. A failed build leaves the previous deployed game available.
Open the live link on your phone; native touch buttons are already included.
Browser saves belong to the device/browser/site where they were created. Use
Export/Import to transfer a character from a desktop or offline build.

The deployed build-info.json records its commit and workflow run. Only browser
runtime files and the five card portraits are staged; source and reference
artwork remain in the repository. To check staging locally:

    npm ci
    npx playwright install chromium
    python3 tools/stage-pages.py
    npm run test:pages

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
- native/town.c and town.h: Haven map, residents, native dialogue/quest state.
- native/quest.c: original content/data loader, native player initialization,
  browser API, and frame loop.
- native/dungeon.c and dungeon.h: original sanctuary map, perspective data, horror
  vector artwork, encounters, choices, and validated persistence.
- native/Makefile: explicit sources entering the browser build.
- native-host.js: Fortune Teller handoff, controls, native stats, and saves.
- monads.js: ceremony metadata and deterministic reading RNG, not world rules.
- fortune.js / creation-ui.js: illustrated reading and selection UI.
- assets: five card portraits and original reference artwork.
- legacy/index.html and engine.js/game.js: previous dungeon prototype.

The active world uses upstream worldMap.c for map geometry and rendering,
playerOverworld.c for movement/collision/camera/player rendering, and player.c
for resource/time rules and the Player structure. Haven reuses playerTown.c for native movement, collision requests, gate exits,
and player rendering; native/town.c supplies the original map, resident
collision, scene transition adapter, conversation choices, and quest rules.
The original disk loader,
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
vehicle tables. That lookup fixes negative and cross-region coordinate access. Dungeon movement
has a one-action entry point that omits idle auto-pass. Renderer tile reads are
bounded, its terminal perspective row is protected, and distance-zero enemy
height indexing is safe. In original-content builds, rendering does not replace
the latest action message. All dungeon tables and creature outlines are original.

The new tile atlas is generated from original small pixel patterns in quest.c.
It is a placeholder art pass. Card provenance and prompts are in
assets/ARTWORK.md. No fan texture pack has been added.

## Verification

With Playwright/Chromium installed:

    node tests/native-browser.cjs
    node tests/haven-browser.cjs

CHROMIUM_EXECUTABLE can select a browser binary. Native browser tests cover a
complete reading, all five character presets, native movement and food/time
costs, location introductions, both region seams, terrain blocking, dialogs
preventing actions, saves across reload, invalid imports preserving the current
journey, exhausted saves, and desktop/landscape/portrait layouts. Both the web
entry and standalone HTML are exercised. Haven checks exercise six conversations and both quest outcomes across three
viewport sizes, town save/reload, atomic invalid imports, provisions, tonic
purchases, single rewards, and upgrading earlier native saves. Town positions,
quest flags, supplies, tonics, gold, and experience are saved. Version 3 also
stores dungeon facing, cache, enemy positions/health, and the Listener outcome;
versions 1 and 2 upgrade automatically. `node tests/dungeon-browser.cjs` checks
all five Monads, both outcomes, native navigation/attacks, once-only rewards,
blocked movement, dungeon reload, corrupt payload rollback, exit/reentry,
rescue, and desktop/landscape/portrait layouts.
Physical Safari/iOS testing remains.

Earlier dungeon checks remain available:

    node tests/engine.cjs
    node tests/fortune.cjs
    node tests/expedition.cjs
    node tests/browser.cjs
    node tests/fortune-browser.cjs
    node tests/journey-browser.cjs

## Next native milestones

1. Expand the native dungeon into procedural floors and richer encounters.
2. Replace native equipment/spell tables with original definitions.
3. Add active Monad abilities and further consequences to the persistent world.
4. Extend the single-character foundation into party/tactical combat.
