/* The UI hands character data to C; native Open Sosaria owns world state. */
'use strict';
const NATIVE_IDS=['ariel','samael','raphael','jophiel','lilith'],NATIVE_KEY='quest-bodhisattva-native-v1';
let nativeCharacter=null,nativeReady=false,nativeLast=null;
const n$=id=>document.getElementById(id),nativeCanvas=n$('canvas');
function nativeNotice(message){n$('native-message').textContent=message;}
function nativeCall(name,returnType,args,values){return Module.ccall(name,returnType,args,values);}
function nativeSnapshot(){return JSON.parse(nativeCall('quest_state','string',[],[]));}
function nativeUpdate(){
 if(!nativeCharacter)return;const s=nativeSnapshot();nativeLast=s;
 n$('native-monad').textContent=Aeon.MONADS[NATIVE_IDS[s.monad]].name;n$('native-name').textContent=nativeCharacter.name;n$('native-turn').textContent='TURN '+s.turn+' · '+s.x+', '+s.y;
 n$('native-stats').replaceChildren();for(const[key,label]of Object.entries({hp:'Vitality',food:'Food',gold:'Gold',experience:'Experience',strength:'Strength',agility:'Agility',stamina:'Stamina',charisma:'Charisma',wisdom:'Wisdom',intelligence:'Intelligence'})){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=s[key];n$('native-stats').append(dt,dd);}
 nativeNotice(nativeCall('quest_message','string',[],[]).replace(/\^[A-Za-z]?\d/g,''));
}
function nativeSaveData(){return{game:'QUEST_BODHISATTVA_OPEN_SOSARIA',version:1,state:nativeSnapshot(),character:nativeCharacter};}
function nativeSave(manual=false){if(!nativeCharacter)return;try{localStorage.setItem(NATIVE_KEY,JSON.stringify(nativeSaveData()));if(manual)nativeNotice('Journey saved.');}catch{nativeNotice('Browser storage is unavailable. Export a save to keep your journey.');}}
function nativeSaved(){try{return localStorage.getItem(NATIVE_KEY);}catch{return null;}}
function nativeRestore(text){
 const data=JSON.parse(text),s=data.state,c=data.character;
 if(data.game!=='QUEST_BODHISATTVA_OPEN_SOSARIA'||data.version!==1||!s||!c||typeof c.name!=='string'||c.name.length>24||!['reading','direct'].includes(c.method)||typeof c.seed!=='string'||c.seed.length>100||!Array.isArray(c.choices)||c.choices.length>4||c.choices.some(x=>!x||typeof x.id!=='string'||!NATIVE_IDS.includes(x.choice))||c.method==='reading'&&c.choices.length!==4)throw Error('Invalid native save');
 for(const key of ['monad','x','y','hp','turn'])if(!Number.isInteger(s[key]))throw Error('Invalid native position');
 for(const key of ['food','time'])if(typeof s[key]!=='number'||!Number.isFinite(s[key]))throw Error('Invalid native resources');
 // Validate every field before changing the live player, including passable terrain.
 if(!NATIVE_IDS[s.monad]||s.x<0||s.x>=172||s.y<0||s.y>=172||s.hp<0||s.hp>100||s.food<0||s.food>100||s.turn<0||s.turn>1000000||s.time<0||s.time>1000000)throw Error('Invalid native state');
 const previous=nativeCharacter?nativeSaveData():null;
 nativeCall('quest_start','number',['number','string'],[s.monad,c.name]);
 if(!nativeCall('quest_restore','number',['number','number','number','number','number','number','number'],[s.monad,s.x,s.y,s.hp,s.food,s.turn,s.time])){
  if(previous){const p=previous.state;nativeCall('quest_start','number',['number','string'],[p.monad,previous.character.name]);nativeCall('quest_restore','number',Array(7).fill('number'),[p.monad,p.x,p.y,p.hp,p.food,p.turn,p.time]);}
  throw Error('Invalid or impassable saved location');
 }
 nativeCharacter=c;nativeUpdate();n$('welcome').close();nativeCanvas.focus({preventScroll:true});
}
function nativeBegin(character){
 nativeCharacter=character.creation;nativeCall('quest_start','number',['number','string'],[NATIVE_IDS.indexOf(character.monad),nativeCharacter.name]);n$('welcome').close();nativeUpdate();nativeSave();nativeCanvas.focus({preventScroll:true});
}
function nativeAct(action){if(!nativeReady||!nativeCharacter||n$('welcome').open)return;nativeCall('quest_action','number',['number'],[action]);nativeUpdate();nativeSave();}
for(const b of document.querySelectorAll('[data-native]'))b.onclick=()=>nativeAct(+b.dataset.native);
window.addEventListener('keydown',e=>{if(n$('welcome').open||e.target.closest('input,textarea,button'))return;const action={ArrowUp:1,w:1,ArrowDown:2,s:2,ArrowLeft:3,a:3,ArrowRight:4,d:4,e:6,Enter:6,' ':5}[e.key];if(action){e.preventDefault();if(!e.repeat)nativeAct(action);}});
n$('native-new').onclick=()=>CreationUI.open();n$('native-save').onclick=()=>nativeSave(true);
n$('native-export').onclick=()=>{if(!nativeCharacter)return;const url=URL.createObjectURL(new Blob([JSON.stringify(nativeSaveData(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='Quest-of-the-Bodhisattva-Native.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
n$('native-import').onclick=()=>{n$('native-file').value='';n$('native-file').click();};n$('native-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>20000)throw Error('Too large');nativeRestore(await f.text());nativeSave();nativeNotice('Imported native journey.');}catch{nativeNotice('Invalid native save. Your current journey is unchanged.');}};
var Module={canvas:nativeCanvas,print:()=>{},printErr:message=>console.error(message),onAbort:()=>nativeNotice('Open Sosaria could not start. This build requires WebGL 2.'),onRuntimeInitialized:()=>{
 nativeReady=true;nativeNotice('Open Sosaria is ready.');CreationUI.init({onBegin:nativeBegin,onLoad:()=>{try{nativeRestore(nativeSaved());}catch{nativeNotice('That native save could not be read.');}},onCancel:()=>nativeCanvas.focus({preventScroll:true}),hasRun:()=>!!nativeCharacter,hasSaved:()=>!!nativeSaved()});CreationUI.open();
}};
