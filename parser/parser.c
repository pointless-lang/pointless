
#include <assert.h>

#include "parser.h"
#include "parserFuncs.h"

#include "../error/error.h"

// ---------------------------------------------------------------------------

Parser
newParser(FileStruct* file) {
  return (Parser) {file->tokens};
}

// ---------------------------------------------------------------------------

void
parse(FileStruct* file) {
  tokenize(file);
  if (file->node) {
    return;
  }
  
  Parser parser = newParser(file);
  file->node = getProgram(&parser);
}

// ---------------------------------------------------------------------------

bool
hasTokens(Parser* parser) {
  return parser->head;
}

// ---------------------------------------------------------------------------

void
advanceParser(Parser* parser) {
  assert(hasTokens(parser));
  parser->head = parser->head->next;
}

// ---------------------------------------------------------------------------

TokenType
currentType(Parser* parser) {
  return parser->head->tokType;
}

// ---------------------------------------------------------------------------
// check whether tokType is in set of testTypes (testTypes must be terminated
// by Tok_NULL)

bool
matchesType(TokenType tokType, TokenType* testTypes) {
  while (*testTypes != Tok_NULL) {
    if (tokType == *testTypes) {
      return true;
    }
    testTypes++;
  }
  return false;
}

// ---------------------------------------------------------------------------

void
wrongToken(TokenType* expected, char* got, Location loc) {
  errorHeader("Parser Error");
  fprintf(stderr, "Expected '");

  // print expected tokens joined by ' or '
  while (*expected != Tok_NULL) {
    fprintf(stderr, "%s", getTokTypeStr(*expected));
    expected++;
    
    if (*expected != Tok_NULL) {
      fprintf(stderr, " or ");
    }
  }

  fprintf(stderr, "', got '%s'", got);
  pushLocError(loc);
  throwError();
}

// ---------------------------------------------------------------------------

TokenType defSkip[] = tokSetDef(Tok_Newline, Tok_Whitespace, Tok_Comment);

// ---------------------------------------------------------------------------

bool
isNext(Parser* parser, TokenType* testTypes, TokenType* skipTypes) {
  Token* oldHead = parser->head;

  while (hasTokens(parser)) {
    TokenType tokType = currentType(parser);
    advanceParser(parser);

    if (matchesType(tokType, testTypes)) {
      // restore original index
      parser->head = oldHead;
      return true;
    }

    if (!matchesType(tokType, skipTypes)) {
      // restore original index
      parser->head = oldHead;
      return false;
    }
  }

  // restore original index
  parser->head = oldHead;
  return false;
}

// ---------------------------------------------------------------------------

bool
isNextMulti(Parser* parser, TokenType* tokTypes, TokenType skipTypes[]) {
  Token* oldHead = parser->head;

  while (hasTokens(parser)) {
    TokenType tokType = currentType(parser);
    advanceParser(parser);

    if (tokTypes[0] == Tok_NULL) {
      // restore original index
      parser->head = oldHead;
      return true;
    }

    if (tokType == tokTypes[0]) {
      // increment to point to next token type
      tokTypes++;
    }

    else if (!matchesType(tokType, skipTypes)) {
      // restore original index
      parser->head = oldHead;
      return false;
    }
  }

  // restore original index
  parser->head = oldHead;
  return false;
}

// ---------------------------------------------------------------------------

Token*
getNext(Parser* parser, TokenType* testTypes, TokenType* skipTypes) {
  while (true) {
    assert(hasTokens(parser));
    Token* token = parser->head;
    TokenType tokType = token->tokType;

    if (matchesType(tokType, testTypes)) {
      break;
    }
    
    if (!matchesType(tokType, skipTypes)) {
      // throw error showing which types we expected
      wrongToken(testTypes, getTokTypeStr(tokType), token->loc);
    }

    advanceParser(parser);
  }

  Token* result = parser->head;
  advanceParser(parser);
  return result;
}

// ---------------------------------------------------------------------------

Token*
peek(Parser* parser, TokenType* testTypes, TokenType* skipTypes) {
  Token* oldHead = parser->head;
  Token* token = getNext(parser, testTypes, skipTypes);
  // restore original index
  parser->head = oldHead;
  return token;
}

// ---------------------------------------------------------------------------

ASTNode*
getSeq(Parser* parser, TokenType start, TokenType end, TokenType sep,
       NodeHandler handler, Location* loc, bool allowTrailingSep) {

  Token* startTok = getNext(parser, tokSet(start), defSkip);

  // set loc to location of start token
  if (loc) {
    *loc = startTok->loc;
  }

  // handle empty sequence
  if (isNext(parser, tokSet(end), defSkip)) {
    getNext(parser, tokSet(end), defSkip);
    return NULL;
  }

  ASTNode* elems = handler(parser);

  while (!isNext(parser, tokSet(end), defSkip)) {  
    getNext(parser, tokSet(sep), defSkip);

    if (allowTrailingSep && isNext(parser, tokSet(end), defSkip)) {
      break;                                                        
    }

    elems = linkNodes(elems, handler(parser));
  }                                                            
                 
  getNext(parser, tokSet(end), defSkip);
  return elems;        
}
