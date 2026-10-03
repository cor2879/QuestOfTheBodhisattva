/* The Fortune Teller's ceremony. The illustrated deck is independent of rules. */
(function(root){
'use strict';
const $=id=>document.getElementById(id),F=root.Fortune,A=root.Aeon;
let reading=null,selection='samael',method='direct',callbacks,mode='intro';
const REVEALS={
 samael:'Your light questions the authority behind a chain. Judgment asks you to discern what must end—and to answer for the way you end it.',
 raphael:'Your light travels beside the wounded. Restoration asks you to offer care without turning the gift into a debt.',
 jophiel:'Your light gives hidden truth a visible form. Beauty asks you to illuminate, even when what becomes visible is difficult to bear.',
 ariel:'Your light recognizes a living world beyond human walls. Guardianship asks you to protect growth without commanding its shape.',
 lilith:'Your light refuses a belonging bought with surrender. Sovereignty asks you to defend freedom without abandoning responsibility.'
};
function randomSeed(prefix){return prefix+'-'+Math.random().toString(36).slice(2,10).toUpperCase();}
function art(id,concealed=false){
 const frame=document.createElement('div');frame.className='card-art';
 const a=root.MONAD_ART[id],p=A.MONADS[id];
 if(a?.src){const img=document.createElement('img');img.src=a.src;img.alt=concealed?'Illustration of a possible path':p.name+' card illustration';if(a.sheet)img.className='solar-sheet';frame.append(img);}
 else{frame.classList.add('portrait-pending');const mark=document.createElement('span');mark.className='pending-mark';mark.textContent=p.symbol;const label=document.createElement('small');label.textContent='Established portrait awaiting reference';frame.append(mark,label);}
 return frame;
}
function resetScroll(){ $('welcome').scrollTop=0; }
function focus(id){$(id)?.focus({preventScroll:true});}
function renderDirect(){
 $('patrons').replaceChildren();
 for(const[id,p]of Object.entries(A.MONADS)){
  const b=document.createElement('button');b.className='patron-choice illustrated';b.dataset.patron=id;b.dataset.monad=id;b.style.setProperty('--accent',p.color);
  const text=document.createElement('div');text.className='card-label';const name=document.createElement('b'),title=document.createElement('small');name.textContent=p.name;title.textContent=p.title;text.append(name,title);b.append(art(id),text);b.onclick=()=>select(id);$('patrons').append(b);
 }
 select(selection);
}
function select(id){
 if(!A.MONADS[id])return;selection=id;method='direct';
 for(const b of $('patrons').children){const active=b.dataset.monad===id;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active);}
 const p=A.MONADS[id];$('selected-description').textContent=p.native?p.description:p.power+': '+p.description+' Vitality '+p.hp+' · strike '+p.attack+'.';
}
function showMode(next){
 mode=next;for(const id of ['intro','question','reveal','direct'])$('reading-'+id).hidden=id!==next;
 $('begin').hidden=!['reveal','direct'].includes(next);
 $('reading-back').hidden=next!=='question'||!reading?.history.length;
 $('reading-restart').hidden=!['question','reveal'].includes(next);
 $('choose-direct').hidden=next==='direct';
 $('reading-fields').hidden=next==='question';
 $('reading-step').textContent=next==='question'?'READING '+(reading.step+1)+' OF 4':next==='reveal'?'THE MONAD REVEALED':next==='direct'?'CHOOSE YOUR MONAD':'THE FORTUNE TELLER';
 resetScroll();
}
function startReading(){
 reading=F.create(randomSeed('THREAD'));method='reading';renderQuestion();
}
function renderQuestion(){
 const q=F.question(reading);if(!q){reveal();return;}
 showMode('question');$('question-title').textContent=q.title;$('question-story').textContent=q.story;$('reading-options').replaceChildren();
 for(const id of F.pair(reading)){
  const o=q.choices[id],b=document.createElement('button');b.className='reading-option';b.dataset.choice=id;b.style.setProperty('--accent',A.MONADS[id].color);
  const label=document.createElement('div');label.className='choice-label';const verb=document.createElement('b'),detail=document.createElement('span');verb.textContent=o.verb;detail.textContent=o.detail;label.append(verb,detail);b.append(art(id,true),label);
  b.onclick=()=>{if(!F.choose(reading,id))return;if(reading.result)reveal();else renderQuestion();};$('reading-options').append(b);
 }
 $('reading-options').firstElementChild.focus({preventScroll:true});
}
function reveal(){
 selection=reading.result;method='reading';const p=A.MONADS[selection];
 $('revealed-card').replaceChildren(art(selection));
 const label=document.createElement('div');label.className='reveal-card-label';label.textContent=p.name;$('revealed-card').append(label);
 $('revealed-name').textContent=p.name;$('revealed-title').textContent=p.title;$('revealed-meaning').textContent=REVEALS[selection];
 const last=reading.history.filter(h=>h.choice===selection).at(-1);
 $('revealed-quote').textContent='“'+last.echo+' '+p.name+'’s card has followed your hand.”';
 $('revealed-gift').textContent=p.power+' · '+p.description;
 $('reading-summary').replaceChildren();
 for(const h of reading.history){const li=document.createElement('li');li.textContent=h.title+' — '+h.verb;$('reading-summary').append(li);}
 showMode('reveal');focus('begin');
}
function direct(){method='direct';renderDirect();showMode('direct');$('patrons').querySelector('.selected').focus({preventScroll:true});}
function character(){
 return{monad:selection,creation:{name:$('character-name').value.trim().slice(0,24)||'Wayfarer',method,seed:method==='reading'?reading.seed:'',choices:method==='reading'?reading.history.map(h=>({id:h.id,choice:h.choice})):[]},world:$('seed').value.trim().slice(0,40)||randomSeed('ORU')};
}
function open(){
 reading=null;$('seed').value=randomSeed('ORU');$('welcome-cancel').hidden=!callbacks.hasRun();$('welcome-resume').disabled=!callbacks.hasSaved();showMode('intro');
 if(!$('welcome').open)$('welcome').showModal();focus('start-reading');
}
function init(options){
 callbacks=options;renderDirect();
 $('start-reading').onclick=startReading;$('choose-direct').onclick=direct;$('reading-restart').onclick=startReading;
 $('reading-back').onclick=()=>{reading=F.undo(reading);renderQuestion();};
 $('shuffle').onclick=()=>{$('seed').value=randomSeed('ORU');};
 $('begin').onclick=()=>callbacks.onBegin(character());
 $('welcome-resume').onclick=callbacks.onLoad;
 $('welcome-cancel').onclick=()=>{$('welcome').close();callbacks.onCancel();};
 $('welcome').addEventListener('cancel',e=>{if(!callbacks.hasRun())e.preventDefault();});
}
root.CreationUI={init,open,character,select,art,get reading(){return reading;},get mode(){return mode;}};
})(globalThis);
