#ifndef QUEST_ENGINES_H
#define QUEST_ENGINES_H
void quests_reset(int seed);
void quests_render(float *view);
int quests_interact(void);
const char *quests_dialogue(int resident,int monad);
int quests_option(int resident,int choice,int monad);
const char *quests_sable_options(void);
const char *quests_sable_text(void);
int quests_valid(const char *data,int listener,int monad);
void quests_restore(const char *data);
#endif
