
#include <assert.h>
#include <string.h>

#include "text.h"

// ---------------------------------------------------------------------------
// maximum number of characters for all strings and variable / field
// names in program source

#define maxChars 100000

char text[maxChars] = "Empty";
int64_t textInd = 6;

// ---------------------------------------------------------------------------

char*
getText(int index) {
  assert(index < textInd);
  return &text[index];
}

// ---------------------------------------------------------------------------
// store chars at next unused index in text array

int64_t
saveChars(char* chars, int length) {
  int64_t result = textInd; // result is first index of chars

  // make sure there's room for new chars (pre-escape)
  // extra one for null terminator
  assert(textInd + length + 1 < maxChars);
  for (int index = 0; index < length; index++) {
    if (index == length - 1) {
      text[textInd++] = chars[index];

    } else if (chars[index] == '\\' && chars[index + 1] == '\\') {
      text[textInd++] = chars[index];
      text[textInd++] = chars[index];

    } else if (chars[index] == '\\') {
      index++;
      switch (chars[index]) {
        // https://stackoverflow.com/a/7369771
        case 'a':  text[textInd++] = '\a'; break;
        case 'b':  text[textInd++] = '\b'; break;
        case 'f':  text[textInd++] = '\f'; break;
        case 'n':  text[textInd++] = '\n'; break;
        case 'r':  text[textInd++] = '\r'; break;
        case 't':  text[textInd++] = '\t'; break;
        case 'v':  text[textInd++] = '\v'; break;
        case '\\': text[textInd++] = '\\'; break;
        case '\'': text[textInd++] = '\''; break;
        case '"':  text[textInd++] = '\"'; break;
        case '?':  text[textInd++] = '\?'; break;
        assert(false);
      }

    } else {
      text[textInd++] = chars[index];
    }
  }
  text[textInd++] = '\0';

  return result;
}

// ---------------------------------------------------------------------------
// check whether text already contains full string before adding new chars
// (can't use substrings of larger strings since we need null terminator)

int64_t
internChars(char* newChars, int length) {
  int index = 0;
  while (index < textInd) {
    bool sameLength = length == (int)strlen(getText(index));
    if (sameLength && strncmp(getText(index), newChars, length) == 0) {
      return index;
    }
    index += strlen(getText(index)) + 1; // plus 1 to pass null terminator
  }
  return saveChars(newChars, length);
}

// ---------------------------------------------------------------------------

int64_t
internStr(ASTNode* node) {
  char* chars = (char*)node->children[0];
  int length = node->children[1];
  return internChars(chars, length);
}

// ---------------------------------------------------------------------------

int64_t
strLiteralIndex(char* chars) {
  return internChars(chars, strlen(chars));
}
