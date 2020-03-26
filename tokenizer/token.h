
#pragma once
#include <stdbool.h>

#include "tokenTypes.h"

// ---------------------------------------------------------------------------
// need forward def for mutual recursion between Token and Location

struct Token;

// ---------------------------------------------------------------------------

typedef struct {
  int lineNum, colNum;
  char* path;
  char* lineChars; // points to char at start of token line
  // token that loc goes with
  // (may be NULL, used for displaying compiler output)
  struct Token* token;
} Location;

// ---------------------------------------------------------------------------

Location
makeLoc(int lineNum, int colNum, char* path, char* chars);

// ---------------------------------------------------------------------------

struct Token {
  TokenType tokType;
  int length;         // number of chars covered by token
  char* chars;        // points to first token character
  Location loc;
  struct Token* next; // for token linked list
};

typedef struct Token Token;

// ---------------------------------------------------------------------------

Token*
makeToken(int length, TokenType tokType, char* chars, Location loc);

// ---------------------------------------------------------------------------

void
printTokString(Token* token);

// ---------------------------------------------------------------------------
// print a token, showing its location, type, and contents

// example:
//   1:1  [ Newline      ] 

void
printToken(Token* token);

// ---------------------------------------------------------------------------
// get string representation for tokenType

char*
getTokTypeStr(TokenType tokType);
