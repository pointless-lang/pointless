
#pragma once
#include <stdbool.h>
#include <stdlib.h>
#include <libgen.h>

#include "../tokenizer/token.h"
#include "../parser/ASTNode.h"

// -----------------------------------------------------------------------------
// "Some believe that nobody in their right mind should make use of the
// internals of this structure"

// forward declaration to avoid circular include through lexScope.h
struct LexScope;
typedef struct LexScope LexScope;

// -----------------------------------------------------------------------------

struct FileStruct {
  char* path;         // need path for error messages
  char* absPath;      // need absPath for detecting redundant imports
  int index;          // index in list of all source files
  int length;         // number of chars
  char* chars;        // program text
  Token* tokens;      // program tokens
  Token* lastToken;   // end of tokens linked list
  ASTNode* node;      // program root AST node
  bool lock;          // used by annotater to check for circular imports
  LexScope* lexScope; // used by annotater in compiler
  struct FileStruct* next;
};

typedef struct FileStruct FileStruct;

// -----------------------------------------------------------------------------
// get linked list of all file structs imported somewhere in the source tree

FileStruct*
getImports(void);

// -----------------------------------------------------------------------------
// get an n-byte block of static memory
// used by tokenizer, parser, annotator, and compiler to avoid
// dynamic memory allocation

void*
alloc(int n);

// -----------------------------------------------------------------------------
// get the file structure for the given relative path, creating a
// new structure if none exists yet for this file (absolute path)
// need pathLength to index into file char array

FileStruct*
getFileStruct(char* path, int pathLength);

// -----------------------------------------------------------------------------
// get a file structure from path, relative to a base path

FileStruct*
getFileRelative(char* basePath, char* path, int length);

// -----------------------------------------------------------------------------
// push a token to this file structure's tokens array

void
fileAddToken(FileStruct* file, Token* token);

// -----------------------------------------------------------------------------

FileStruct*
getPrelude(void);
