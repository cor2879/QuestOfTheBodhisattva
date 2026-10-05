/* Original Lantern Coast pixel art; source atlas is editable independently of rules. */
#ifndef QUEST_ART_H
#define QUEST_ART_H
#define QUEST_ART_SCALE 2
#define QUEST_ART_WIDTH 28
#define QUEST_ART_HEIGHT 32
void quest_art_copy(unsigned char *destination,int stride,int column,int tile);
#endif
