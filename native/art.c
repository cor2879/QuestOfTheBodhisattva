#include "art.h"
#include "art-pixels.h"
void quest_art_copy(unsigned char *destination,int stride,int column,int tile){
 for(int y=0;y<QUEST_ART_HEIGHT;y++)for(int x=0;x<QUEST_ART_WIDTH;x++){
  unsigned int color=art_pixels[((tile/4)*QUEST_ART_HEIGHT+y)*112+(tile%4)*QUEST_ART_WIDTH+x];
  unsigned char *p=destination+(y*stride+column*QUEST_ART_WIDTH+x)*4;
  p[0]=color>>24;p[1]=color>>16;p[2]=color>>8;p[3]=color;
 }
}
