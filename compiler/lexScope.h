
#include "lexScopeStructs.h"
#include "../tokenizer/token.h"
#include "../parser/ASTNode.h"
#include "../files/files.h"

// ---------------------------------------------------------------------------
// make a new lex scope with given parent
// annotates given node with scope information

LexScope*
makeLexScope(LexScope* parent, ASTNode* node);

// ---------------------------------------------------------------------------
// add def entry to scope, with local or non-local
// takes node to annotate entry loc for debugging and node index

LexEntry*
addLexChars(
  LexScope* scope, char* chars, int length, bool isLocal, ASTNode* node
);

// ---------------------------------------------------------------------------
// get lex entry matching a given string, or null or none matches

LexEntry*
getLexEntry(LexScope* scope, char* chars, int length);

// ---------------------------------------------------------------------------
// add lex scope entries for a def lhs node (name, tuple of names, or blank)

void
addLexDef(LexScope* scope, ASTNode* node);

// ---------------------------------------------------------------------------
// walk scope entries list to find start of non-local entries chain
// used by compiler to set up upval handling

LexEntry*
getNonLocals(LexScope* scope);

// ---------------------------------------------------------------------------
// print debug rep for name node

void
showNodeAnnotations(ASTNode* node);

// ---------------------------------------------------------------------------
// print debug rep for lex scope

void
showLexScope(LexScope* scope);

// ---------------------------------------------------------------------------
// annotate name node with lex scope index information
// update annotations in lex scope parent hierarchy as necessary 

int
getLexScopeIndex(LexScope* scope, ASTNode* node);
