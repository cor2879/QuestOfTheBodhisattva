/* Scene music is independent of the turn clock and saved journey. */
'use strict';
const QuestMusic=(()=>{
 const tracks={
  title:{url:'assets/music/title.mp3',name:'Quest of the Bodhisattva Title'},
  town:{url:'assets/music/town.mp3',name:'RPG MAIN 1 · Andrew Cole'},
  coast:{url:'assets/music/coast.mp3',name:'Under a Forgotten Heaven'},
  dungeon:{url:'assets/music/dungeon.mp3',name:'Where the Light Cannot Follow'}
 };
 const audio=new Audio();audio.id='quest-music';audio.hidden=true;audio.loop=true;audio.preload='none';document.body.append(audio);
 const toggle=document.getElementById('music-toggle'),volume=document.getElementById('music-volume'),status=document.getElementById('music-status');
 let enabled=true,level=.35,unlocked=false,current='',scene='title',generation=0;
 try{const pref=JSON.parse(localStorage.getItem('quest-bodhisattva-music'));if(pref){enabled=pref.enabled!==false;if(Number.isFinite(pref.volume))level=Math.max(0,Math.min(1,pref.volume));}}catch{}
 audio.volume=level;volume.value=Math.round(level*100);
 function ui(blocked=false){toggle.textContent=enabled?'Music on':'Music off';toggle.setAttribute('aria-pressed',String(enabled));status.textContent=!enabled?'Music muted':blocked?'Tap Music to resume':!unlocked?'Music starts when you play':level===0?'Volume muted':tracks[scene].name;}
 function save(){try{localStorage.setItem('quest-bodhisattva-music',JSON.stringify({enabled,volume:level}));}catch{}}
 function play(){
  if(!enabled||!unlocked||document.hidden){audio.pause();ui();return;}
  if(current!==scene){audio.pause();current=scene;audio.src=tracks[scene].url;}
  const token=++generation;
  const result=audio.play();if(result)result.catch(()=>{if(token===generation&&enabled)ui(true);});ui();
 }
 function update(state){scene=document.getElementById('welcome').open?'title':state&&(state.location===2||state.location===4)?'dungeon':state&&(state.location===1||state.location===3)?'town':'coast';play();}
 toggle.addEventListener('click',()=>{enabled=!enabled;unlocked=true;++generation;save();play();});
 volume.addEventListener('input',()=>{level=Number(volume.value)/100;audio.volume=level;save();ui();});
 // One trusted gesture unlocks HTML audio, including inside an arcade iframe.
 document.addEventListener('click',e=>{if(e.isTrusted&&!unlocked){unlocked=true;play();}});
 document.addEventListener('keydown',e=>{if(e.isTrusted&&!unlocked){unlocked=true;play();}});
 new MutationObserver(()=>update(typeof nativeLast==='undefined'?null:nativeLast)).observe(document.getElementById('welcome'),{attributes:true,attributeFilter:['open']});
 document.addEventListener('visibilitychange',()=>{++generation;play();});
 window.addEventListener('pagehide',()=>{++generation;audio.pause();});
 audio.addEventListener('error',()=>{status.textContent='Music unavailable · gameplay continues';});
 ui();return {update};
})();
