
#include <assert.h>
#include <string.h>

#include "lexScope.h"

#include "../parser/showNode.h"
#include "../files/files.h"
#include "../error/error.h"

// ---------------------------------------------------------------------------

LexScope*
makeLexScope(LexScope* parent, ASTNode* node) {
  LexScope* scope = alloc(sizeof(LexScope));
  
  // prelude and global scopes should have themselves as their own globals
  // (check: prelude has no parent, global scopes have prelude as parent)
  LexScope* global =
    parent && parent != getPrelude()->lexScope
    ? parent->global
    : scope;

  *scope = (LexScope) {
    global,  // global
    parent,  // parent
    0,       // numLocals
    0,       // numNonLocals
    NULL,    // entries
    NULL,    // last
  };

  // annotate node with scope
  node->scope = scope;
  return scope;
}

// ---------------------------------------------------------------------------
// get entry in scope with name matching name node str, or null if no match
// annotate node with scope index and acces information

LexEntry*
getLexName(LexScope* scope, ASTNode* node) {
  assert(node->nodeType == Node_Name);

  char* chars = (char*)node->children[0];
  int length = node->children[1];

  LexEntry* result = getLexEntry(scope, chars, length);

  if (result) {
    node->index = result->index;

    // prelude always loads from itself
    if (scope->parent == NULL) {
      node->access = Access_Prelude;

    } else if (scope->parent == getPrelude()->lexScope) {
      // global scopes have prelude as parent
      node->access = Access_Global;

    } else {
      node->access = Access_Local;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// check that strings (maybe not null-terminated) have same length and chars
// can't use strncmp since that gives false positives for substrings

bool
strsMatch(char* aChars, int aLength, char* bChars, int bLength) {
  // strings are equal if they have the same length and number of chars
  // can't use strncmp alone since that gives false positives for substrings
  bool sameLength = aLength == bLength;
  bool sameChars = strncmp(aChars, bChars, bLength) == 0;
  return sameLength && sameChars;
}

// ---------------------------------------------------------------------------

LexEntry*
getLexEntry(LexScope* scope, char* chars, int length) {
  LexEntry* entry = scope->entries;
  // search entry list for entry with matching name
  while (entry) {
    char* entryChars = entry->chars;
    int entryLength = entry->length;

    if (strsMatch(entryChars, entryLength, chars, length)) {
      return entry;
    }

    entry = entry->next;
  }

  // return null if no matching entry found
  return NULL;
}

// ---------------------------------------------------------------------------

LexEntry*
addLexChars(
    LexScope* scope, char* chars, int length, bool isLocal, ASTNode* node
  ) {
  
  int index = scope->numLocals;
  if (isLocal) {
    // we cannot add a Local def after we've already stated adding non-locals
    assert(!scope->numNonLocals);
    scope->numLocals++;

  } else {
    // have to offset non-locals index by number of preceding local defs
    index += scope->numNonLocals++;
  }

  node->index = index;
  LexEntry* entry = alloc(sizeof(LexEntry));
  
  *entry = (LexEntry) {
    index,      // index
    0,          // upIndex
    chars,      // chars
    length,     // length
    NULL,       // next
    &node->loc, // location
  };

  // prepend entry to entries list
  // (have to prepend instead of append so that locals come first)

  if (!scope->entries) {
    scope->entries = entry;
  } else {
    scope->last->next = entry;
  }

  scope->last = entry;
  return entry;
}

// ---------------------------------------------------------------------------
// add def for node name - node must be name node

LexEntry*
addLexEntry(LexScope* scope, ASTNode* node, bool isLocal) {
  assert(node->nodeType == Node_Name);

  char* chars = (char*)node->children[0];
  int length = node->children[1];

  // if entry with matching name already exists, then there's a duplicate def
  if(getLexName(scope, node)) {
    errorHeader("Name Error");

    fprintf(stderr,
      "Duplicate definition for name '%.*s'", length, chars
    );

    pushLocError(node->loc);
    throwError();
  }

  return addLexChars(scope, chars, length, isLocal, node);
}

// ---------------------------------------------------------------------------

void
addLexDef(LexScope* scope, ASTNode* node) {
  if (node->nodeType == Node_Name) {
    // mark as local, since isn't an upval capture def
    addLexEntry(scope, node, true);

  } else if (node->nodeType == Node_Tuple) {
    // mark as local, since isn't an upval capture def
    ASTNode* member = getChildNode(node, 0);
    while (member) {
      if (member->nodeType == Node_Blank) {
        member = member->next;
        continue;
      }
      
      addLexEntry(scope, member, true);
      member = member->next;
    }

  } else {
    // should be enforced by parser
    assert(node->nodeType == Node_Blank);
  }
}

// ---------------------------------------------------------------------------

LexEntry*
getNonLocals(LexScope* scope) {
  LexEntry* entry = scope->entries;
  for (int n = scope->numLocals; n; n--) {
    // should always have as many local entries as local count
    assert(entry);
    entry = entry->next;
  }
  return entry;
}

// ---------------------------------------------------------------------------
// only re-print location line for debug output when location line changes
// (lineNum changes or source file changes)

void
lexShowLoc(Location* loc) {
  // use lastLoc var to filter out redundant calls to print loc lines
  static Location* lastLoc = NULL;

  bool newLoc = !lastLoc;
  newLoc = newLoc || lastLoc->lineNum != loc->lineNum;
  newLoc = newLoc || strcmp(lastLoc->path, loc->path) != 0;

  if (newLoc) {
    printf("\n");
    printLocLine(stdout, loc);
  }
  lastLoc = loc;
}

// ---------------------------------------------------------------------------
// node must be name node
// show node index and access

void
showNodeAnnotations(ASTNode* node) {
  assert(node->nodeType == Node_Name);
  lexShowLoc(&node->loc);

  char* chars = (char*)node->children[0];
  int length = node->children[1];
  printf("access: %.*s ", length, chars);

  switch (node->access) {
    case Access_Prelude: printf("prelude"); break;
    case Access_Global: printf("global"); break;
    case Access_Local: printf("local"); break;
  }

  printf(": %d\n", node->index);
}

// ---------------------------------------------------------------------------
// show entry indecies (and upVals for non-locals) for scope

void
showLexScope(LexScope* scope) {
  LexEntry* entry = scope->entries;
  while (entry) {
    lexShowLoc(entry->loc);
    printf("entry: %.*s index: %d",
      entry->length, entry->chars, entry->index
    );

    // entry is upVal
    if (entry->index >= scope->numLocals) {
      printf(" upIndex: %d", entry->upIndex);
    }

    printf("\n");
    entry = entry->next;
  }
}

// ---------------------------------------------------------------------------

int
getLexScopeIndex(LexScope* scope, ASTNode* node) {
  assert(node->nodeType == Node_Name);

  // check for matching def
  LexEntry* entry = getLexName(scope, node);
  if (entry) {
    return entry->index;
  }

  if (!scope->parent) {
    // throw missing def error 
    char* chars = (char*)node->children[0];
    int length = node->children[1];

    errorHeader("Name Error");
    fprintf(stderr, "No definition for name '%.*s'", length, chars);
    pushLocError(node->loc);
    throwError();
  }

  int index = getLexScopeIndex(scope->parent, node);

  // handle upVals if def wasn't global or prelude
  if (node->access == Access_Local) {
    // make entry for upVal
    entry = addLexEntry(scope, node, false);
    // save index in parent scope
    entry->upIndex = index;
    // annotate node now that upVal is set up
    getLexName(scope, node);
    // return upVal index for children
    return entry->index;
  }

  return index;
}
