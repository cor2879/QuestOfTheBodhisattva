/* Original Lantern Coast pixel art; source atlas is editable independently of rules. */
#ifndef QUEST_ART_H
#define QUEST_ART_H
#define QUEST_ART_SCALE 2
#define QUEST_ART_WIDTH 28
#define QUEST_ART_HEIGHT 32
void quest_art_copy(unsigned char *destination,int stride,int column,int tile);
unsigned int quest_art_pixel(int interior,int tile,int x,int y);
void quest_interior_copy(unsigned char *destination,int stride,int column,int tile);
void quest_dungeon_background(void);
void quest_dungeon_walls(int distance,int front,int left,int right);
void quest_dungeon_objects(void);
#endif
