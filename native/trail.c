/* Original coast discoveries and intentional-turn encounters on Open Sosaria. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <limits.h>
#include <emscripten.h>
#include "trail.h"
#include "quests.h"
#include "art.h"
#include "town.h"
#include "dungeon.h"
#include "chapter.h"
#include "progression.h"
#include "data/player.h"
#include "engine/geometry.h"
#include "engine/texture.h"
#include "maths/matrix4.h"
int trail_enemy=0;
static int seed=1,steps=0,cooldown=0,sites[4]={0},travelers[2][2]={{36,52},{52,52}},foes[3][3]={{32,55,24},{45,53,32},{55,59,40}};
static const int initial[3][3]={{32,55,24},{45,53,32},{55,59,40}};
static const char *names[3]={"Veil scavenger","Cyclopean wanderer","Hollow sentinel"};
static const int dirs[4][2]={{0,-1},{1,0},{0,1},{-1,0}};
static Geometry markers[6];static unsigned int markerTexture;static float transform[16];
static int distance(int x,int y){return abs(player.tx-x)+abs(player.ty-y);}
static int occupied(int x,int y,int skip){for(int i=0;i<3;i++)if(i!=skip&&foes[i][2]>0&&foes[i][0]==x&&foes[i][1]==y)return 1;for(int i=0;i<2;i++)if(travelers[i][0]==x&&travelers[i][1]==y)return 1;return (x==41&&y==29)||(x==49&&y==56);}
void trail_reset(void){seed=1;steps=cooldown=trail_enemy=0;memset(sites,0,sizeof(sites));memcpy(foes,initial,sizeof(foes));travelers[0][0]=36;travelers[0][1]=52;travelers[1][0]=travelers[1][1]=52;}
void trail_seed(int value){if(value>0&&!steps)seed=value;}
void trail_init(void){
 unsigned char pixels[168*32*4]={0};const int tiles[6]={9,10,11,12,13,14};
 for(int i=0;i<6;i++)quest_art_copy(pixels,168,i,tiles[i]);
 markerTexture=texture_load(168,32,pixels);for(int i=0;i<6;i++)geometry_setSprite(&markers[i],14,16,i/6.0f,0,(i+1)/6.0f,1);matrix4_setIdentity(transform);trail_reset();
}
static void draw(int type,int x,int y,float *view){matrix4_setPosition(transform,x*14,y*16,3);geometry_render(&markers[type],markerTexture,transform,view);}
void trail_render(float *view){if(!sanctuary_outcome)return;for(int i=0;i<2;i++)draw(0,travelers[i][0],travelers[i][1],view);draw(1,41,29,view);draw(2,49,56,view);for(int i=0;i<3;i++)if(foes[i][2])draw(3+i,foes[i][0],foes[i][1],view);}
int trail_solid(int x,int y){if(!sanctuary_outcome)return 0;for(int i=0;i<3;i++)if(foes[i][2]>0&&foes[i][0]==x&&foes[i][1]==y)return 1;return 0;}
int trail_contact(int x,int y){if(!sanctuary_outcome)return 0;for(int i=0;i<3;i++)if(foes[i][2]>0&&foes[i][0]==x&&foes[i][1]==y){trail_enemy=i+1;quest_clear_effects();quest_note("A wandering horror bars your path. F strikes; P invokes your gift; G escapes. Movement and idle time do not advance the duel.");return 1;}return 0;}
void trail_after_step(void){
 if(!sanctuary_outcome||trail_enemy)return;steps++;if(cooldown){cooldown--;return;}
 if(steps%3==0){
  for(int i=0;i<2;i++){int direction=(int)(((unsigned int)seed+(unsigned int)steps/3+(unsigned int)i*7)%4),x=travelers[i][0]+dirs[direction][0],y=travelers[i][1]+dirs[direction][1];if(x>=(i?50:31)&&x<=(i?56:38)&&y>=51&&y<=57&&distance(x,y)>0&&!occupied(x,y,-1)){travelers[i][0]=x;travelers[i][1]=y;}}
  for(int i=0;i<3;i++){int direction=(int)(((unsigned int)seed+(unsigned int)steps/3+(unsigned int)i*11)%4),x=foes[i][0]+dirs[direction][0],y=foes[i][1]+dirs[direction][1];if(foes[i][2]&&x>=31&&x<=56&&y>=50&&y<=62&&distance(x,y)>0&&!occupied(x,y,i)){foes[i][0]=x;foes[i][1]=y;}}
 }
 for(int i=0;i<3;i++)if(foes[i][2]&&distance(foes[i][0],foes[i][1])==1){trail_enemy=i+1;quest_clear_effects();quest_note("A wandering horror turns toward your light. F strikes; P invokes your gift; G escapes without retaliation.");return;}
 for(int i=0;i<2;i++)if(distance(travelers[i][0],travelers[i][1])<=1){quest_note("A traveler pauses beside the path. E speaks with them; amber figures roam the southern trails.");return;}
 if(distance(41,29)==0)quest_note("An unmarked spring answers your presence. E discovers its fivefold inscription.");
 if(distance(49,56)==0)quest_note("A star-shaped vessel lies in the grass. E inspects the fallen relic.");
}
void trail_rescue(void){trail_enemy=0;cooldown=3;quest_clear_effects();}
static void retaliation(void){int i=trail_enemy-1,damage=5+i*2-(player.armor?1:0);if(quest_stun[i]){quest_stun[i]--;damage=0;}if(quest_veil){quest_veil--;damage=0;}if(quest_ward){quest_ward--;damage=(damage+1)/2;}if(damage){player.health-=damage;if(player.health<0)player.health=0;char text[180];snprintf(text,sizeof(text),"%s strikes for %d vitality. %s",names[i],damage,player.health?"F strikes, P invokes your gift, G escapes.":"E recalls you to Haven, preserving discoveries and the wounded horror.");quest_note(text);}}
static int harm(int damage){int i=trail_enemy-1;foes[i][2]-=damage;if(foes[i][2]<=0){int before=quest_level();foes[i][2]=0;trail_enemy=0;quest_clear_effects();quest_gain_xp(18);player.gold=player.gold>99988?100000:player.gold+12;quest_reward_note("The wandering horror dissolves. Eighteen experience and twelve gold. Its defeat remains part of this journey.",before);return 1;}quest_note("Your light wounds the wandering horror.");return 0;}
int trail_action(int action,int monad){
 if(!trail_enemy||!player_isAlive())return 0;
 if(action==14){trail_rescue();player_waitPenalty();if(player.food<0)player.food=0;quest_note("You withdraw safely. The wounded horror remains; three travel steps give you room to leave.");return 1;}
 if(action==11){retaliation();return 0;}
 if(action==13||action==5){player_waitPenalty();retaliation();if(player.food<0)player.food=0;return 1;}
 if(action!=8&&action!=12){quest_note("This is a duel. F strikes, P invokes your gift, H uses a tonic, G escapes. E rescues an exhausted journey.");return 0;}
 if(action==12){
  if(quest_light<3||(monad==2&&player.health>=100)){quest_note("Your gift needs three Light; restoration also needs a wound.");return 0;}
  quest_light-=3;
  if(monad==0){quest_ward=3;player.health=player.health>95?100:player.health+5;quest_note("Ariel's Verdant Ward shelters the duel.");}
  if(monad==1){player_consumeDungeonFood();if(!harm(16+2*quest_level()))retaliation();if(player.food<0)player.food=0;return 1;}
  if(monad==2){player.health+=30+2*quest_level();if(player.health>100)player.health=100;quest_ward=1;quest_note("Raphael's Restoring Light mends the wound.");}
  if(monad==3){quest_stun[trail_enemy-1]=3;quest_focus=4+quest_level();quest_note("Jophiel reveals the horror's borrowed form and stills it.");}
  if(monad==4){quest_veil=3;quest_focus=8+quest_level();quest_note("Lilith's veil conceals you from the horror.");}
 }else{int damage=quest_strike_damage();quest_focus=quest_veil=0;player_consumeDungeonFood();if(!harm(damage))retaliation();if(player.food<0)player.food=0;return 1;}
 player_consumeDungeonFood();retaliation();if(player.food<0)player.food=0;return 1;
}
int trail_interact(void){if(!sanctuary_outcome)return 0;if(quests_interact())return 1;for(int i=0;i<2;i++)if(distance(travelers[i][0],travelers[i][1])<=1){quest_conversation=6+i;return 1;}if(distance(41,29)==0){quest_conversation=8;return 1;}if(distance(49,56)==0){quest_conversation=9;return 1;}return 0;}
const char *trail_dialogue(int resident,int monad){
 static char out[1900],text[1200];int site=resident-6;if(site<0||site>3)return "null";const char *name,*options;
 const char *insights[5]={"Ariel sees a bond that may grow without possession.","Samael judges the binding before the bound.","Raphael leaves room for a wound to heal in its own time.","Jophiel finds beauty in a name allowed to be spoken freely.","Lilith offers belonging without demanding obedience."};
 if(site==0){name="Sable, Roadkeeper";snprintf(text,sizeof(text),"%s %s %s",sites[0]?"Your meeting remains in Sable's roadbook.":"A traveler has lost a pack to the southern horrors. Share ten food, or listen and mark a safer way.",sanctuary_outcome==1?"The Listener's freedom has already become a story on this road.":"Word of your protective ward has reached the roadkeepers.",insights[monad]);options=sites[0]?"[{\"id\":82,\"label\":\"Ask about the hidden spring\"}]":"[{\"id\":80,\"label\":\"Share ten food - receive a tonic and 12 experience\"},{\"id\":81,\"label\":\"Listen and mark a safe route - 8 experience\"},{\"id\":82,\"label\":\"Ask about the hidden spring\"}]";}
 else if(site==1){name="Tessera, Weaver of Road Stories";snprintf(text,sizeof(text),"%s %s %s",sites[1]?"Tessera remembers the message you chose to carry.":"What story should the next traveler hear?",vesper_outcome==1?"Vesper's names have returned by invitation.":vesper_outcome==2?"Vesper shelters its names behind a door their keepers may open.":"Vesper has not yet given the Choir its answer.",insights[monad]);options=sites[1]?"[]":"[{\"id\":84,\"label\":\"Carry a story of remembrance - 10 experience, 8 gold\"},{\"id\":85,\"label\":\"Carry a promise of sanctuary - 10 experience, a tonic\"}]";}
 else if(site==2){name="The Fivefold Spring";snprintf(text,sizeof(text),"Five lights share a source without becoming the same flame. %s %s",insights[monad],sites[2]?"The inscription is already in your journal; its waters may restore Light again.":"Read the hidden inscription to restore Light and fifteen vitality, and gain twenty experience once.");options="[{\"id\":83,\"label\":\"Read the inscription and restore Light\"}]";}
 else{name="A Vessel Fallen from the Stars";snprintf(text,sizeof(text),"%s %s",sites[3]?"The fallen vessel remembers your answer. No second reward waits here.":"Within a shattered vessel rests a star staff. Salvage it, or leave five gold to make this a place of shelter.",insights[monad]);options=sites[3]?"[]":"[{\"id\":86,\"label\":\"Salvage: star staff, 15 gold, 18 experience\"},{\"id\":87,\"label\":\"Offer 5 gold: restore Light, 25 experience\"}]";}
 char expanded[900];if(site==0){snprintf(expanded,sizeof(expanded),"%.*s%s]",(int)strlen(options)-1,options,quests_sable_options());options=expanded;size_t used=strlen(text);snprintf(text+used,sizeof(text)-used,"%s",quests_sable_text());}
 snprintf(out,sizeof(out),"{\"name\":\"%s\",\"text\":\"%s\",\"options\":%s}",name,text,options);return out;
}
int trail_option(int resident,int choice,int monad){
 if(choice>=100)return quests_option(resident,choice,monad);
 (void)monad;int site=resident-6,before=quest_level();if(site<0||site>3)return 0;
 if(site==0&&choice==82){quest_note("Sable: The Fivefold Spring lies at (41,29), six north and six west of the northern shrine. Southern travelers roam near (36,52) and (52,52); a star vessel fell at (49,56).");return 1;}
 if(site==2&&choice==83){quest_recharge();if(!sites[2]){sites[2]=1;player.health+=15;if(player.health>100)player.health=100;quest_gain_xp(20);quest_reward_note("The hidden spring restores fifteen vitality and Light. Twenty experience; its lore enters your road journal.",before);}else quest_note("The spring restores your Light. Its lore has already been learned.");return 1;}
 if(sites[site])return 0;
 if(site==0&&choice==80){if(player.food<=10){quest_note("Keep more than ten food for your own journey before sharing.");return 0;}player.food-=10;if(quest_tonics<5)quest_tonics++;sites[0]=1;quest_gain_xp(12);quest_reward_note("Sable accepts your provisions and offers a tonic if your pouch has room. Twelve experience.",before);return 1;}
 if(site==0&&choice==81){sites[0]=2;quest_gain_xp(8);quest_reward_note("You listen and mark a safe route in Sable's roadbook. Eight experience.",before);return 1;}
 if(site==1&&(choice==84||choice==85)){sites[1]=choice==84?1:2;quest_gain_xp(10);if(choice==84)player.gold=player.gold>99992?100000:player.gold+8;else if(quest_tonics<5)quest_tonics++;quest_reward_note(choice==84?"A story of remembrance travels onward. Ten experience and eight gold.":"A promise of sanctuary travels onward. Ten experience and a tonic if there is room.",before);return 1;}
 if(site==3&&choice==86){sites[3]=1;quest_owned|=2;player.weapons[2]=1;player.gold=player.gold>99985?100000:player.gold+15;quest_gain_xp(18);quest_reward_note("You salvage a star staff (equip it when ready), fifteen gold, and eighteen experience.",before);return 1;}
 if(site==3&&choice==87){if(player.gold<5){quest_note("The offering needs five gold.");return 0;}sites[3]=2;player.gold-=5;quest_gain_xp(25);quest_recharge();quest_reward_note("You make the fallen vessel a place of shelter. Twenty-five experience; Light restored.",before);return 1;}
 return 0;
}
static int parse(const char *s,int *v){if(!s||strlen(s)>240)return 0;for(int i=0;i<21;i++){char *end;errno=0;if(*s<'0'||*s>'9')return 0;long n=strtol(s,&end,10);if(errno||n>INT_MAX||end==s)return 0;v[i]=(int)n;if(i==20)return *end==0;if(*end!=',')return 0;s=end+1;}return 0;}
int trail_valid(const char *s,int location,int x,int y,int listener){
 int v[21];if(!parse(s,v)||v[0]<1||v[1]>1000000||v[2]>3||v[3]>3)return 0;
 for(int i=4;i<8;i++)if(v[i]>(i==6?1:2))return 0;
 if(!listener&&(v[1]||v[3]||v[4]||v[5]||v[6]||v[7]))return 0;
 for(int i=0;i<2;i++)if(v[8+i*2]<(i?50:31)||v[8+i*2]>(i?56:38)||v[9+i*2]<51||v[9+i*2]>57)return 0;
 for(int i=0;i<3;i++){int k=12+i*3;if(v[k]<31||v[k]>56||v[k+1]<50||v[k+1]>62||v[k+2]>initial[i][2])return 0;if(v[k+2]){for(int j=0;j<i;j++)if(v[14+j*3]&&v[k]==v[12+j*3]&&v[k+1]==v[13+j*3])return 0;for(int j=0;j<2;j++)if(v[k]==v[8+j*2]&&v[k+1]==v[9+j*2])return 0;if(location==0&&v[k]==x&&v[k+1]==y)return 0;}}
 if(v[3]){int k=12+(v[3]-1)*3;if(location!=0||!v[k+2]||abs(v[k]-x)+abs(v[k+1]-y)!=1)return 0;}
 return 1;
}
void trail_restore(const char *s){int v[21];if(!parse(s,v))return;seed=v[0];steps=v[1];cooldown=v[2];trail_enemy=v[3];memcpy(sites,v+4,sizeof(sites));memcpy(travelers,v+8,sizeof(travelers));memcpy(foes,v+12,sizeof(foes));}
const char *trail_default(void){return "1,0,0,0,0,0,0,0,36,52,52,52,32,55,24,45,53,32,55,59,40";}
EMSCRIPTEN_KEEPALIVE const char *quest_trail_default(int location,int x,int y){static char out[260];int f[3][3];memcpy(f,initial,sizeof(f));if(location==0)for(int i=0;i<3;i++)if(f[i][0]==x&&f[i][1]==y)f[i][0]++;snprintf(out,sizeof(out),"1,0,0,0,0,0,0,0,36,52,52,52,%d,%d,%d,%d,%d,%d,%d,%d,%d",f[0][0],f[0][1],f[0][2],f[1][0],f[1][1],f[1][2],f[2][0],f[2][1],f[2][2]);return out;}
EMSCRIPTEN_KEEPALIVE const char *quest_trail(void){static char out[260];snprintf(out,sizeof(out),"%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d",seed,steps,cooldown,trail_enemy,sites[0],sites[1],sites[2],sites[3],travelers[0][0],travelers[0][1],travelers[1][0],travelers[1][1],foes[0][0],foes[0][1],foes[0][2],foes[1][0],foes[1][1],foes[1][2],foes[2][0],foes[2][1],foes[2][2]);return out;}
EMSCRIPTEN_KEEPALIVE const char *quest_trail_state(void){static char out[700];snprintf(out,sizeof(out),"{\"active\":%d,\"enemyHP\":%d,\"name\":\"%s\",\"steps\":%d,\"cooldown\":%d,\"sites\":[%d,%d,%d,%d],\"travelers\":[[%d,%d],[%d,%d]],\"foes\":[[%d,%d,%d],[%d,%d,%d],[%d,%d,%d]]}",trail_enemy,trail_enemy?foes[trail_enemy-1][2]:0,trail_enemy?names[trail_enemy-1]:"",steps,cooldown,sites[0],sites[1],sites[2],sites[3],travelers[0][0],travelers[0][1],travelers[1][0],travelers[1][1],foes[0][0],foes[0][1],foes[0][2],foes[1][0],foes[1][1],foes[1][2],foes[2][0],foes[2][1],foes[2][2]);return out;}
