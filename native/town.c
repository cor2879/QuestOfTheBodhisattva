/* Original Haven content; movement and player rendering use Open Sosaria playerTown.c. */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <math.h>
#include <emscripten.h>
#include "town.h"
#include "dungeon.h"
#include "progression.h"
#include "chapter.h"
#include "trail.h"
#include "art.h"
#include "engine/engine.h"
#include "engine/texture.h"
#include "engine/geometry.h"
#include "engine/camera.h"
#include "maths/matrix4.h"
#include "maths/vector2.h"
#include "scenes/sceneDiskLoader.h"
#include "scenes/sceneOverworld.h"
#include "scenes/sceneCastle.h"
#include "entities/playerOverworld.h"
#include "entities/playerTown.h"
#include "data/player.h"
int quest_location=0,quest_stage=0,quest_clue=0,quest_blessing=0,quest_supplies=0,quest_resolution=0,quest_tonics=0,quest_conversation=-1;
static const int positions[6][2]={{20,6},{9,7},{30,7},{9,15},{30,15},{20,13}};
static const char *names[6]={"Meriel, Keeper of Haven","Tavian, Healer","Iona, Outfitter","Caldus, Witness","Senna, Gardener","Aster, Traveler"};
static unsigned char townPixels[560*384*4],peoplePixels[196*32*4];
static Geometry background,people[6];
static float transform[16];
static GLuint townTexture[2];
Vector2 princessPosition={-1,-1}; /* Castle scene is not active in this chapter. */
static void overworld_return(void){int vesper=quest_location==3;quest_location=0;quest_conversation=-1;playerTown_free();enemyEncounter.monsterId=-1;playerOverworld_setCameraFollow();quest_note(vesper?"You leave Vesper. The Archive stone lies seven steps north.":"You leave Haven and return to the Lantern Coast.");}
Scene sceneOverworld={overworld_return,NULL,NULL};
void vmExecuter_createSceneTransition(float delay,Scene *next){(void)delay;if(next==&sceneOverworld)overworld_return();}
bool sceneCastle_isSolid(int x,int y){(void)x;(void)y;return true;}
bool sceneTown_isSolid(int x,int y){
 if(x<0||x>=40||y<0||y>22)return true;
 if(y==22)return x!=20;
 if(ultimaAssets.townCollisionMap[y][x])return true;
 for(int i=0;i<6;i++)if(x==positions[i][0]&&y==positions[i][1])return true;
 return false;
}
int haven_valid_position(int x,int y){return x>=0&&x<40&&y>=0&&y<22&&!sceneTown_isSolid(x,y);}
static void put(int x,int y,unsigned int c){int p=(y*560+x)*4;townPixels[p]=c>>16;townPixels[p+1]=c>>8;townPixels[p+2]=c;townPixels[p+3]=255;}
static void wall(int x,int y){ultimaAssets.townCollisionMap[y][x]=1;}
static void house(int left,int top,int right,int bottom,int doorX,int doorY){for(int y=top;y<=bottom;y++)for(int x=left;x<=right;x++)if(x==left||x==right||y==top||y==bottom)wall(x,y);ultimaAssets.townCollisionMap[doorY][doorX]=0;}
void haven_init(void){
 memset(ultimaAssets.townCollisionMap,0,sizeof(ultimaAssets.townCollisionMap));
 for(int x=0;x<40;x++){wall(x,0);wall(x,21);}for(int y=0;y<22;y++){wall(0,y);wall(39,y);}ultimaAssets.townCollisionMap[21][20]=0;
 house(4,3,14,10,9,10);house(16,3,24,9,20,9);house(26,3,36,10,30,10);house(4,13,14,19,9,13);
 for(int edition=0;edition<2;edition++){
  for(int y=0;y<384;y++)for(int x=0;x<560;x++){
   int tx=x/14,ty=y/14,tile=-1;unsigned int color;
   if(ty<22){
    if(ultimaAssets.townCollisionMap[ty][tx])tile=0;
    else if(tx==20||tx==21||ty==11||ty==12)tile=edition?5:1;
    else if((tx>4&&tx<14&&ty>3&&ty<10)||(tx>16&&tx<24&&ty>3&&ty<9))tile=1;
    else if((tx>26&&tx<36&&ty>3&&ty<10)||(tx>4&&tx<14&&ty>13&&ty<19))tile=2;
    else if(tx>=26&&tx<=36&&ty>=13&&ty<=19)tile=edition?5:4;
   }
   if(tile>=0)color=quest_art_pixel(1,tile,(x%14)*2,(y%14)*32/14);
   else color=quest_art_pixel(0,1,(x%28),(y%32));
   /* One temple mosaic, rather than a distracting symbol on every floor cell. */
   if(tx>=18&&tx<23&&ty>=4&&ty<8)color=quest_art_pixel(1,edition?5:3,(x-18*14)*28/(5*14),(y-4*14)*32/(4*14));
   if(ty>=22){
    if(tx==20||tx==21)color=quest_art_pixel(0,4,x%28,y%32);
    else if(ty>=24&&(tx<17||tx>24))color=quest_art_pixel(0,2,x%28,(y-24*14)%32);
   }
   unsigned int r=color>>24,g=(color>>16)&255,b=(color>>8)&255;
   if(edition){r=(r*3+b)/4;g=g*9/10;b=b>235?255:b+20;}
   put(x,y,(r<<16)|(g<<8)|b);
  }
  townTexture[edition]=texture_load(560,384,townPixels);
 }
 geometry_setSprite(&background,280,192,0,0,1,1);
 for(int i=0;i<6;i++)quest_interior_copy(peoplePixels,196,i,8+i);
 quest_art_copy(peoplePixels,196,6,8);
 ultimaAssets.townCastleSprites.width=196;ultimaAssets.townCastleSprites.height=32;ultimaAssets.townCastleSprites.textureId=texture_load(196,32,peoplePixels);
 for(int i=0;i<6;i++)geometry_setSprite(&people[i],10,12,i/7.0f,0,(i+1)/7.0f,1);
 strcpy(ultimaStrings[341],"A wall or resident blocks the way.");
}
void haven_enter(void){quest_location=1;quest_conversation=-1;player.px=20;player.py=20;isPlayerInCastle=false;playerTown_init();camera_setPosition3f(&camera,0,0,10);quest_note("Haven. Meriel tends the northern temple. Walk south through the gate to leave.");}
void vesper_enter(void){haven_enter();quest_location=3;quest_note("Vesper, City of Unwritten Names. Maera waits in the northern hall; Neris and Oren keep the southwest home and southeast memorial. The south gate leads back to the coast.");}
void haven_render(void){
 matrix4_setIdentity(transform);geometry_render(&background,townTexture[quest_location==3],transform,camera_getViewProjectionMatrix(&camera));
 for(int i=0;i<6;i++){matrix4_setPosition(transform,positions[i][0]*7-1.5f,positions[i][1]*7-5,1+positions[i][1]*.02f);geometry_render(&people[i],ultimaAssets.townCastleSprites.textureId,transform,camera_getViewProjectionMatrix(&camera));}
 playerTown_render(camera_getViewProjectionMatrix(&camera));
}
int haven_interact(void){for(int i=0;i<6;i++)if(abs(player.px-positions[i][0])+abs(player.py-positions[i][1])==1){quest_conversation=i;return 1;}quest_note(quest_location==3?"Stand beside a resident and interact. Maera waits in the northern hall.":"Stand beside a resident and interact. Meriel is in the northern temple.");return 0;}
EMSCRIPTEN_KEEPALIVE void quest_close_conversation(void){quest_conversation=-1;}
EMSCRIPTEN_KEEPALIVE const char *quest_dialogue(void){
 static char out[1800];if(quest_conversation<0){return "null";}if(quest_conversation>=6)return trail_dialogue(quest_conversation,quest_get_monad());if(quest_location==3)return vesper_dialogue(quest_conversation);const char *text="",*options="";
 switch(quest_conversation){
 case 0:
  text=quest_stage==0?"I keep Haven's light, but lately it shivers. Caldus heard a voice near the buried sanctuary. Will you learn what is asking to be heard?":quest_stage==1?"Visit the shrine northeast of Haven, then inspect the sanctuary southeast of here. Return with what you learn; do not mistake every unfamiliar voice for an enemy.":quest_stage==2?"You found the words: THE LISTENER IS BOUND. Our fear made us imagine a hungry god. What shall Haven do with this knowledge?":sanctuary_outcome==1?"The Listener has its name again. Haven will remember that you judged the prison before the prisoner.":sanctuary_outcome==2?"Your ward gives the Listener time to heal. Protection has become a promise of freedom, not another prison.":"Our preparations have opened the sanctuary. Seek the Listener below; return to tell us what you decide.";
  options=quest_stage==0?"[{\"id\":1,\"label\":\"I will investigate the fading light\"},{\"id\":2,\"label\":\"Tell me about Haven\"}]":quest_stage==2?"[{\"id\":3,\"label\":\"Prepare to listen and seek release\"},{\"id\":4,\"label\":\"Prepare a guarded expedition\"}]":"[{\"id\":2,\"label\":\"Tell me about Haven\"}]";break;
 case 1:text="A gift of care is not a debt of obedience. I can mend your wounds and restore your Light freely. A restoring tonic costs ten gold; carry no more than five.";options="[{\"id\":10,\"label\":\"Receive healing\"},{\"id\":11,\"label\":\"Buy a restoring tonic - 10 gold\"}]";break;
 case 2:text=quest_supplies?"Your first provisions are already packed. Further supplies cost five gold for twenty food, up to one hundred.":"Haven offers its first travelers provisions freely. Afterward, twenty food costs five gold. A journey should begin with more than a promise.";options=quest_supplies?"[{\"id\":21,\"label\":\"Buy twenty food - 5 gold\"}]":"[{\"id\":20,\"label\":\"Take the first provisions\"},{\"id\":21,\"label\":\"Buy twenty food - 5 gold\"}]";break;
 case 3:text="The voice did not command me. It asked whether anyone could remember its name. I fled, and have wondered ever since whether my fear left someone alone.";options="[{\"id\":30,\"label\":\"Where did you hear it?\"}]";break;
 case 4:text="Our garden thrives where roots share water. The northern shrine was built around that same thought: five lights can belong to one source without becoming the same light.";options="[{\"id\":40,\"label\":\"Tell me about the shrine\"}]";break;
 default:text="I have followed voices that wanted worship, and voices that wanted help. Learn which you are hearing before you offer either a sword or a vow.";options="[{\"id\":50,\"label\":\"What lies beyond the coast?\"}]";break;
 }
 char shopOptions[1000];
 if(quest_conversation==2){snprintf(shopOptions,sizeof(shopOptions),"%.*s,{\"id\":22,\"label\":\"Pilgrim blade - 25 gold (+4 strike, reach 1)\"},{\"id\":23,\"label\":\"Star staff - 30 gold (+1 strike, reach 2)\"},{\"id\":24,\"label\":\"Warded robe - 20 gold (-1 harm per horror)\"}]",(int)strlen(options)-1,options);options=shopOptions;}
 snprintf(out,sizeof(out),"{\"name\":\"%s\",\"text\":\"%s\",\"options\":%s}",names[quest_conversation],text,options);return out;
}
EMSCRIPTEN_KEEPALIVE int quest_option(int choice){
 if(quest_conversation<0)return 0;
 if(quest_conversation>=6)return trail_option(quest_conversation,choice,quest_get_monad());
 if(quest_location==3&&quest_conversation!=1&&quest_conversation!=2)return vesper_option(quest_conversation,choice);
 if(quest_conversation==0&&choice==1&&quest_stage==0){quest_stage=(quest_clue&&quest_blessing)?2:1;quest_note("Quest accepted: inspect the shrine and sanctuary, then return to Meriel.");}
 else if(quest_conversation==0&&choice==2){quest_note("Meriel: Haven began as a refuge where no traveler had to surrender their name to belong.");}
 else if(quest_conversation==0&&(choice==3||choice==4)&&quest_stage==2){int oldLevel=quest_level();quest_stage=3;quest_resolution=choice==3?1:2;quest_gain_xp(25);player.gold+=30;quest_reward_note(choice==3?"Haven prepares a listening vigil. Quest complete: 25 experience and 30 gold.":"Haven prepares a guarded expedition. Quest complete: 25 experience and 30 gold.",oldLevel);}
 else if(quest_conversation==1&&choice==10){player.health=100;quest_recharge();quest_note(quest_location==3?"Thalen restores your vitality and Light. No debt is owed.":"Tavian restores your vitality and Light. No debt is owed.");}
 else if(quest_conversation==1&&choice==11){if(player.gold<10||quest_tonics>=5){quest_note("A tonic needs ten gold and space in your pouch (maximum five).");return 0;}player.gold-=10;quest_tonics++;quest_note("A restoring tonic is added to your pouch.");}
 else if(quest_conversation==2&&choice==20){if(quest_supplies){quest_note("Your first provisions have already been collected.");return 0;}quest_supplies=1;player.food=100;quest_note("Iona packs provisions for your journey. Food restored to one hundred.");}
 else if(quest_conversation==2&&choice==21){if(player.gold<5||player.food>=100){quest_note("You need five gold and room for provisions.");return 0;}player.gold-=5;player.food=fminf(100,player.food+20);quest_note(quest_location==3?"Ysra supplies twenty food, up to your carrying limit.":"Iona supplies twenty food, up to your carrying limit.");}
 else if(quest_conversation==2&&choice>=22&&choice<=24)return quest_buy_gear(choice);
 else if(quest_conversation==3&&choice==30)quest_note("Caldus: Eleven steps east and seven south of the coast's first threshold. Inspect the sanctuary stone.");
 else if(quest_conversation==4&&choice==40)quest_note("Senna: The shrine is northeast of Haven. Read its fivefold inscription before judging the voice.");
 else if(quest_conversation==5&&choice==50)quest_note("Aster: Vesper, City of Unwritten Names, lies eleven steps east of Haven at (54,40). Its Archive is seven steps north. The Listener must be answered before Vesper will open its gates.");
 else return 0;
 return 1;
}
