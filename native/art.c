#include "art.h"
#include "art-pixels.h"
#include "interior-pixels.h"
unsigned int quest_art_pixel(int interior,int tile,int x,int y){
 if(tile<0||tile>=16||x<0||x>=28||y<0||y>=32)return 0;
 return (interior?interior_pixels:art_pixels)[((tile/4)*32+y)*112+(tile%4)*28+x];
}
void quest_art_copy(unsigned char *destination,int stride,int column,int tile){
 for(int y=0;y<QUEST_ART_HEIGHT;y++)for(int x=0;x<QUEST_ART_WIDTH;x++){
  unsigned int color=art_pixels[((tile/4)*QUEST_ART_HEIGHT+y)*112+(tile%4)*QUEST_ART_WIDTH+x];
  unsigned char *p=destination+(y*stride+column*QUEST_ART_WIDTH+x)*4;
  p[0]=color>>24;p[1]=color>>16;p[2]=color>>8;p[3]=color;
 }
}

void quest_interior_copy(unsigned char *destination,int stride,int column,int tile){
 for(int y=0;y<32;y++)for(int x=0;x<28;x++){
  unsigned int color=quest_art_pixel(1,tile,x,y);unsigned char *p=destination+(y*stride+column*28+x)*4;
  p[0]=color>>24;p[1]=color>>16;p[2]=color>>8;p[3]=color;
 }
}
