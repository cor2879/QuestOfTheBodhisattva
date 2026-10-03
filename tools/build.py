"""Build the offline, dependency-free browser deliverable."""
from pathlib import Path
import base64, json
root = Path(__file__).resolve().parents[1]
html = (root / "template.html").read_text()
web = html.replace('<style>/* STYLE */</style>', '<link rel="stylesheet" href="style.css">')
for marker, name in [("ENGINE", "engine.js"), ("FORTUNE", "fortune.js"), ("ART", "art.js"), ("CREATION", "creation-ui.js"), ("GAME", "game.js")]:
    web = web.replace('<script>/* ' + marker + ' */</script>', '<script src="' + name + '"></script>')
(root / "index.html").write_text(web)
for marker, name in [("/* STYLE */", "style.css"), ("/* ENGINE */", "engine.js"), ("/* FORTUNE */", "fortune.js"), ("/* CREATION */", "creation-ui.js"), ("/* GAME */", "game.js")]:
    assert html.count(marker) == 1
    source = (root / name).read_text()
    if name.endswith(".js"):
        assert "</script" not in source.lower()
    html = html.replace(marker, source)
art = {name: {"src": "data:image/png;base64," + base64.b64encode((root / "assets" / (name + ".png")).read_bytes()).decode()} for name in ("samael", "raphael", "jophiel", "ariel", "lilith")}
(root / "art.js").write_text("globalThis.MONAD_ART=" + json.dumps({name: {"src": "assets/" + name + ".png"} for name in art}) + ";\n")
assert html.count("/* ART */") == 1
html = html.replace("/* ART */", "globalThis.MONAD_ART=" + json.dumps(art) + ";")
(root / "play.html").write_text(html)
print("Built", root / "play.html")
