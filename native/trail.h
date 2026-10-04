#ifndef QUEST_TRAIL_H
#define QUEST_TRAIL_H
extern int trail_enemy;
void trail_init(void);
void trail_reset(void);
void trail_seed(int seed);
void trail_render(float *view);
void trail_after_step(void);
int trail_solid(int x,int y);
int trail_contact(int x,int y);
int trail_action(int action,int monad);
void trail_rescue(void);
int trail_interact(void);
const char *trail_dialogue(int resident,int monad);
int trail_option(int resident,int choice,int monad);
int trail_valid(const char *data,int location,int x,int y,int listener);
void trail_restore(const char *data);
const char *trail_default(void);
#endif
