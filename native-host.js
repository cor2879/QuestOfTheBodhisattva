/* The UI hands character data to C; native Open Sosaria owns world state. */
'use strict';
const NATIVE_IDS=['ariel','samael','raphael','jophiel','lilith'],NATIVE_KEY='quest-bodhisattva-native-v1';
let nativeCharacter=null,nativeReady=false,nativeLast=null;
const n$=id=>document.getElementById(id),nativeCanvas=n$('canvas');
const NATIVE_ZOOM_KEY='quest-bodhisattva-view-zoom',nativeZoomLevels=[1,1.5,2,3];
let nativeZoomIndex=0;
try{const saved=Number(localStorage.getItem(NATIVE_ZOOM_KEY));if(nativeZoomLevels.includes(saved))nativeZoomIndex=nativeZoomLevels.indexOf(saved);}catch{}
function nativeZoomUI(s=nativeLast){
 const dungeon=s&&(s.location===2||s.location===4),disabled=!nativeReady||!nativeCharacter||dungeon;
 n$('native-zoom-level').textContent=dungeon?'Full view':nativeZoomLevels[nativeZoomIndex]+'×';
 n$('native-zoom-out').disabled=disabled||nativeZoomIndex===0;n$('native-zoom-in').disabled=disabled||nativeZoomIndex===nativeZoomLevels.length-1;n$('native-zoom-reset').disabled=disabled||nativeZoomIndex===0;
 n$('native-zoom-label').textContent=dungeon?'Dungeon · full corridor and minimap':'Map zoom · follows your character';
}
function nativeSetZoom(index,persist=true){nativeZoomIndex=Math.max(0,Math.min(nativeZoomLevels.length-1,index));if(nativeReady)nativeCall('quest_set_zoom','number',['number'],[nativeZoomLevels[nativeZoomIndex]]);if(persist)try{localStorage.setItem(NATIVE_ZOOM_KEY,String(nativeZoomLevels[nativeZoomIndex]));}catch{}nativeZoomUI();}
n$('native-zoom-in').onclick=()=>nativeSetZoom(nativeZoomIndex+1);n$('native-zoom-out').onclick=()=>nativeSetZoom(nativeZoomIndex-1);n$('native-zoom-reset').onclick=()=>nativeSetZoom(0);
// One turn per touch/pen press, never repeat while held. Mouse/keyboard use click.
const nativePresses=new Map(),nativeSuppressedClicks=new WeakMap();
const nativeTouchButton=target=>target instanceof Element?target.closest('[data-native],[data-equip],.native-zoom button'):null;
document.addEventListener('pointerdown',e=>{
 const b=nativeTouchButton(e.target);if(!b||!['touch','pen'].includes(e.pointerType))return;e.preventDefault();if(!e.isPrimary||b.disabled||nativePresses.has(e.pointerId))return;
 nativePresses.set(e.pointerId,b);nativeSuppressedClicks.set(b,Infinity);try{b.setPointerCapture(e.pointerId);}catch{}b.click();
},{capture:true,passive:false});
function nativeReleasePress(e){const b=nativePresses.get(e.pointerId);if(!b)return;nativePresses.delete(e.pointerId);nativeSuppressedClicks.set(b,Date.now()+1000);}
for(const event of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(event,nativeReleasePress,true);
document.addEventListener('click',e=>{const b=nativeTouchButton(e.target);if(b&&e.isTrusted&&(e.pointerType==='touch'||e.pointerType==='pen'||!e.pointerType&&e.detail>0)&&Date.now()<(nativeSuppressedClicks.get(b)||0)){e.preventDefault();e.stopImmediatePropagation();}},true);
for(const event of ['contextmenu','dragstart','selectstart'])document.addEventListener(event,e=>{if(e.target instanceof Element&&e.target.closest('button,#canvas'))e.preventDefault();},true);
window.addEventListener('blur',()=>{for(const b of nativePresses.values())nativeSuppressedClicks.set(b,Date.now()+1000);nativePresses.clear();});
// Keep one live status region beside the sticky map on phones, and with controls on desktop.
const nativeFeedback=document.createElement('div');nativeFeedback.className='native-feedback';
const nativeMessage=n$('native-message'),nativeControls=nativeMessage.parentElement;
nativeControls.insertBefore(nativeFeedback,nativeControls.firstChild);
nativeFeedback.append(nativeMessage.previousElementSibling,nativeMessage);
const nativeMobile=matchMedia('(max-width:649px)');
function nativePlaceFeedback(){
 const mobile=nativeMobile.matches;
 nativeFeedback.querySelector('.eyebrow').textContent=mobile?'Latest update':'Travel with intention';
 if(mobile)document.querySelector('.view').append(nativeFeedback);
 else nativeControls.insertBefore(nativeFeedback,nativeControls.firstChild);
}
nativeMobile.addEventListener('change',nativePlaceFeedback);nativePlaceFeedback();
function nativeNotice(message){n$('native-message').textContent=message;}
function nativeCall(name,returnType,args,values){return Module.ccall(name,returnType,args,values);}
function nativeSnapshot(){return JSON.parse(nativeCall('quest_state','string',[],[]));}
function nativeUpdate(){
 if(!nativeCharacter)return;const s=nativeSnapshot(),d=nativeCall('quest_active_dungeon','string',[],[]).split(',').map(Number),trail=JSON.parse(nativeCall('quest_trail_state','string',[],[])),duel=s.location===0&&trail.active>0,inside=s.location===2||s.location===4,vesper=s.location===3||s.location===4;
 nativeZoomUI(s);
 for(const b of document.querySelectorAll('[data-native]')){const a=+b.dataset.native;if(a>=1&&a<=4)b.disabled=duel;if(a===8){b.hidden=!inside&&!duel;b.textContent=duel?'Strike horror · F':'Strike ahead · F';}if(a===14)b.hidden=!duel;if(a===9||a===10){b.hidden=!inside||s.px!==9||s.py!==1||d[2]!==0;b.textContent=(a===9?(vesper?'Remember Choir':'Release Listener'):(vesper?'Shelter Choir':'Ward Listener'))+(a===9?' · R':' · B');}}
 for(const[a,label]of [[1,'Forward'],[2,'Turn around'],[3,'Turn left'],[4,'Turn right']])document.querySelector('[data-native="'+a+'"]').setAttribute('aria-label',inside?label:['','Move north','Move south','Move west','Move east'][a]);nativeLast=s;
 const gift=Aeon.MONADS[NATIVE_IDS[s.monad]];
 n$('native-power').textContent=gift.power+' · P · 3 Light';n$('native-power').disabled=s.light<3||s.hp<=0||s.food<=0||(!inside&&!duel&&s.monad!==2);
 n$('native-power-description').textContent=gift.description;
 n$('native-growth').textContent='Level '+s.level+' · '+(s.nextLevelXP?'Next level at '+s.nextLevelXP+' experience.':'Current chapter level cap reached.');
 n$('native-light').textContent='Light '+s.light+'/'+s.maxLight;
 n$('native-equipment-status').textContent=['Inner light','Pilgrim blade','Star staff'][s.weapon]+' · '+(s.armor?'Warded robe':'Travel clothes')+' · Strike '+s.strike+' · Reach '+s.reach+(s.ward?' · Ward '+s.ward:'')+(s.veil?' · Veil '+s.veil:'');
 for(const b of document.querySelectorAll('[data-equip]')){const [slot,item]=b.dataset.equip.split(',').map(Number),selected=(slot===0?s.weapon:s.armor)===item,owned=item===0||!!(s.owned&(slot===1?4:item===1?1:2));b.disabled=selected||!owned||s.hp<=0||s.food<=0;b.setAttribute('aria-pressed',String(selected));}
 n$('native-vitality').textContent='Vitality '+s.hp;n$('native-food').textContent='Food '+s.food.toFixed(1);
 const exhausted=s.hp<=0||s.food<=0;n$('native-rescue').hidden=!exhausted;n$('native-warning').hidden=!exhausted&&s.food>10;
 n$('native-warning').textContent=exhausted?'Rescue preserves your progress and costs up to 10 gold.': 'Food is running low. Iona in Haven or Ysra in Vesper sells provisions.';
 document.querySelector('[data-native="6"]').textContent=exhausted?'Rescue to Haven · E':'Interact · E';
 n$('native-town-guide').hidden=s.location!==1&&s.location!==3;
 n$('native-town-guide').textContent=s.location===3?'Maera: northern hall (20,6). Thalen: western clinic (9,7). Ysra: eastern shop (30,7). Neris: southwest home (9,15). Oren: southeast memorial (30,15). Ilyan: central path (20,13).':'Meriel: northern temple. Tavian: western clinic. Iona: eastern shop. Caldus: southwest home. Senna: southeast garden. Aster: central path.';
 n$('native-view-note').textContent=inside?'Forward advances; left/right turn; down turns around. F strikes ahead. E interacts. Plan: gold exit, violet '+(vesper?'Choir':'Listener')+', green cache, red horrors, cyan you.':s.location?'Stand beside a resident and press E. The south gate returns to the coast.':'Haven (43,40) · Shrine (47,35) · Sanctuary (51,47) · Vesper (54,40) · Archive (54,33).';
 n$('native-monad').textContent=gift.name;n$('native-name').textContent=nativeCharacter.name;
 n$('native-place').textContent=['THE LANTERN COAST','HAVEN OF THE FIVE LIGHTS','SANCTUARY · THE BOUND LISTENER','VESPER · UNWRITTEN NAMES','ARCHIVE · THE NAMELESS CHOIR'][s.location];
 if(duel){n$('native-place').textContent='TRAIL DUEL · '+trail.name.toUpperCase();n$('native-view-note').textContent=trail.name+' · Vitality '+trail.enemyHP+'. F strikes; P invokes your gift; H uses a tonic; G escapes safely. Only intentional combat actions advance this duel.';}
 n$('native-journal').replaceChildren();const journalNames=['Sable: '+(trail.sites[0]===1?'shared provisions':'marked a safe route'),'Tessera: '+(trail.sites[1]===1?'carried remembrance':'carried sanctuary'),'Fivefold Spring: learned the inscription','Fallen vessel: '+(trail.sites[3]===1?'salvaged a star staff':'made an offering')];for(let i=0;i<4;i++)if(trail.sites[i]){const li=document.createElement('li');li.textContent=journalNames[i];n$('native-journal').append(li);}n$('native-trail-summary').textContent=trail.sites.filter(Boolean).length+'/4 discoveries · '+trail.foes.filter(f=>f[2]>0).length+' wandering horrors remain.';
 n$('native-turn').textContent='TURN '+s.turn+' · '+(s.location?s.px:s.x)+', '+(s.location?s.py:s.y)+(inside?' · '+['N','E','S','W'][d[3]]:'');
 n$('native-quest').textContent=['Speak with Meriel in Haven’s northern temple.','The fading light: read the shrine and sanctuary inscriptions, then return to Meriel.','Discovery made: return to Meriel with the Listener’s inscription.','Haven’s investigation is complete. Enter the sanctuary, find the Listener at (9,1), and return to tell Meriel.'][s.quest||0];
 n$('native-stats').replaceChildren();for(const[key,label]of Object.entries({hp:'Vitality',food:'Food',gold:'Gold',experience:'Experience',level:'Level',light:'Light',strike:'Strike',reach:'Reach',strength:'Strength',agility:'Agility',stamina:'Stamina',charisma:'Charisma',wisdom:'Wisdom',intelligence:'Intelligence',tonics:'Tonics'})){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=s[key];n$('native-stats').append(dt,dd);}
 const first=nativeCall('quest_dungeon','string',[],[]).split(',').map(Number);
 if(first[2])n$('native-quest').textContent=['The Listener has been answered. Vesper lies eleven steps east of Haven at (54,40). Speak with Maera in its northern hall.','The Unwritten Names: hear Neris and Oren, then return to Maera.','Both witnesses are heard. Return to Maera and choose Vesper’s preparation.','The Archive is open at (54,33). Seek the Choir at (9,1); remember its names or shelter them. Return to Maera afterward.','Vesper honors your answer. Both settlements remain open for healing, supplies, and exploration.'][s.vesperStage];
 const adventure=JSON.parse(nativeCall('quest_engine_state','string',[],[]));
 if(adventure.stage){const li=document.createElement('li');li.textContent=adventure.name+' · '+adventure.objective;n$('native-journal').append(li);}
 if(s.vesperStage===3&&s.choir)n$('native-quest').textContent=(s.choir===1?'The Choir’s names return.':'The Choir rests beneath your shelter.')+' Return to Maera in Vesper to complete your promise.';
 if(s.vesperStage===4)n$('native-quest').textContent=adventure.objective;
 nativeNotice(nativeCall('quest_message','string',[],[]).replace(/\^[A-Za-z]?\d/g,''));
}
function nativeSaveData(){return{game:'QUEST_BODHISATTVA_OPEN_SOSARIA',version:7,engines:nativeCall('quest_engines','string',[],[]),trail:nativeCall('quest_trail','string',[],[]),chapter:nativeCall('quest_chapter','string',[],[]),growth:nativeCall('quest_progress','string',[],[]),dungeon:nativeCall('quest_dungeon','string',[],[]),state:nativeSnapshot(),character:nativeCharacter};}
function nativeSave(manual=false){if(!nativeCharacter)return;try{localStorage.setItem(NATIVE_KEY,JSON.stringify(nativeSaveData()));if(manual)nativeNotice('Journey saved.');}catch{nativeNotice('Browser storage is unavailable. Export a save to keep your journey.');}}
function nativeSaved(){try{return localStorage.getItem(NATIVE_KEY);}catch{return null;}}
function nativeRestore(text){
 const data=JSON.parse(text),s=data.state,c=data.character;
 if(data.game!=='QUEST_BODHISATTVA_OPEN_SOSARIA'||![1,2,3,4,5,6,7].includes(data.version)||!s||!c||typeof c.name!=='string'||c.name.length>24||!['reading','direct'].includes(c.method)||typeof c.seed!=='string'||c.seed.length>100||!Array.isArray(c.choices)||c.choices.length>4||c.choices.some(x=>!x||typeof x.id!=='string'||!NATIVE_IDS.includes(x.choice))||c.method==='reading'&&c.choices.length!==4)throw Error('Invalid native save');
 if(data.version===1)Object.assign(s,{location:0,px:0,py:0,quest:0,clue:0,blessing:0,supplies:0,resolution:0,tonics:0});
 const keys=['monad','x','y','hp','food','turn','time','location','px','py','quest','clue','blessing','supplies','resolution','gold','experience','tonics'];
 for(const key of keys)if(typeof s[key]!=='number'||!Number.isFinite(s[key])||!['food','time'].includes(key)&&!Number.isInteger(s[key]))throw Error('Invalid native state');
 const dungeon=data.version>=3?data.dungeon:'0,0,0,0,3,7,16,7,5,18,9,3,20';
 if(typeof dungeon!=='string'||dungeon.length>150)throw Error('Invalid dungeon');
 const growth=data.version>=4?data.growth:nativeCall('quest_progress_default','string',['number'],[s.experience]);
 if(typeof growth!=='string'||growth.length>100)throw Error('Invalid progression');
 const chapter=data.version>=5?data.chapter:nativeCall('quest_chapter_default','string',[],[]);
 if(typeof chapter!=='string'||chapter.length>220)throw Error('Invalid chapter');
 const trail=data.version>=6?data.trail:nativeCall('quest_trail_default','string',['number','number','number'],[s.location,s.x,s.y]);
 if(typeof trail!=='string'||trail.length>240)throw Error('Invalid coast encounters');
 const engines=data.version>=7?data.engines:trail.split(',')[0]+',1,0,0,0';
 if(typeof engines!=='string'||engines.length>90)throw Error('Invalid quest engine');
 if(!nativeCall('quest_restore_v7','number',[...keys.map(()=> 'number'),'string','string','string','string','string'],[...keys.map(k=>s[k]),dungeon,growth,chapter,trail,engines]))throw Error('Invalid or impassable saved location');
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
 nativeCharacter=character.creation;nativeCall('quest_start','number',['number','string'],[NATIVE_IDS.indexOf(character.monad),nativeCharacter.name]);
 let seed=2166136261;for(const c of character.world)seed=Math.imul(seed^c.charCodeAt(0),16777619);nativeCall('quest_set_seed',null,['number'],[(seed>>>0)%2147483647||1]);
 n$('welcome').close();nativeUpdate();nativeSave();nativeCanvas.focus({preventScroll:true});
}
function nativeAct(action){if(!nativeReady||!nativeCharacter||n$('welcome').open||n$('conversation').open)return;nativeCall('quest_action','number',['number'],[action]);nativeUpdate();nativeSave();nativeShowConversation();if(!n$('conversation').open)nativeCanvas.focus({preventScroll:true});}
for(const b of document.querySelectorAll('[data-native]'))b.onclick=()=>nativeAct(+b.dataset.native);
window.addEventListener('keydown',e=>{if(n$('welcome').open||n$('conversation').open||e.target.closest('input,textarea,button'))return;const action={ArrowUp:1,w:1,ArrowDown:2,s:2,ArrowLeft:3,a:3,ArrowRight:4,d:4,e:6,Enter:6,' ':5,h:7,f:8,r:9,b:10,p:12,g:14}[e.key];if(action){e.preventDefault();if(!e.repeat)nativeAct(action);}});
for(const b of document.querySelectorAll('[data-equip]'))b.onclick=()=>{if(!nativeReady||!nativeCharacter||n$('welcome').open||n$('conversation').open)return;nativeCall('quest_change_equipment','number',['number','number'],b.dataset.equip.split(',').map(Number));nativeUpdate();nativeSave();nativeCanvas.focus({preventScroll:true});};
 n$('native-rescue').onclick=()=>nativeAct(6);
n$('native-new').onclick=()=>{if(nativeReady)CreationUI.open();};n$('native-save').onclick=()=>nativeSave(true);
n$('native-export').onclick=()=>{if(!nativeCharacter)return;const url=URL.createObjectURL(new Blob([JSON.stringify(nativeSaveData(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='Quest-of-the-Bodhisattva-Native.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
n$('native-import').onclick=()=>{n$('native-file').value='';n$('native-file').click();};n$('native-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>20000)throw Error('Too large');nativeRestore(await f.text());nativeSave();nativeNotice('Imported native journey.');}catch{nativeNotice('Invalid native save. Your current journey is unchanged.');}};
var Module={canvas:nativeCanvas,print:()=>{},printErr:message=>console.error(message),onAbort:()=>nativeNotice('Open Sosaria could not start. This build requires WebGL 2.'),onRuntimeInitialized:()=>{
 nativeReady=true;nativeSetZoom(nativeZoomIndex,false);nativeNotice('Open Sosaria is ready.');CreationUI.init({onBegin:nativeBegin,onLoad:()=>{try{nativeRestore(nativeSaved());}catch{nativeNotice('That native save could not be read.');}},onCancel:()=>nativeCanvas.focus({preventScroll:true}),hasRun:()=>!!nativeCharacter,hasSaved:()=>!!nativeSaved()});CreationUI.open();
}};
