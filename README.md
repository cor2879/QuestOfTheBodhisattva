# Quest of the Bodhisattva — The Lantern Coast

An original browser RPG by David Cole, set in The Lion of God universe.
Repository: https://github.com/cor2879/QuestOfTheBodhisattva

## Chapter 0.9: The Lost Pilgrim

After answering the Listener, ask **Sable near (36,52)** about the missing
pilgrim. An existing journey can start this adventure; no restart is required.
The Road journal gives two generated clue coordinates. Inspect both turquoise
tokens with **E**, then seek the amber pilgrim at the revealed refuge. Return
to Sable after resolving the binding for 45 XP, 20 gold and a tonic if room.
The reward cannot repeat.

This first native quest engine combines six pilgrim names, three bindings, and
three distinct sites selected from six reachable northern clearings. It uses
the new-game seed: revisiting, saving, importing and rescue never reroll it.
The authored Haven and Vesper quests and existing graphics remain unchanged.
Clues can be read in either order; finding the refuge early cannot bypass them.
Listening lets the pilgrim choose a way out, without resources or violence.
Alternatively, spend three Light on your Monad's distinctive intervention:

| Monad | Resolution |
| --- | --- |
| Ariel | Grow a living bridge beyond the binding. |
| Samael | Sever the false covenant, not the pilgrim. |
| Raphael | Heal the wound on which the binding feeds. |
| Jophiel | Reveal the imperfect, beautiful self behind the mirror. |
| Lilith | Open a door without an oath of obedience. |

Both routes award the same reward; the chosen resolution persists separately.
These are narrative resolutions, not five new combat powers or generated maps.
The first engine deliberately uses a verified location pool rather than
unconstrained terrain generation. The second engine, The Broken Sanctuary,
is planned, not included in this release.

`native/quests.c` owns the engine registry, stable seeded layout, clue and
resolution state, markers, dialogue and strict save validation. Save version 7
adds `engines` CSV: seed, engine ID, stage, clue mask, resolution. Older native
saves 1–6 migrate to an unstarted Lost Pilgrim using their coast seed (1 for
pre-coast saves), preserving previous progress. Future engine IDs must supply
their own generation, progression and validators; preserve engine 1's layout
algorithm for saved journeys. Tests prove all five Monad routes, the free route
at zero Light, atomic invalid imports, one-time rewards, mobile/desktop resume,
and deterministic connected sites across 256 seeds.

## Chapter 0.8: Beyond the Lanterns

After answering Haven's Listener, original native actors appear beyond the
established quest roads. Amber travelers wander near (36,52) and (52,52), a
hidden spring waits at (41,29), and a fallen star vessel rests at (49,56).
Violet horrors wander in the southern grasslands, bounded to x31–56/y50–62.
Haven, Vesper, their shrine, and both dungeon approaches remain outside this
encounter area. Actor movement advances every third successful coast step;
idle time, dialogs, town movement and dungeon actions never move them.

Meet Sable or Tessera on their tile or beside them and interact. Their stories
respond to your Monad, the Listener's answer and Vesper's Choir outcome.
Read the spring or inspect the vessel while standing on it. Choices and lore
enter the Road journal, and rewards are one-time:

| Discovery | Choices and rewards |
| --- | --- |
| Sable | Share 10 food (must retain some food): 12 XP and a tonic if room; or mark a safe route: 8 XP. |
| Tessera | Carry remembrance: 10 XP/8 gold; or sanctuary: 10 XP/a tonic if room. |
| Fivefold Spring | First reading: 20 XP, +15 vitality and full Light. Later readings restore Light without XP or healing. |
| Fallen vessel | Salvage: star staff (not auto-equipped), 18 XP/15 gold; or offer 5 gold: 25 XP and full Light. |

