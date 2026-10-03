const assert=require('node:assert/strict'),A=require('../engine.js');
// Every placement is unique, walkable, reachable, and reproducible.
for(let n=0;n<300;n++)for(let depth=1;depth<=5;depth++){
 const f=A.generate('WORLD-'+n,depth),reachable=A.flood(f.tiles,f.start);
 assert.equal(reachable.size,f.tiles.filter(t=>t===1).length);
 assert.equal(new Set(f.entities.map(e=>A.key(e.x,e.y))).size,f.entities.length);
 for(const e of f.entities){assert(reachable.has(A.key(e.x,e.y)));if(e.kind==='enemy')assert(A.dist(f.start,e)>=8);}
 assert.deepEqual(f,A.generate('WORLD-'+n,depth));
 assert.equal(f.entities.filter(e=>e.kind==='captive').length,1);
 assert.equal(f.entities.filter(e=>e.boss).length,depth===5?1:0);
}
function isolated(id){const s=A.newRun(id,'RULES');s.floor.tiles.fill(1);s.floor.entities=[];s.x=10;s.y=10;A.reveal(s);return s;}
function enemy(x=11,y=10){return{x,y,kind:'enemy',id:'custodian',name:'Test horror',glyph:'eye',hp:40,maxHp:40,attack:6,bound:false,stun:0};}
let s=isolated('samael');s.floor.entities.push({...enemy(),bound:true},{x:12,y:10,kind:'anchor',name:'Binding',hp:18,maxHp:18});
A.act(s,'strike');assert.equal(s.floor.entities[0].hp,36);assert.equal(s.hp,32);A.act(s,'power');assert.equal(s.floor.entities[1].kind,'gone');assert.equal(s.light,8);A.act(s,'strike');assert.equal(s.floor.entities[0].hp,27);
s=isolated('raphael');s.hp=12;s.dread=5;s.floor.entities.push(enemy());A.act(s,'power');assert.equal(s.hp,27);assert.equal(s.dread,0);assert.equal(s.light,8);A.act(s,'wait');assert.equal(s.hp,21);
s=isolated('ariel');s.hp=12;s.floor.entities.push(enemy());A.act(s,'power');assert.equal(s.hp,14);assert(s.ward);for(let i=0;i<5;i++)A.act(s,'wait');assert.equal(s.ward.until,s.turn);
s=isolated('jophiel');s.floor.entities.push(enemy());A.act(s,'power');assert.equal(s.hp,s.maxHp);assert(s.empowered);A.act(s,'strike');assert.equal(s.floor.entities[0].hp,24);assert.equal(s.hp,s.maxHp);assert(!s.empowered);A.act(s,'wait');assert.equal(s.hp,s.maxHp-6);
s=isolated('samael');s.light=0;const turn=s.turn;assert(!A.act(s,'power'));assert.equal(s.turn,turn);assert(!A.act(s,'strike'));assert.equal(s.turn,turn);s.floor.tiles[A.key(10,9)]=0;assert(!A.act(s,[0,-1]));assert.equal(s.turn,turn);
s=isolated('ariel');s.hp=10;s.floor.entities.push({x:10,y:10,kind:'captive',name:'Witness',freed:false},{x:12,y:10,kind:'anchor',name:'Binding',hp:18,maxHp:18});assert(!A.act(s,'interact'));s.floor.entities.pop();assert(A.act(s,'interact'));assert.equal(s.rescued,1);assert.equal(s.hp,16);assert(!A.act(s,'interact'));assert.equal(s.rescued,1);
s=isolated('jophiel');s.floor.entities.push({x:10,y:10,kind:'shrine',name:'Shrine',used:false});A.act(s,'interact');assert.equal(s.pendingRelics.length,3);assert.equal(s.turn,0);assert(!A.act(s,[0,1]));assert(!A.chooseRelic(s,'invalid'));assert(A.chooseRelic(s,s.pendingRelics[0]));assert.equal(s.turn,1);assert(!A.act(s,'interact'));
s=isolated('samael');s.depth=5;s.fragments=[0,1,2];s.rescued=3;s.floor.entities.push({x:10,y:10,kind:'altar',name:'Threshold'});A.act(s,'interact');assert.equal(s.status,'won');assert.equal(s.ending,'liberation');assert(!A.act(s,'wait'));
s=isolated('samael');const boss=enemy();boss.hp=1;boss.boss=true;s.floor.entities.push(boss);A.act(s,'strike');assert.equal(s.status,'won');assert.equal(s.ending,'judgment');assert.equal(s.hp,s.maxHp);
s=isolated('jophiel');s.hp=1;s.floor.entities.push(enemy());A.act(s,'wait');assert.equal(s.status,'lost');assert.equal(s.hp,0);assert(!A.act(s,'power'));
for(const id of Object.keys(A.PATRONS)){
 s=A.newRun(id,'SAVE');assert.deepEqual(A.deserialize(A.serialize(s)),s);
 const payload=JSON.parse(A.serialize(s));payload.state.floor.entities[0].x=-1;assert.throws(()=>A.deserialize(JSON.stringify(payload)));assert.equal(s.floor.entities[0].x>=0,true);
 const bad=JSON.parse(A.serialize(s));bad.state.light=999;assert.throws(()=>A.deserialize(JSON.stringify(bad)));
}
assert.throws(()=>A.deserialize('not json'));assert.throws(()=>A.deserialize(JSON.stringify({game:'Other'})));
console.log('PASS: 1,500 generated floors; patron powers; turn costs; bindings; relics; both endings; defeat; saves.');
