/* Original sanctuary content on Open Sosaria's dungeon movement and renderer.
   All perspective tables and horror outlines below are original, not disk assets. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten.h>
#include <errno.h>
#include <limits.h>
#include <math.h>
#include "data/enemy.h"
#include "dungeon.h"
#include "town.h"
#include "progression.h"
#include "chapter.h"
#include "trail.h"
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
int dungeonEnemyHplotPointsCount=3,sanctuary_outcome=0,vesper_outcome=0;
static int renderDirty=1;
typedef struct {int V,C,F,O,E[3][3],CX,CY;char cells[11][12];} Dungeon;
static Dungeon first,archive;
static int archiveSeed=1;
static Dungeon *current(void){return quest_location==4?&archive:&first;}
#define visited (current()->V)
#define chest (current()->C)
#define facing (current()->F)
#define enemy (current()->E)
#define outcome (current()->O)
#define cacheX (current()->CX)
#define cacheY (current()->CY)
static const int starts[3][3]={{3,7,16},{7,5,18},{9,3,20}};
static const char *layout[11]={"###########","#.........#","#.###.###.#","#...#...#.#","###.#.#.#.#","#...#.#...#","#.###.###.#","#.....#...#","#.#####.#.#","#.........#","###########"};
static const int vectors[4][2]={{0,-1},{1,0},{0,1},{-1,0}};
static int floor_in(const Dungeon *d,int x,int y){return x>0&&x<10&&y>0&&y<10&&d->cells[y][x]!='#';}
static int floor_at(int x,int y){return floor_in(current(),x,y);}
static unsigned int random_next(unsigned int *state){*state^=*state<<13;*state^=*state>>17;*state^=*state<<5;return *state;}
static void generate(Dungeon *d,int seed){
 memset(d,0,sizeof(*d));for(int y=0;y<11;y++){memset(d->cells[y],'#',11);d->cells[y][11]=0;}
 unsigned int rng=(unsigned int)seed;int stack[25][2],count=1;stack[0][0]=1;stack[0][1]=9;d->cells[9][1]='.';
 while(count){int x=stack[count-1][0],y=stack[count-1][1],choices[4],n=0;
  for(int i=0;i<4;i++){int nx=x+vectors[i][0]*2,ny=y+vectors[i][1]*2;if(nx>0&&nx<10&&ny>0&&ny<10&&d->cells[ny][nx]=='#')choices[n++]=i;}
  if(!n){count--;continue;}int i=choices[random_next(&rng)%(unsigned int)n],nx=x+vectors[i][0]*2,ny=y+vectors[i][1]*2;
  d->cells[y+vectors[i][1]][x+vectors[i][0]]='.';d->cells[ny][nx]='.';stack[count][0]=nx;stack[count][1]=ny;count++;
 }
 /* Two extra connections provide alternate approaches without isolated rooms. */
 for(int k=0;k<2;k++){int options[40][2],n=0;for(int y=1;y<10;y++)for(int x=1;x<10;x++)if(d->cells[y][x]=='#'&&((x%2==0&&y%2==1&&d->cells[y][x-1]=='.'&&d->cells[y][x+1]=='.')||(x%2==1&&y%2==0&&d->cells[y-1][x]=='.'&&d->cells[y+1][x]=='.'))){options[n][0]=x;options[n++][1]=y;}if(n){int i=random_next(&rng)%(unsigned int)n;d->cells[options[i][1]][options[i][0]]='.';}}
 int cells[25][2],n=0;for(int y=1;y<10;y+=2)for(int x=1;x<10;x+=2)if(abs(x-1)+abs(y-9)>=6&&!(x==9&&y==1)){cells[n][0]=x;cells[n++][1]=y;}
 for(int i=0;i<4;i++){int at=random_next(&rng)%(unsigned int)n,x=cells[at][0],y=cells[at][1];cells[at][0]=cells[n-1][0];cells[at][1]=cells[n-1][1];n--;if(i==0){d->CX=x;d->CY=y;}else{d->E[i-1][0]=x;d->E[i-1][1]=y;d->E[i-1][2]=20+i*4;}}
}
static void map_sync(void){renderDirty=1;
 for(int x=0;x<11;x++)for(int y=0;y<11;y++)dungeonMap[x][y]=floor_at(x,y)?0:1;
 dungeonMap[1][9]=8;if(!chest)dungeonMap[cacheX][cacheY]=5;
 for(int i=0;i<3;i++)if(enemy[i][2]>0)dungeonMap[enemy[i][0]][enemy[i][1]]=(i+1)*100;
 player.dx=vectors[facing][0];player.dy=vectors[facing][1];player.dungeonDepth=1;
}
int sanctuary_solid(int x,int y){if(!floor_at(x,y))return 1;for(int i=0;i<3;i++)if(enemy[i][2]>0&&enemy[i][0]==x&&enemy[i][1]==y)return 1;return 0;}
bool sceneDungeon_isSolid(int x,int y){return sanctuary_solid(x,y);}
void sceneDungeon_generateFloor(void){map_sync();}
void vmExecuter_createWait(float delay){(void)delay;}
void sanctuary_reset(void){memset(&first,0,sizeof(first));for(int y=0;y<11;y++)strcpy(first.cells[y],layout[y]);first.CX=first.CY=3;memcpy(first.E,starts,sizeof(starts));sanctuary_outcome=vesper_outcome=0;archiveSeed=1;generate(&archive,archiveSeed);chapter_reset();}
void archive_seed(int seed){if(seed<1||archive.V)return;archiveSeed=seed;generate(&archive,seed);}
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
void archive_enter(void){quest_location=4;visited=1;quest_conversation=-1;player.px=1;player.py=9;facing=0;map_sync();camera_setPosition3f(&camera,0,0,10);quest_note("The Archive of Unwritten Names. Seek the Choir at (9,1). The green mark is a pilgrim's cache; gold marks the exit. This labyrinth belongs to your journey.");}
void sanctuary_leave(void){quest_clear_effects();quest_location=0;playerOverworld_setCameraFollow();quest_note("You climb to the sanctuary stone. Haven lies northwest; Tavian can heal you.");}
void sanctuary_render(void){
 if(renderDirty){dungeonRenderer_update();
 /* Compact surveyed sanctuary plan in the renderer's unused lower strip. */
 for(int x=0;x<11;x++)for(int y=0;y<11;y++){int r=60,g=70,b=85;if(floor_at(x,y)){r=145;g=155;b=160;}if(x==1&&y==9){r=230;g=195;b=110;}if(x==9&&y==1){r=185;g=125;b=225;}if(x==cacheX&&y==cacheY&&!chest){r=100;g=205;b=140;}for(int i=0;i<3;i++)if(enemy[i][2]>0&&x==enemy[i][0]&&y==enemy[i][1]){r=215;g=80;b=85;}if(x==player.px&&y==player.py){r=100;g=225;b=250;}for(int a=0;a<2;a++)for(int c=0;c<2;c++)dungeonRenderer_setPixel(5+x*2+a,165+y*2+c,r,g,b);}
 renderDirty=0;}dungeonRenderer_render(camera_getViewProjectionMatrix(&camera));
}
static void enemies_turn(void){
 int damage=0;for(int i=0;i<3;i++){if(enemy[i][2]<=0)continue;if(quest_stun[i]>0){quest_stun[i]--;continue;}if(quest_veil>0)continue;int dx=player.px-enemy[i][0],dy=player.py-enemy[i][1];if(abs(dx)+abs(dy)==1){damage+=player.armor==1?3:4;continue;}
 /* Horrors wake only within three cells, then follow an unobstructed corridor. */
 if(abs(dx)+abs(dy)>3)continue;int nx=enemy[i][0]+(dx>0?1:dx<0?-1:0),ny=enemy[i][1];if(dx==0||sanctuary_solid(nx,ny)){nx=enemy[i][0];ny=enemy[i][1]+(dy>0?1:dy<0?-1:0);}if((nx!=player.px||ny!=player.py)&&!sanctuary_solid(nx,ny)){enemy[i][0]=nx;enemy[i][1]=ny;}
 }
 if(quest_ward>0){damage=(damage+1)/2;quest_ward--;}if(quest_veil>0)quest_veil--;
 if(damage){player.health-=damage;if(player.health<0)player.health=0;char text[160];snprintf(text,sizeof(text),"The horrors retaliate for %d vitality. %s",damage,player.health?"Strike ahead or retreat.":"Your light falters. E recalls you to Haven; gold pays for the rescue.");quest_note(text);}map_sync();
}
static int front_enemy(int range){
 for(int distance=1;distance<=range;distance++){
  int x=player.px+player.dx*distance,y=player.py+player.dy*distance;
  if(!floor_at(x,y))return -1;
  for(int i=0;i<3;i++)if(enemy[i][2]>0&&enemy[i][0]==x&&enemy[i][1]==y)return i;
 }return -1;
}
static void harm(int target,int damage){
 int oldLevel=quest_level();enemy[target][2]-=damage;
 if(enemy[target][2]<=0){enemy[target][2]=0;quest_stun[target]=0;quest_gain_xp(12);player.gold+=8;quest_reward_note("The horror dissolves. Twelve experience and eight gold.",oldLevel);}
 else quest_note("Your light wounds the horror.");
}
static int power(int monad){
 if(quest_light<3){quest_note("Your gift needs three Light. Rest outside the dungeon, or visit a healer or the shrine.");return 0;}
 if(monad==0){quest_ward=3;player.health=fminf(100,player.health+5);quest_note("Ariel's Verdant Ward restores five vitality and halves harm for this and two further enemy turns.");}
 else if(monad==1){int target=front_enemy(3);if(target<0){quest_note("Severance needs a horror within three cells straight ahead, with a clear passage.");return 0;}quest_light-=3;harm(target,16+2*quest_level());player_consumeDungeonFood();return 1;}
 else if(monad==2){if(player.health>=100){quest_note("Restoring Light needs a wound.");return 0;}player.health=fminf(100,player.health+30+2*quest_level());quest_ward=1;quest_note("Raphael's Restoring Light heals your wounds and halves harm this turn.");}
 else if(monad==3){int count=0;for(int i=0;i<3;i++)if(enemy[i][2]>0&&abs(enemy[i][0]-player.px)+abs(enemy[i][1]-player.py)<=3){quest_stun[i]=3;count++;}if(!count){quest_note("Revelation needs a horror within three cells of you.");return 0;}quest_focus=4+quest_level();quest_note("Jophiel's Revelation stuns nearby horrors for this and two further turns, and empowers your next strike.");}
 else if(monad==4){quest_veil=3;quest_focus=8+quest_level();quest_note("Lilith's Veil of Sovereignty stills the horrors for this and two further turns. Your next strike breaks the veil and gains harm.");}
 else return 0;
 quest_light-=3;player_consumeDungeonFood();return 1;
}
int sanctuary_action(int action,int monad){
 if(action==11){enemies_turn();return 0;}
 if(!player_isAlive()&&action!=6)return 0;
 if(action==13){player_waitPenalty();enemies_turn();if(player.food<0)player.food=0;return 1;}
 if(action==6){
  if(player.px==1&&player.py==9){sanctuary_leave();return 0;}
  if(player.px==cacheX&&player.py==cacheY&&!chest){chest=1;quest_owned|=4;player.armors[1]=1;player.gold+=15;if(quest_tonics<5)quest_tonics++;map_sync();quest_note("A pilgrim's cache: a warded robe (equip it below), fifteen gold, and a tonic if your pouch has room.");return 0;}
  if(player.px==9&&player.py==1){quest_note(quest_location==4?(outcome?"The Choir remembers your answer. Return to Maera in Vesper.":"The Nameless Choir carries both grief and love. R invites its names into remembrance; B shelters them behind a ward that each keeper may open."):(outcome?"The chamber remembers your choice. Return to Haven; its keeper will hear your story.":"The Listener is a captive memory, not a god demanding worship. R releases its name; B binds a protective ward. Your Monad gives the choice its meaning."));return 0;}
  if(quest_location==4){quest_note("Seek the Choir at (9,1), or the green cache mark on the plan. E interacts where you stand; return to (1,9) to leave.");return 0;}
  quest_note("Seek the Listener in the northeast chamber (9,1). A pilgrim's cache rests at (3,3). E interacts where you stand.");return 0;
 }
 if(action==9||action==10){
  if(player.px!=9||player.py!=1||outcome){quest_note("The choice belongs to the northeast chamber, and can be made only once.");return 0;}
  int oldLevel=quest_level();outcome=action==9?1:2;renderDirty=1;if(quest_location==4){vesper_outcome=outcome;const char *voices[5]={"Ariel makes room for roots to grow around a scar.","Samael severs the horror's claim without condemning its wounded keepers.","Raphael offers healing without erasing the past.","Jophiel weaves the forgotten names into a song that may be heard by choice.","Lilith defends the right to remember, and the right to wait."};char note[380];snprintf(note,sizeof(note),"%s %s Return to Maera in Vesper.",action==9?"The Choir offers its names to remembrance.":"A protective vigil shelters the Choir, without demanding silence.",voices[monad]);quest_note(note);return 0;}sanctuary_outcome=outcome;quest_gain_xp(40);player.gold+=20;
  const char *insights[5]={"Ariel restores a bond between the voice and the living coast.","Samael judges the prison, not the prisoner.","Raphael heals the wound that made captivity seem inevitable.","Jophiel restores a name erased from the world's song.","Lilith offers freedom without demanding allegiance."};char text[256];snprintf(text,sizeof(text),"%s %s Forty experience and twenty gold.",action==9?"The Listener is released.":"A ward protects the Listener while its memory heals.",insights[monad]);quest_reward_note(text,oldLevel);return 0;
 }
 if(!player_isAlive())return 0;
 int acted=0;if(action>=1&&action<=4){memset(&input,0,sizeof(input));input.up=action==1;input.down=action==2;input.left=action==3;input.right=action==4;acted=playerDungeon_step(action);memset(&input,0,sizeof(input));if(acted){for(int i=0;i<4;i++)if(vectors[i][0]==player.dx&&vectors[i][1]==player.dy)facing=i;}}
 else if(action==8){int target=front_enemy(quest_strike_range());if(target<0){quest_note("No horror is in reach straight ahead. Turn toward it before striking.");return 0;}int damage=quest_strike_damage();quest_focus=quest_veil=0;harm(target,damage);player_consumeDungeonFood();acted=1;}
 else if(action==12){acted=power(monad);}
 else if(action==5){player_waitPenalty();quest_note("You wait; the horrors act.");acted=1;}
 if(acted){enemies_turn();if(player.food<0)player.food=0;}return acted;
}
/* Numeric payload: exact parser, bounded coordinates/health, no dead enemy resurrection. */
static void save_dungeon(char *out,size_t size,const Dungeon *d){snprintf(out,size,"%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d",d->V,d->C,d->O,d->F,d->E[0][0],d->E[0][1],d->E[0][2],d->E[1][0],d->E[1][1],d->E[1][2],d->E[2][0],d->E[2][1],d->E[2][2]);}
const char *sanctuary_save(void){static char out[200];save_dungeon(out,sizeof(out),&first);return out;}
static int parse(const char *s,int *v){
 if(!s||strlen(s)>150)return 0;
 for(int i=0;i<13;i++){char *end;errno=0;if(*s<'0'||*s>'9')return 0;long n=strtol(s,&end,10);if(errno||n<0||n>INT_MAX||end==s)return 0;v[i]=(int)n;if(i==12)return *end==0;if(*end!=',')return 0;s=end+1;}return 0;
}
static int valid_dungeon(const Dungeon *d,const int *v,int x,int y,int second){if(v[0]>1||v[1]>1||v[2]>2||v[3]>3)return 0;if(!v[0]&&(v[1]||v[2]))return 0;for(int i=0;i<3;i++){int k=4+i*3;if(!floor_in(d,v[k],v[k+1])||v[k+2]>(second?24+i*4:starts[i][2]))return 0;if(v[k+2]){if(x==v[k]&&y==v[k+1])return 0;for(int j=0;j<i;j++)if(v[4+j*3+2]&&v[k]==v[4+j*3]&&v[k+1]==v[5+j*3])return 0;}}return x<0?1:floor_in(d,x,y)&&v[0];}
int sanctuary_valid(const char *s,int x,int y){int v[13];return parse(s,v)&&valid_dungeon(&first,v,x,y,0);}
static void restore_dungeon(Dungeon *d,const int *v){d->V=v[0];d->C=v[1];d->O=v[2];d->F=v[3];for(int i=0;i<3;i++)memcpy(d->E[i],v+4+i*3,3*sizeof(int));}
void sanctuary_restore(const char *s){int v[13];if(!parse(s,v))return;restore_dungeon(&first,v);sanctuary_outcome=first.O;map_sync();}
EMSCRIPTEN_KEEPALIVE const char *quest_dungeon(void){return sanctuary_save();}
const char *chapter_save(void){static char out[240],d[180];save_dungeon(d,sizeof(d),&archive);snprintf(out,sizeof(out),"%d,%d,%d,%d,%s",archiveSeed,vesper_stage,vesper_testimony,vesper_intent,d);return out;}
static int chapter_parse(const char *s,int *v,const char **d){if(!s||strlen(s)>220)return 0;for(int i=0;i<4;i++){char *end;errno=0;if(*s<'0'||*s>'9')return 0;long n=strtol(s,&end,10);if(errno||n>INT_MAX||end==s||*end!=',')return 0;v[i]=(int)n;s=end+1;}*d=s;return parse(s,v+4);}
int chapter_valid(const char *s,int location,int x,int y){int v[17];const char *payload;if(!chapter_parse(s,v,&payload)||v[0]<1||v[1]>4||v[2]>3||v[3]>2)return 0;if((v[1]==0&&(v[2]||v[3]))||(v[1]==1&&(v[2]==3||v[3]))||(v[1]>=2&&v[2]!=3)||(v[1]<3&&v[3])||(v[1]>=3&&!v[3])||(v[4]&&v[1]<3)||(v[6]&&v[1]<3)||(v[1]==4&&!v[6]))return 0;Dungeon d;generate(&d,v[0]);return valid_dungeon(&d,v+4,location==4?x:-1,location==4?y:-1,1);}
void chapter_restore(const char *s){int v[17];const char *payload;if(!chapter_parse(s,v,&payload))return;archiveSeed=v[0];generate(&archive,archiveSeed);vesper_stage=v[1];vesper_testimony=v[2];vesper_intent=v[3];restore_dungeon(&archive,v+4);vesper_outcome=archive.O;map_sync();}
const char *chapter_default(void){static char out[240],data[180];Dungeon d;generate(&d,1);save_dungeon(data,sizeof(data),&d);snprintf(out,sizeof(out),"1,0,0,0,%s",data);return out;}
EMSCRIPTEN_KEEPALIVE const char *quest_chapter(void){return chapter_save();}
EMSCRIPTEN_KEEPALIVE const char *quest_chapter_default(void){return chapter_default();}
EMSCRIPTEN_KEEPALIVE void quest_set_seed(int seed){archive_seed(seed);trail_seed(seed);}
/* Read-only surveyed native plan for the browser's accessible legend and tests. */
EMSCRIPTEN_KEEPALIVE const char *quest_active_dungeon(void){static char out[180];save_dungeon(out,sizeof(out),current());return out;}
EMSCRIPTEN_KEEPALIVE const char *quest_archive_map(void){static char out[122];for(int y=0;y<11;y++)memcpy(out+y*11,archive.cells[y],11);out[121]=0;return out;}
EMSCRIPTEN_KEEPALIVE const char *quest_archive_cache(void){static char out[20];snprintf(out,sizeof(out),"%d,%d",archive.CX,archive.CY);return out;}
