/* Original sanctuary content on Open Sosaria's dungeon movement and renderer.
   All perspective tables and horror outlines below are original, not disk assets. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten.h>
#include <errno.h>
#include <limits.h>
#include "data/enemy.h"
#include "dungeon.h"
#include "town.h"
#include "data/player.h"
#include "data/bevery.h"
#include "data/dungeonEnemy.h"
#include "entities/dungeonRenderer.h"
#include "entities/playerOverworld.h"
#include "engine/camera.h"
#include "engine/engine.h"
#include "engine/input.h"
#include "scenes/sceneDungeon.h"
#include "scenes/sceneDiskLoader.h"
bool playerDungeon_step(int action);
int dungeonMap[11][11],monstersIndex=0,monsters[100][4];
int dungeonTable[11][4],dungeonDoorsTable[11][6],dungeonDoorsFrontTable[11][4],dungeonTrapsTable[11][6],dungeonLaddersTable[11][4],dungeonEnemiesHeight[11][1];
DungeonEnemyHplotData dungeonEnemyHplotPoints[25];
int dungeonEnemyHplotPointsCount=3,sanctuary_outcome=0;
static int renderDirty=1;
static int visited=0,chest=0,facing=0,enemy[3][3]; /* x,y,hp */
static const int starts[3][3]={{3,7,16},{7,5,18},{9,3,20}};
static const char *layout[11]={"###########","#.........#","#.###.###.#","#...#...#.#","###.#.#.#.#","#...#.#...#","#.###.###.#","#.....#...#","#.#####.#.#","#.........#","###########"};
static const int vectors[4][2]={{0,-1},{1,0},{0,1},{-1,0}};
static int floor_at(int x,int y){return x>0&&x<10&&y>0&&y<10&&layout[y][x]!='#';}
static void map_sync(void){renderDirty=1;
 for(int x=0;x<11;x++)for(int y=0;y<11;y++)dungeonMap[x][y]=floor_at(x,y)?0:1;
 dungeonMap[1][9]=8;if(!chest)dungeonMap[3][3]=5;
 for(int i=0;i<3;i++)if(enemy[i][2]>0)dungeonMap[enemy[i][0]][enemy[i][1]]=(i+1)*100;
 player.dx=vectors[facing][0];player.dy=vectors[facing][1];player.dungeonDepth=1;
}
int sanctuary_solid(int x,int y){if(!floor_at(x,y))return 1;for(int i=0;i<3;i++)if(enemy[i][2]>0&&enemy[i][0]==x&&enemy[i][1]==y)return 1;return 0;}
bool sceneDungeon_isSolid(int x,int y){return sanctuary_solid(x,y);}
void sceneDungeon_generateFloor(void){map_sync();}
void vmExecuter_createWait(float delay){(void)delay;}
void sanctuary_reset(void){visited=chest=facing=sanctuary_outcome=0;memcpy(enemy,starts,sizeof(enemy));}
void sanctuary_init(void){
 sanctuary_reset();dungeonRenderer_init();for(int i=1;i<=3;i++)snprintf(enemyDefinitions[i].name,16,"Veil horror %d",i);
 /* Perspective rectangles converge on (140,79); all renderer tables include a terminal row. */
 for(int d=0;d<11;d++){int w=140/(d+1),h=79/(d+1);int l=140-w,r=140+w,t=79-h,b=79+h;
  dungeonTable[d][0]=l;dungeonTable[d][1]=r;dungeonTable[d][2]=t;dungeonTable[d][3]=b;
  dungeonDoorsTable[d][0]=l;dungeonDoorsTable[d][1]=l+w/3;dungeonDoorsTable[d][2]=t+h/3;dungeonDoorsTable[d][3]=t+h/2;dungeonDoorsTable[d][4]=b;dungeonDoorsTable[d][5]=b-h/3;
  dungeonDoorsFrontTable[d][0]=140-w/3;dungeonDoorsFrontTable[d][1]=140+w/3;dungeonDoorsFrontTable[d][2]=t+h/2;dungeonDoorsFrontTable[d][3]=b;
  dungeonTrapsTable[d][0]=140-w/2;dungeonTrapsTable[d][1]=140+w/2;dungeonTrapsTable[d][2]=140-w/3;dungeonTrapsTable[d][3]=140+w/3;dungeonTrapsTable[d][4]=b-h/4;dungeonTrapsTable[d][5]=b-h/2;
  dungeonLaddersTable[d][0]=140-w/4;dungeonLaddersTable[d][1]=140+w/4;dungeonLaddersTable[d][2]=t+h/3;dungeonLaddersTable[d][3]=b-h/3;dungeonEnemiesHeight[d][0]=50/(d+1);
 }
 /* Tentacled silhouette and cyclopean eye, reusable vector art at each distance. */
 const float body[]={-.5f,0,-.7f,-.3f,-.5f,-.8f,0,-1,.5f,-.8f,.7f,-.3f,.5f,0};
 const float eye[]={-.25f,-.6f,0,-.75f,.25f,-.6f,0,-.45f,-.25f,-.6f};
 const float tendrils[]={-.5f,0,-.8f,.1f,-1,-.1f,-.8f,-.3f};
 for(int i=0;i<3;i++){DungeonEnemyHplotData *a=&dungeonEnemyHplotPoints[i];a->hplotListCount=4;memcpy(a->hplotLists[0].points,body,sizeof(body));a->hplotLists[0].pointCount=14;memcpy(a->hplotLists[1].points,eye,sizeof(eye));a->hplotLists[1].pointCount=10;memcpy(a->hplotLists[2].points,tendrils,sizeof(tendrils));a->hplotLists[2].pointCount=8;for(int j=0;j<8;j++)a->hplotLists[3].points[j]=j%2?tendrils[j]:-tendrils[j];a->hplotLists[3].pointCount=8;}
 strcpy(ultimaStrings[859],"forward");strcpy(ultimaStrings[860],"Stone or a horror blocks the way.");strcpy(ultimaStrings[865],"turn around");strcpy(ultimaStrings[866],"turn left");strcpy(ultimaStrings[867],"turn right");
}
void sanctuary_enter(void){visited=1;quest_location=2;quest_conversation=-1;player.px=1;player.py=9;facing=0;map_sync();camera_setPosition3f(&camera,0,0,10);quest_note("The Bound Listener. Forward advances; left/right turn, down turns around. F strikes ahead. Return to the entrance and E to leave.");}
void sanctuary_leave(void){quest_location=0;playerOverworld_setCameraFollow();quest_note("You climb to the sanctuary stone. Haven lies northwest; Tavian can heal you.");}
void sanctuary_render(void){
 if(renderDirty){dungeonRenderer_update();
 /* Compact surveyed sanctuary plan in the renderer's unused lower strip. */
 for(int x=0;x<11;x++)for(int y=0;y<11;y++){int r=60,g=70,b=85;if(floor_at(x,y)){r=145;g=155;b=160;}if(x==1&&y==9){r=230;g=195;b=110;}if(x==9&&y==1){r=185;g=125;b=225;}if(x==3&&y==3&&!chest){r=100;g=205;b=140;}for(int i=0;i<3;i++)if(enemy[i][2]>0&&x==enemy[i][0]&&y==enemy[i][1]){r=215;g=80;b=85;}if(x==player.px&&y==player.py){r=100;g=225;b=250;}for(int a=0;a<2;a++)for(int c=0;c<2;c++)dungeonRenderer_setPixel(5+x*2+a,165+y*2+c,r,g,b);}
 renderDirty=0;}dungeonRenderer_render(camera_getViewProjectionMatrix(&camera));
}
static void enemies_turn(void){
 int damage=0;for(int i=0;i<3;i++){if(enemy[i][2]<=0)continue;int dx=player.px-enemy[i][0],dy=player.py-enemy[i][1];if(abs(dx)+abs(dy)==1){damage+=4;continue;}
 /* Horrors wake only within three cells, then follow an unobstructed corridor. */
 if(abs(dx)+abs(dy)>3)continue;int nx=enemy[i][0]+(dx>0?1:dx<0?-1:0),ny=enemy[i][1];if(dx==0||sanctuary_solid(nx,ny)){nx=enemy[i][0];ny=enemy[i][1]+(dy>0?1:dy<0?-1:0);}if((nx!=player.px||ny!=player.py)&&!sanctuary_solid(nx,ny)){enemy[i][0]=nx;enemy[i][1]=ny;}
 }
 if(damage){player.health-=damage;if(player.health<0)player.health=0;char text[160];snprintf(text,sizeof(text),"The horrors retaliate for %d vitality. %s",damage,player.health?"Strike ahead or retreat.":"Your light falters. E recalls you to Haven; gold pays for the rescue.");quest_note(text);}map_sync();
}
int sanctuary_action(int action,int monad){
 if(action==11){enemies_turn();return 0;}
 if(action==6){
  if(player.px==1&&player.py==9){sanctuary_leave();return 0;}
  if(player.px==3&&player.py==3&&!chest){chest=1;player.gold+=15;if(quest_tonics<5)quest_tonics++;map_sync();quest_note("A pilgrim's cache: fifteen gold and a tonic if your pouch has room.");return 0;}
  if(player.px==9&&player.py==1){quest_note(sanctuary_outcome?"The chamber remembers your choice. Return to Haven; its keeper will hear your story.":"The Listener is a captive memory, not a god demanding worship. R releases its name; B binds a protective ward. Your Monad gives the choice its meaning.");return 0;}
  quest_note("Seek the Listener in the northeast chamber (9,1). A pilgrim's cache rests at (3,3). E interacts where you stand.");return 0;
 }
 if(action==9||action==10){
  if(player.px!=9||player.py!=1||sanctuary_outcome){quest_note("The choice belongs to the Listener's chamber, and can be made only once.");return 0;}
  sanctuary_outcome=action==9?1:2;player.experience+=40;player.gold+=20;
  const char *insights[5]={"Ariel restores a bond between the voice and the living coast.","Samael judges the prison, not the prisoner.","Raphael heals the wound that made captivity seem inevitable.","Jophiel restores a name erased from the world's song.","Lilith offers freedom without demanding allegiance."};char text[256];snprintf(text,sizeof(text),"%s %s Forty experience and twenty gold.",action==9?"The Listener is released.":"A ward protects the Listener while its memory heals.",insights[monad]);quest_note(text);return 0;
 }
 if(!player_isAlive())return 0;
 int acted=0;if(action>=1&&action<=4){memset(&input,0,sizeof(input));input.up=action==1;input.down=action==2;input.left=action==3;input.right=action==4;acted=playerDungeon_step(action);memset(&input,0,sizeof(input));if(acted){for(int i=0;i<4;i++)if(vectors[i][0]==player.dx&&vectors[i][1]==player.dy)facing=i;}}
 else if(action==8){int target=-1;for(int i=0;i<3;i++)if(enemy[i][2]>0&&enemy[i][0]==player.px+player.dx&&enemy[i][1]==player.py+player.dy)target=i;if(target<0){quest_note("No horror stands immediately ahead. Turn toward it before striking.");return 0;}int hit=8+player.strength/5;enemy[target][2]-=hit;if(enemy[target][2]<0)enemy[target][2]=0;quest_note(enemy[target][2]?"Your light wounds the horror.":"The horror dissolves. Twelve experience and eight gold.");if(!enemy[target][2]){player.experience+=12;player.gold+=8;}player_consumeDungeonFood();acted=1;}
 else if(action==5){player_waitPenalty();quest_note("You wait; the horrors act.");acted=1;}
 if(acted){enemies_turn();if(player.food<0)player.food=0;}return acted;
}
/* Numeric payload: exact parser, bounded coordinates/health, no dead enemy resurrection. */
const char *sanctuary_save(void){static char out[200];snprintf(out,sizeof(out),"%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d",visited,chest,sanctuary_outcome,facing,enemy[0][0],enemy[0][1],enemy[0][2],enemy[1][0],enemy[1][1],enemy[1][2],enemy[2][0],enemy[2][1],enemy[2][2]);return out;}
static int parse(const char *s,int *v){
 if(!s||strlen(s)>150)return 0;
 for(int i=0;i<13;i++){char *end;errno=0;if(*s<'0'||*s>'9')return 0;long n=strtol(s,&end,10);if(errno||n<0||n>INT_MAX||end==s)return 0;v[i]=(int)n;if(i==12)return *end==0;if(*end!=',')return 0;s=end+1;}return 0;
}
int sanctuary_valid(const char *s,int x,int y){int v[13];if(!parse(s,v)||v[0]<0||v[0]>1||v[1]<0||v[1]>1||v[2]<0||v[2]>2||v[3]<0||v[3]>3)return 0;if(!v[0]&&(v[1]||v[2]))return 0;for(int i=0;i<3;i++){int k=4+i*3;if(!floor_at(v[k],v[k+1])||v[k+2]<0||v[k+2]>starts[i][2])return 0;if(v[k+2]){if(x==v[k]&&y==v[k+1])return 0;for(int j=0;j<i;j++)if(v[4+j*3+2]&&v[k]==v[4+j*3]&&v[k+1]==v[5+j*3])return 0;}}return x<0?1:floor_at(x,y)&&v[0];}
void sanctuary_restore(const char *s){int v[13];if(!parse(s,v))return;visited=v[0];chest=v[1];sanctuary_outcome=v[2];facing=v[3];for(int i=0;i<3;i++)memcpy(enemy[i],v+4+i*3,3*sizeof(int));map_sync();}
EMSCRIPTEN_KEEPALIVE const char *quest_dungeon(void){return sanctuary_save();}
