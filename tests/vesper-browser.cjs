const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
const completed='1,1,1,0,3,7,0,7,5,0,9,3,0';
const snap=p=>p.evaluate(()=>nativeSnapshot());
const saved=p=>p.evaluate(()=>JSON.stringify(nativeSaveData()));
async function begin(p,monad){await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForSelector('#welcome[open]');await p.click('#choose-direct');await p.click('[data-monad="'+monad+'"]');await p.click('#begin');}
async function walk(p,gx,gy){await p.evaluate(({gx,gy})=>{
 const s=nativeSnapshot(),town=s.location===1||s.location===3,start=town?[s.px,s.py]:[s.x,s.y],dirs=[[0,-1,1],[0,1,2],[-1,0,3],[1,0,4]];
 const queue=[{x:start[0],y:start[1],route:[]}],seen=new Set([start.join(',')]);let route;
 for(let k=0;k<queue.length;k++){const a=queue[k];if(a.x===gx&&a.y===gy){route=a.route;break;}for(const[dx,dy,action]of dirs){const x=a.x+dx,y=a.y+dy,key=x+','+y;if(seen.has(key)||!nativeCall('quest_can_walk','number',['number','number'],[x,y]))continue;seen.add(key);queue.push({x,y,route:[...a.route,action]});}}
 if(!route)throw Error('No native route '+gx+','+gy);for(const action of route)nativeAct(action);
 },{gx,gy});}
async function archiveWalk(p,gx,gy){await p.evaluate(({gx,gy})=>{
 const map=nativeCall('quest_archive_map','string',[],[]),dirs=[[0,-1],[1,0],[0,1],[-1,0]];
 for(let step=0;step<400;step++){
  const s=nativeSnapshot(),d=nativeCall('quest_active_dungeon','string',[],[]).split(',').map(Number);if(s.hp<=0||s.food<=0)throw Error('Exhausted in Archive');if(s.px===gx&&s.py===gy)return;
  const near=[0,1,2].filter(i=>d[6+i*3]>0&&Math.abs(d[4+i*3]-s.px)+Math.abs(d[5+i*3]-s.py)<=3);
  const target=near.find(i=>Math.abs(d[4+i*3]-s.px)+Math.abs(d[5+i*3]-s.py)===1);
  if(s.monad===2&&s.hp<70&&s.light>=3){nativeAct(12);continue;}
  if(s.monad===0&&s.hp<80&&s.light>=3&&!s.ward){nativeAct(12);continue;}
  if(s.monad===3&&near.length&&s.light>=3&&!s.focus){nativeAct(12);continue;}
  if(s.monad===4&&near.length&&s.light>=3&&!s.veil&&!s.focus){nativeAct(12);continue;}
  let desired,attack=target!==undefined;
  if(attack)desired=dirs.findIndex(([x,y])=>s.px+x===d[4+target*3]&&s.py+y===d[5+target*3]);
  else{const queue=[{x:s.px,y:s.py,route:[]}],seen=new Set([s.px+','+s.py]);let route;
   for(let k=0;k<queue.length;k++){const a=queue[k];if(a.x===gx&&a.y===gy){route=a.route;break;}for(let i=0;i<4;i++){const x=a.x+dirs[i][0],y=a.y+dirs[i][1],key=x+','+y;if(x<0||x>10||y<0||y>10||seen.has(key)||map[y*11+x]!=='.')continue;seen.add(key);queue.push({x,y,route:[...a.route,i]});}}
   if(!route)throw Error('Generated map disconnected');desired=route[0];
  }
  const delta=(desired-d[3]+4)%4;if(delta)nativeAct(delta===3?3:delta===2?2:4);else nativeAct(attack?(s.monad===1&&s.light>=3?12:8):1);
 }
 throw Error('Archive navigation budget exceeded');
 },{gx,gy});}
