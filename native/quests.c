/* Original seeded quest registry. Layout is derived, decisions alone are saved. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <limits.h>
#include <emscripten.h>
#include "quests.h"
#include "trail.h"
#include "town.h"
#include "dungeon.h"
#include "progression.h"
#include "art.h"
#include "data/player.h"
#include "engine/texture.h"
#include "engine/geometry.h"
#include "maths/matrix4.h"
static void lost_render(float *view);
static int lost_interact(void);
static const char *lost_dialogue(int resident,int monad);
static int lost_option(int resident,int choice,int monad);
static const char *lost_sable_options(void);
static const char *lost_sable_text(void);
static const char *lost_state(void);
static int lost_valid(const char *data,int listener,int monad);
typedef struct {
 int id;const char *name;
 void (*render)(float *view);
 int (*interact)(void);
 const char *(*dialogue)(int resident,int monad);
 int (*option)(int resident,int choice,int monad);
 const char *(*sable_options)(void);
 const char *(*sable_text)(void);
 const char *(*state)(void);
 int (*valid)(const char *data,int listener,int monad);
} QuestEngine;
/* Add engines here only once their generation and validation are implemented. */
static const QuestEngine engines[]={{1,"The Lost Pilgrim",lost_render,lost_interact,lost_dialogue,lost_option,lost_sable_options,lost_sable_text,lost_state,lost_valid}};
static int engine_id=1;
static const QuestEngine *find_engine(int id){for(unsigned int i=0;i<sizeof(engines)/sizeof(engines[0]);i++)if(engines[i].id==id)return &engines[i];return NULL;}
static int seed=1,stage=0,clues=0,resolution=0;
static const int places[6][2]={{39,27},{45,25},{52,28},{35,29},{49,22},{55,24}};
static const char *pilgrims[]={"Orin","Mira","Vey","Ishra","Numa","Cael"};
static const char *bindings[]={"a promise that forbids asking for help","a borrowed voice that calls fear devotion","a mirror that mistakes perfection for peace"};
static const char *letters[]={"writes: I promised I would never need another. Now I cannot ask anyone to open the door.","writes: A voice wearing my name calls every doubt a failure of devotion. It grows louder when I obey.","writes: The mirror promises peace when I become flawless. Each correction erases another memory."};
static const char *tracks[]={"left a thread tied in two unequal loops: a bond can hold without becoming a chain.","left a footprint facing away from the echo: the borrowed voice cannot choose the pilgrim's road.","left a cracked bead beside the trail: something imperfect was worth carrying out of the mirror."};
static const char *gifts[]={"Ariel grows a living bridge beyond the binding.","Samael severs the false covenant, not the pilgrim.","Raphael heals the wound on which the binding feeds.","Jophiel reveals the imperfect, beautiful self behind the mirror.","Lilith offers a door that opens without an oath of obedience."};
static unsigned int texture;static Geometry sprites[2];static float matrix[16];static int initialized=0;
static unsigned int random_next(unsigned int *r){*r=*r*1664525u+1013904223u;return *r;}
static void layout(int *order,int *person,int *binding){unsigned int r=(unsigned int)seed;for(int i=0;i<6;i++)order[i]=i;for(int i=5;i>0;i--){int j=(int)(random_next(&r)%(unsigned int)(i+1)),t=order[i];order[i]=order[j];order[j]=t;}*person=(int)(random_next(&r)%6);*binding=(int)(random_next(&r)%3);}
void quests_reset(int value){seed=value>0?value:1;engine_id=engines[((unsigned int)seed-1)%(sizeof(engines)/sizeof(engines[0]))].id;stage=clues=resolution=0;}
static int nearby(int i){return abs(player.tx-places[i][0])+abs(player.ty-places[i][1])<=1;}
static void lost_render(float *view){
 if(!sanctuary_outcome||stage<1||stage>2)return;
 if(!initialized){unsigned char pixels[56*32*4]={0};quest_art_copy(pixels,56,0,11);quest_art_copy(pixels,56,1,9);texture=texture_load(56,32,pixels);for(int i=0;i<2;i++)geometry_setSprite(&sprites[i],14,16,i/2.0f,0,(i+1)/2.0f,1);matrix4_setIdentity(matrix);initialized=1;}
 int order[6],person,binding;layout(order,&person,&binding);
 for(int i=0;i<3;i++){if(i<2&&(clues&(1<<i)))continue;if(i==2&&stage<2)continue;matrix4_setPosition(matrix,places[order[i]][0]*14,places[order[i]][1]*16,3);geometry_render(&sprites[i==2],texture,matrix,view);}
}
static int lost_interact(void){if(!sanctuary_outcome||stage<1||stage>2)return 0;int order[6],person,binding;layout(order,&person,&binding);for(int i=0;i<3;i++)if(nearby(order[i])){quest_conversation=10+i;return 1;}return 0;}
static const char *lost_sable_text(void){
 static char out[260];
 if(stage>=3){snprintf(out,sizeof(out)," %s %s",stage==3?"Report your pilgrim's safe passage.":"The Lost Pilgrim's safe passage is recorded; its reward has already been given.",resolution==1?"You listened, and the pilgrim chose their own way out.":gifts[resolution-2]);return out;}
 return stage==0?" Sable also keeps a letter from a missing pilgrim. Ask about The Lost Pilgrim.":" Your Lost Pilgrim investigation remains in the road journal.";
}
static const char *lost_sable_options(void){return stage==0?",{\"id\":100,\"label\":\"Accept The Lost Pilgrim - a seeded adventure\"}":stage==3?",{\"id\":104,\"label\":\"Report the pilgrim's safe passage\"}":"";}
static const char *lost_state(void){static char out[1600];int order[6],person,binding;layout(order,&person,&binding);char objective[550];if(stage==0)snprintf(objective,sizeof(objective),"Speak with Sable near (36,52) to begin The Lost Pilgrim after answering the Listener.");else if(stage==1)snprintf(objective,sizeof(objective),"Find %s: inspect the two turquoise tokens at (%d,%d) and (%d,%d).",pilgrims[person],places[order[0]][0],places[order[0]][1],places[order[1]][0],places[order[1]][1]);else if(stage==2)snprintf(objective,sizeof(objective),"Find %s at the refuge (%d,%d). They face %s. Listen freely or invoke your Monad for 3 Light.",pilgrims[person],places[order[2]][0],places[order[2]][1],bindings[binding]);else snprintf(objective,sizeof(objective),stage==3?"%s is free. Return to Sable near (36,52) for your reward.":"%s's passage is recorded. The Lost Pilgrim is complete.",pilgrims[person]);snprintf(out,sizeof(out),"{\"engine\":%d,\"name\":\"%s\",\"seed\":%d,\"stage\":%d,\"clues\":%d,\"resolution\":%d,\"pilgrim\":\"%s\",\"binding\":%d,\"sites\":[[%d,%d],[%d,%d],[%d,%d]],\"objective\":\"%s\"}",engines[0].id,engines[0].name,seed,stage,clues,resolution,pilgrims[person],binding,places[order[0]][0],places[order[0]][1],places[order[1]][0],places[order[1]][1],places[order[2]][0],places[order[2]][1],objective);return out;}
static const char *lost_dialogue(int resident,int monad){static char out[1800],text[1000];int order[6],person,binding;layout(order,&person,&binding);int i=resident-10;if(i<0||i>2)return "null";const char *options;
 if(i<2){snprintf(text,sizeof(text),"%s %s %s",i==0?"A rain-dark letter carries a pilgrim's name.":"A turquoise thread catches beside a footprint.",pilgrims[person],i==0?letters[binding]:tracks[binding]);options=(clues&(1<<i))?"[]":i==0?"[{\"id\":101,\"label\":\"Read the letter\"}]":"[{\"id\":102,\"label\":\"Read the trail\"}]";}
 else{snprintf(text,sizeof(text),"%s shelters behind %s. %s %s",pilgrims[person],bindings[binding],stage<2?"Both clues are needed to distinguish the pilgrim's voice from the binding.":"You can listen until they choose their own way out. No payment or violence is required.",gifts[monad]);options=stage==2?"[{\"id\":103,\"label\":\"Listen: let the pilgrim choose their way\"},{\"id\":105,\"label\":\"Invoke your Monad - 3 Light\"}]":"[]";}
 if(i==2&&stage>=3)snprintf(text,sizeof(text),"%s is free. %s Sable will carry word of their safe passage.",pilgrims[person],resolution==1?"You listened, and the pilgrim chose their own way out.":gifts[resolution-2]);
 snprintf(out,sizeof(out),"{\"name\":\"%s\",\"text\":\"%s\",\"options\":%s}",i==2?pilgrims[person]:"A pilgrim's sign",text,options);return out;
}
static int lost_option(int resident,int choice,int monad){
 if(!sanctuary_outcome||!player_isAlive())return 0;
 if(resident==6&&choice==100&&stage==0){stage=1;quest_note("The Lost Pilgrim begins. Two clue sites are marked in your road journal; turquoise tokens show their locations.");return 1;}
 if(resident==6&&choice==104&&stage==3){int before=quest_level();stage=4;quest_gain_xp(45);player.gold=player.gold>99980?100000:player.gold+20;if(quest_tonics<5)quest_tonics++;quest_reward_note("Sable records the safe passage: 45 experience, 20 gold and a tonic if there is room. This promise cannot pay twice.",before);return 1;}
 if(stage==1&&((resident==10&&choice==101)||(resident==11&&choice==102))){int bit=1<<(resident-10);if(clues&bit)return 0;clues|=bit;if(clues==3)stage=2;quest_note(clues==3?"Together the signs reveal the refuge. Your road journal now names its coordinates.":"The first sign enters your journal. Seek the other turquoise token.");return 1;}
 if(resident==12&&stage==2&&(choice==103||choice==105)){if(choice==105&&quest_light<3){quest_note("Your intervention needs three Light. Listening is always available, or restore Light at the spring or a healer.");return 0;}if(choice==105)quest_light-=3;resolution=choice==103?1:monad+2;stage=3;quest_note(choice==103?"You listen without demanding an answer. The pilgrim chooses the road freely. Return to Sable.":gifts[monad]);return 1;}return 0;
}
EMSCRIPTEN_KEEPALIVE const char *quest_engines(void){static char out[100];snprintf(out,sizeof(out),"%d,%d,%d,%d,%d",seed,engine_id,stage,clues,resolution);return out;}
static int parse(const char *s,int *v){if(!s||strlen(s)>90)return 0;for(int i=0;i<5;i++){if(*s<'0'||*s>'9')return 0;char *end;errno=0;long n=strtol(s,&end,10);if(errno||n>INT_MAX)return 0;v[i]=(int)n;if(i==4)return *end==0;if(*end!=',')return 0;s=end+1;}return 0;}
static int lost_valid(const char *s,int listener,int monad){int v[5];if(!parse(s,v)||v[0]<1||v[1]!=1||v[2]>4||v[3]>3||v[4]>6)return 0;if(!listener&&v[2])return 0;if(v[2]==0&&(v[3]||v[4]))return 0;if(v[2]==1&&(v[3]==3||v[4]))return 0;if(v[2]>=2&&v[3]!=3)return 0;if(v[2]==2&&v[4])return 0;if(v[2]>=3&&v[4]!=1&&v[4]!=monad+2)return 0;return 1;}
void quests_restore(const char *s){int v[5];if(parse(s,v)&&find_engine(v[1])){seed=v[0];engine_id=v[1];stage=v[2];clues=v[3];resolution=v[4];}}
/* Stable IDs dispatch content; adding a second engine does not reroll saved IDs. */
void quests_render(float *view){find_engine(engine_id)->render(view);}
int quests_interact(void){return find_engine(engine_id)->interact();}
const char *quests_dialogue(int resident,int monad){return find_engine(engine_id)->dialogue(resident,monad);}
int quests_option(int resident,int choice,int monad){return find_engine(engine_id)->option(resident,choice,monad);}
const char *quests_sable_options(void){return find_engine(engine_id)->sable_options();}
const char *quests_sable_text(void){return find_engine(engine_id)->sable_text();}
EMSCRIPTEN_KEEPALIVE const char *quest_engine_state(void){return find_engine(engine_id)->state();}
int quests_valid(const char *s,int listener,int monad){int v[5];if(!parse(s,v))return 0;const QuestEngine *e=find_engine(v[1]);return e&&e->valid(s,listener,monad);}
