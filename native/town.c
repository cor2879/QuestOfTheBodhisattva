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
static unsigned char townPixels[280*192*4],peoplePixels[49*7*4];
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
static void put(int x,int y,unsigned int c){int p=(y*280+x)*4;townPixels[p]=c>>16;townPixels[p+1]=c>>8;townPixels[p+2]=c;townPixels[p+3]=255;}
static void wall(int x,int y){ultimaAssets.townCollisionMap[y][x]=1;}
static void house(int left,int top,int right,int bottom,int doorX,int doorY){for(int y=top;y<=bottom;y++)for(int x=left;x<=right;x++)if(x==left||x==right||y==top||y==bottom)wall(x,y);ultimaAssets.townCollisionMap[doorY][doorX]=0;}
void haven_init(void){
 memset(ultimaAssets.townCollisionMap,0,sizeof(ultimaAssets.townCollisionMap));
 for(int x=0;x<40;x++){wall(x,0);wall(x,21);}for(int y=0;y<22;y++){wall(0,y);wall(39,y);}ultimaAssets.townCollisionMap[21][20]=0;
 house(4,3,14,10,9,10);house(16,3,24,9,20,9);house(26,3,36,10,30,10);house(4,13,14,19,9,13);
 for(int y=0;y<192;y++)for(int x=0;x<280;x++){
  int tx=x/7,ty=y/7;unsigned int c=0x172a29;
  if(ty<22){c=(tx==20||tx==21||ty==11||ty==12)?0x7e735e:0x42614a;if(ultimaAssets.townCollisionMap[ty][tx])c=(y%7==0||x%7==0)?0x344454:0x8a9d9c;else if((x*3+y*7)%19==0)c=0x647b53;}
  put(x,y,c);
 }
 /* Flower garden and temple mosaic, original decorative pixels. */
 for(int y=99;y<126;y++)for(int x=185;x<255;x++)if((x+y)%11==0)put(x,y,(x%3==0)?0xe0b888:0x97779b);
 for(int y=28;y<56;y++)for(int x=120;x<165;x++)if((x-y)%13==0)put(x,y,0xd7c691);
 townTexture[0]=texture_load(280,192,townPixels);geometry_setSprite(&background,280,192,0,0,1,1);
 /* Vesper's twilight stone and memorial paths share native town movement,
    but have a separate original palette and decorative name plaques. */
 for(int p=0;p<280*192*4;p+=4){unsigned int r=townPixels[p],g=townPixels[p+1],b=townPixels[p+2];townPixels[p]=(unsigned char)((r+b)/2);townPixels[p+1]=(unsigned char)(g*3/4);townPixels[p+2]=(unsigned char)((g+b)/2+20);}
 for(int y=101;y<128;y+=7)for(int x=190;x<250;x+=7)put(x,y,0xc5b3db);
 townTexture[1]=texture_load(280,192,townPixels);
 unsigned int colors[7]={0xe3c783,0x75bdb0,0xae8bba,0xa8b7c8,0x8cb46b,0xc6977f,0x75c4df};
 for(int i=0;i<7;i++)for(int y=0;y<7;y++)for(int x=0;x<7;x++){
  int p=(y*49+i*7+x)*4;unsigned int c=y<3?0xe3bd91:colors[i];peoplePixels[p]=c>>16;peoplePixels[p+1]=c>>8;peoplePixels[p+2]=c;peoplePixels[p+3]=(x>=2&&x<=4)?255:0;
 }
 ultimaAssets.townCastleSprites.width=49;ultimaAssets.townCastleSprites.height=7;ultimaAssets.townCastleSprites.textureId=texture_load(49,7,peoplePixels);
 for(int i=0;i<6;i++)geometry_setSprite(&people[i],7,7,i/7.0f,0,(i+1)/7.0f,1);
 strcpy(ultimaStrings[341],"A wall or resident blocks the way.");
}
void haven_enter(void){quest_location=1;quest_conversation=-1;player.px=20;player.py=20;isPlayerInCastle=false;playerTown_init();camera_setPosition3f(&camera,0,0,10);quest_note("Haven. Meriel tends the northern temple. Walk south through the gate to leave.");}
void vesper_enter(void){haven_enter();quest_location=3;quest_note("Vesper, City of Unwritten Names. Maera waits in the northern hall; Neris and Oren keep the southwest home and southeast memorial. The south gate leads back to the coast.");}
void haven_render(void){
 matrix4_setIdentity(transform);geometry_render(&background,townTexture[quest_location==3],transform,camera_getViewProjectionMatrix(&camera));
 for(int i=0;i<6;i++){matrix4_setPosition(transform,positions[i][0]*7,positions[i][1]*7,2);geometry_render(&people[i],ultimaAssets.townCastleSprites.textureId,transform,camera_getViewProjectionMatrix(&camera));}
 playerTown_render(camera_getViewProjectionMatrix(&camera));
}
int haven_interact(void){for(int i=0;i<6;i++)if(abs(player.px-positions[i][0])+abs(player.py-positions[i][1])==1){quest_conversation=i;return 1;}quest_note(quest_location==3?"Stand beside a resident and interact. Maera waits in the northern hall.":"Stand beside a resident and interact. Meriel is in the northern temple.");return 0;}
EMSCRIPTEN_KEEPALIVE void quest_close_conversation(void){quest_conversation=-1;}
EMSCRIPTEN_KEEPALIVE const char *quest_dialogue(void){
 static char out[1800];if(quest_conversation<0){return "null";}if(quest_location==3)return vesper_dialogue(quest_conversation);const char *text="",*options="";
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
