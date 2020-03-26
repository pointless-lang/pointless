
#include <stdio.h>
#include <assert.h>

#include "token.h"
#include "../files/files.h"

// ---------------------------------------------------------------------------

Location
makeLoc(int lineNum, int colNum, char* path, char* chars) {
  return (Location){
    lineNum, // lineNum 
    colNum,  // colNum 
    path,    // path 
    chars,   // lineChars 
    NULL,    // token 
  };
}

// ---------------------------------------------------------------------------

Token*
makeToken(int length, TokenType tokType, char* chars, Location loc) {
  Token* token = alloc(sizeof(Token));
  // init next pointer to null
  *token = (Token){tokType, length, chars, loc, NULL};
  // make sure to update token->loc, not loc
  token->loc.token = token;
  return token;
}

// ---------------------------------------------------------------------------

void
printTokString(Token* token) {
  printf("%.*s", token->length, token->chars);
}

// ---------------------------------------------------------------------------

void
printToken(Token* token) {
  printf("%3d:", token->loc.lineNum);
  printf("%-2d", token->loc.colNum);

  printf(" [ %-12s ] ", getTokTypeStr(token->tokType));
  if (token->tokType != Tok_Newline) {
    // suppress newline display to neaten output
    printTokString(token);
  }
  printf("\n");
}

// ---------------------------------------------------------------------------

char*
getTokTypeStr(TokenType tokType) {
  switch (tokType) {
    #include "tokenStrings.h"
  }

  assert(false);
}
