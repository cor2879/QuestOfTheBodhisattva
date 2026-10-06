"""Build native Open Sosaria web runtime, then create an offline single-file preview."""
from pathlib import Path
import subprocess,base64,re,os
root=Path(__file__).resolve().parents[1]
subprocess.run(['make','-C',str(root/'native')],check=True)
html=(root/'native/template.html').read_text()
(root/'index.html').write_text(html)
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+(root/'style.css').read_text()+'</style>')
for name in ['monads.js','fortune.js','art.js','creation-ui.js','music.js','native-host.js','native/web/quest.js']:
 text=(root/name).read_text()
 if name=='music.js':
  for track in ['title','town','coast','dungeon']:
   text=text.replace('assets/music/'+track+'.mp3','data:audio/mpeg;base64,'+base64.b64encode((root/'assets/music'/f'{track}.mp3').read_bytes()).decode())
 if name=='art.js':
  for monad in ['ariel','samael','raphael','jophiel','lilith']:
   text=text.replace('assets/'+monad+'.png','data:image/png;base64,'+base64.b64encode((root/'assets'/f'{monad}.png').read_bytes()).decode())
 text=re.sub('</script',r'<\\/script',text,flags=re.I)
 html=html.replace(f'<script src="{name}"></script>',f'<script>{text}</script>')
(root/'play.html').write_text(html)
print('Built native index.html and offline play.html')
