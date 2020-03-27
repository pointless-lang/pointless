
# development: make -j12 dev

CC     = gcc
CFLAGS = -I. -Wall -Wextra -O0 -std=gnu11 -g -Wstrict-prototypes

SRC = $(wildcard tokenizer/*.c) \
	$(wildcard parser/*.c) \
	$(wildcard compiler/*.c) \
	$(wildcard vm/*.c) \
	$(wildcard files/*.c) \
	$(wildcard error/*.c) \

DEPS      = makefile
VM        = vm/*
COMPILER  = compiler/*
PARSER    = parser/*
TOKENIZER = tokenizer/*
ERROR     = error/*
FILES     = files/*

.PHONY: all
all:
	$(MAKE) clean
	$(MAKE) dev
	$(MAKE) test

.PHONY: dev
dev: debug/tokenize \
	debug/highlight \
	debug/parse \
	debug/annotate \
	debug/compile \
	debug/run

.PHONY: opt
opt: CFLAGS += -O3
opt: pointless

.PHONY: clean
clean:
	rm bin/*.o

.PHONY: test
test: SHELL:=/bin/bash
test:
	-tests/runTests.sh --test debug/tokenize tests/tokenizer/*.test
	-tests/runTests.sh --test debug/parse tests/parser/*.test
	-tests/runTests.sh --test debug/annotate tests/annotator/*.test
	-tests/runTests.sh --test debug/compile tests/compiler/*.test
	-tests/runTests.sh --test debug/run tests/vm/*.test

bin/files.o: files/files.c $(FILES) $(PARSER) $(TOKENIZER) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/error.o: error/error.c $(ERROR) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/token.o: tokenizer/*.c $(TOKENIZER) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/tokenizer.o: tokenizer/tokenizer.c $(TOKENIZER) $(ERROR) $(FILES) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/ASTNode.o: parser/ASTNode.c $(PARSER) $(TOKENIZER) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/convertNum.o: parser/convertNum.c $(PARSER) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/showNode.o: parser/showNode.c $(PARSER) $(TOKENIZER) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/parserFuncs.o: parser/parserFuncs.c $(PARSER) $(TOKENIZER) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/parser.o: parser/parser.c $(PARSER) $(TOKENIZER) $(ERROR) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/lexScope.o: compiler/lexScope.c $(COMPILER) $(PARSER) $(ERROR) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/annotate.o: compiler/annotate.c $(COMPILER) $(PARSER) $(ERROR) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/text.o: compiler/text.c $(PARSER) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/showInstructions.o: compiler/showInstructions.c $(COMPILER) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/compiler.o: compiler/compiler.c $(COMPILER) $(PARSER) $(TOKENIZER) $(ERROR) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

bin/map.o: vm/map.c
	$(CC) -c $< -o $@ $(CFLAGS)

bin/vm.o: vm/vm.c $(VM) $(COMPILER) $(PARSER) $(ERROR) $(DEPS)
	$(CC) -c $< -o $@ $(CFLAGS)

OBJS = $(addprefix bin/,$(notdir $(SRC:.c=.o)))

pointless: pointless.c $(OBJS)
	$(CC) -o $@ $< $(OBJS) $(CFLAGS) -lm

debug/run: debug/run.c pointless
	$(CC) -o $@ $< $(OBJS) $(CFLAGS) -lm

debug/compile: debug/compile.c pointless
	$(CC) -o $@ $< $(OBJS) $(CFLAGS) -lm

debug/annotate: debug/annotate.c pointless
	$(CC) -o $@ $< $(OBJS) $(CFLAGS) -lm

debug/parse: debug/parse.c pointless
	$(CC) -o $@ $< $(OBJS) $(CFLAGS) -lm

debug/highlight: debug/highlight.c pointless
	$(CC) -o $@ $< $(OBJS) $(CFLAGS) -lm

debug/tokenize: debug/tokenize.c pointless
	$(CC) -o $@ $< $(OBJS) $(CFLAGS) -lm
