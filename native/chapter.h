#ifndef QUEST_CHAPTER_H
#define QUEST_CHAPTER_H
extern int vesper_stage,vesper_testimony,vesper_intent;
void chapter_reset(void);
const char *vesper_dialogue(int resident);
int vesper_option(int resident,int choice);
#endif
