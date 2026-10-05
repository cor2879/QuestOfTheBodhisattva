/* Verify production textures in real WebGL screenshots, not just asset presence. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
const atlas=fs.readFileSync(path.resolve(__dirname,'../native/assets/lantern-atlas.png'));
assert(fs.readFileSync(path.resolve(__dirname,'../native/art-pixels.h'),'utf8').includes(crypto.createHash('sha256').update(atlas).digest('hex')),'Recompile changed artwork');
async function count(p,rect,kind){
 await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const png=await p.locator('canvas').screenshot();
 return p.evaluate(async({base64,rect,kind})=>{
  const im=new Image();im.src='data:image/png;base64,'+base64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);const [x,y,w,h]=rect.map((v,i)=>Math.round(v*(i%2?im.height/192:im.width/280)));const data=ctx.getImageData(x,y,w,h).data;let hits=0;
  for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2];if(kind==='ivory'?r>180&&g>170&&b>140:kind==='gold'?r>180&&g>95&&g<220&&b<100:kind==='violet'?r>65&&b>90&&g<65:kind==='turquoise'?r<100&&g>150&&b>165:kind==='water'?b>75&&b>g*1.3&&b>r*1.5:kind==='stone'?r>90&&Math.abs(r-g)<35&&Math.abs(g-b)<40:false)hits++;}
  return hits;
 },{base64:png.toString('base64'),rect,kind});
}
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,headless:true});try{
 for(const viewport of [{width:1280,height:720},{width:390,height:844},{width:844,height:390}]){
  const p=await browser.newPage({viewport,hasTouch:viewport.width<1000,deviceScaleFactor:viewport.width<1000?3:1}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForSelector('#welcome[open]');await p.click('#choose-direct');await p.click('[data-monad="ariel"]');await p.click('#begin');
  assert.deepEqual(await p.evaluate(()=>[nativeCanvas.width,nativeCanvas.height]),[560,384]);assert(await count(p,[126,80,14,16],'ivory')>3,'Pilgrim sprite must render');assert(await count(p,[168,80,14,16],'gold')>2,'Town lanterns must render');assert(await count(p,[224,0,14,16],'gold')>2,'Shrine must use the correct atlas cell');await p.screenshot({path:'/tmp/quest-art-coast-'+viewport.width+'.png'});
  for(const [x,y,rect,kind]of [[12,30,[112,80,14,16],'water'],[57,40,[140,80,14,16],'stone']]){await p.evaluate(({x,y})=>{nativeCall('quest_restore','number',Array(7).fill('number'),[0,x,y,100,100,0,0]);nativeUpdate();},{x,y});assert(await count(p,rect,kind)>3,kind+' texture must render');}
  // All three distinct horrors, spring, relic and traveler survive transparent compositing.
  for(const [x,y,rect,kind]of [[32,56,[126,64,14,16],'violet'],[45,54,[126,64,14,16],'violet'],[55,60,[126,64,14,16],'violet'],[41,30,[126,64,14,16],'turquoise'],[49,57,[126,64,14,16],'turquoise'],[36,53,[126,64,14,16],'gold']]){
   await p.evaluate(({x,y})=>{const d=nativeSaveData();Object.assign(d.state,{x,y,quest:3,clue:1,blessing:1,resolution:1});d.dungeon='1,1,1,0,3,7,0,7,5,0,9,3,0';nativeRestore(JSON.stringify(d));},{x,y});assert(await count(p,rect,kind)>2,'Missing '+kind+' sprite at '+x+','+y);
  }
  assert.deepEqual(errors,[]);await p.close();console.log('PASS production art, resolution, atlas coordinates and transparency',viewport);
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
