
#include <stdbool.h>
#include <string.h>
#include <ctype.h>
#include <assert.h>
#include <stdio.h>

#include "tokenizer.h"
#include "symbols.h"

#include "../error/error.h"
#include "../files/files.h"

// ---------------------------------------------------------------------------
// create a list of tokens from an input string

Tokenizer
newTokenizer(FileStruct* file) {
  // makeLoc(lineNum, colNum, filePath, chars)
  // initial tokenizer location (lines and cols are 1-indexed)
  Location loc = makeLoc(1, 1, file->path, file->chars);
  // (Tokenizer){index, length, tokIndex, loc, tokLoc, chars}
  return (Tokenizer){0, file->length, 0, loc, loc, file->chars};
}

// ---------------------------------------------------------------------------
// get pointer to current char in input string

char*
getSourceChars(Tokenizer* tok) {
  return &tok->chars[tok->index];
}

// ---------------------------------------------------------------------------
// get pointer to starting char for current token

char*
getTokenChars(Tokenizer* tok) {
  return &tok->chars[tok->tokIndex];
}

// ---------------------------------------------------------------------------
// update tokenizer location (line and column number)

void
tokAdvanceLoc(Tokenizer* tok) {
  if (getSourceChars(tok)[0] == '\n') {
    // next line starts after newline char
    tok->loc.lineChars = getSourceChars(tok) + 1;
    tok->loc.lineNum++;
    tok->loc.colNum = 1;
  } else {
    tok->loc.colNum++;
  }
}

// ---------------------------------------------------------------------------
// advance a character in the input string

void
tokAdvance(Tokenizer* tok) {
  assert(tok->index < tok->length);
  tokAdvanceLoc(tok);
  tok->index++;
}

// ---------------------------------------------------------------------------
// make a new token at current index and length

Token*
newToken(Tokenizer* tok, TokenType tokType) {
  int length = tok->index - tok->tokIndex;

  char* chars = getTokenChars(tok);
  Token* token = makeToken(length, tokType, chars, tok->tokLoc);

  // store current index and loc for next token
  tok->tokIndex = tok->index;
  tok->tokLoc = tok->loc;
  return token;
}

// ---------------------------------------------------------------------------
// check whether next character matches some symbol set