Three wandering horrors begin at 24, 32 and 40 vitality. Moving beside one,
or trying to enter its tile, starts a native single-horror duel on the visible
overworld map. Contact itself has no extra cost or opening attack. **F** strikes,
**P** uses any Monad gift, **H** uses a tonic, and **G** escapes safely without
retaliation. Directional movement is paused during the duel. Successful strikes
and gifts cost 0.1 food/one time unit; waiting, changing gear, tonic use and
escape cost 0.05 food/0.5 time. Gifts retain their dungeon rules against the
engaged foe. Staff reach remains a dungeon benefit; both weapons still modify
duel damage. Base incoming harm is 5/7/9, reduced by the robe and ward.

Each defeated horror awards 18 XP/12 gold once. Survivors retain their wounds
after fleeing or rescue. Escape and rescue grant three successful coast steps
without automatic re-engagement. Defeated horrors never respawn in the same
journey. Gear, Light, temporary combat effects, actor positions, journal choices,
and an active duel all survive save/reload. Existing saves keep both quests;
new default spawns are shifted if an older character is standing on their tile.

## Chapter 0.7: The Unwritten Names

Continue an existing journey: after answering the Bound Listener, travel eleven
steps east from Haven to **Vesper (54,40)**. Maera waits in the northern hall.
Hear Neris and Oren, then prepare a public remembrance or a protected vigil.
The **Archive (54,33)** opens seven steps north of the city. Both preparations
lead to the Choir; your final answer may differ from your initial intention.
Return to Maera to complete the quest. The witnesses remember the ending.

Vesper has six original residents, a twilight/memorial palette, free healing and
Light, tonics, food and the same gear economy as Haven. It shares the native
town footprint and upstream movement system; it is not a new browser-side engine.
The first sanctuary remains authored and unchanged. The Archive uses a native
seeded 11×11 maze: depth-first carving, two alternate connections, a reachable
Choir at (9,1), a generated cache, and three stronger horrors (24/28/32 vitality).
All floor cells are connected. Its plan marks the exit, cache, Choir and horrors.
Its seed, encounters, cache and outcome persist independently from the first
sanctuary. New journeys vary; revisits, reloads and rescues never reroll the map.

Vesper rewards: 35 experience once for preparing the city; 12 experience/eight
gold for each horror; 15 gold, a robe and a tonic (if room) from the cache; and
60 experience/25 gold once when reporting the Choir's answer to Maera. Choosing
at the Choir does not itself grant another reward. Public remembrance and a
protected vigil have equal rewards; the branch changes remembered story responses,
not the combat difficulty. All five native Monad gifts work in both dungeons.
Levels five and six now extend growth to 160 and 240 experience.

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
gold for the Listener. The cache also grants a warded robe for you to equip. Return to Meriel for the remembered response.

Dungeon movement and rotation reuse upstream playerDungeon.c; perspective
walls, ladders, chests and vector creatures use upstream dungeonRenderer.c.
Original native C encounter rules replace the disk-dependent original combat.
Successful steps/turns/strikes cost 0.1 food and one time unit. Horrors act only
on successful movement, rotation, attacks, waiting, or tonic use. Each adjacent
horror deals four vitality per action; attacks ahead deal 8 + Strength/5 before equipment, level and gift bonuses.
Blocked movement and attacks without a target spend no turn. The plan at the
bottom shows you in cyan, horrors red, entrance gold, cache green, Listener
violet. Idle time never advances combat. At zero vitality or food, E recalls
you to Haven with at least 50 vitality/20 food for up to ten gold, keeping all progress.
Monad powers, equipment and levels are active in both dungeons and native trail
duels. The Archive is the first procedural floor; deeper floors, larger regions
and party combat remain future work.

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
- F / Strike ahead: attack a horror in your weapon’s forward reach.
- P / Monad gift: spend three Light to use your spiritual gift.
- G / Escape duel: withdraw without retaliation; the horror keeps its wounds.
- Equipment: choose owned gear; Iona sells it and the cache grants a robe.
- R / Release or B / Ward: choose at the Listener’s chamber; remember or shelter
  the Choir in the Archive.
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
a supply warning. Rescue preserves your character, quests and both dungeon states.
The overworld and first sanctuary are authored. The Archive has a saved native
seed derived from each new journey; older saves begin with Archive seed one.

