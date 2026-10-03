(function(root){
const PATRONS={
 ariel:{name:'Ariel',title:'Keeper of Living Creation',color:'#89d6ad',symbol:'✧',hp:42,attack:7,power:'Verdant Ward',cost:4,description:'Sanctify the ground around you. Restore 5 vitality and halve harm within the ward for five turns.',relic:'Seed of the First Garden'},
 samael:{name:'Samael',title:'Flame of Judgment',color:'#ef9c82',symbol:'✦',hp:38,attack:9,power:'Severance',cost:4,description:'Sever a visible binding within five steps, or burn the nearest visible horror for 16 harm, ignoring its ward.',relic:'Sword of the Unbinding'},
 raphael:{name:'Raphael',title:'Light of Restoration',color:'#89cdda',symbol:'☼',hp:46,attack:6,power:'Restoring Light',cost:4,description:'Restore 15 vitality, clear dread, and shelter yourself from the next enemy turn.',relic:'Vessel of the Living Breath'},
 jophiel:{name:'Jophiel',title:'Beauty, Art, and Illumination',color:'#e6ce83',symbol:'◇',hp:36,attack:8,power:'Revelation',cost:4,description:'Reveal the surrounding ruins, stun nearby horrors for two turns, and empower your next strike.',relic:'Lantern of the Unseen Word'},
 lilith:{name:'Lilith',title:'Sovereignty and the Hidden Ways',color:'#c49ee1',symbol:'☾',hp:40,attack:8,power:'Veil of Sovereignty',cost:4,description:'Move beneath the horrors’ notice for two enemy turns, clear dread, and add 8 harm to your next strike.',relic:'Key of the Uncommanded'}
};
function rng(seed){let n=2166136261;for(const c of String(seed)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return()=>{n+=0x6D2B79F5;let t=Math.imul(n^(n>>>15),1|n);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296;};}
const gifts={ariel:['Living Covenant','Stamina 20, wisdom 18.'],samael:['Discernment','Strength 20, agility 18.'],raphael:['Restoration','Stamina 20, intelligence 18.'],jophiel:['Illumination','Intelligence 20, wisdom 18.'],lilith:['Sovereignty','Agility 20, charisma 18.']};
for(const[id,p]of Object.entries(PATRONS)){p.native=true;p.power=gifts[id][0];p.description=gifts[id][1]+' Starting attributes for the native overworld; active Monad abilities will follow.';p.hp=100;p.attack='not yet active';}

root.Aeon={MONADS:PATRONS,rng};
})(globalThis);
