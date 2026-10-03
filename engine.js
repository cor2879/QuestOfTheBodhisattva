/* Quest of the Bodhisattva — original game rules. No external runtime dependencies. */
(function(root){
'use strict';
const W=43,H=27,MAX_FLOOR=5,DIRS=[[0,-1],[0,1],[-1,0],[1,0]];
const PATRONS={
 ariel:{name:'Ariel',title:'Keeper of Living Creation',color:'#89d6ad',symbol:'✧',hp:42,attack:7,power:'Verdant Ward',cost:4,description:'Sanctify the ground around you. Restore 5 vitality and halve harm within the ward for five turns.',relic:'Seed of the First Garden'},
 samael:{name:'Samael',title:'Flame of Judgment',color:'#ef9c82',symbol:'✦',hp:38,attack:9,power:'Severance',cost:4,description:'Sever a visible binding within five steps, or burn the nearest visible horror for 16 harm, ignoring its ward.',relic:'Sword of the Unbinding'},
 raphael:{name:'Raphael',title:'Light of Restoration',color:'#89cdda',symbol:'☼',hp:46,attack:6,power:'Restoring Light',cost:4,description:'Restore 15 vitality, clear dread, and shelter yourself from the next enemy turn.',relic:'Vessel of the Living Breath'},
 jophiel:{name:'Jophiel',title:'Beauty, Art, and Illumination',color:'#e6ce83',symbol:'◇',hp:36,attack:8,power:'Revelation',cost:4,description:'Reveal the surrounding ruins, stun nearby horrors for two turns, and empower your next strike.',relic:'Lantern of the Unseen Word'},
 lilith:{name:'Lilith',title:'Sovereignty and the Hidden Ways',color:'#c49ee1',symbol:'☾',hp:40,attack:8,power:'Veil of Sovereignty',cost:4,description:'Move beneath the horrors’ notice for two enemy turns, clear dread, and add 8 harm to your next strike.',relic:'Key of the Uncommanded'}
};
const TYPES=[
 {id:'custodian',name:'Many-Eyed Custodian',hp:16,attack:3,color:'#b499d9',glyph:'eye'},
 {id:'choir',name:'Entombed Choir',hp:18,attack:3,color:'#99bed1',glyph:'choir'},
 {id:'weaver',name:'Cord Weaver',hp:20,attack:4,color:'#ca8ea9',glyph:'spider'},
 {id:'idol',name:'Hollow Idol',hp:26,attack:4,color:'#c8b88b',glyph:'idol'},
 {id:'thought',name:'Stray Thought',hp:15,attack:4,color:'#91bdb4',glyph:'orb'},
 {id:'herald',name:'Threshold Herald',hp:30,attack:5,color:'#d19476',glyph:'horn'}
];
const RELICS=[
 {id:'edge',name:'Blade of Clear Intention',description:'+2 strike harm.',stat:'attack',value:2},
 {id:'vessel',name:'Vessel of Dawn',description:'+8 maximum vitality; restore 8 vitality.',stat:'maxHp',value:8},
 {id:'lamp',name:'Unfading Lamp',description:'+3 maximum light; restore 3 light.',stat:'maxLight',value:3},
 {id:'mantle',name:'Mantle of Mercy',description:'Reduce every incoming blow by 1.',stat:'armor',value:1},
 {id:'lens',name:'Lens of the Inner Eye',description:'+1 sight radius.',stat:'sight',value:1},
 {id:'ember',name:'Ember of Resolve',description:'Defeated horrors restore 2 extra light.',stat:'recovery',value:2}
];
const LORE=[
 {title:'The Prison Beneath the Temple',text:'The builders called their engine a sanctuary. Its light came from captive souls. Every cord you sever disproves the lie carved above its gate.'},
 {title:'The Choir Without Breath',text:'A hundred voices were mortared into the stone. They sing to keep the Dreamer asleep, yet each note teaches it another human longing.'},
 {title:'The Geometry of a True Name',text:'A true name is a relationship, not a command. To learn it, witness what a being was before it became a weapon.'},
 {title:'The Mercy of the Threshold',text:'Judgment without discernment feeds the prison. Mercy without courage leaves its doors closed. The path asks for both.'},
 {title:'The Name Before the Hunger',text:'Before the harvest, the Sleeper guarded a living sea. Its first name was Oru—the Listener. Three liberated witnesses and three recovered fragments can call it back.'}
];
function rng(seed){let n=2166136261;for(const c of String(seed)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return()=>{n+=0x6D2B79F5;let t=Math.imul(n^(n>>>15),1|n);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296;};}
function key(x,y){return y*W+x;}
function dist(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);}
function inside(x,y){return x>=0&&y>=0&&x<W&&y<H;}
function flood(tiles,start){const seen=new Set([key(start.x,start.y)]),queue=[start];for(let i=0;i<queue.length;i++){const p=queue[i];for(const [dx,dy]of DIRS){const x=p.x+dx,y=p.y+dy,k=key(x,y);if(inside(x,y)&&tiles[k]===1&&!seen.has(k)){seen.add(k);queue.push({x,y});}}}return seen;}
function generate(seed,depth){
 const random=rng(seed+':'+depth),integer=(a,b)=>a+Math.floor(random()*(b-a+1)),tiles=Array(W*H).fill(0),rooms=[];
 function carve(x,y){if(x>0&&y>0&&x<W-1&&y<H-1)tiles[key(x,y)]=1;}
 // One room in each cell, linked by a spanning chain. Every floor is connected.
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){
  const x=2+col*10+integer(0,2),y=2+row*8+integer(0,1),w=integer(5,7),h=integer(4,5);
  const room={x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2)};rooms.push(room);
  for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)carve(xx,yy);
 }
 const link=(a,b)=>{let x=a.cx,y=a.cy;const horizontal=random()<.5;const xs=()=>{while(x!==b.cx){carve(x,y);x+=Math.sign(b.cx-x);}carve(x,y);};const ys=()=>{while(y!==b.cy){carve(x,y);y+=Math.sign(b.cy-y);}carve(x,y);};if(horizontal){xs();ys();}else{ys();xs();}};
 for(let i=1;i<rooms.length;i++)link(rooms[i-1],rooms[i]);
 for(let i=0;i<5;i++)link(rooms[integer(0,11)],rooms[integer(0,11)]);
 const start={x:rooms[0].cx,y:rooms[0].cy},exit={x:rooms[11].cx,y:rooms[11].cy},used=new Set([key(start.x,start.y),key(exit.x,exit.y)]);
 function place(room,min=0){const options=[];for(let y=room.y;y<room.y+room.h;y++)for(let x=room.x;x<room.x+room.w;x++)if(!used.has(key(x,y))&&dist({x,y},start)>=min)options.push({x,y});const p=options[integer(0,options.length-1)];if(!p)throw Error('No room for encounter');used.add(key(p.x,p.y));return p;}
 const entities=[
  {...place(rooms[5]),kind:'anchor',name:'Astral Binding',hp:18,maxHp:18},
  {...place(rooms[6]),kind:'captive',name:'Bound Witness',freed:false},
  {...place(rooms[3]),kind:'shrine',name:'Sanctuary of Remembrance',used:false},
  {...place(rooms[8]),kind:'lore',name:LORE[depth-1].title,index:depth-1},
  {...exit,kind:depth===MAX_FLOOR?'altar':'stairs',name:depth===MAX_FLOOR?'Threshold of Oru':'Descending Stair'}
 ];
 for(let i=0;i<4;i++)entities.push({...place(rooms[integer(1,10)]),kind:i===0?'tonic':'light',name:i===0?'Restoring Tonic':'Gathered Light'});
 for(let i=0;i<5+depth;i++){
  const type=TYPES[(i+depth-1)%TYPES.length],p=place(rooms[integer(1,10)],8);
  entities.push({...p,...type,kind:'enemy',hp:type.hp+depth*2,maxHp:type.hp+depth*2,attack:type.attack+Math.floor(depth/3),bound:i%3===0,stun:0});
 }
 if(depth===MAX_FLOOR)entities.push({...place(rooms[11]),kind:'enemy',id:'dreamer',name:'Oru, the Devouring Dream',glyph:'boss',hp:100,maxHp:100,attack:8,color:'#d3a4dc',bound:true,stun:0,boss:true});
 return {tiles,rooms,start,entities,explored:Array(W*H).fill(false),visible:Array(W*H).fill(false)};
}
function los(f,a,b){let x=a.x,y=a.y,dx=Math.abs(b.x-x),dy=-Math.abs(b.y-y),sx=x<b.x?1:-1,sy=y<b.y?1:-1,err=dx+dy;for(;;){if(x===b.x&&y===b.y)return true;if((x!==a.x||y!==a.y)&&f.tiles[key(x,y)]!==1)return false;let e=err*2;if(e>=dy){err+=dy;x+=sx;}if(e<=dx){err+=dx;y+=sy;}}}
function newRun(patron,seed,creation){if(!PATRONS[patron])throw Error('Unknown Monad');const p=PATRONS[patron];const s={version:1,seed:String(seed).slice(0,40),patron,depth:1,turn:0,status:'playing',hp:p.hp,maxHp:p.hp,light:12,maxLight:12,attack:p.attack,armor:0,sight:7,recovery:0,kits:2,dread:0,rescued:0,fragments:[],relics:[],kills:0,ward:null,shield:0,empowered:false,pendingRelics:null,log:[],floor:generate(String(seed).slice(0,40),1)};
 if(creation)s.creation=JSON.parse(JSON.stringify(creation));
 s.x=s.floor.start.x;s.y=s.floor.start.y;log(s,p.name+' is your Monad. Descend, discern, and return the captive light.');reveal(s);return s;}
