# Venomous Press arcade integration

Game page: https://venomouspress.com/pages/quest-of-the-bodhisattva

The published page embeds the GitHub Pages build on demand, offers separate-tab and full-screen play, and labels this edition as a playable work in progress. game-page.html records the published page body.

vp-arcade-hub.liquid is the prepared hub change: adds one Quest of the Bodhisattva cabinet using the approved Lantern Coast concept art and updates the count to eight. It has not yet been applied to the live theme. Re-read the live section before applying so concurrent edits are preserved.

GitHub Actions workflow: Browser build and deploy. Run it on main if a connector commit does not automatically trigger a push build. Publishing requires a successful native rebuild, regression suite, Pages checks, and actual soundtrack playback checks.

Soundtrack controls are in music.js; playback mappings and attribution are in assets/music/README.md. The standalone build embeds all four tracks.
