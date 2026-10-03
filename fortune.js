/* Fictional dilemmas inspired by lore; a four-choice, five-Monad reading. */
(function(root){
'use strict';
const IDS=['samael','raphael','jophiel','ariel','lilith'];
function option(verb,detail,echo){return{verb,detail,echo};}
const PAIRS={
 'raphael|samael':[
  {id:'plague-crown',title:'The Crown and the Fever',story:'A ruler’s oath keeps a fever moving through the city. You can break the oath by confronting its author, or carry a remedy from door to door while others seek its source.',choices:{
   samael:option('Confront the oath-maker','End the binding at its source, knowing the ruler’s guards will oppose you.','You sought the author of suffering, even when the author wore a crown.'),
   raphael:option('Carry the remedy','Keep the afflicted alive, though every hour spent healing delays the confrontation.','You would not make the wounded wait for justice before receiving care.')}},
  {id:'last-breath',title:'The Keeper of the Last Breath',story:'A soul has been held at the edge of death by a cruel bargain. Severing it will restore the soul’s freedom, but its frail body may fail. You could first spend your dwindling light mending the vessel.',choices:{
   samael:option('Sever the bargain','Return the choice of life and death to the captive, accepting what they decide.','You placed a soul’s freedom above the captor’s promise of safety.'),
   raphael:option('Mend the vessel first','Give the captive strength to survive, while the bargain remains dangerous.','You prepared the wounded to meet their freedom with a living breath.')}}
 ],
 'jophiel|samael':[
  {id:'forbidden-fruit',title:'The Fruit Behind the Veil',story:'A forbidden fruit reveals the suffering hidden beyond a perfect garden. Its keeper says awakening will destroy the inhabitants’ innocence. You can offer the fruit, or illuminate the keeper’s deception before anyone tastes it.',choices:{
   samael:option('Offer the forbidden fruit','Defy the prohibition and accept responsibility for the painful awakening.','You accepted the cost of awakening rather than preserve a comforting prohibition.'),
   jophiel:option('Illuminate the deception','Give the inhabitants understanding, so they can decide what knowledge to seek.','You wanted those who awakened to understand the light they were choosing.')}},
  {id:'burned-library',title:'The Book of Living Chains',story:'A beautiful illuminated book binds every person whose name appears in it. Burning it would end the enchantment now. Studying its design might free the captives while preserving the history its pages contain.',choices:{
   samael:option('Burn the binding book','End its power before another name is written, at the cost of its history.','You would sacrifice a treasured object to end its power over living souls.'),
   jophiel:option('Decipher the living script','Search for a way to undo its harm, though study leaves the book active longer.','You sought the pattern that could separate remembrance from bondage.')}}
 ],
 'ariel|samael':[
  {id:'wounded-garden',title:'The Garden and the Axe',story:'An army feeds its war engine with the roots of a living forest. You can strike the commander who ordered the harvest, or awaken the forest’s scattered guardians before its last ancient tree falls.',choices:{
   samael:option('Strike the commander','Break the command sustaining the harvest, risking the forest while you pursue it.','You followed the chain of command to the hand that made destruction lawful.'),
   ariel:option('Awaken the guardians','Make the threatened land capable of defending itself, while the commander remains.','You gave living creation the strength to stand in its own defense.')}},
  {id:'lion-at-gate',title:'The Lion at the Gate',story:'A lion guards a temple gate, maddened by a golden collar. The collar’s maker waits inside. You can pass the beast and judge its master, or stay to break the collar while the master escapes.',choices:{
   samael:option('Pursue the collar’s maker','Prevent another creature from being bound, though this lion must wait.','You sought the maker of the chains, refusing to let the next victim go unseen.'),
   ariel:option('Free the lion here','Return the creature to itself, even if its master slips beyond your reach.','You answered the living being before you, whose suffering could not be postponed.')}}
 ],
 'lilith|samael':[
  {id:'unequal-garden',title:'The Unequal Garden',story:'You are offered a place in paradise, but its keeper demands obedience as proof that you belong. Beyond the walls lies an unknown wilderness. Others in the garden still believe the keeper’s law cannot be challenged.',choices:{
   samael:option('Challenge the keeper','Remain long enough to confront the law that binds everyone.','You stayed to challenge the authority that made surrender a condition of belonging.'),
   lilith:option('Leave the garden','Choose the wilderness rather than a paradise that demands your surrender.','You did not choose freedom because the wilderness was safe.')}},
  {id:'names-of-night',title:'The Names Written in Night',story:'A celestial court has branded a wanderer monstrous for refusing its decrees. You can summon the court to account for its verdict, or teach the wanderer the hidden name that lets them leave its reach.',choices:{
   samael:option('Question the celestial court','Demand that its judgment withstand scrutiny, even if it turns against you.','You required the judges themselves to answer for their judgment.'),
   lilith:option('Teach the hidden name','Restore the wanderer’s power to depart, without waiting for the court’s consent.','You would not make freedom depend upon the permission of its jailer.')}}
 ],
 'jophiel|raphael':[
  {id:'stranger-road',title:'The Stranger on the Road',story:'A family suffers beneath a curse and distrusts every stranger. You know a remedy and suspect the source of the curse. You can travel beside them quietly, or reveal a truth they may find frightening.',choices:{
   raphael:option('Walk beside the family','Earn their trust through care before asking them to face the hidden danger.','You chose companionship as the first medicine.'),
   jophiel:option('Reveal the hidden cause','Help them understand the danger, even if your revelation is unwelcome.','You offered understanding before comfort, so the danger could no longer hide.')}},
  {id:'blind-painter',title:'The Painter Without Sight',story:'An artist has lost her sight to an enchantment. Its signs can still be felt in the patterns she paints. You have light enough either to restore her eyes now or to help her decipher the pattern that threatens others.',choices:{
   raphael:option('Restore her sight','Return what was taken from her, leaving the enchantment’s wider pattern unresolved.','You saw the artist’s suffering before the usefulness of her discovery.'),
   jophiel:option('Read the pattern together','Treat her as the interpreter of her own work, while the cure must wait.','You recognized an artist’s insight even where others saw only loss.')}}
 ],
 'ariel|raphael':[
  {id:'poisoned-river',title:'The River and the Sick',story:'A poisoned river has sickened a village and its surrounding woods. You can use your light to purify its spring, or treat those already dying while others attempt the slower work of cleansing the water.',choices:{
   raphael:option('Treat the afflicted','Meet the urgent suffering of those who may not survive another day.','You brought care to those for whom tomorrow was not yet promised.'),
   ariel:option('Purify the spring','Restore the source that sustains the whole valley, though the sick must wait.','You saw healing as a covenant with the living world that sustains everyone.')}},
  {id:'winter-orchard',title:'The Orchard in Winter',story:'A sanctuary shelters refugees through a bitter winter. Its orchard has fallen dormant. You can spend your light healing the exhausted people, or awaken the orchard to provide food before the stores run out.',choices:{
   raphael:option('Restore their strength','Help the refugees endure the cold, while food remains uncertain.','You placed your hands upon the suffering you could reach.'),
   ariel:option('Wake the orchard','Offer the sanctuary a living future, while its people still carry their wounds.','You made a place where care could continue after your light was spent.')}}
 ],
 'lilith|raphael':[
  {id:'compulsory-mercy',title:'The House of Compulsory Mercy',story:'A healer’s sanctuary cures every injury, but its doors are locked: those it saves must serve there forever. You can open a hidden way out, or persuade its wounded keeper to surrender the bargain.',choices:{
   raphael:option('Heal the keeper’s fear','Try to change the belief that makes the keeper imprison those they save.','You sought the wound inside a harmful promise of care.'),
   lilith:option('Open the hidden exit','Let the residents leave now; the keeper can face their choices afterward.','You refused to let a gift of healing become a debt of obedience.')}},
  {id:'night-refuge',title:'The Refuge Beyond the Wall',story:'An exile asks you to hide them from a household that calls their departure a betrayal. They are injured and afraid. You can guide them beyond pursuit tonight, or shelter and heal them before attempting the journey.',choices:{
   raphael:option('Shelter and heal','Give them a stronger body for the escape, though discovery remains possible.','You offered a place to recover before asking the injured to brave another road.'),
   lilith:option('Lead them beyond pursuit','Protect their right to leave, despite the hardship of traveling wounded.','You heard a person’s refusal, even when their household called it betrayal.')}}
 ],
 'ariel|jophiel':[
  {id:'silent-atelier',title:'The City Without Color',story:'A city has forbidden art because it awakens memories its rulers wish forgotten. Outside its walls, an ancient grove still carries those memories in its living bark. You can create a forbidden work, or awaken the grove’s voice.',choices:{
   jophiel:option('Create the forbidden work','Bring remembrance into the streets, knowing it may provoke unrest.','You trusted beauty to speak a truth that authority had forbidden.'),
   ariel:option('Awaken the living grove','Let the land itself remember, drawing people away from the rulers’ walls.','You listened for a truth that living creation had never surrendered.')}},
  {id:'perfect-city',title:'The Perfect City',story:'An enchanted city appears flawless, hiding every crack and wound behind a radiant illusion. Beyond its gate, real wildflowers push through broken stone. You can reveal the city as it is, or bring that untamed life inside.',choices:{
   jophiel:option('Reveal the hidden city','Let its people see what must be repaired, even if its beauty seems to vanish.','You saw beauty as a way of perceiving truth, not a veil laid over it.'),
   ariel:option('Bring the wildflowers in','Help the city become alive again, letting imperfect growth undo the illusion.','You welcomed the imperfect life that a perfect image could not contain.')}}
 ],
 'jophiel|lilith':[
  {id:'beautiful-cage',title:'The Beautiful Cage',story:'A singer lives in a gilded palace where every song is celebrated, provided she never sings of leaving. You can help her compose a song that exposes the bargain, or give her the forgotten word that opens its gates.',choices:{
   jophiel:option('Compose the unsanctioned song','Let her art reveal the bargain to everyone who has applauded it.','You gave a silenced truth a form that could be heard.'),
   lilith:option('Give her the opening word','Let her decide where her voice belongs, without an audience’s approval.','You returned the voice to its owner before asking what it might teach others.')}},
  {id:'unwritten-star',title:'The Star Without a Name',story:'A young maker discovers a pattern that the temple forbids anyone to draw. You can help them make the pattern visible so its wisdom can be shared, or teach them how to carry it beyond the temple’s reach.',choices:{
   jophiel:option('Draw the forbidden pattern','Share the discovery, accepting that its maker may face the temple’s anger.','You chose to make a hidden possibility visible.'),
   lilith:option('Carry it beyond the temple','Protect the maker’s sovereignty over their discovery before sharing it.','You defended the right to create beyond another’s permission.')}}
 ],
 'ariel|lilith':[
  {id:'tamed-garden',title:'The Garden That Cannot Grow',story:'Every tree in a royal garden has been bound into the same beautiful shape. One branch has broken its wire and begun to grow toward the wilderness. You can patiently unbind the grove, or cut a passage beyond the walls.',choices:{
   ariel:option('Unbind the whole grove','Restore each living form, though the work leaves you under the gardener’s eye.','You wanted the garden to become a home for growth, rather than leave its captives behind.'),
   lilith:option('Open a way beyond the wall','Give the untamed branch—and those who follow—a path the gardener cannot govern.','You made room for a life that could not flourish inside imposed boundaries.')}},
  {id:'wild-covenant',title:'The Covenant of the Wild',story:'A settlement offers shelter to the spirits of the wild if they accept human names and duties. Some spirits welcome the bargain; others feel their shapes beginning to change. You can rebuild the covenant, or shelter those who refuse it.',choices:{
   ariel:option('Rebuild the covenant','Seek a shared home that preserves the spirits’ living nature, despite the slow negotiations.','You sought belonging that would not erase the beings it welcomed.'),
   lilith:option('Shelter those who refuse','Protect their choice to remain outside, even if the settlement withdraws its welcome.','You honored the freedom to refuse a place offered on another’s terms.')}}
 ]
};
function pair(r){const d=r.deck;return r.step===0?[d[0],d[1]]:r.step===1?[d[2],d[3]]:r.step===2?[r.first,d[4]]:r.step===3?[r.third,r.second]:null;}
function create(seed){const random=root.Aeon.rng(seed),deck=IDS.slice();for(let i=deck.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return{seed:String(seed),deck,step:0,history:[],first:null,second:null,third:null,result:null};}
function question(r){const p=pair(r);if(!p)return null;const choices=PAIRS[p.slice().sort().join('|')];const random=root.Aeon.rng(r.seed+':'+r.step+':'+p.join(':'));return choices[Math.floor(random()*choices.length)];}
function choose(r,id){const p=pair(r);if(!p||!p.includes(id))return false;const q=question(r);r.history.push({id:q.id,choice:id,title:q.title,verb:q.choices[id].verb,echo:q.choices[id].echo});if(r.step===0)r.first=id;else if(r.step===1)r.second=id;else if(r.step===2)r.third=id;else r.result=id;r.step++;return true;}
function undo(r){if(!r.history.length)return r;const choices=r.history.slice(0,-1).map(h=>h.choice),restored=create(r.seed);for(const c of choices)choose(restored,c);return restored;}
root.Fortune={IDS,PAIRS,create,pair,question,choose,undo};
if(typeof module!=='undefined')module.exports=root.Fortune;
})(typeof globalThis!=='undefined'?globalThis:this);
