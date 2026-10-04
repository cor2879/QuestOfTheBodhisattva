EMCC ?= emcc
SRC = opensosaria/src
ENGINE = $(SRC)/engine/engine.c $(SRC)/engine/input.c $(SRC)/engine/shader.c $(SRC)/engine/texture.c $(SRC)/engine/geometry.c $(SRC)/engine/camera.c $(SRC)/maths/matrix4.c $(SRC)/memory.c
WORLD = $(SRC)/entities/worldMap.c $(SRC)/entities/playerOverworld.c $(SRC)/data/player.c $(SRC)/utils.c $(SRC)/entities/playerTown.c $(SRC)/entities/playerDungeon.c $(SRC)/entities/dungeonRenderer.c
FLAGS = -O2 -std=c99 -Wall -Wextra -Werror -I$(SRC) -DCR_WEB -DCR_ORIGINAL -ffunction-sections -sUSE_GLFW=3 -sMIN_WEBGL_VERSION=2 -sMAX_WEBGL_VERSION=2 -sALLOW_MEMORY_GROWTH=1 -sSTACK_SIZE=2097152 -sEXPORTED_RUNTIME_METHODS='["ccall"]' -sSINGLE_FILE=1
HEADERS = $(wildcard $(SRC)/*.h $(SRC)/engine/*.h $(SRC)/entities/*.h $(SRC)/entities/ui/*.h $(SRC)/scenes/*.h $(SRC)/data/*.h $(SRC)/maths/*.h)
all: web/quest.js
web/quest.js: quest.c town.c town.h dungeon.c dungeon.h progression.c progression.h chapter.c chapter.h trail.c trail.h $(ENGINE) $(WORLD) $(HEADERS) Makefile
	$(EMCC) quest.c town.c dungeon.c progression.c chapter.c trail.c $(ENGINE) $(WORLD) $(FLAGS) -o $@
.PHONY: all
