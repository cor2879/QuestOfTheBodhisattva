# Quest of the Bodhisattva — The Buried Sanctuary

A playable browser RPG prototype by David Cole, set in The Lion of God universe. Play an Archangel
Bodhisattva exploring cyclopean ruins where captive souls sustain a cosmic
horror. This is original fantasy inspired by esoteric traditions.

Repository: https://github.com/cor2879/QuestOfTheBodhisattva

## Play

Run `python3 tools/build.py`, then open **play.html** in a modern browser. It is a single standalone file, works
offline, and needs neither a server nor a download of external assets.

Begin with the Fortune Teller’s Fivefold Reading, or choose Ariel, Samael,
Raphael, Jophiel, or Lilith directly. Each has different starting vitality,
strike strength, a Monad power, and interpretations of recovered lore. World
seeds recreate initial dungeon geometry, encounters, and shrine offers. Use
**EXPEDITION-2** for a seed on which complete expeditions were verified with all
five Monads, or choose a new random seed.

Explore five strata. Find the astral binding, free its witness, recover an
inscription, and choose a shrine relic before finding the descending stair.
You may descend without clearing every encounter. On the final floor, defeat
Oru or invoke the remembered name at the threshold with at least three liberated
witnesses and three lore fragments from this expedition.

Death ends the expedition. Recovered lore remains in the codex; it does not
grant permanent combat bonuses or satisfy another expedition's ending condition.

## The Fortune Teller · Chapter 0.2

The shuffled five-card deck presents four dilemmas. Choose an action; the
Monad names remain concealed until the reveal. Ten pairings each have two
scenario variants, selected by the reading’s seed. The choices form an
elimination bracket: every Monad can reach the final card, and no answer is
scored as right or wrong. The shuffled bracket also affects the result.

Undo the previous choice, draw another reading, or choose directly. Give your
character a name and accept the reveal to enter the existing five-floor dungeon.
Your name and reading are included in exported saves; earlier AEON DESCENT
saves still load. Browser storage retains the earlier keys for continuity.
The reading seed controls the ceremony, while the world seed controls the dungeon.

This is the first character-building chapter, not yet the Ultima-scale campaign.
The authored overworld, settlements, and quest conversations remain future work.
The card deck and scenario data are separate from dungeon rules for iteration.

## Controls

| Input | Action |
| --- | --- |
| Arrows / WASD | Move; bump a horror to strike |
| E / Enter | Interact on your tile or beside it |
| X | Strike an adjacent horror |
| F | Monad power, costing 4 light |
| H | Drink a restoring tonic |
| Space | Wait one turn |
| Escape | Open help; the world waits while a dialog is open |
| Mouse / touch | Use the on-screen controls |
| Click / tap map | Move into an adjacent tile, or inspect a visible distant tile |

Successful moves and actions give nearby enemies one turn. Blocked movement,
failed actions, inspection, and opening help/codex do not advance time. Reading
an inscription consumes its interaction turn, then pauses for the lore panel.
Choosing a shrine relic consumes a turn after restoring vitality and light.
Enemies do not move on a real-time timer.

## Monads and resources

| Monad | Vitality / strike | Power |
| --- | --- | --- |
| Ariel | 42 / 7 | Verdant Ward restores 5 vitality and halves incoming harm within two steps of the ward for five turns |
| Samael | 38 / 9 | Severance destroys a visible binding within five steps, or burns the nearest visible horror for 16 harm through its ward |
| Raphael | 46 / 6 | Restoring Light restores 15 vitality, clears dread, and shields the next enemy turn |
| Jophiel | 36 / 8 | Revelation explores nearby terrain, stuns visible foes within five steps for two turns, and adds 8 harm to the next strike |
| Lilith | 40 / 8 | Veil of Sovereignty clears dread, shields two enemy turns including the casting turn, and adds 8 harm to the next strike |

Living bindings halve strike harm to warded horrors. Liberating a witness
restores 6 vitality and 4 light; each freed witness also reduces the final
horror's vitality. Defeated horrors restore 3 light; sparks restore 5. Tonics
restore 18 vitality and clear dread. Every two dread reduce strike harm by one.
Descending restores 8 vitality and 4 light and reduces dread by two.