## Automatic builds and phone testing

GitHub Actions rebuilds the C/WebAssembly game with Emscripten 6.0.10 on each
push to main. It runs the Fortune Teller, overworld, Haven, sanctuary, Vesper/Archive, and
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

## Native gifts, equipment and growth

All powers cost **3 Light**. Use P or the named touch button. Effects advance
only on successful enemy turns; idle time and blocked moves do not consume them.
A three-turn protection or stun includes its casting turn and two further turns.

| Monad | Gift | Effect |
| --- | --- | --- |
| Ariel | Verdant Ward | Heal 5 vitality; halve incoming harm for three enemy turns. |
| Samael | Severance | Hit a horror up to three cells straight ahead through a clear passage for 16 + 2 × level harm. |
| Raphael | Restoring Light | Heal 30 + 2 × level vitality; halve harm on the casting turn in a dungeon. Can heal outside. Requires a wound. |
| Jophiel | Revelation | Stun living horrors within three cells for three turns; add 4 + level to the next strike. |
| Lilith | Veil of Sovereignty | Still horror movement/attacks for three turns; the next strike breaks the veil and adds 8 + level harm. |

Ariel, Samael, Jophiel and Lilith use their gifts in the dungeon. Resting outside
it restores one Light per waiting turn. The shrine and Tavian restore full Light.
Gaining a level also refills Light. Vitality remains capped at 100.

| Level | Total experience required | Light capacity | Extra strike damage |
| --- | --- | --- | --- |
| 1 | 1 | 8 | 0 |
| 2 | 25 | 10 | 2 |
| 3 | 60 | 12 | 4 |
| 4 | 100 | 14 | 6 |
| 5 | 160 | 16 | 8 |
| 6 | 240 | 18 | 10 |

Level six is this chapter's cap. Level is derived from native experience, so
older completed journeys receive their earned level on import/resume.

| Equipment | Cost | Effect |
| --- | --- | --- |
| Inner light / travel clothes | Starting equipment | Strike reach one; no armor reduction. |
| Pilgrim blade | 25 gold | +4 strike harm; reach one. |
| Star staff | 30 gold | +1 strike harm; reach two through a clear passage. |
| Warded robe | 20 gold, or the unopened sanctuary cache | Reduce each attacking horror's harm by one, before a ward halves the combined harm. |

Purchases equip the item immediately. Each item can be bought only once. Use
Equipment to switch owned weapons/clothes. A dungeon equipment change costs a
waiting turn and lets horrors act; changing gear in town/on the coast is free.
Temporary effects clear on exiting the dungeon or rescue; gear and Light persist.

Native save version six adds the independent coast payload: roaming positions,
living/dead/wounded horrors, active duel, cooldown and discovery choices.
Versions one through five upgrade automatically, retaining both chapters and
equipment/Light when present. Active duel effects are validated with the encounter
before either is restored. Invalid imports leave the current journey untouched.

Native save version five added Vesper's testimony, preparation and ending, plus
the independent Archive seed/encounter/cache state. Versions one through four
upgrade without resetting the character or either existing quest. Version four
keeps Light and equipment; earlier versions receive full Light and starting gear.
Invalid chapter, progression, or scene imports are validated before any mutation.

Native save version four added Light, owned/equipped gear and temporary effects.
Versions one through three upgrade with full Light and starting gear; their
character, experience, quests and dungeon progress are retained. A cache already
opened in an older version keeps its prior rewards; Iona can sell the new robe.
Invalid progression imports leave the current journey untouched.

## Source and build

Install and activate Emscripten (this checkpoint uses 6.0.10), then run:

    python3 tools/build.py

That compiles native/web/quest.js, writes index.html, and embeds an offline
play.html. The generated native runtime is tracked for immediate play;
play.html is ignored because it duplicates all portrait bytes.

The older prototype can be rebuilt separately with:

    python3 tools/build-legacy.py

