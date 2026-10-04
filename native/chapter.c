/* Original Vesper story. Residents may reclaim memory without surrendering choice. */
#include <stdio.h>
#include <emscripten.h>
#include "chapter.h"
#include "town.h"
#include "dungeon.h"
#include "progression.h"
#include "data/player.h"
int vesper_stage=0,vesper_testimony=0,vesper_intent=0;
void chapter_reset(void){vesper_stage=vesper_testimony=vesper_intent=0;}
const char *vesper_dialogue(int resident){
 static char out[2200];const char *name,*text,*options;
 switch(resident){
 case 0:name="Maera, Keeper of Unwritten Names";
 text=vesper_stage==0?"We sealed our painful memories beneath Vesper. Now a dreaming horror feeds upon what we refused to hear. Learn what Neris and Oren remember before you decide how to open the Archive.":vesper_stage==1?"Neris waits in the southwest home. Oren tends the southeast memorial garden. Hear both of them; neither speaks for the whole city.":vesper_stage==2?"Neris wants her brother remembered. Oren fears being forced to relive the siege. Will you prepare a public remembrance, or a protected space where each person may return in their own time?":vesper_stage==4?"The city remembers your promise. A name is an invitation, not a command. Neither silence nor remembrance should be imposed.":vesper_outcome?"You have heard the Nameless Choir. Tell us how you answered, and we will begin the work you promised.":"The Archive is open, seven steps north of Vesper. Seek the Choir in its northeast chamber. Your preparation is a promise, not a command; you may still change your mind.";
 options=vesper_stage==0?"[{\"id\":60,\"label\":\"Investigate the silence beneath Vesper\"}]":vesper_stage==2?"[{\"id\":61,\"label\":\"Prepare a public remembrance\"},{\"id\":62,\"label\":\"Prepare a protected vigil\"}]":vesper_stage==3&&vesper_outcome?"[{\"id\":63,\"label\":\"Share the Choir's answer with Vesper\"}]":"[]";break;
 case 1:name="Thalen, Restorer";text="Healing is not the removal of every scar. I offer care freely. Receive vitality and Light, or carry a tonic for ten gold.";options="[{\"id\":10,\"label\":\"Receive healing and Light\"},{\"id\":11,\"label\":\"Buy a tonic - 10 gold\"}]";break;
 case 2:name="Ysra, Provisioner";text="The Archive changes between journeys, never while a traveler is inside it. Bring food and a tool that suits your way of fighting.";options="[{\"id\":21,\"label\":\"Buy twenty food - 5 gold\"},{\"id\":22,\"label\":\"Pilgrim blade - 25 gold\"},{\"id\":23,\"label\":\"Star staff - 30 gold\"},{\"id\":24,\"label\":\"Warded robe - 20 gold\"}]";break;
 case 3:name="Neris, Keeper of a Missing Name";text=vesper_stage==4?(vesper_outcome==1?"His name was Aren. We have written it in the memorial garden. Oren will join us when he wishes; grief need not have an audience to be real.":"His name was Aren. The vigil keeps it safely until we are ready to speak it together. A sheltered memory is not a forgotten one."):"My brother died opening the gates during the siege. When we buried our memories, even his name vanished. I want him remembered, but not at the price of another person's peace.";options=vesper_stage<2?"[{\"id\":64,\"label\":\"Listen to Neris's testimony\"}]":"[]";break;
 case 4:name="Oren, Gardener of the Memorial";text=vesper_stage==4?(vesper_outcome==1?"I hear the names from the garden. No one demands that I stand among them. For the first time, remembrance feels like an open door instead of a summons.":"The vigil lets me sleep, and it has a door I may open myself. Perhaps tomorrow I will ask Neris to tell me about Aren."):"I survived the siege. The silence let me sleep again. Do not make healing another test of courage. If the memories return, let us choose when to meet them.";options=vesper_stage<2?"[{\"id\":65,\"label\":\"Listen to Oren's testimony\"}]":"[]";break;
 default:name="Ilyan, Cartographer of Dreams";text="The Archive grows around the shape of a journey. Its corridors are connected, but horrors move through them. The plan beneath your view marks the Choir, a cache, and your way out.";options="[{\"id\":66,\"label\":\"Where is the Archive?\"}]";break;
 }
 snprintf(out,sizeof(out),"{\"name\":\"%s\",\"text\":\"%s\",\"options\":%s}",name,text,options);return out;
}
int vesper_option(int resident,int choice){
 if(resident==0&&choice==60&&vesper_stage==0){vesper_stage=1;quest_note("The Unwritten Names: hear Neris and Oren, then return to Maera.");return 1;}
 if((resident==3&&choice==64)||(resident==4&&choice==65)){
  if(vesper_stage!=1){quest_note("Their testimony waits for Maera's investigation. It carries no repeat reward.");return 0;}
  vesper_testimony|=resident==3?1:2;if(vesper_testimony==3)vesper_stage=2;
  quest_note(vesper_stage==2?"Both voices have been heard. Return to Maera and decide how Vesper will prepare.":"One voice is heard. Listen to the other witness before you decide.");return 1;
 }
 if(resident==0&&(choice==61||choice==62)&&vesper_stage==2){int before=quest_level();vesper_stage=3;vesper_intent=choice==61?1:2;quest_gain_xp(35);quest_reward_note(choice==61?"Vesper prepares a remembrance. The Archive is open at (54,33). Thirty-five experience.":"Vesper prepares a protected vigil. The Archive is open at (54,33). Thirty-five experience.",before);return 1;}
 if(resident==0&&choice==63&&vesper_stage==3&&vesper_outcome){int before=quest_level();vesper_stage=4;quest_gain_xp(60);player.gold+=25;quest_reward_note(vesper_outcome==1?"The names return by invitation, not decree. Vesper begins its remembrance. Sixty experience and twenty-five gold.":"The Choir rests beneath a ward with doors, not chains. Vesper begins its protected vigil. Sixty experience and twenty-five gold.",before);return 1;}
 if(resident==5&&choice==66){quest_note("Ilyan: The Archive stone is seven steps north of Vesper, at (54,33). Maera opens it after both testimonies.");return 1;}
 return 0;
}