bool
hasSymbol(Pair* pairs, char* sourceChars) {
  for (Pair* p = pairs; p->tokType != Tok_NULL; p++) {
    // only check first character
    if (strncmp(p->sym, sourceChars, 1) == 0) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// get the token type of next token in symbol set

TokenType
getTokenType(Pair* pairs, Tokenizer* tok) {
  for (Pair* p = pairs; p->tokType != Tok_NULL; p++) {
    
    int length = tok->index - tok->tokIndex;
    bool sameLength = length == (int)strlen(p->sym);
    char* tokChars = getTokenChars(tok);

    if (sameLength && strncmp(p->sym, tokChars, length) == 0) {
      return p->tokType;
    }
  }
  return Tok_NULL;
}

// ---------------------------------------------------------------------------
// check if token type is in type set

bool
matchTokenType(Pair* pairs, TokenType tokType) {
  // symbol tables are terminated by pair with Tok_NULL token type
  for (Pair* p = pairs; p->tokType != Tok_NULL; p++) {
    if (p->tokType == tokType) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// get token type of upcoming token

bool
isBlank(char* chars) {
  return chars[0] == '_';
}

bool
isComment(char* chars) {
  return strncmp("--", chars, 2) == 0;
}
              
bool
isNumber(char* chars) {
  bool isInt = isdigit(chars[0]); 
  bool isFloat = chars[0] == '.' && isdigit(chars[1]);
  return isInt || isFloat;
}

bool
isName(char* chars) {
  return islower(chars[0]);
}

bool
isLabel(char* chars) {
  return isupper(chars[0]);
}

bool
isField(char* chars) {
  // handleField will throw error for
  // upper case leading char in field name
  bool isCustom = chars[0] == '.' && isalpha(chars[1]);

  // special built in fields
  bool isLangField = chars[0] == '.' && chars[1] == '!';
  return isCustom || isLangField;
}

bool
isOpSym(char* chars) {
  // all the starting symbols for language operators
  return strspn(chars, "/+$>!<*-|=%") > 0;
}

bool
isWhitespace(char* chars) {
  return chars[0] == ' ' || chars[0] == '\t';
}

bool
isNewline(char* chars) {
  return chars[0] == '\n';
}

bool
isSeparator(char* chars) {
  return hasSymbol(separators, chars);
}

bool
isPairSym(char* chars) {
  bool isLeft = hasSymbol(leftSyms, chars);
  bool isRight = hasSymbol(rightSyms, chars);
  return isLeft || isRight;
}

bool
isString(char* chars) {
  return chars[0] == '"';
}

// ---------------------------------------------------------------------------

Token*
handleBlank(Tokenizer* tok) {
  tokAdvance(tok);
  return newToken(tok, Tok_Blank);
}

// ---------------------------------------------------------------------------

Token*
handleComment(Tokenizer* tok) {
  while (getSourceChars(tok)[0] == '-') {
    tokAdvance(tok);
  }

  // take chars until newline
  while (getSourceChars(tok)[0] && getSourceChars(tok)[0] != '\n') {
    tokAdvance(tok);
  }

  return newToken(tok, Tok_Comment);
}

// ---------------------------------------------------------------------------

Token*
handleWhitespace(Tokenizer* tok) {
  // combine repeated spaces into one token
  while (isWhitespace(getSourceChars(tok))) {
    tokAdvance(tok);
  }

  return newToken(tok, Tok_Whitespace);
}

// ---------------------------------------------------------------------------

Token*
handleNewline(Tokenizer* tok) {
  // combine repeated newline into one token
  while (isNewline(getSourceChars(tok))) {
    tokAdvance(tok);
  }

  return newToken(tok, Tok_Newline);
}

// ---------------------------------------------------------------------------

Token*
handleSeparator(Tokenizer* tok) {
  tokAdvance(tok);
  TokenType tokenType = getTokenType(separators, tok);
  return newToken(tok, tokenType);
}

// ---------------------------------------------------------------------------

Token*
handleName(Tokenizer* tok) {
  // following alpha-numeric characters are part of the name
  while (isalnum(getSourceChars(tok)[0])) {
    tokAdvance(tok);
  }

  TokenType kwdType = getTokenType(keywords, tok);
  // check if name is keyword
  if (kwdType != Tok_NULL) {
    return newToken(tok, kwdType);
  }
  return newToken(tok, Tok_Name);
}

// ---------------------------------------------------------------------------

Token*
handleField(Tokenizer* tok) {
  tokAdvance(tok);

  // disallow leading uppercase char
  if (isupper(getSourceChars(tok)[0])) {
    errorHeader("Tokenizer Error");
    fprintf(stderr, "Field name cannot start with uppercase char");
    pushLocError(tok->loc);
    throwError();
  }

  // special built-in fields start with bang
  if (getSourceChars(tok)[0] == '!') {
    tokAdvance(tok);
  }

  while (isalnum(getSourceChars(tok)[0])) {
    tokAdvance(tok);
  }
  return newToken(tok, Tok_Field);
}

// ---------------------------------------------------------------------------

Token*
handleLabel(Tokenizer* tok) {
  // following alpha-numeric characters are part of the label
  while (isalnum(getSourceChars(tok)[0])) {
    tokAdvance(tok);
  }
  return newToken(tok, Tok_Label);
}

// ---------------------------------------------------------------------------

Token*
handleString(Tokenizer* tok) {
  // loop until end of string or break
  while (getSourceChars(tok)[0] != '\0') {
    tokAdvance(tok);
    // break if char is a quote and is not escaped
    if (getSourceChars(tok)[0] == '"' && getSourceChars(tok)[-1] != '\\') {
      break;
    }
    // don't allow line-breaks in string
    // (should give better errors for missing end quote)
    if (getSourceChars(tok)[0] == '\n') {
      errorHeader("Tokenizer Error");
      fprintf(stderr, "Unmatched quote (must escape line breaks in string)");
      pushLocError(tok->tokLoc);
      throwError();
    }
  }

  // throw error if end is reached before finding closing quote
  if (getSourceChars(tok)[0] == '\0') {
    errorHeader("Tokenizer Error");
    fprintf(stderr, "Unmatched opening quote");
    pushLocError(tok->tokLoc);
    throwError();
  }

  tokAdvance(tok);
  return newToken(tok, Tok_String);
}

// ---------------------------------------------------------------------------

Token*
handleNumber(Tokenizer* tok) {
  while (isdigit(getSourceChars(tok)[0])) {
    tokAdvance(tok);
  }
  
  // check for decimal followed by more digits
  if (isNumber(getSourceChars(tok))) {
    tokAdvance(tok);
    while (isdigit(getSourceChars(tok)[0])) {
      tokAdvance(tok);
    }
  }

  return newToken(tok, Tok_Number);
}

// ---------------------------------------------------------------------------

Token*
handleOpSym(Tokenizer* tok) {
  // take chars as long as the next char appears in some operator
  while (isOpSym(getSourceChars(tok))) {
    tokAdvance(tok);
  }

  TokenType opType = getTokenType(opSyms, tok);
  // the string of symbols we got might not be a real operator
  // for example "*+"
  if (opType == Tok_NULL) {
    int length = (tok->index - tok->tokIndex);
    char* tokChars = getTokenChars(tok);

    errorHeader("Tokenizer Error");
    fprintf(stderr, "Invalid operator '%.*s'", length, tokChars);
    pushLocError(tok->tokLoc);
    throwError();
  }

  return newToken(tok, opType);
}

// ---------------------------------------------------------------------------

Token*
handlePairSym(Tokenizer* tok) {
  tokAdvance(tok);

  TokenType leftType = getTokenType(leftSyms, tok);
  TokenType rightType = getTokenType(rightSyms, tok);
  TokenType pairType = leftType != Tok_NULL ? leftType : rightType;

  return newToken(tok, pairType);
}

// ---------------------------------------------------------------------------
// determine the type of the next token, and construct it,
// advancing tokenizer position accordingly

Token*
getToken(Tokenizer* tok) {
  char* sourceChars = getSourceChars(tok);
  
       if (isBlank(sourceChars))      return handleBlank(tok);
  else if (isComment(sourceChars))    return handleComment(tok);
  else if (isWhitespace(sourceChars)) return handleWhitespace(tok);
  else if (isNewline(sourceChars))    return handleNewline(tok);
  else if (isSeparator(sourceChars))  return handleSeparator(tok);
  else if (isName(sourceChars))       return handleName(tok);
  else if (isField(sourceChars))      return handleField(tok);
  else if (isLabel(sourceChars))      return handleLabel(tok);
  else if (isString(sourceChars))     return handleString(tok);
  else if (isNumber(sourceChars))     return handleNumber(tok);
  else if (isOpSym(sourceChars))      return handleOpSym(tok);
  else if (isPairSym(sourceChars))    return handlePairSym(tok);

  errorHeader("Tokenizer Error");
  fprintf(stderr, "Unexpected symbol '%c'", getSourceChars(tok)[0]);
  pushLocError(tok->tokLoc);
  throwError();
}

// ---------------------------------------------------------------------------

void
showTokens(Token* tokens) {
  for (Token* token = tokens; token; token = token->next) {
    printToken(token);
  }
}

// ---------------------------------------------------------------------------
// scan tokens, keeping track of whether '-' corresponds to a negative
// sign or subtraction operator, depending on whether they occur at the start
// of an expression, and update (all '-' are initially parsed as subtraction)

void
convertNegatives(Token* tokens) {
  // assume expression by default (holdover from old REPL code)
  bool isStartExpr = true;

  for (Token* token = tokens; token; token = token->next) {
    TokenType tokType = token->tokType;

    // change subtraction to negative if we're at expression start
    if (tokType == Tok_Sub && isStartExpr) {
      token->tokType = Tok_Neg;
    }

    if ( matchTokenType(opSyms, tokType)
      || matchTokenType(separators, tokType)
      || matchTokenType(leftSyms, tokType)
      || (tokType != Tok_Bool && matchTokenType(keywords, tokType))) {
      
      isStartExpr = true;

    } else if (
      matchTokenType(rightSyms, tokType)
      || tokType == Tok_Bool
      || tokType == Tok_Name
      || tokType == Tok_Field
      || tokType == Tok_String
      || tokType == Tok_Number) {

      isStartExpr = false;
    }
  }
}

// ---------------------------------------------------------------------------

void
tokenize(FileStruct* file) {
  if (file->tokens) {
    return;
  }
  
  Tokenizer tokenizer = newTokenizer(file);

  while (getSourceChars(&tokenizer)[0]) {
    fileAddToken(file, getToken(&tokenizer));
  }

  // all files end with EOF token
  fileAddToken(file, newToken(&tokenizer, Tok_EOF));
  convertNegatives(file->tokens);
}
