
#pragma once

#include "token.h"
#include "../files/files.h"

// ---------------------------------------------------------------------------

typedef struct {
  int index;             // current position in chars
  int length;            // number of chars
  int tokIndex;          // start position of current token
  Location loc, tokLoc;  // current loc and start loc of current token
  char* chars;
} Tokenizer;

// ---------------------------------------------------------------------------
// get tokens from chars, store in tokens array

void
tokenize(FileStruct* fileStruct);

// ---------------------------------------------------------------------------
// print a list of tokens with their locations

// 1:1  [ Newline      ] 
// 2:1  [ Name         ] output
// 2:7  [ Whitespace   ]  
// 2:8  [ Assign       ] =
// 2:9  [ Newline      ] 
// ...

void
showTokens(Token* token);
