
#pragma once
#include <stdbool.h>

#include "ASTNode.h"

#include "../tokenizer/token.h"
#include "../files/files.h"

// ---------------------------------------------------------------------------

typedef struct {
  Token* head;
} Parser;

// ---------------------------------------------------------------------------
// generic parser function type

typedef ASTNode* (*NodeHandler)(Parser* parser);

// ---------------------------------------------------------------------------
// make Tok_NULL terminated token type list, as argument (tokSet), or as
// definition (tokSetDef), used with isNext, getNext, peek, isNextMulti

#define tokSetDef(...) {__VA_ARGS__, Tok_NULL}
#define tokSet(...) ((TokenType[])tokSetDef(__VA_ARGS__))

// ---------------------------------------------------------------------------
// parse file, set root node in file struct

void
parse(FileStruct* file);

// ---------------------------------------------------------------------------
// get type of current token

TokenType
currentType(Parser* parser);

// ---------------------------------------------------------------------------
// check if next token has type in testTypes (ignoring leading tokens with
// type in skipTypes)

bool
isNext(Parser* parser, TokenType* testTypes, TokenType* skipTypes);

// ---------------------------------------------------------------------------
// check the n_th next token has the n_th type in tokTypes, ignoring skips

bool
isNextMulti(Parser* parser, TokenType* tokTypes, TokenType skipTypes[]);

// ---------------------------------------------------------------------------
// advance parser and get matching token (throw error if next non-skip
// token has wrong type)

Token*
getNext(Parser* parser, TokenType* testTypes, TokenType* skipTypes);

// ---------------------------------------------------------------------------
// return matching token without advancing parser

Token*
peek(Parser* parser, TokenType* testTypes, TokenType* skipTypes);

// ---------------------------------------------------------------------------
// get a sequence of elements, where elements are parsed by function handler
// starts with start token, ends with end, separated by sep
// set loc to location of start token, allow / disallow trailing separator

ASTNode*
getSeq(Parser* parser, TokenType start, TokenType end, TokenType sep,
       NodeHandler handler, Location* loc, bool allowTrailingSep);

// ---------------------------------------------------------------------------
// skip newlines, whitespace, and comments by default
// defined in parser.c

extern TokenType defSkip[];
