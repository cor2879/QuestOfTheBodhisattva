/* Original textured presentation layered into Open Sosaria's perspective renderer.
   The native dungeon map/tables determine visibility; this file changes no rules. */
#include <stdlib.h>
#include "art.h"
#include "town.h"
#include "dungeon.h"
#include "data/player.h"
#include "data/bevery.h"
#include "scenes/sceneDungeon.h"
#include "entities/dungeonRenderer.h"
static int solid(int tile){return tile==1||tile==3||tile==4;}
static void shade(int x,int y,unsigned int color,int light){
 if(!(color&255))return;
 int r=(color>>24)*light/100,g=((color>>16)&255)*light/100,b=((color>>8)&255)*light/100;
 if(quest_location==4){r=r*9/10;b=b+8>255?255:b+8;}
 dungeonRenderer_setPixel(x,y,r,g,b);
}
void quest_dungeon_background(void){
 for(int y=0;y<192;y++)for(int x=0;x<280;x++){
  if(y>=160){dungeonRenderer_setPixel(x,y,13,19,30);continue;}
  int offset=abs(y-79)+1,depth=1600/offset;
  int u=((x-140)*depth/40+player.px*28)%28,v=(depth+player.py*32)%32;if(u<0)u+=28;if(v<0)v+=32;
  shade(x,y,quest_art_pixel(1,7,u,v),y<79?18+offset/4:20+offset);
 }
}
static void panel(int xa,int xb,int ta,int tb,int ba,int bb,int light){
 int left=xa<xb?xa:xb,right=xa>xb?xa:xb;
 for(int x=left;x<=right;x++){
  float t=xa==xb?0:(float)(x-xa)/(xb-xa);int top=ta+(int)((tb-ta)*t),bottom=ba+(int)((bb-ba)*t),u=(int)(t*27);
  for(int y=top;y<=bottom;y++){int v=(y-top)*31/(bottom-top?bottom-top:1);shade(x,y,quest_art_pixel(1,6,u,v),light);}
 }
}
void quest_dungeon_walls(int d,int front,int left,int right){
 int *a=dungeonTable[d],*b=dungeonTable[d+1],light=100/(1+d/2);
 if(d>0&&solid(front)){
  for(int y=a[2];y<=a[3];y++)for(int x=a[0];x<=a[1];x++)shade(x,y,quest_art_pixel(1,6,(x-a[0])*27/(a[1]-a[0]),(y-a[2])*31/(a[3]-a[2])),light);
  return;
 }
 if(solid(left))panel(a[0],b[0],a[2],b[2],a[3],b[3],light*9/10);
 if(solid(right))panel(a[1],b[1],a[2],b[2],a[3],b[3],light*3/4);
}
static int tile_at(int x,int y){return x<0||x>=11||y<0||y>=11?1:dungeonMap[x][y];}
static void sprite(int interior,int tile,int d,int height,int glow){
 int h=height/(d+1),w=h*28/32,bottom=dungeonTable[d][3]-1,top=bottom-h,left=140-w/2;
 for(int y=0;y<h;y++)for(int x=0;x<w;x++)shade(left+x,top+y,quest_art_pixel(interior,tile,x*28/w,y*32/h),glow?100:100-d*5);
}
void quest_dungeon_objects(void){
 int far=0;
 for(int d=0;d<10;d++){int tile=tile_at(player.px+player.dx*d,player.py+player.dy*d);if(solid(tile%100))break;far=d;}
 for(int d=far;d>=0;d--){
  int x=player.px+player.dx*d,y=player.py+player.dy*d,tile=tile_at(x,y);
  if(tile/100>=1&&tile/100<=3)sprite(0,11+tile/100,d,144,1);
  if(tile%100==5)sprite(1,14,d,80,0);
  if(tile%100==8){
   if(d>0)sprite(0,6,d,82,1);
   else for(int step=0;step<6;step++)for(int y=0;y<4;y++)for(int x=120-step*3;x<160+step*3;x++)dungeonRenderer_setPixel(x,130+step*4+y,y==0?205:70,y==0?173:65,y==0?103:58);
  }
  if(x==9&&y==1)sprite(1,15,d,112,1);
 }
}
