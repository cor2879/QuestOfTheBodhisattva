const assert=require('node:assert/strict'),A=require('../engine.js'),F=require('../fortune.js');
const reached=new Set(),questions=new Set();
assert.equal(Object.keys(F.PAIRS).length,10);
for(let seed=0;seed<120;seed++)for(let route=0;route<16;route++){
 const r=F.create('READ-'+seed),again=F.create(r.seed);assert.deepEqual(r,again);assert.equal(new Set(r.deck).size,5);
 for(let step=0;step<4;step++){
  const q=F.question(r),p=F.pair(r);questions.add(q.id);assert(q.choices[p[0]]&&q.choices[p[1]]);
  assert(!F.choose(r,'invalid'));const before=structuredClone(r);assert(F.choose(r,p[(route>>step)&1]));assert.deepEqual(F.undo(r),before);
 }
 assert.equal(r.history.length,4);assert.equal(F.pair(r),null);assert.equal(F.question(r),null);assert(!F.choose(r,r.result));reached.add(r.result);
 const creation={name:'The Wanderer',method:'reading',seed:r.seed,choices:r.history.map(({id,choice})=>({id,choice}))};
 const run=A.newRun(r.result,'WORLD',creation);assert.deepEqual(A.deserialize(A.serialize(run)),run);
 creation.name='Changed';assert.equal(run.creation.name,'The Wanderer');
}
assert.equal(reached.size,5);assert.equal(questions.size,20);
const s=A.newRun('lilith','POWER');s.floor.tiles.fill(1);s.floor.entities=[{x:s.x+1,y:s.y,kind:'enemy',id:'custodian',name:'Horror',glyph:'eye',hp:40,maxHp:40,attack:6,bound:false,stun:0}];s.dread=5;
A.act(s,'power');assert.equal(s.hp,40);assert.equal(s.dread,0);assert.equal(s.shield,1);assert.equal(s.light,8);assert(s.empowered);
A.act(s,'strike');assert.equal(s.floor.entities[0].hp,24);assert.equal(s.hp,40);assert.equal(s.shield,0);assert(!s.empowered);
A.act(s,'wait');assert.equal(s.hp,34);
const bad=A.newRun('lilith','SAVE',{name:'x',method:'reading',seed:'x',choices:[]});assert.throws(()=>A.deserialize(A.serialize(bad)));
console.log('PASS: 1,920 readings; all 20 dilemmas and five outcomes; undo; character saves; Lilith veil and strike.');
