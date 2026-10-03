/* Browser interface and original procedural pixel art. */
'use strict';
const A=Aeon,$=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d'),T=20;
let run=null,selected='samael',finishedShown=false,known=[],storageAvailable=true,lastLog='';
const RUN_KEY='aeon-descent-run-v1',LORE_KEY='aeon-descent-codex-v1';
const FLOOR_NAMES=['The Broken Vestibule','The Choir in Stone','The Weaver’s Archive','The Merciless Geometry','The Dreaming Threshold'];
const PATRON_INSIGHTS={
 ariel:['There is living breath in this stone. The prison did not erase the garden; it buried it.','The roots remember the singers. Free a voice, and something living will answer.','A name grows from relationship. Attend to the life behind the monstrous shape.','Restoration is an act of courage. The imprisoned world cannot heal while its cords remain.','Before the hunger, there was a sea. You carry the possibility of its return.'],
 samael:['Expose the false sanctuary. Let judgment fall upon the binding that consumes the innocent.','The choir’s torment is no covenant. No vow can make this theft sacred.','Discern the captive from the captor. Strike the chain with the same resolve you bring to the horror.','Purification asks for clarity. Anger alone cannot tell you what must end.','The hunger deserves an ending. Discern whether the Listener must end with it.'],
 raphael:['These souls are wounded, not spent. Break their cords; their breath can become their own again.','Listen beneath the song. The voices remember the sound of a waking world.','The first name holds a memory of wholeness. A thing made monstrous may still remember.','Healing opens a door. Liberation gives the wounded a way to walk through it.','The guardian’s wound became the world’s danger. Restore what can be restored; end what continues to harm.'],
 lilith:['A sanctuary that demands surrender is a cage with a gentler name.','No voice belongs to the stone that holds it. Let the captive choose where to sing.','A true name opens a way beyond imposed names. Listen to the being, not its sentence.','You owe no obedience to a chain because someone calls it protection.','Let the Listener choose a life beyond the hunger that has commanded it.'],
 jophiel:['The inscription contradicts the machinery. Its promised sanctuary is a device of extraction.','Observe the pattern: every captive voice becomes another strand in the Dream.','A true name is knowledge joined to witness. Collect words, but also free those who can remember.','Neither destruction nor mercy is wisdom without understanding. Read the whole design.','Oru—the Listener. Three fragments and three witnesses can make that remembered name a living truth.']
};
function notice(text){$('notice').textContent=text;}
function readStorage(key){try{return localStorage.getItem(key);}catch{storageAvailable=false;return null;}}
function writeStorage(key,value){try{localStorage.setItem(key,value);return true;}catch{storageAvailable=false;return false;}}
try{const data=JSON.parse(readStorage(LORE_KEY)||'[]');if(Array.isArray(data))known=[...new Set(data.filter(i=>Number.isInteger(i)&&i>=0&&i<5))];}catch{}
function remember(){if(!run)return;known=[...new Set([...known,...run.fragments])].sort();writeStorage(LORE_KEY,JSON.stringify(known));}
function save(manual=false){if(!run)return;remember();const ok=writeStorage(RUN_KEY,A.serialize(run));if(manual)notice(ok?'Expedition saved. Export a backup to move it between browsers.':'Browser storage is unavailable. Export a save to keep your expedition.');return ok;}
function focusGame(){canvas.focus({preventScroll:true});}
function modalOpen(){return [...document.querySelectorAll('dialog')].some(d=>d.open);}
function welcome(){release();CreationUI.open();}
function begin(character){const world=character.world;selected=character.monad;run=A.newRun(selected,world,character.creation);finishedShown=false;lastLog='';$('welcome').close();save();update();focusGame();}
function load(){
 try{const text=readStorage(RUN_KEY);if(!text){notice('No saved expedition in this browser. Import an exported save instead.');return;}
 const restored=A.deserialize(text);run=restored;finishedShown=false;lastLog='';for(const d of document.querySelectorAll('dialog[open]'))d.close();remember();update();focusGame();notice('Expedition resumed.');}
 catch{notice('That saved expedition could not be read. Your current expedition is unchanged.');}
}
$('resume').onclick=load;$('welcome-resume').onclick=load;$('save').onclick=()=>save(true);$('new').onclick=welcome;$('again').onclick=()=>{$('ending').close();welcome();};
$('export').onclick=()=>{if(!run)return;const blob=new Blob([A.serialize(run)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Quest-of-the-Bodhisattva-'+run.seed.replace(/[^a-zA-Z0-9-]/g,'').slice(0,40)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('Save exported. Import it here to continue on another browser.');};
$('import').onclick=()=>{$('import-file').value='';$('import-file').click();};
$('import-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>200000)throw Error('Too large');const restored=A.deserialize(await file.text());run=restored;finishedShown=false;lastLog='';save();update();focusGame();notice('Imported expedition.');}catch{notice('Invalid save. Your current expedition is unchanged.');}};
function showInfo(title,articles){
 release();const box=$('info-content');box.replaceChildren();const h=document.createElement('h2');h.textContent=title;box.append(h);
 for(const article of articles){const el=document.createElement('article'),heading=document.createElement('h3'),p=document.createElement('p');heading.textContent=article.title;p.textContent=article.text;el.append(heading,p);box.append(el);}
 $('info').showModal();
}
function codex(){remember();showInfo('The remembered word',known.length?known.map(i=>A.LORE[i]):[{title:'An unwritten remembrance',text:'Find inscriptions in the ruins and interact beside them. Their words remain here even after an expedition ends. Three fragments and three liberated witnesses open the peaceful resolution at the last threshold.'}]);}
$('codex').onclick=codex;$('ending-codex').onclick=()=>{$('ending').close();codex();};
$('info-close').onclick=()=>{$('info').close();focusGame();};
$('help').onclick=()=>showInfo('Walk with intention',[
 {title:'Movement and turns',text:'Arrows or WASD move. Bump a horror to strike it, or press X to strike an adjacent foe. Every successful move, strike, power, tonic, interaction, or wait gives nearby horrors one turn. Blocked moves and inspection cost nothing. Nothing moves while you read a panel.'},
 {title:'Light and your Monad',text:'F uses your Monad power for 4 light. Killed horrors restore 3 light; gathered sparks restore 5. Samael severs nearby bindings or burns through a foe’s ward. Ariel creates a protective ward. Raphael heals, clears dread, and shields one turn. Jophiel reveals and stuns nearby foes. Lilith shields two turns and empowers a strike.'},
 {title:'Bindings and witnesses',text:'E or Enter interacts on your tile or beside it. Break a binding with repeated interactions or Samael’s power. Living bindings halve harm to warded horrors and hold the floor’s witness captive. Once unbound, interact with the witness to liberate them, restore vitality/light, and weaken the final horror.'},
 {title:'Relics, tonics, and dread',text:'Shrines offer a choice of three relics and restore vitality and light; each shrine works once. H drinks a tonic, restoring 18 vitality and clearing dread. Entombed Choirs inflict dread, reducing strike harm by 1 per two dread. Restoring Light also clears it. Your Monad power and tonic counts are shown beside the map.'},
 {title:'Find the threshold',text:'Explore five generated strata. Inscriptions preserve lore in your codex. Descending restores 8 vitality and 4 light. On the fifth floor, defeat Oru or interact at the threshold with at least three freed witnesses and three fragments. There are no compulsory floor-clear battles.'},
 {title:'Keeping an expedition',text:'The game autosaves after actions when browser storage is available. Save and Resume are also available. Export a backup before moving files or changing browsers. Death ends this expedition; codex discoveries persist. A world seed recreates its initial maps and relic offers.'}
]);
function take(action){if(!run||modalOpen())return;releaseIfEnding();const before=run.fragments.length;A.act(run,action);save();update();if(run.status==='playing'&&run.fragments.length>before&&!modalOpen()){const index=run.fragments[run.fragments.length-1];showInfo('Recovered remembrance',[A.LORE[index],{title:A.PATRONS[run.patron].name+'’s discernment',text:PATRON_INSIGHTS[run.patron][index]}]);}}
function releaseIfEnding(){if(run?.status!=='playing')release();}
let repeat=null;
function release(){if(repeat){clearInterval(repeat);repeat=null;}}
for(const b of document.querySelectorAll('[data-move]')){
 b.addEventListener('pointerdown',e=>{if(e.button!==0||modalOpen())return;e.preventDefault();release();b.setPointerCapture(e.pointerId);take(b.dataset.move.split(',').map(Number));if(run?.status==='playing'&&!modalOpen())repeat=setInterval(()=>take(b.dataset.move.split(',').map(Number)),190);});
 b.addEventListener('lostpointercapture',release);b.addEventListener('click',e=>{if(e.detail===0)take(b.dataset.move.split(',').map(Number));});
}
document.addEventListener('pointerup',release);document.addEventListener('pointercancel',release);window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
for(const b of document.querySelectorAll('[data-act]'))b.onclick=()=>take(b.dataset.act);
document.addEventListener('keydown',e=>{
 if(modalOpen()||e.target.matches('input,textarea')||e.target.closest('button')&&['Enter','Space'].includes(e.code))return;
 const moves={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]};
 const actions={KeyE:'interact',Enter:'interact',KeyX:'strike',KeyF:'power',KeyH:'tonic',Space:'wait'};
 if(moves[e.code]||actions[e.code]){e.preventDefault();if(e.repeat&&!moves[e.code])return;take(moves[e.code]||actions[e.code]);}
 else if(e.code==='Escape'){e.preventDefault();$('help').click();}
});
canvas.onclick=e=>{if(!run||modalOpen())return;const r=canvas.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*A.W),y=Math.floor((e.clientY-r.top)/r.height*A.H);if(!A.key||!run.floor.visible[A.key(x,y)])return;const entity=A.at(run,x,y);if(A.dist(run,{x,y})===1){take([x-run.x,y-run.y]);focusGame();}else if(entity){$('inspect').textContent=entity.name+(entity.hp!==undefined?' · vitality '+entity.hp+'/'+entity.maxHp:'')+(entity.bound?' · protected while a binding lives':'')+(entity.freed?' · liberated':'')+(entity.kind==='shrine'&&entity.used?' · already remembered':'');}else $('inspect').textContent=run.floor.tiles[A.key(x,y)]===1?'Ancient stone. Walkable ground.':'Cyclopean masonry. Impassable.';};
function relicChoice(){
 if($('relic-dialog').open)return;release();$('relic-choices').replaceChildren();
 for(const id of run.pendingRelics){const r=A.RELICS.find(r=>r.id===id),b=document.createElement('button'),name=document.createElement('b'),desc=document.createElement('small');name.textContent=r.name;desc.textContent=r.description;b.append(name,desc);b.onclick=()=>{A.chooseRelic(run,id);$('relic-dialog').close();save();update();focusGame();};$('relic-choices').append(b);}
 $('relic-dialog').showModal();
}
$('relic-dialog').addEventListener('cancel',e=>e.preventDefault());
function end(){
 if(finishedShown)return;finishedShown=true;release();const won=run.status==='won',mercy=run.ending==='liberation';
 $('ending-eyebrow').textContent=won?'The sanctuary opens':'The sanctuary remembers';
 $('ending-title').textContent=won?(mercy?'The Listener awakens':'The Dream is broken'):'A light returns home';
 $('ending-text').textContent=won?(mercy?'You speak the name Oru. The captive engine falls silent, and the guardian beneath the hunger remembers the sea. Your judgment was discernment; your victory was liberation.':'You extinguish the Devouring Dream. Its prison collapses, and the witnesses you freed follow your light into the waking world.'):'Your vessel fell beneath the ruins. The words you recovered remain in the codex. Choose your patron, enter another shifting world, and carry that knowledge forward.';
 $('end-stats').textContent='Stratum '+run.depth+' · '+run.rescued+' witnesses · '+run.fragments.length+' fragments · '+run.turn+' turns';
 $('ending-seed').textContent='World seed: '+run.seed;$('ending').showModal();
}
$('ending-close').onclick=()=>{$('ending').close();focusGame();};
function update(){
 if(!run){draw();return;}
 const p=A.PATRONS[run.patron];document.documentElement.style.setProperty('--patron',p.color);
 $('character-label').textContent=run.creation?.name||'Wayfarer';$('patron-mark').textContent=p.symbol;$('patron-name').textContent=p.name;$('patron-title').textContent=p.title;
 $('hp').textContent=run.hp+' / '+run.maxHp;$('light').textContent=run.light+' / '+run.maxLight;
 $('hp-bar').style.width=100*run.hp/run.maxHp+'%';$('light-bar').style.width=100*run.light/run.maxLight+'%';
 $('strike').textContent=(run.attack-Math.floor(run.dread/2)+(run.empowered?8:0))+' / '+run.armor;$('tonics').textContent=run.kits;$('dread').textContent=run.dread+' / 5';$('rescued').textContent=run.rescued;$('fragments').textContent=run.fragments.length+' / 5';
 $('depth').textContent='STRATUM '+run.depth+' / 5 · '+FLOOR_NAMES[run.depth-1];$('turn').textContent='TURN '+run.turn;
 $('view-note').textContent='Seed '+run.seed+' · '+(run.status==='playing'?'The ruins wait for your next action.':run.status==='won'?'The expedition is complete.':'This expedition has ended.');
 $('power').textContent=p.power+' · F · 4 light';$('power-desc').textContent=p.description;
 const binding=run.floor.entities.some(e=>e.kind==='anchor'&&e.hp>0),witness=run.floor.entities.find(e=>e.kind==='captive');
 $('mission').textContent=run.depth===5?'Confront Oru. Three witnesses and three fragments allow liberation at the threshold.':binding?'Find and break the astral binding. Free this stratum’s witness and recover its inscription before descending.':!witness.freed?'The binding is broken. Find the witness and restore their freedom.':'A witness walks free. Gather lore, seek a shrine, and find the descending stair.';
 $('relic-list').replaceChildren();const starting=document.createElement('li');starting.textContent=p.relic+' · Monad gift';$('relic-list').append(starting);for(const id of run.relics){const li=document.createElement('li');li.textContent=A.RELICS.find(r=>r.id===id).name;$('relic-list').append(li);}
 const newLog=JSON.stringify(run.log.slice(-5));if(newLog!==lastLog){lastLog=newLog;$('log').replaceChildren();for(const line of run.log.slice(-5)){const li=document.createElement('li');li.textContent=line;$('log').append(li);}}
 for(const b of document.querySelectorAll('[data-act],[data-move]'))b.disabled=run.status!=='playing';
 $('power').disabled=run.status!=='playing'||run.light<4;$('save').disabled=false;$('export').disabled=false;
 draw();if(run.pendingRelics)relicChoice();else if(run.status!=='playing')end();
 if(!storageAvailable)notice('Browser storage unavailable. Use Export save to keep your expedition.');
}
// Deterministic pixel art: the map and creatures use no external images.
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function line(x,y,xx,yy,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke();}
function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function tile(x,y,visible,wall){
 const px=x*T,py=y*T,n=((x*129+y*53)%17);
 if(wall){rect(px,py,T,T,visible?'#283443':'#141c29');rect(px+1,py+1,18,2,visible?'#455364':'#222c3b');rect(px+1,py+3,1,15,visible?'#394657':'#1c2734');rect(px+2,py+17,18,2,'#0c131e');line(px+10,py+3,px+10,py+9,visible?'#1c2938':'#0e1622');line(px+2,py+10,px+18,py+10,visible?'#1c2938':'#0e1622');}
 else{rect(px,py,T,T,visible?(n<8?'#202a37':'#232e3c'):'#111925');rect(px+1,py+1,18,1,visible?'#303c4a':'#182231');rect(px+1,py+1,1,18,visible?'#2b3745':'#16212e');if(n%3===0)line(px+5,py+7,px+8,py+11,visible?'#384251':'#192331');if(n%5===0)rect(px+14,py+15,2,1,visible?'#566050':'#25302e');}
}
function creature(e,x,y){
 const c=e.color||'#d3a4dc';ctx.save();
 if(e.bound&&run.floor.entities.some(a=>a.kind==='anchor'&&a.hp>0)){ctx.strokeStyle='#9b6090';ctx.strokeRect(x+1,y+1,18,18);}
 if(e.glyph==='eye'){circle(x+10,y+11,7,'#443551');circle(x+10,y+10,5,c);rect(x+5,y+8,10,5,'#e8d3ca');rect(x+9,y+8,3,5,'#231a37');rect(x+2,y+15,3,2,c);rect(x+15,y+15,3,2,c);}
 else if(e.glyph==='choir'){for(let i=0;i<3;i++){rect(x+3+i*5,y+6,4,11,'#65758e');rect(x+3+i*5,y+5,4,3,c);rect(x+4+i*5,y+7,1,3,'#111824');}rect(x+2,y+17,16,2,'#414a64');}
 else if(e.glyph==='spider'){for(let i=0;i<3;i++){line(x+8,y+8+i*3,x+2,y+4+i*6,c,2);line(x+12,y+8+i*3,x+18,y+4+i*6,c,2);}circle(x+10,y+11,5,'#67394f');rect(x+8,y+7,4,4,c);rect(x+9,y+8,2,1,'#f0d2b9');}
 else if(e.glyph==='idol'){rect(x+4,y+5,12,13,'#73664f');rect(x+5,y+3,10,6,c);rect(x+6,y+6,3,2,'#1a2029');rect(x+11,y+6,3,2,'#1a2029');rect(x+8,y+10,4,6,'#251e29');rect(x+2,y+18,16,2,'#c4ab77');}
 else if(e.glyph==='orb'){for(let i=0;i<3;i++)circle(x+6+i*4,y+11+(i%2?2:-2),4,'#425b64');circle(x+10,y+9,5,c);rect(x+8,y+8,4,2,'#d5e3c8');rect(x+10,y+14,1,5,c);}
 else if(e.glyph==='horn'){rect(x+4,y+7,12,11,'#64414d');line(x+5,y+8,x+2,y+2,c,3);line(x+15,y+8,x+18,y+2,c,3);rect(x+6,y+6,8,8,c);rect(x+7,y+8,2,2,'#31283c');rect(x+11,y+8,2,2,'#31283c');rect(x+8,y+13,4,3,'#201b2c');}
 else{for(let i=0;i<5;i++){line(x+10,y+11,x-4+i*7,y+23,'#7f5e96',3);line(x+10,y+9,x-4+i*7,y-3,'#71558b',2);}circle(x+10,y+10,10,'#554469');circle(x+10,y+10,7,c);circle(x+10,y+10,4,'#ebdfb9');rect(x+9,y+6,3,8,'#362039');}
 if(e.stun){rect(x+8,y-3,4,2,'#e8cf98');}
 const ratio=e.hp/e.maxHp;rect(x+2,y+19,16,2,'#282033');rect(x+2,y+19,Math.max(1,Math.floor(16*ratio)),2,'#b56e85');ctx.restore();
}
function object(e,x,y){
 if(e.kind==='enemy'){creature(e,x,y);return;}
 if(e.kind==='anchor'){circle(x+10,y+10,7,'#503342');line(x+10,y+2,x+10,y+18,'#d18baf',2);line(x+2,y+10,x+18,y+10,'#d18baf',2);line(x+4,y+4,x+16,y+16,'#a66391',2);line(x+16,y+4,x+4,y+16,'#a66391',2);circle(x+10,y+10,2,'#f4d5c0');}
 else if(e.kind==='captive'){circle(x+10,y+5,3,e.freed?'#d9e9be':'#b8c7e2');rect(x+7,y+9,6,8,e.freed?'#82b9a1':'#6b7996');line(x+5,y+3,x+15,y+3,e.freed?'#e8d69c':'#ab82b0');if(!e.freed){rect(x+5,y+12,10,2,'#b680a3');}}
 else if(e.kind==='shrine'){rect(x+3,y+14,14,5,'#546b7b');rect(x+6,y+9,8,5,'#829096');line(x+10,y+2,x+15,y+7,e.used?'#70777e':'#e5cf9a',2);line(x+15,y+7,x+10,y+12,e.used?'#70777e':'#e5cf9a',2);line(x+10,y+12,x+5,y+7,e.used?'#70777e':'#e5cf9a',2);line(x+5,y+7,x+10,y+2,e.used?'#70777e':'#e5cf9a',2);}
 else if(e.kind==='lore'){rect(x+4,y+3,12,15,'#697b89');for(let i=0;i<3;i++)rect(x+7,y+6+i*4,6,1,'#e1c58c');}
 else if(e.kind==='stairs'){rect(x+3,y+3,14,15,'#0a101c');for(let i=0;i<4;i++)rect(x+4+i,y+4+i*3,12-i*2,2,'#c4aa78');}
 else if(e.kind==='altar'){circle(x+10,y+10,8,'#655273');circle(x+10,y+10,5,'#121723');circle(x+10,y+10,2,'#f3da9c');for(let i=0;i<4;i++){const a=i*Math.PI/2;line(x+10+Math.cos(a)*6,y+10+Math.sin(a)*6,x+10+Math.cos(a)*9,y+10+Math.sin(a)*9,'#e9d9aa',2);}}
 else if(e.kind==='light'){circle(x+10,y+10,6,'#53533e');circle(x+10,y+10,3,'#f2dda6');rect(x+9,y+4,2,12,'#e8c986');}
 else if(e.kind==='tonic'){rect(x+8,y+3,4,3,'#d8cab0');rect(x+6,y+6,8,10,'#80b5c4');rect(x+7,y+7,2,6,'#c0e7df');rect(x+6,y+13,8,3,'#6097ae');}
}
function draw(){
 ctx.clearRect(0,0,canvas.width,canvas.height);rect(0,0,860,540,'#080d16');
 // A quiet star field marks unexplored space without revealing room geometry.
 for(let i=0;i<120;i++){const x=(i*179+17)%860,y=(i*97+31)%540;rect(x,y,1,1,i%3?'#172033':'#263044');}
 if(!run){ctx.textAlign='center';ctx.fillStyle='#b6aa91';ctx.font='20px Georgia';ctx.fillText('THE BURIED SANCTUARY',430,260);ctx.font='12px system-ui';ctx.fillStyle='#66748b';ctx.fillText('Choose the light you carry.',430,285);return;}
 const f=run.floor;
 for(let y=0;y<A.H;y++)for(let x=0;x<A.W;x++){const k=A.key(x,y);if(f.explored[k])tile(x,y,f.visible[k],f.tiles[k]===0);}
 if(run.ward&&run.ward.until>run.turn){const w=run.ward;for(let y=w.y-2;y<=w.y+2;y++)for(let x=w.x-2;x<=w.x+2;x++)if(x>=0&&y>=0&&x<A.W&&y<A.H&&f.visible[A.key(x,y)]&&f.tiles[A.key(x,y)]===1){ctx.fillStyle='#6bb58a22';ctx.fillRect(x*T,y*T,T,T);}}
 const anchor=f.entities.find(e=>e.kind==='anchor'&&e.hp>0),captive=f.entities.find(e=>e.kind==='captive'&&!e.freed);
 if(anchor&&captive&&f.visible[A.key(anchor.x,anchor.y)]&&f.visible[A.key(captive.x,captive.y)]){ctx.setLineDash([3,4]);line(anchor.x*T+10,anchor.y*T+10,captive.x*T+10,captive.y*T+10,'#ae77a577');ctx.setLineDash([]);}
 for(const e of f.entities){const k=A.key(e.x,e.y);if(e.kind==='gone'||e.kind==='enemy'&&e.hp<=0||!f.explored[k])continue;if(!f.visible[k]&&e.kind==='enemy')continue;ctx.globalAlpha=f.visible[k]?1:.32;object(e,e.x*T,e.y*T);ctx.globalAlpha=1;}
 const x=run.x*T,y=run.y*T,p=A.PATRONS[run.patron];
 circle(x+10,y+4,5,'#bba67c');circle(x+10,y+4,3,'#242f42');rect(x+8,y+5,5,4,'#edccb0');rect(x+6,y+10,9,8,p.color);rect(x+4,y+12,3,5,'#aeb7ce');rect(x+15,y+12,3,5,'#e9d7a6');rect(x+7,y+18,3,2,'#dce3da');rect(x+12,y+18,3,2,'#dce3da');
 if(run.empowered){line(x+2,y+3,x+2,y+17,'#ead590',2);line(x+18,y+3,x+18,y+17,'#ead590',2);}
 ctx.strokeStyle=p.color;ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,19,19);
}
for(const id of ['save','export'])$(id).disabled=true;
CreationUI.init({onBegin:begin,onLoad:load,onCancel:focusGame,hasRun:()=>!!run,hasSaved:()=>!!readStorage(RUN_KEY)});update();welcome();
