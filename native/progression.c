/* Original RPG growth and equipment, stored alongside the native Player. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <limits.h>
#include <emscripten.h>
#include "progression.h"
#include "town.h"
#include "dungeon.h"
#include "trail.h"
#include "data/player.h"
int quest_light=8,quest_owned=0,quest_ward=0,quest_veil=0,quest_focus=0,quest_stun[3]={0};
int quest_level_for(int xp){return xp>=240?6:xp>=160?5:xp>=100?4:xp>=60?3:xp>=25?2:1;}
int quest_level(void){return quest_level_for(player.experience);}
int quest_light_max(void){return 6+2*quest_level();}
int quest_strike_damage(void){return 8+player.strength/5+2*(quest_level()-1)+(player.weapon==1?4:player.weapon==2?1:0)+quest_focus;}
int quest_strike_range(void){return player.weapon==2?2:1;}
void quest_clear_effects(void){quest_ward=quest_veil=quest_focus=0;memset(quest_stun,0,sizeof(quest_stun));}
void quest_progress_reset(void){quest_light=8;quest_owned=0;player.weapon=player.armor=0;memset(player.weapons,0,sizeof(player.weapons));memset(player.armors,0,sizeof(player.armors));player.weapons[0]=1;quest_clear_effects();}
void quest_recharge(void){quest_light=quest_light_max();}
void quest_gain_xp(int xp){int before=quest_level();player.experience+=xp;if(player.experience>100000)player.experience=100000;if(quest_level()>before)quest_recharge();}
void quest_reward_note(const char *text,int oldLevel){char out[512];if(quest_level()>oldLevel)snprintf(out,sizeof(out),"%s You reach level %d; strike damage and Light capacity grow. Light restored.",text,quest_level());else snprintf(out,sizeof(out),"%s",text);quest_note(out);}
int quest_buy_gear(int choice){int bit=choice==22?1:choice==23?2:choice==24?4:0,price=choice==22?25:choice==23?30:20;if(!bit)return 0;if((quest_owned&bit)||player.gold<price){quest_note("You already own that item, or need more gold.");return 0;}player.gold-=price;quest_owned|=bit;if(bit==4){player.armors[1]=1;player.armor=1;}else{player.weapons[bit]=1;player.weapon=bit;}quest_note(bit==1?"Pilgrim blade equipped: four extra strike damage, reach one.":bit==2?"Star staff equipped: one extra strike damage, reach two straight ahead.":"Warded robe equipped: one less vitality lost per attacking horror.");return 1;}
EMSCRIPTEN_KEEPALIVE int quest_equip(int slot,int item){
 if(!player_isAlive()||quest_conversation>=0)return 0;
 if(slot==0){if(item<0||item>2||(item&&!(quest_owned&(item==1?1:2)))||player.weapon==item)return 0;player.weapon=item;}
 else if(slot==1){if(item<0||item>1||(item&&!(quest_owned&4))||player.armor==item)return 0;player.armor=item;}
 else return 0;
 quest_note("Equipment changed. During dungeon combat or a trail duel, changing gear gives horrors a turn.");
 /* Scene action 13 applies the waiting cost and enemy response once. */
 if(quest_location==2||quest_location==4)return sanctuary_action(13,0);
 if(trail_enemy)return trail_action(13,0);
 return 0;
}
const char *quest_progress_save(void){static char out[100];snprintf(out,sizeof(out),"%d,%d,%d,%d,%d,%d,%d,%d,%d,%d",quest_light,quest_owned,player.weapon,player.armor,quest_ward,quest_veil,quest_focus,quest_stun[0],quest_stun[1],quest_stun[2]);return out;}
static int parse(const char *s,int *v){if(!s||strlen(s)>100)return 0;for(int i=0;i<10;i++){char *end;errno=0;if(*s<'0'||*s>'9')return 0;long n=strtol(s,&end,10);if(errno||n<0||n>INT_MAX||end==s)return 0;v[i]=(int)n;if(i==9)return *end==0;if(*end!=',')return 0;s=end+1;}return 0;}
int quest_progress_valid(const char *s,int xp,int location){int v[10];if(!parse(s,v)||v[0]>6+2*quest_level_for(xp)||v[1]>7||v[2]>2||v[3]>1||v[4]>3||v[5]>3||v[6]>14)return 0;if(v[2]&&!(v[1]&(v[2]==1?1:2)))return 0;if(v[3]&&!(v[1]&4))return 0;for(int i=7;i<10;i++)if(v[i]>3)return 0;if(location!=2&&location!=4)for(int i=4;i<10;i++)if(v[i])return 0;return 1;}
void quest_progress_restore(const char *s){int v[10];if(!parse(s,v))return;quest_light=v[0];quest_owned=v[1];player.weapon=v[2];player.armor=v[3];quest_ward=v[4];quest_veil=v[5];quest_focus=v[6];memcpy(quest_stun,v+7,sizeof(quest_stun));player.weapons[0]=1;player.weapons[1]=!!(quest_owned&1);player.weapons[2]=!!(quest_owned&2);player.armors[1]=!!(quest_owned&4);}
EMSCRIPTEN_KEEPALIVE const char *quest_progress(void){return quest_progress_save();}

EMSCRIPTEN_KEEPALIVE const char *quest_progress_default(int xp){static char out[100];snprintf(out,sizeof(out),"%d,0,0,0,0,0,0,0,0,0",6+2*quest_level_for(xp));return out;}
