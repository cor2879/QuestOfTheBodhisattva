const A=require('../engine.js'),assert=require('node:assert/strict');
function route(s,target){
 let q=[{x:s.x,y:s.y,path:[]}],seen=new Set([A.key(s.x,s.y)]);
 for(let i=0;i<q.length;i++){
  const p=q[i];if(p.x===target.x&&p.y===target.y)return p.path;
  for(const d of A.DIRS){const x=p.x+d[0],y=p.y+d[1],k=A.key(x,y);if(x<0||y<0||x>=A.W||y>=A.H||!s.floor.tiles[k]||seen.has(k))continue;seen.add(k);q.push({x,y,path:[...p.path,d]});}
 }return [];
}
function drive(patron,seed){
let s=A.newRun(patron,seed),limit=2500,commands=[];
function act(action){commands.push({action});A.act(s,action);}
function choose(id){commands.push({relic:id});A.chooseRelic(s,id);}
while(s.status==='playing'&&limit--){
 if(s.pendingRelics){const choices=s.pendingRelics;choose(choices.find(id=>id==='edge')||choices.find(id=>id==='mantle')||choices[0]);continue;}
 const adjacent=s.floor.entities.filter(e=>e.kind==='enemy'&&e.hp>0&&A.dist(s,e)===1);
 if(s.hp<s.maxHp-17&&s.kits){act('tonic');continue;}
 if(adjacent.length&&s.light>=4){
  if(patron==='raphael'&&s.hp<s.maxHp-12||patron==='ariel'&&(!s.ward||s.ward.until<=s.turn||A.dist(s,s.ward)>2)||patron==='lilith'&&!s.shield||patron==='jophiel'&&!s.empowered||patron==='samael'&&adjacent.some(e=>e.hp>s.attack)){act('power');continue;}
 }
 if(adjacent.length){act('strike');continue;}
 const target=s.floor.entities.find(e=>e.kind==='anchor'&&e.hp>0)||s.floor.entities.find(e=>e.kind==='captive'&&!e.freed)||s.floor.entities.find(e=>e.kind==='lore')||s.floor.entities.find(e=>e.kind==='shrine'&&!e.used)||s.floor.entities.find(e=>e.kind==='stairs'||e.kind==='altar');
 if(!target)throw Error('No objective');
 if(A.dist(s,target)<=1){
  if(target.kind==='anchor'&&patron==='samael'&&s.light>=4)act('power');else act('interact');
 }else{
  const p=route(s,target);if(!p.length)throw Error('Unreachable');act(p[0]);
 }
}
assert(limit>0,'Expedition stalled');
return {state:s,commands};
}
if(require.main===module){
 for(const patron of Object.keys(A.PATRONS)){
  const {state:s}=drive(patron,'EXPEDITION-2');
  assert.equal(s.status,'won');assert.equal(s.depth,5);assert.equal(s.rescued,5);assert.equal(s.fragments.length,5);assert.equal(s.relics.length,5);
  assert.equal(A.deserialize(A.serialize(s)).status,'won');
  console.log('PASS five-floor expedition',patron,s.turn,'turns',s.ending);
 }
 const {state:s}=drive('raphael','EXPEDITION-0');assert.equal(s.ending,'liberation');console.log('PASS liberation expedition',s.turn,'turns');
}
module.exports={drive};