function log(s,t){s.log.push(t);if(s.log.length>60)s.log.shift();}
function at(s,x,y){return s.floor.entities.find(e=>e.x===x&&e.y===y&&e.kind!=='gone'&&!(e.kind==='enemy'&&e.hp<=0));}
function reveal(s){s.floor.visible.fill(false);for(let y=Math.max(0,s.y-s.sight);y<=Math.min(H-1,s.y+s.sight);y++)for(let x=Math.max(0,s.x-s.sight);x<=Math.min(W-1,s.x+s.sight);x++)if(Math.hypot(x-s.x,y-s.y)<=s.sight&&los(s.floor,s,{x,y})){s.floor.visible[key(x,y)]=true;s.floor.explored[key(x,y)]=true;}}
function damage(s,e,n,pierce=false){
 if(!pierce&&e.kind==='enemy'&&e.bound&&s.floor.entities.some(a=>a.kind==='anchor'&&a.hp>0))n=Math.max(1,Math.floor(n/2));
 e.hp=Math.max(0,e.hp-n);log(s,(e.kind==='anchor'?'Binding':e.name)+' suffers '+n+'.');
 if(e.hp<=0){if(e.kind==='anchor'){e.kind='gone';log(s,'The astral cords collapse. The witness and warded horrors are unbound.');}
 else{s.kills++;s.light=Math.min(s.maxLight,s.light+3+s.recovery);log(s,e.name+' dissolves. Its stolen light returns.');if(e.boss){s.status='won';s.ending='judgment';log(s,'The Dream breaks. You lead the surviving witnesses into dawn.');}}}
}
function enemyTurn(s){
 if(s.status!=='playing')return;
 const enemies=s.floor.entities.filter(e=>e.kind==='enemy'&&e.hp>0);
 // BFS from the player: monsters pursue around walls, rather than through them.
 const distances=new Map([[key(s.x,s.y),0]]),queue=[{x:s.x,y:s.y}];
 for(let i=0;i<queue.length;i++){let p=queue[i],d=distances.get(key(p.x,p.y));if(d>=9)continue;for(const[dx,dy]of DIRS){const x=p.x+dx,y=p.y+dy,k=key(x,y);if(inside(x,y)&&s.floor.tiles[k]===1&&!distances.has(k)){distances.set(k,d+1);queue.push({x,y});}}}
 for(const e of enemies){
  if(s.status!=='playing')break;
  if(e.stun>0){e.stun--;continue;}
  const d=distances.get(key(e.x,e.y));if(d===undefined||d>7)continue;
  if(d===1){
   let n=e.attack+(e.boss?Math.max(0,2-s.rescued):0);
   if(s.shield>0)n=0;
   if(s.ward&&s.ward.until>s.turn&&dist(s,s.ward)<=2)n=Math.ceil(n/2);
   n=Math.max(0,n-s.armor);s.hp=Math.max(0,s.hp-n);
   if(e.id==='choir'&&n>0)s.dread=Math.min(5,s.dread+1);
   log(s,e.name+(n?' strikes for '+n+'.':' meets your protective light.'));
   if(s.hp===0){s.status='lost';log(s,'Your vessel falls. The sanctuary remembers what you learned.');}
  }else{
   const choices=DIRS.map(([dx,dy])=>({x:e.x+dx,y:e.y+dy})).filter(p=>inside(p.x,p.y)&&s.floor.tiles[key(p.x,p.y)]===1&&!at(s,p.x,p.y)&&!(p.x===s.x&&p.y===s.y)&&distances.has(key(p.x,p.y)));
   choices.sort((a,b)=>distances.get(key(a.x,a.y))-distances.get(key(b.x,b.y)));
   if(choices.length&&distances.get(key(choices[0].x,choices[0].y))<d){e.x=choices[0].x;e.y=choices[0].y;}
  }
 }
 if(s.shield>0)s.shield--;
}
function advance(s){s.turn++;enemyTurn(s);reveal(s);}
function collect(s){const e=at(s,s.x,s.y);if(!e)return;if(e.kind==='light'){s.light=Math.min(s.maxLight,s.light+5);e.kind='gone';log(s,'You gather 5 light.');}else if(e.kind==='tonic'){s.kits++;e.kind='gone';log(s,'You recover a restoring tonic.');}}
function interact(s){
 const objects=s.floor.entities.filter(e=>['anchor','captive','shrine','lore','stairs','altar'].includes(e.kind)&&dist(s,e)<=1);
 const e=objects.find(e=>e.x===s.x&&e.y===s.y)||objects[0];
 if(!e){log(s,'Approach a witness, binding, inscription, shrine, or stair.');return false;}
 if(e.kind==='anchor'){damage(s,e,s.attack);return true;}
 if(e.kind==='captive'){
  if(e.freed){log(s,'The witness remembers your mercy.');return false;}
  if(s.floor.entities.some(a=>a.kind==='anchor'&&a.hp>0)){log(s,'An astral cord holds this witness. Break the binding first.');return false;}
  e.freed=true;s.rescued++;s.hp=Math.min(s.maxHp,s.hp+6);s.light=Math.min(s.maxLight,s.light+4);log(s,'A witness is liberated. Their remembrance weakens Oru and restores your light.');return true;
 }
 if(e.kind==='lore'){if(!s.fragments.includes(e.index))s.fragments.push(e.index);e.kind='gone';log(s,'Recovered: '+LORE[e.index].title+'.');return true;}
 if(e.kind==='shrine'){
  if(e.used){log(s,'This sanctuary has given its remembrance.');return false;}
  const r=rng(s.seed+':relic:'+s.depth),choices=RELICS.slice();for(let i=choices.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}s.pendingRelics=choices.slice(0,3).map(r=>r.id);e.used=true;return false;
 }
 if(e.kind==='altar'){
  if(s.fragments.length>=3&&s.rescued>=3){s.status='won';s.ending='liberation';log(s,'You speak Oru’s first name. The hunger loosens; the Listener wakes. No soul remains fuel for its dream.');return true;}
  log(s,'The threshold needs three liberated witnesses and three lore fragments. You may still defeat Oru in combat.');return false;
 }
 s.depth++;const f=generate(s.seed,s.depth);s.floor=f;s.x=f.start.x;s.y=f.start.y;s.ward=null;s.dread=Math.max(0,s.dread-2);s.hp=Math.min(s.maxHp,s.hp+8);s.light=Math.min(s.maxLight,s.light+4);
 if(s.depth===5){const boss=f.entities.find(e=>e.boss);boss.hp=boss.maxHp=Math.max(55,100-s.rescued*9);log(s,'The last threshold. Each liberated witness has diminished the Dream.');}
 else log(s,'You descend to stratum '+s.depth+'. The stair restores 8 vitality and 4 light.');
 return true;
}
function power(s){
 const p=PATRONS[s.patron];if(s.light<p.cost){log(s,'You need '+p.cost+' light. Gather sparks or defeat horrors.');return false;}
 if(s.patron==='samael'){
  const binding=s.floor.entities.find(e=>e.kind==='anchor'&&dist(s,e)<=5&&los(s.floor,s,e));
  const targets=s.floor.entities.filter(e=>e.kind==='enemy'&&e.hp>0&&dist(s,e)<=5&&los(s.floor,s,e)).sort((a,b)=>dist(s,a)-dist(s,b));
  if(binding)damage(s,binding,99);else if(targets.length)damage(s,targets[0],16,true);else{log(s,'No binding or horror is visible within five steps.');return false;}
 }else if(s.patron==='ariel'){s.hp=Math.min(s.maxHp,s.hp+5);s.ward={x:s.x,y:s.y,until:s.turn+6};log(s,'Living light roots into the stone. Your ward shelters a five-by-five area.');}
 else if(s.patron==='raphael'){s.hp=Math.min(s.maxHp,s.hp+15);s.dread=0;s.shield=1;log(s,'Restoring Light mends your vessel and shields the next enemy turn.');}
 else if(s.patron==='lilith'){s.dread=0;s.shield=2;s.empowered=true;log(s,'The Veil shelters you for two enemy turns. No command owns your will; your next strike gains 8 harm.');}
 else {for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(dist(s,{x,y})<=11)s.floor.explored[key(x,y)]=true;for(const e of s.floor.entities)if(e.kind==='enemy'&&dist(s,e)<=5&&los(s.floor,s,e))e.stun=2;s.empowered=true;log(s,'Revelation illuminates the ruins. Nearby horrors falter; your next strike gains 8 harm.');}
 s.light-=p.cost;return true;
}
function act(s,action){
 if(s.status!=='playing'||s.pendingRelics)return false;
 let spent=false;
 if(Array.isArray(action)){
  const[dx,dy]=action;if(!DIRS.some(d=>d[0]===dx&&d[1]===dy))return false;
  const x=s.x+dx,y=s.y+dy;if(!inside(x,y)||s.floor.tiles[key(x,y)]!==1)return false;
  const e=at(s,x,y);
  if(e&&e.kind==='enemy'){damage(s,e,s.attack+ (s.empowered?8:0)-Math.floor(s.dread/2));s.empowered=false;}
  else{s.x=x;s.y=y;collect(s);}
  spent=true;
 }else if(action==='power')spent=power(s);
 else if(action==='interact')spent=interact(s);
 else if(action==='strike'){
  const e=s.floor.entities.find(e=>e.kind==='enemy'&&e.hp>0&&dist(s,e)===1);
  if(e){damage(s,e,s.attack+(s.empowered?8:0)-Math.floor(s.dread/2));s.empowered=false;spent=true;}
  else{log(s,'No adjacent horror. Move toward a foe to strike.');}
 }else if(action==='tonic'){
  if(s.kits===0){log(s,'No restoring tonics remain.');}
  else if(s.hp===s.maxHp&&s.dread===0){log(s,'Your vessel is already whole.');}
  else{s.kits--;s.hp=Math.min(s.maxHp,s.hp+18);s.dread=0;log(s,'A tonic restores 18 vitality and clears dread.');spent=true;}
 }else if(action==='wait'){log(s,'You hold your ground.');spent=true;}
 if(spent)advance(s);return spent;
}
function chooseRelic(s,id){if(!s.pendingRelics?.includes(id))return false;const r=RELICS.find(r=>r.id===id);s[r.stat]+=r.value;if(r.stat==='maxHp')s.hp+=r.value;if(r.stat==='maxLight')s.light+=r.value;s.light=Math.min(s.maxLight,s.light+4);s.relics.push(id);s.pendingRelics=null;s.hp=s.maxHp;s.light=s.maxLight;s.dread=0;log(s,r.name+' answers your intention. The shrine restores your vitality and light.');advance(s);return true;}
function serialize(s){return JSON.stringify({game:'QUEST_OF_THE_BODHISATTVA',version:1,state:s});}
function deserialize(text){
 if(typeof text!=='string'||text.length>200000)throw Error('Invalid save');
 const data=JSON.parse(text),s=data.state;
 if(!['QUEST_OF_THE_BODHISATTVA','AEON_DESCENT'].includes(data.game)||data.version!==1||!s||s.version!==1||!PATRONS[s.patron])throw Error('Invalid save');
 if(s.creation!==undefined){
  const c=s.creation;if(!c||typeof c.name!=='string'||c.name.length>24||!['reading','direct'].includes(c.method)||typeof c.seed!=='string'||c.seed.length>100||!Array.isArray(c.choices)||c.choices.length>4||c.choices.some(a=>!a||typeof a.id!=='string'||a.id.length>60||!PATRONS[a.choice]))throw Error('Invalid character reading');
  if(c.method==='reading'&&c.choices.length!==4)throw Error('Incomplete character reading');
 }
 const integer=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
 if(typeof s.seed!=='string'||s.seed.length>40||!integer(s.depth,1,5)||!integer(s.x,0,W-1)||!integer(s.y,0,H-1)||!integer(s.maxHp,1,200)||!integer(s.hp,0,s.maxHp)||!integer(s.maxLight,1,100)||!integer(s.light,0,s.maxLight)||!integer(s.turn,0,1000000)||!['playing','won','lost'].includes(s.status))throw Error('Invalid save state');
 for(const field of ['attack','armor','sight','recovery','kits','dread','rescued','kills'])if(!integer(s[field],0,field==='kills'?10000:200))throw Error('Invalid character state');
 if(!Array.isArray(s.relics)||s.relics.length>30||s.relics.some(id=>!RELICS.some(r=>r.id===id))||!Array.isArray(s.fragments)||s.fragments.length>5||s.fragments.some(i=>!integer(i,0,4))||new Set(s.fragments).size!==s.fragments.length)throw Error('Invalid discoveries');
 const f=s.floor;if(!f||!Array.isArray(f.tiles)||f.tiles.length!==W*H||f.tiles.some(v=>v!==0&&v!==1)||f.tiles[key(s.x,s.y)]!==1||!Array.isArray(f.entities)||f.entities.length>60)throw Error('Invalid dungeon');
 for(const field of ['visible','explored'])if(!Array.isArray(f[field])||f[field].length!==W*H||f[field].some(v=>typeof v!=='boolean'))throw Error('Invalid map visibility');
 for(const e of f.entities){
  if(!e||!integer(e.x,0,W-1)||!integer(e.y,0,H-1)||f.tiles[key(e.x,e.y)]!==1||!['enemy','anchor','captive','shrine','lore','stairs','altar','tonic','light','gone'].includes(e.kind)||typeof e.name!=='string'||e.name.length>100)throw Error('Invalid encounter');
  if(e.kind==='enemy'||e.kind==='anchor'){if(!integer(e.hp,0,200)||!integer(e.maxHp,1,200))throw Error('Invalid enemy');}
  if(e.kind==='enemy'&&(!integer(e.attack,0,30)||!integer(e.stun,0,10)||typeof e.bound!=='boolean'||!['custodian','choir','weaver','idol','thought','herald','dreamer'].includes(e.id)))throw Error('Invalid horror');
  if(e.kind==='lore'&&!integer(e.index,0,4))throw Error('Invalid inscription');
 }
 if(!Array.isArray(s.log)||s.log.length>60||s.log.some(t=>typeof t!=='string'||t.length>1000)||typeof s.empowered!=='boolean'||!integer(s.shield,0,10))throw Error('Invalid journey log');
 if(s.pendingRelics!==null&&(!Array.isArray(s.pendingRelics)||s.pendingRelics.length!==3||s.pendingRelics.some(id=>!RELICS.some(r=>r.id===id))))throw Error('Invalid relic choice');
 if(s.ward!==null&&(!s.ward||!integer(s.ward.x,0,W-1)||!integer(s.ward.y,0,H-1)||!integer(s.ward.until,0,1000010)))throw Error('Invalid ward');
 const reached=flood(f.tiles,s);if(f.entities.some(e=>!reached.has(key(e.x,e.y))))throw Error('Disconnected save');
 reveal(s);return s;
}
root.Aeon={W,H,MAX_FLOOR,PATRONS,MONADS:PATRONS,TYPES,RELICS,LORE,DIRS,rng,key,dist,flood,generate,newRun,act,chooseRelic,serialize,deserialize,reveal,at,los};
if(typeof module!=='undefined')module.exports=root.Aeon;
})(typeof globalThis!=='undefined'?globalThis:this);
