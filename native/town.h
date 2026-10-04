#ifndef QUEST_TOWN_H
#define QUEST_TOWN_H
void haven_init(void);
void haven_enter(void);
void haven_render(void);
int haven_interact(void);
int haven_valid_position(int x,int y);
extern int quest_location,quest_stage,quest_clue,quest_blessing,quest_supplies,quest_resolution,quest_tonics;
extern int quest_conversation;
void quest_note(const char *s);
#endif
