#ifndef QUEST_PROGRESSION_H
#define QUEST_PROGRESSION_H
extern int quest_light,quest_owned,quest_ward,quest_veil,quest_focus,quest_stun[3];
int quest_level_for(int xp);
int quest_level(void);
int quest_light_max(void);
int quest_strike_damage(void);
int quest_strike_range(void);
void quest_progress_reset(void);
void quest_clear_effects(void);
void quest_recharge(void);
void quest_gain_xp(int xp);
void quest_reward_note(const char *text,int oldLevel);
int quest_buy_gear(int choice);
int quest_progress_valid(const char *data,int xp,int location);
void quest_progress_restore(const char *data);
const char *quest_progress_save(void);
#endif