- native/opensosaria/src: upstream source, including retained unported systems.
- native/progression.c and progression.h: original native levels, Light, equipment
  and validated growth/effect persistence in the upstream Player structure.
- native/town.c and town.h: Haven map, residents, native dialogue/quest state.
- native/chapter.c and chapter.h: Vesper's original residents, testimony,
  branching preparation, remembered ending and one-time return reward.
- native/trail.c and trail.h: original coast actors/sprites, wandering rules,
  intentional-turn duels, discoveries, rewards and validated trail persistence.
- native/quest.c: original content/data loader, native player initialization,
  browser API, and frame loop.
- native/dungeon.c and dungeon.h: original sanctuary, seeded Archive generation,
  perspective data, encounters, choices and validated persistence.
- native/art.c and art-dungeon.c: embedded original atlases and textured presentation
  using native dungeon perspective/visibility tables.
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

The Lantern Coast now uses the first production VGA-inspired art pass: original
28×32 source tiles, a 560×384 drawing buffer, readable ivory/amber characters,
distinct wandering horrors, turquoise discoveries, and gold-lit landmarks.
Visible paths connect the existing quest locations with normal walking costs.
The logical map and save version remain unchanged. The second art pass brings
warm stone, wood, flowers and a temple mosaic to Haven, with cooler slate and
violet memorial paving in Vesper. Six distinct resident outfits and a larger
player billboard share the existing town collision grid.

Dungeon interiors now show shaded masonry, perspective flagstones, original
horror sprites, supply chests, gold exit steps, and the benevolent Listener/Choir.
Open Sosaria's native perspective tables and map control visibility; walls
occlude sprites. This changes presentation, not dungeon generation, combat or
quest rules. Existing native saves load directly.

The editable atlas, mapping, generation specifications and build workflow are in
native/assets/ARTWORK.md. Pixel data is embedded in the runtime, so Pages and
the offline build need no image-fetch initialization. Local original-content
engine adaptations scale texture coordinates and the drawing buffer while
preserving the native camera and collision dimensions. Card provenance and
prompts are in assets/ARTWORK.md. No fan texture pack has been added.

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
versions 1 and 2 upgrade automatically. Version 4 adds the progression payload. `node tests/dungeon-browser.cjs` checks
all five Monads, both outcomes, native navigation/attacks, once-only rewards,
blocked movement, dungeon reload, corrupt payload rollback, exit/reentry,
rescue, and desktop/landscape/portrait layouts.
`node tests/growth-browser.cjs` exercises all five gifts, costs, effect expiry,
active-effect reload, equipment transactions and combat, native level boundaries,
old-save upgrades and invalid progression rollback.
`node tests/vesper-browser.cjs` checks 128 native seeds for connected, bounded,
repeatable maps and non-overlapping cache/horrors. It follows the new quest with
all five Monads through native town movement, both witnesses, both preparations,
both endings (including changing one's mind), combat, cache, return reward,
scene-3/scene-4 save/reload, invalid-import rollback and rescue from both scenes.
Desktop, landscape and portrait layouts are checked.
`node tests/trail-browser.cjs` covers both contact routes, all five combat gifts,
active-effect reload, escape, equipment/tonic costs, death and food exhaustion,
rescue preserving wounds, repeatable roaming, invalid trail imports, old saves
standing on new spawn tiles, every discovery branch, one-time rewards, remembered
lore and the saved journal. Screenshots are decoded in the browser to confirm
that native horror, traveler and discovery markers actually render.
Chapters 0.6 and 0.7 have passed the user's playtests; Chapter 0.8 needs that check.

Earlier dungeon checks remain available:

    node tests/engine.cjs
    node tests/fortune.cjs
    node tests/expedition.cjs
    node tests/browser.cjs
    node tests/fortune-browser.cjs
    node tests/journey-browser.cjs

## Next native milestones

1. Expand the native dungeon into procedural floors and richer encounters.
2. Add more equipment, spells and meaningful loot.
3. Extend Monad abilities and quest consequences throughout the persistent world.
4. Extend the single-character foundation into party/tactical combat.
