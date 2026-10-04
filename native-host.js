/* The UI hands character data to C; native Open Sosaria owns world state. */
'use strict';
const NATIVE_IDS=['ariel','samael','raphael','jophiel','lilith'],NATIVE_KEY='quest-bodhisattva-native-v1';
let nativeCharacter=null,nativeReady=false,nativeLast=null;
const n$=id=>document.getElementById(id),nativeCanvas=n$('canvas');
function nativeNotice(message){n$('native-message').textContent=message;}
function nativeCall(name,returnType,args,values){return Module.ccall(name,returnType,args,values);}
function nativeSnapshot(){return JSON.parse(nativeCall('quest_state','string',[],[]));}
function nativeUpdate(){
 if(!nativeCharacter)return;const s=nativeSnapshot(),d=nativeCall('quest_dungeon','string',[],[]).split(',').map(Number);for(const b of document.querySelectorAll('[data-native]')){const a=+b.dataset.native;if(a===8)b.hidden=s.location!==2;if(a>=9)b.hidden=s.location!==2||s.px!==9||s.py!==1||d[2]!==0;}for(const[a,label]of [[1,'Forward'],[2,'Turn around'],[3,'Turn left'],[4,'Turn right']])document.querySelector('[data-native="'+a+'"]').setAttribute('aria-label',s.location===2?label:['','Move north','Move south','Move west','Move east'][a]);nativeLast=s;
 n$('native-vitality').textContent='Vitality '+s.hp;n$('native-food').textContent='Food '+s.food.toFixed(1);
 const exhausted=s.hp<=0||s.food<=0;n$('native-rescue').hidden=!exhausted;n$('native-warning').hidden=!exhausted&&s.food>10;
 n$('native-warning').textContent=exhausted?'Rescue preserves your progress and costs up to 10 gold.': 'Food is running low. Return to Iona in Haven for provisions.';
 document.querySelector('[data-native="6"]').textContent=exhausted?'Rescue to Haven · E':'Interact · E';
 n$('native-town-guide').hidden=s.location!==1;n$('native-view-note').textContent=s.location===2?'Forward advances; left/right turn; down turns around. F strikes ahead. E interacts; R releases, B wards the Listener.':s.location?'Stand beside a resident and press E. The south gate returns to the coast.':'Grass and woodland are passable. Water needs a vessel; mountains block travel.';
 n$('native-monad').textContent=Aeon.MONADS[NATIVE_IDS[s.monad]].name;n$('native-name').textContent=nativeCharacter.name;n$('native-place').textContent=s.location===2?'SANCTUARY · THE BOUND LISTENER':s.location?'HAVEN OF THE FIVE LIGHTS':'THE LANTERN COAST';n$('native-turn').textContent='TURN '+s.turn+' · '+(s.location?s.px:s.x)+', '+(s.location?s.py:s.y)+(s.location===2?' · '+['N','E','S','W'][d[3]]:'');n$('native-quest').textContent=['Speak with Meriel in Haven’s northern temple.','The fading light: read the shrine and sanctuary inscriptions, then return to Meriel.','Discovery made: return to Meriel with the Listener’s inscription.','Haven’s investigation is complete. Enter the sanctuary, find the Listener at (9,1), and return to tell Meriel.'][s.quest||0];
 n$('native-stats').replaceChildren();for(const[key,label]of Object.entries({hp:'Vitality',food:'Food',gold:'Gold',experience:'Experience',strength:'Strength',agility:'Agility',stamina:'Stamina',charisma:'Charisma',wisdom:'Wisdom',intelligence:'Intelligence',tonics:'Tonics'})){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=s[key];n$('native-stats').append(dt,dd);}
 if(d[2])n$('native-quest').textContent=d[2]===1?'The Listener is free. Return to Meriel in Haven to share what you found.':'The Listener rests beneath your ward. Return to Meriel in Haven to share what you found.';
 nativeNotice(nativeCall('quest_message','string',[],[]).replace(/\^[A-Za-z]?\d/g,''));
}
function nativeSaveData(){return{game:'QUEST_BODHISATTVA_OPEN_SOSARIA',version:3,dungeon:nativeCall('quest_dungeon','string',[],[]),state:nativeSnapshot(),character:nativeCharacter};}
function nativeSave(manual=false){if(!nativeCharacter)return;try{localStorage.setItem(NATIVE_KEY,JSON.stringify(nativeSaveData()));if(manual)nativeNotice('Journey saved.');}catch{nativeNotice('Browser storage is unavailable. Export a save to keep your journey.');}}
function nativeSaved(){try{return localStorage.getItem(NATIVE_KEY);}catch{return null;}}
function nativeRestore(text){
 const data=JSON.parse(text),s=data.state,c=data.character;
 if(data.game!=='QUEST_BODHISATTVA_OPEN_SOSARIA'||![1,2,3].includes(data.version)||!s||!c||typeof c.name!=='string'||c.name.length>24||!['reading','direct'].includes(c.method)||typeof c.seed!=='string'||c.seed.length>100||!Array.isArray(c.choices)||c.choices.length>4||c.choices.some(x=>!x||typeof x.id!=='string'||!NATIVE_IDS.includes(x.choice))||c.method==='reading'&&c.choices.length!==4)throw Error('Invalid native save');
 if(data.version===1)Object.assign(s,{location:0,px:0,py:0,quest:0,clue:0,blessing:0,supplies:0,resolution:0,tonics:0});
 const keys=['monad','x','y','hp','food','turn','time','location','px','py','quest','clue','blessing','supplies','resolution','gold','experience','tonics'];
 for(const key of keys)if(typeof s[key]!=='number'||!Number.isFinite(s[key])||!['food','time'].includes(key)&&!Number.isInteger(s[key]))throw Error('Invalid native state');
 const dungeon=data.version===3?data.dungeon:'0,0,0,0,3,7,16,7,5,18,9,3,20';
 if(typeof dungeon!=='string'||dungeon.length>150)throw Error('Invalid dungeon');
 if(!nativeCall('quest_restore_v3','number',[...keys.map(()=> 'number'),'string'],[...keys.map(k=>s[k]),dungeon]))throw Error('Invalid or impassable saved location');
 nativeCall('quest_set_name',null,['string'],[c.name]);nativeCharacter=c;nativeCloseConversation(false);nativeUpdate();if(n$('welcome').open)n$('welcome').close();nativeCanvas.focus({preventScroll:true});
}
function nativeShowConversation(){
 const data=JSON.parse(nativeCall('quest_dialogue','string',[],[]));if(!data)return;
 n$('conversation-name').textContent=data.name;n$('conversation-text').textContent=data.text;n$('conversation-options').replaceChildren();
 for(const option of data.options){const b=document.createElement('button');b.textContent=option.label;b.dataset.option=option.id;b.onclick=()=>{nativeCall('quest_option','number',['number'],[option.id]);nativeUpdate();n$('conversation-response').textContent=n$('native-message').textContent;nativeSave();nativeShowConversation();};n$('conversation-options').append(b);}
 if(!n$('conversation').open){n$('conversation-response').textContent='';n$('conversation').showModal();}n$('conversation-options').firstElementChild?.focus({preventScroll:true});
}
function nativeCloseConversation(focus=true){if(nativeReady)nativeCall('quest_close_conversation',null,[],[]);if(n$('conversation').open)n$('conversation').close();if(focus)nativeCanvas.focus({preventScroll:true});}
n$('conversation-close').onclick=()=>nativeCloseConversation();n$('conversation').addEventListener('cancel',e=>{e.preventDefault();nativeCloseConversation();});
function nativeBegin(character){
 nativeCharacter=character.creation;nativeCall('quest_start','number',['number','string'],[NATIVE_IDS.indexOf(character.monad),nativeCharacter.name]);n$('welcome').close();nativeUpdate();nativeSave();nativeCanvas.focus({preventScroll:true});
}
function nativeAct(action){if(!nativeReady||!nativeCharacter||n$('welcome').open||n$('conversation').open)return;nativeCall('quest_action','number',['number'],[action]);nativeUpdate();nativeSave();nativeShowConversation();if(!n$('conversation').open)nativeCanvas.focus({preventScroll:true});}
for(const b of document.querySelectorAll('[data-native]'))b.onclick=()=>nativeAct(+b.dataset.native);
window.addEventListener('keydown',e=>{if(n$('welcome').open||n$('conversation').open||e.target.closest('input,textarea,button'))return;const action={ArrowUp:1,w:1,ArrowDown:2,s:2,ArrowLeft:3,a:3,ArrowRight:4,d:4,e:6,Enter:6,' ':5,h:7,f:8,r:9,b:10}[e.key];if(action){e.preventDefault();if(!e.repeat)nativeAct(action);}});
n$('native-rescue').onclick=()=>nativeAct(6);
n$('native-new').onclick=()=>{if(nativeReady)CreationUI.open();};n$('native-save').onclick=()=>nativeSave(true);
n$('native-export').onclick=()=>{if(!nativeCharacter)return;const url=URL.createObjectURL(new Blob([JSON.stringify(nativeSaveData(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='Quest-of-the-Bodhisattva-Native.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
n$('native-import').onclick=()=>{n$('native-file').value='';n$('native-file').click();};n$('native-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>20000)throw Error('Too large');nativeRestore(await f.text());nativeSave();nativeNotice('Imported native journey.');}catch{nativeNotice('Invalid native save. Your current journey is unchanged.');}};
var Module={canvas:nativeCanvas,print:()=>{},printErr:message=>console.error(message),onAbort:()=>nativeNotice('Open Sosaria could not start. This build requires WebGL 2.'),onRuntimeInitialized:()=>{
 nativeReady=true;nativeNotice('Open Sosaria is ready.');CreationUI.init({onBegin:nativeBegin,onLoad:()=>{try{nativeRestore(nativeSaved());}catch{nativeNotice('That native save could not be read.');}},onCancel:()=>nativeCanvas.focus({preventScroll:true}),hasRun:()=>!!nativeCharacter,hasSaved:()=>!!nativeSaved()});CreationUI.open();
}};
