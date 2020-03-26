
// separate from lexScope.h to allow ../parser/ASTNode.h to include
// without incurring circular include

#pragma once

#include "../tokenizer/token.h"

// ---------------------------------------------------------------------------

struct LexScope;

struct LexEntry {
  int index;             // position in scope defs list
  int upIndex;           // for non local vars, index in parent
  char* chars;           // string for def name
  int length;            // def name length
  struct LexEntry* next; // pointer for linked list of entries
  Location* loc;         // used for printing lex scope debugging output
};

typedef struct LexEntry LexEntry;

// ---------------------------------------------------------------------------

struct LexScope {
  struct LexScope* global; // used for handling global vals
  struct LexScope* parent; // used for handling upvals
  int numLocals;
  int numNonLocals;
  // all local entries must come before non-local entries
  LexEntry* entries;
  LexEntry* last; // use to prepend entries to list
};

typedef struct LexScope LexScope;
