"""Stage only browser files for GitHub Pages, preserving relative asset URLs."""
from pathlib import Path
import json, os, shutil
root=Path(__file__).resolve().parents[1]
out=root/'build'/'pages'
if out.exists(): shutil.rmtree(out)
out.mkdir(parents=True)
files=['index.html','style.css','monads.js','fortune.js','art.js','creation-ui.js',
       'native-host.js','engine.js','game.js','native/web/quest.js',
       'legacy/index.html','legacy/art.js']
files += [f'assets/{name}.png' for name in ['ariel','samael','raphael','jophiel','lilith']]
for name in files:
    target=out/name
    target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(root/name,target)
(out/'.nojekyll').touch()
(out/'build-info.json').write_text(json.dumps({'commit':os.environ.get('GITHUB_SHA','local'),
    'run':os.environ.get('GITHUB_RUN_ID','local')},indent=2)+'\n')
print(f'Staged {len(files)} browser files in {out}')
