
#include "../parser/parser.h"

// ---------------------------------------------------------------------------
// retrieve interned string at a given index

char*
getText(int index);

// ---------------------------------------------------------------------------
// store a string for the vm to read
// only store one copy for strings which appear more than once

int64_t
internStr(ASTNode* node);

// ---------------------------------------------------------------------------
// get index for null-terminated (literal) string

int64_t
strLiteralIndex(char* chars);
