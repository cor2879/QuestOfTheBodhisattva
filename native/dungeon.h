#ifndef QUEST_DUNGEON_H
#define QUEST_DUNGEON_H
void sanctuary_init(void);
void sanctuary_reset(void);
void sanctuary_enter(void);
void sanctuary_leave(void);
void sanctuary_render(void);
int sanctuary_action(int action,int monad);
int sanctuary_valid(const char *data,int x,int y);
void sanctuary_restore(const char *data);
const char *sanctuary_save(void);
int sanctuary_solid(int x,int y);
extern int sanctuary_outcome;
#endif