async function converse(p,x,y,choice){await walk(p,x,y);await p.click('[data-native="6"]');await p.click('[data-option="'+choice+'"]');await p.click('#conversation-close');}
async function checkpoint(p,change={}){await p.evaluate(({completed,change})=>{const d=nativeSaveData();Object.assign(d.state,{location:0,x:43,y:40,px:0,py:0,quest:3,clue:1,blessing:1,resolution:1,experience:102,hp:100,food:100,gold:100},change);d.dungeon=completed;d.growth='14,0,0,0,0,0,0,0,0,0';nativeRestore(JSON.stringify(d));},{completed,change});}
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,headless:true});try{
 // 128 generated maps, including high seeds: connectivity, bounds and repeatability.
 const p=await b.newPage();await begin(p,'ariel');
 const maps=await p.evaluate(()=>{const result=[];for(const seed of [...Array.from({length:126},(_,i)=>i+1),2147483646,2147483647]){
  nativeCall('quest_set_seed',null,['number'],[seed]);const map=nativeCall('quest_archive_map','string',[],[]),data=nativeCall('quest_chapter','string',[],[]).split(',').map(Number),cache=nativeCall('quest_archive_cache','string',[],[]);nativeCall('quest_set_seed',null,['number'],[seed]);if(map!==nativeCall('quest_archive_map','string',[],[]))throw Error('Unstable seed');result.push({seed,map,data,cache});}return result;});
 for(const {map,data,cache}of maps){assert.equal(map.length,121);const q=[[1,9]],seen=new Set(['1,9']);for(let i=0;i<q.length;i++)for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=q[i][0]+dx,y=q[i][1]+dy,k=x+','+y;if(x<0||x>10||y<0||y>10||map[y*11+x]!=='.'||seen.has(k))continue;seen.add(k);q.push([x,y]);}assert.equal(seen.size,[...map].filter(c=>c==='.').length);assert(seen.has('9,1'));assert(seen.has(cache));assert.notEqual(cache,'9,1');assert.notEqual(cache,'1,9');for(let i=0;i<11;i++){assert.equal(map[i],'#');assert.equal(map[110+i],'#');assert.equal(map[i*11],'#');assert.equal(map[i*11+10],'#');}const occupied=new Set([cache]);for(let i=0;i<3;i++){const x=data[8+i*3],y=data[9+i*3];assert(seen.has(x+','+y));assert(!occupied.has(x+','+y));occupied.add(x+','+y);assert.equal(data[10+i*3],24+i*4);}}
 assert(new Set(maps.map(x=>x.map)).size>100);console.log('PASS 128 deterministic, connected, bounded native Archive seeds');
 // Gates do not bypass the first sanctuary or the new testimony quest.
 await p.evaluate(()=>{const d=nativeSaveData();d.state.x=54;d.state.y=40;nativeRestore(JSON.stringify(d));nativeAct(6);});assert.equal((await snap(p)).location,0);
 await checkpoint(p,{x:54,y:33});await p.evaluate(()=>nativeAct(6));assert.equal((await snap(p)).location,0);
 // A real version-four shape retains gear, depleted Light and first-quest progress.
 await p.evaluate(()=>{const d=nativeSaveData();d.version=4;delete d.chapter;d.growth='5,7,2,1,0,0,0,0,0,0';nativeRestore(JSON.stringify(d));});assert.equal((await snap(p)).light,5);assert.equal((await snap(p)).owned,7);assert.equal((await snap(p)).weapon,2);assert.equal((await snap(p)).armor,1);assert.equal((await snap(p)).vesperStage,0);assert.equal(await p.evaluate(()=>nativeSaveData().chapter.split(',')[0]),'1');
 for(const [xp,level,maxLight,next]of [[159,4,14,160],[160,5,16,240],[239,5,16,240],[240,6,18,0]]){await checkpoint(p,{experience:xp});const s=await snap(p);assert.equal(s.level,level);assert.equal(s.maxLight,maxLight);assert.equal(s.nextLevelXP,next);}
 console.log('PASS version-four gear/Light migration and level-five/six boundaries');await p.close();
 for(const[monad,width,height,intent,ending]of [['ariel',1280,720,61,9],['samael',844,390,62,10],['raphael',390,844,61,10],['jophiel',1280,720,62,9],['lilith',390,844,61,9]]){
  const p=await b.newPage({viewport:{width,height},hasTouch:width<1000}),errors=[];p.on('pageerror',e=>errors.push(e.message));await begin(p,monad);await checkpoint(p);const first=await p.evaluate(()=>nativeSaveData().dungeon);
  await walk(p,54,40);await p.click('[data-native="6"]');assert.equal((await snap(p)).location,3);assert((await p.locator('#native-place').textContent()).includes('VESPER'));
  // Native conversations and movement, no quest teleports or browser-side state changes.
  await converse(p,20,7,60);assert.equal((await snap(p)).vesperStage,1);
  await converse(p,9,16,64);assert.equal((await snap(p)).testimony,1);await converse(p,30,16,65);assert.equal((await snap(p)).vesperStage,2);
  const citySave=await saved(p);await p.reload();await p.waitForSelector('#welcome[open]');await p.click('#welcome-resume');assert.equal(await saved(p),citySave);
  await converse(p,20,7,intent);assert.equal((await snap(p)).vesperStage,3);assert.equal((await snap(p)).intent,intent===61?1:2);
  await converse(p,30,8,22);await converse(p,30,8,24);await converse(p,9,8,10);assert.equal((await snap(p)).weapon,1);assert.equal((await snap(p)).armor,1);
  await walk(p,20,21);await p.evaluate(()=>nativeAct(2));assert.equal((await snap(p)).location,0);assert.equal((await snap(p)).x,54);
  await walk(p,54,33);await p.click('[data-native="6"]');assert.equal((await snap(p)).location,4);const map=await p.evaluate(()=>nativeCall('quest_archive_map','string',[],[]));await p.evaluate(()=>nativeCall('quest_set_seed',null,['number'],[42]));assert.equal(await p.evaluate(()=>nativeCall('quest_archive_map','string',[],[])),map);
  // Cache contents are one-time, and rescue from scene 4 retains the seed and encounters.
  const cache=await p.evaluate(()=>nativeCall('quest_archive_cache','string',[],[]).split(',').map(Number));await archiveWalk(p,...cache);const cacheGold=(await snap(p)).gold;await p.evaluate(()=>nativeAct(6));assert.equal((await snap(p)).gold,cacheGold+15);await p.evaluate(()=>nativeAct(6));assert.equal((await snap(p)).gold,cacheGold+15);
  const middle=await saved(p),chapter=await p.evaluate(()=>nativeSaveData().chapter);await p.evaluate(()=>{const d=nativeSaveData();d.state.food=0;nativeRestore(JSON.stringify(d));nativeAct(6);});assert.equal((await snap(p)).location,0);assert.equal((await snap(p)).x,43);assert.equal(await p.evaluate(()=>nativeSaveData().chapter),chapter);await p.evaluate(middle=>nativeRestore(middle),middle);assert.equal(await saved(p),middle);
  // Entering/reloading keeps the seed and the independent first sanctuary intact.
  await archiveWalk(p,9,1);await p.click('[data-native="6"]');assert((await p.locator('#native-message').textContent()).includes('Nameless Choir'));
  await p.screenshot({path:'/tmp/quest-vesper-'+monad+'.png'});const dungeonSave=await saved(p);await p.reload();await p.waitForSelector('#welcome[open]');await p.click('#welcome-resume');assert.equal(await saved(p),dungeonSave);assert.equal(await p.evaluate(()=>nativeCall('quest_archive_map','string',[],[])),map);
  for(const change of [{chapter:'0,3,3,1,1,0,0,0,3,7,24,7,5,28,9,3,32'},{chapter:'999999999999999999999999999,3,3,1,1,0,0,0,3,7,24,7,5,28,9,3,32'},{location:3,x:43,y:40},{px:0},{growth:'14,0,0,0,999,0,0,0,0,0'}]){
   assert(await p.evaluate(change=>{const d=nativeSaveData();for(const [k,v]of Object.entries(change))if(k==='chapter'||k==='growth')d[k]=v;else d.state[k]=v;try{nativeRestore(JSON.stringify(d));return false;}catch{return true;}},change));assert.equal(await saved(p),dungeonSave);
  }
  // Effects, tonic and equipment work in scene 4; saved effects restore atomically.
  if(monad!=='raphael'&&monad!=='samael'){await p.click('#native-power');const effectSave=await saved(p);await p.evaluate(s=>nativeRestore(s),effectSave);assert.equal(await saved(p),effectSave);await p.evaluate(s=>nativeRestore(s),dungeonSave);}
  const before=await snap(p);await p.click('[data-native="'+ending+'"]');assert.equal((await snap(p)).choir,ending===9?1:2);assert.equal((await snap(p)).experience,before.experience);assert((await p.locator('#native-message').textContent()).includes(monad[0].toUpperCase()+monad.slice(1)));await p.evaluate(ending=>nativeAct(ending),ending);assert.equal((await snap(p)).experience,before.experience);
  await archiveWalk(p,1,9);await p.click('[data-native="6"]');assert.equal((await snap(p)).location,0);assert.equal(await p.evaluate(()=>nativeSaveData().dungeon),first);assert.equal((await snap(p)).x,54);assert.equal((await snap(p)).y,33);
  await walk(p,54,40);await p.click('[data-native="6"]');const xp=(await snap(p)).experience,gold=(await snap(p)).gold;await converse(p,20,7,63);assert.equal((await snap(p)).vesperStage,4);assert.equal((await snap(p)).experience,xp+60);assert.equal((await snap(p)).gold,gold+25);assert.equal((await snap(p)).level,5);assert.equal((await snap(p)).nextLevelXP,240);
  await p.evaluate(()=>{nativeCall('quest_option','number',['number'],[63]);});assert.equal((await snap(p)).experience,xp+60);
  const finalSave=await saved(p);await p.reload();await p.waitForSelector('#welcome[open]');await p.click('#welcome-resume');assert.equal(await saved(p),finalSave);
  // Universal rescue retains both chapter progress and both dungeon payloads.
  await p.evaluate(()=>{const d=nativeSaveData();d.state.food=0;nativeRestore(JSON.stringify(d));nativeAct(6);});assert.equal((await snap(p)).x,43);assert.equal((await snap(p)).location,0);assert.equal((await snap(p)).vesperStage,4);assert.equal(await p.evaluate(()=>nativeSaveData().dungeon),first);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(width>=650){assert.equal(await p.evaluate(()=>scrollY),0);const box=await p.locator('canvas').boundingBox();assert(box.y+box.height<=height);}assert.deepEqual(errors,[]);console.log('PASS Vesper native testimony, preparation, Archive combat, ending, return, save and rescue',monad,intent,ending);await p.close();
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