Each shrine offers three seeded choices from six relics: strike strength,
maximum vitality, maximum light, protection, sight, or light recovery.
Relic bonuses can stack. The named Monad gift is a narrative starting item;
starting statistics and the Monad power supply its mechanical identity.

## Saves

The game autosaves after actions when browser storage is available. Save and
Resume are also exposed. Export/import JSON saves to move an expedition between
browsers or file locations. Invalid imports leave the current run intact.
Starting a new expedition replaces the browser's current run, while retaining
the codex. Export first if you want to keep several expeditions.

## Architecture

This is a separate project; Galactic Star Fleet is unchanged. The new game's
rules and renderer are JavaScript and Canvas 2D, rather than the earlier native
Open Sosaria/WebAssembly engine. It retains the browser-first approach and
responsive side-panel arrangement while keeping the procedural rules easy to
change. There are no external runtime dependencies or network requests. Card portraits
are embedded in play.html. Dungeon pixel art is drawn by the renderer. Artwork
sources and generation prompts are documented in assets/ARTWORK.md.

- engine.js: deterministic generation, visibility, turn resolution, enemies,
  patrons, relics, objectives, endings, and save validation.
- fortune.js: seeded five-card reading and twenty scenario variants.
- creation-ui.js: illustrated ceremony, reveal, direct choice, and naming.
- game.js: rendering, keyboard/touch input, lore panels,
  browser persistence, and import/export.
- style.css and template.html: responsive interface.
- play.html: generated standalone deliverable.

The build also emits **index.html** and **art.js** for static hosting with
the separate source and asset files. The repository includes that web entry
point; play.html is generated locally to avoid duplicating all portrait bytes
in Git. GitHub Pages can serve index.html if enabled for this repository.

Rebuild after source edits:

    python3 tools/build.py

Patrons are defined in PATRONS, with their powers in the power resolver and
their narrative perspectives in PATRON_INSIGHTS. Adding a patron requires
entries in both definitions and an implemented power; this is not yet a
generic power scripting system.

## Verification

Run:

    node tests/fortune.cjs
    node tests/engine.cjs
    node tests/expedition.cjs

Reading checks cover 1,920 complete paths, all five outcomes and twenty
dilemmas, undo, named character saves, and Lilith’s shield/strike mechanics.
Browser reading checks exercise every reveal at desktop, landscape touch, and
portrait touch sizes, decode all five illustrations, and resume a named character.

Engine checks cover 1,500 generated floors, connected routes, unique encounter
placements, seeded reproducibility, patron powers, action costs, bindings,
relics, both endings, death, and save round trips. Complete five-floor simulated
expeditions pass with all five Monads on EXPEDITION-2; a Raphael expedition on
EXPEDITION-0 also verifies liberation. These are deterministic regression
playthroughs, not proof that every seed is equally balanced.

Install Playwright and its Chromium browser, then:

    node tests/fortune-browser.cjs
    node tests/browser.cjs
    node tests/journey-browser.cjs

CHROMIUM_EXECUTABLE optionally selects a Chromium binary.
Browser checks cover 1920×1080, 1280×720, 844×390 landscape touch, and 390×844
portrait touch, keyboard/pointer controls, dialogs blocking movement,
save/reload/import, invalid imports preserving the run, and overflow.
Wide layouts keep the game inside the viewport with no page scrolling.
Portrait layouts keep the map visible while scrolling through controls/tools.
Full browser expeditions verify judgment and liberation, codex persistence,
save export, and resuming a completed expedition.

## Prototype scope

Implemented: one five-floor biome, five Monads, six ordinary horror forms
plus Oru, bindings, one witness/inscription/shrine per floor, six relics,
consumables, fog of discovery, two endings, and a persistent lore codex.

Not yet implemented: an overworld, towns, additional biomes or Monads, equipment slots, dialogue
choices beyond relic selection, sound/music, animated artwork, accessibility
for playing the tile map entirely through a screen reader, or a broad campaign.
Difficulty remains an initial pass. Physical iOS/Safari testing remains to be
done; the touch checks use Chromium emulation.
