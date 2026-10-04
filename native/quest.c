/* Original content/data bridge into Open Sosaria's native overworld systems. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>
#include <math.h>
#include <emscripten.h>
#include "engine/engine.h"
#include "engine/texture.h"
#include "engine/camera.h"
#include "engine/input.h"
#include "scenes/sceneDiskLoader.h"
#include "scenes/sceneOverworld.h"
#include "entities/worldMap.h"
#include "entities/playerOverworld.h"
#include "entities/playerCommons.h"
#include "entities/vehicleOverworld.h"
#include "entities/ui/uiConsole.h"
#include "data/player.h"
#include "data/enemy.h"
#include "entities/playerTown.h"
#include "town.h"
UltimaAssets ultimaAssets;
char ultimaStrings[1500][41];
unsigned char vehiclesMap[OS_BTERRA_MAP_WIDTH*2][OS_BTERRA_MAP_HEIGHT*2];
EnemyEncounter enemyEncounter={-1,0,0};
EnemyDefinition definitions[24];
EnemyDefinition *enemyDefinitions=definitions;
PLAYER_STATE playerState=PLAYER_STATE_IDLE;
char *vehicleNames[]={"Foot","Steed","Cart","Raft","Ship","Sky vessel","Shuttle"};
static int monad=-1,turns=0;
static char message[256]="The Fortune Teller awaits your choice.";
static const int attributes[5][6]={{14,16,20,14,18,14},{20,18,16,14,14,16},{14,14,20,16,18,18},{12,16,14,18,18,20},{14,20,14,18,16,16}};
void quest_note(const char *s){snprintf(message,sizeof(message),"%s",s);}
void uiConsole_updateStats(void){}
void uiConsole_addMessage(const char*s){quest_note(s);}
void uiConsole_replaceLastMessage(const char*s){quest_note(s);}
void uiConsole_replaceLastMessageFormat(const char*f,...){va_list a;va_start(a,f);vsnprintf(message,sizeof(message),f,a);va_end(a);}
void uiConsole_queueMessageFormat(const char*f,...){va_list a;va_start(a,f);vsnprintf(message,sizeof(message),f,a);va_end(a);}
void uiConsole_queueMessage(const char*s){quest_note(s);}
void uiConsole_addMessageFormat(const char*f,...){va_list a;va_start(a,f);vsnprintf(message,sizeof(message),f,a);va_end(a);}
void audio_playAlert(int n){(void)n;}
/* Empty encounters for this integration milestone; full combat will be adapted next. */
static unsigned char atlas[14*16*8*2*4];
static void pixel(int x,int y,unsigned int c){int p=(y*112+x)*4;atlas[p]=c>>16;atlas[p+1]=c>>8;atlas[p+2]=c;atlas[p+3]=255;}
static void atlas_create(void){
 unsigned int colors[8]={0x24576e,0x315b3f,0x244a34,0x5c6373,0x9c8972,0x65897b,0xab8160,0x3e3a51};
 for(int t=0;t<8;t++)for(int y=0;y<16;y++)for(int x=0;x<14;x++){
  unsigned int c=colors[t];
  if(t==0&&y%5==2&&x%7<4)c=0x468b9b;
  if(t==1&&(x*7+y*3)%23==0)c=0x718860;
  if(t==2&&y>2&&y<13&&abs(x-7)<y/2)c=0x568353;
  if(t==3&&y>3&&abs(x-7)<y/2)c=(x<7?0x9a9a98:0x74777f);
  if(t>=4&&x>2&&x<11&&y>4&&y<14)c=0xc3af8b;
  if(t==6&&y<7&&y>2&&abs(x-7)<y)c=0x9f594d;
  if(t==7&&x>4&&x<10&&y>7)c=0x161d29;
  if(t==5&&abs(x-7)<2&&y>2&&y<13)c=0xe0c88b;
  pixel(t*14+x,y,c);
 }
 for(int y=16;y<32;y++)for(int x=0;x<112;x++){int local=x%14;unsigned int c=0;pixel(x,y,c);atlas[(y*112+x)*4+3]=0;if(local>4&&local<10&&y>18&&y<23)pixel(x,y,0xe6bb89);if(local>3&&local<11&&y>=23&&y<29)pixel(x,y,0xe7cc87);if((local==5||local==9)&&y>=29)pixel(x,y,0xcedad2);}
 ultimaAssets.overworldTiles.width=112;ultimaAssets.overworldTiles.height=32;
 ultimaAssets.overworldTiles.textureId=texture_load(112,32,atlas);
 ultimaAssets.enemySprites=ultimaAssets.overworldTiles;
}
static void world_create(void){
 /* Authored island, original terrain. Four 86x86 region tables retain upstream layout. */
 for(int y=0;y<172;y++)for(int x=0;x<172;x++){
  int terrain=1;
  if(x<12||y<12||x>158||y>158)terrain=0;
  else if((x>57&&x<65&&y<80)||(y>92&&y<99&&x>95))terrain=3;
  else if((x>28&&x<38&&y>31&&y<50)||(x>75&&x<93&&y>38&&y<58))terrain=2;
  ultimaAssets.bterraMaps[(y/86)*2+x/86][y%86][x%86]=(unsigned char)(terrain<<4);
 }
 ultimaAssets.bterraMaps[0][40][43]=0x60; /* Haven */
 ultimaAssets.bterraMaps[0][35][47]=0x50; /* Shrine */
 ultimaAssets.bterraMaps[0][47][51]=0x70; /* Sanctuary */
 strcpy(ultimaStrings[98],"Travel: ");strcpy(ultimaStrings[117],"north");strcpy(ultimaStrings[118],"south");strcpy(ultimaStrings[119],"east");strcpy(ultimaStrings[120],"west");strcpy(ultimaStrings[122],"Water requires a vessel.");strcpy(ultimaStrings[123],"The mountains block your path.");
 atlas_create();worldMap_init();
}
EMSCRIPTEN_KEEPALIVE int quest_start(int id,const char *name){
 if(id<0||id>=5)return 0;
 if(quest_location)playerTown_free();quest_location=0;quest_conversation=-1;quest_stage=quest_clue=quest_blessing=quest_supplies=quest_resolution=quest_tonics=0;
 memset(&player,0,sizeof(player));monad=id;turns=0;player.health=100;player.food=100;player.gold=50;player.experience=1;player.tx=40;player.ty=40;player.type=1;
 snprintf(player.name,sizeof(player.name),"%.15s",name);
 player.strength=attributes[id][0];player.agility=attributes[id][1];player.stamina=attributes[id][2];player.charisma=attributes[id][3];player.wisdom=attributes[id][4];player.intelligence=attributes[id][5];player.weapons[0]=1;
 playerOverworld_init();quest_note("The Lantern Coast. Haven lies three steps east. Seek its keeper.");return 1;
}
EMSCRIPTEN_KEEPALIVE int quest_can_walk(int x,int y){if(quest_location)return haven_valid_position(x,y);if(x<0||x>=172||y<0||y>=172)return 0;int t=(worldMap_getTileAt(x,y)>>4)&15;return t!=0&&t!=3;}
EMSCRIPTEN_KEEPALIVE int quest_action(int direction){
 if(monad<0||quest_conversation>=0)return 0;
 if(!player_isAlive()&&direction!=6&&direction!=7)return 0;
 if(direction==7){if(!quest_tonics||player.health>=100){quest_note("No tonic is needed, or your pouch is empty.");return 0;}quest_tonics--;player.health=(player.health+25>100)?100:player.health+25;player_waitPenalty();if(player.food<0)player.food=0;turns++;quest_note("A tonic restores twenty-five vitality.");return 1;}
 if(direction==5){player_waitPenalty();if(player.food<0)player.food=0;turns++;quest_note("You wait and attend to the world.");return 1;}
 if(direction==6){
  if(quest_location){haven_interact();return 0;}
  int t=(worldMap_getPlayerTile()>>4)&15;
  if(t==6){haven_enter();return 0;}
  if(t==5){quest_blessing=1;if(quest_stage==1&&quest_clue)quest_stage=2;quest_note("Shrine inscription: Five lights share one source. What seems a hungry god may be a captive voice.");return 0;}
  if(t==7){quest_clue=1;if(quest_stage==1&&quest_blessing)quest_stage=2;quest_note("The sanctuary stone reads: THE LISTENER IS BOUND. Its deeper passage is not yet open. Return to Meriel with the shrine's teaching.");return 0;}
  quest_note("Travel east to Haven, northeast to the shrine, or southeast to the sanctuary.");return 0;
 }
 if(direction<1||direction>4)return 0;
 int inTown=quest_location,x=inTown?player.px:player.tx,y=inTown?player.py:player.ty;memset(&input,0,sizeof(input));input.up=direction==1;input.down=direction==2;input.left=direction==3;input.right=direction==4;
 if(inTown)playerTown_updateMovement(0);else playerOverworld_updateMovement(0);memset(&input,0,sizeof(input));waitingTime=0;
 if(quest_location!=inTown||(inTown?(player.px!=x||player.py!=y):(player.tx!=x||player.ty!=y))){if(player.food<0)player.food=0;turns++;if(!player_isAlive())quest_note("Your supplies are exhausted. Start a new reading to journey again.");return 1;}return 0;
}
EMSCRIPTEN_KEEPALIVE const char *quest_message(void){return message;}
EMSCRIPTEN_KEEPALIVE const char *quest_state(void){
 static char buffer[900];snprintf(buffer,sizeof(buffer),"{\"monad\":%d,\"x\":%d,\"y\":%d,\"hp\":%d,\"food\":%.2f,\"gold\":%d,\"experience\":%d,\"time\":%.2f,\"turn\":%d,\"strength\":%d,\"agility\":%d,\"stamina\":%d,\"charisma\":%d,\"wisdom\":%d,\"intelligence\":%d,\"tile\":%d,\"location\":%d,\"px\":%d,\"py\":%d,\"quest\":%d,\"clue\":%d,\"blessing\":%d,\"supplies\":%d,\"resolution\":%d,\"tonics\":%d}",monad,player.tx,player.ty,player.health,player.food,player.gold,player.experience,player.time,turns,player.strength,player.agility,player.stamina,player.charisma,player.wisdom,player.intelligence,(worldMap_getPlayerTile()>>4)&15,quest_location,player.px,player.py,quest_stage,quest_clue,quest_blessing,quest_supplies,quest_resolution,quest_tonics);return buffer;
}
EMSCRIPTEN_KEEPALIVE int quest_restore(int id,int x,int y,int health,double food,int turn,double time){
 if(id<0||id>=5||x<0||x>=172||y<0||y>=172||health<0||health>100||!isfinite(food)||food<0||food>100||turn<0||turn>1000000||!isfinite(time)||time<0||time>1000000)return 0;
 int t=(worldMap_getTileAt(x,y)>>4)&15;if(t==0||t==3)return 0;
 if(quest_location)playerTown_free();quest_location=0;quest_conversation=-1;monad=id;player.strength=attributes[id][0];player.agility=attributes[id][1];player.stamina=attributes[id][2];player.charisma=attributes[id][3];player.wisdom=attributes[id][4];player.intelligence=attributes[id][5];player.tx=x;player.ty=y;player.health=health;player.food=(float)food;turns=turn;player.time=(float)time;playerOverworld_init();quest_note("Your journey on the Lantern Coast resumes.");return 1;
}
EMSCRIPTEN_KEEPALIVE void quest_set_name(const char *name){snprintf(player.name,sizeof(player.name),"%.15s",name);}
EMSCRIPTEN_KEEPALIVE int quest_restore_full(int id,int x,int y,int health,double food,int turn,double time,int location,int px,int py,int stage,int clue,int blessing,int supplies,int resolution,int gold,int experience,int tonics){
 if(location<0||location>1||stage<0||stage>3||clue<0||clue>1||blessing<0||blessing>1||supplies<0||supplies>1||resolution<0||resolution>2||gold<0||gold>100000||experience<1||experience>100000||tonics<0||tonics>5)return 0;
 if((stage>=2&&(!clue||!blessing))||(stage==3?resolution==0:resolution!=0))return 0;
 if(px<0||px>=40||py<0||py>=22)return 0;
 if(location&&((x!=43||y!=40)||!haven_valid_position(px,py)))return 0;
 if(!quest_restore(id,x,y,health,food,turn,time))return 0;
 quest_stage=stage;quest_clue=clue;quest_blessing=blessing;quest_supplies=supplies;quest_resolution=resolution;quest_tonics=tonics;player.gold=gold;player.experience=experience;
 if(location)haven_enter();player.px=px;player.py=py;
 return 1;
}
static void frame(void){
 glfwPollEvents();memset(&input,0,sizeof(input));glClear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT);
 if(monad>=0){if(quest_location)haven_render();else{worldMap_update(camera_getViewProjectionMatrix(&camera));playerOverworld_render();}}glfwSwapBuffers(window);
}
int main(void){if(!engine_init())return 1;world_create();haven_init();emscripten_set_main_loop(frame,0,1);return 0;}
