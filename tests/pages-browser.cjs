/* Serve the staged site under the real project prefix, like GitHub Pages. */
const {chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'../build/pages'),prefix='/QuestOfTheBodhisattva/';
 const server=http.createServer((req,res)=>{try{const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith(prefix)){res.writeHead(404).end();return;}const name=decodeURIComponent(url.pathname.slice(prefix.length))||'index.html',file=path.resolve(root,name);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}const bytes=fs.readFileSync(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(bytes);}catch{res.writeHead(404).end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}${prefix}`;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,headless:true});
 try{for(const viewport of [{width:1280,height:720},{width:390,height:844}]){
  const p=await browser.newPage({viewport,hasTouch:viewport.width<650}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});await p.goto(base);await p.waitForSelector('#welcome[open]');await p.click('#choose-direct');await p.click('[data-monad="ariel"]');await p.waitForFunction(()=>[...document.querySelectorAll('#patrons img')].every(i=>i.complete&&i.naturalWidth>0));await p.click('#begin');await p.click('[data-native="4"]');assert.equal(await p.evaluate(()=>nativeSnapshot().x),41);assert.deepEqual(errors,[]);await p.close();console.log('PASS Pages project-prefix build',viewport);
 }}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exit(1)});
