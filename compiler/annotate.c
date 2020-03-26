
#include <assert.h>

#include "lexScope.h"
#include "annotate.h"
#include "../parser/parser.h"

// ---------------------------------------------------------------------------
// forward declaration for mutual rec with annotate

void
annotateNode(LexScope* scope, ASTNode* node, bool log);

// ---------------------------------------------------------------------------

LexScope*
annotate(FileStruct* file, bool log) {
  if (file->lexScope) {
    return file->lexScope;
  }

  parse(file);

  LexScope* parent =
    file != getPrelude()
    ? annotate(getPrelude(), false)
    : NULL; // prelude gets empty scope

  file->lock = true;
  LexScope* scope = makeLexScope(parent, file->node);
  annotateNode(scope, file->node, log);
  // needs to be placed after call to annotate so that prelude will load
  // locals as local - otherwise, falls back on the rule that scopes with
  // prelude as parent are global, which doesn't hold for local scopes in
  // the prelude, thus must defer installing prelude until after annotation
  file->lexScope = scope;
  file->lock = false;

  return scope;
}

// ---------------------------------------------------------------------------

void
annotateChild(LexScope* scope, ASTNode* node, int index, bool log) {
  annotateNode(scope, getChildNode(node, index), log);
}

// ---------------------------------------------------------------------------

void
annotateChildren(LexScope* scope, ASTNode* node, int index, bool log) {
  ASTNode* child = (ASTNode*)node->children[index];
  while (child) {
    annotateNode(scope, child, log);
    child = child->next;
  }
}

// ---------------------------------------------------------------------------

void
annotateNodeBinaryOp(LexScope* scope, ASTNode* node, bool log) {
  annotateChild(scope, node, 1, log); // lhs
  annotateChild(scope, node, 2, log); // rhs
}

// ---------------------------------------------------------------------------

void
annotateNodeCall(LexScope* scope, ASTNode* node, bool log) {
  annotateChild(scope, node, 0, log);    // func
  annotateChildren(scope, node, 1, log); // args
}

// ---------------------------------------------------------------------------

void
annotateNodeConditional(LexScope* scope, ASTNode* node, bool log) {
  annotateChild(scope, node, 0, log); // predicate
  annotateChild(scope, node, 1, log); // then
  annotateChild(scope, node, 2, log); // else
}

// ---------------------------------------------------------------------------

void
annotateNodeDef(LexScope* scope, ASTNode* node) {
  ASTNode* lhs = getChildNode(node, 0);
  addLexDef(scope, lhs);
  // rhs should get annotated separately after all defs added to scope
}
 
// ---------------------------------------------------------------------------

void
annotateNodeFieldRef(LexScope* scope, ASTNode* node, bool log) {
  annotateChild(scope, node, 0, log); // lhs
}

// ---------------------------------------------------------------------------

void
annotateNodeFunc(LexScope* scope, ASTNode* node, bool log) {
  LexScope* newScope = makeLexScope(scope, node);

  ASTNode* param = getChildNode(node, 0);
  while (param) {
    addLexDef(newScope, param);
    param = param->next;
  }

  annotateChild(newScope, node, 1, log); // body
}

// ---------------------------------------------------------------------------

void
annotateNodeImport(LexScope* scope, ASTNode* node) {
  ASTNode* pathNode = getChildNode(node, 0);
  ASTNode* name = getChildNode(node, 1);
  char* path = (char*)pathNode->children[0];
  int length = pathNode->children[1];

  FileStruct* file = getFileRelative(node->loc.path, path, length);

  if (!file->lock) {
    annotate(file, false);
  }

  addLexDef(scope, name);
}

// ---------------------------------------------------------------------------

void
annotateNodeIndex(LexScope* scope, ASTNode* node, bool log) {
  annotateChild(scope, node, 0, log); // lhs
  annotateChild(scope, node, 1, log); // rhs
}

// ---------------------------------------------------------------------------

void
annotateNodeIterable(LexScope* scope, ASTNode* node, bool log) {
  annotateChildren(scope, node, 0, log); // elems
}

// ---------------------------------------------------------------------------

void
annotateNodeName(LexScope* scope, ASTNode* node) {
  getLexScopeIndex(scope, node);
}

// ---------------------------------------------------------------------------

void
annotateNodeObject(LexScope* scope, ASTNode* node, bool log) {
  LexScope* newScope = makeLexScope(scope, node);

  annotateChildren(newScope, node, 0, log); // defs
  for (ASTNode* def = getChildNode(node, 0); def; def = def->next) {
    // annotate rhs for defs after lhs names added
    annotateChild(newScope, def, 1, log); // rhs
  }
}

// ---------------------------------------------------------------------------

void
annotateNodePair(LexScope* scope, ASTNode* node, bool log) {
  annotateChildren(scope, node, 0, log); // key / case
  annotateChildren(scope, node, 1, log); // val / handler
}

// ---------------------------------------------------------------------------

void
annotateNodeProgram(LexScope* scope, ASTNode* node, bool log) {
  annotateChildren(scope, node, 0, log); // imports
  annotateChildren(scope, node, 1, log); // defs
  
  // annotate rhs for defs after lhs names added
  for (ASTNode* def = getChildNode(node, 1); def; def = def->next) {
    annotateChild(scope, def, 1, log);
  }
}

// ---------------------------------------------------------------------------

void
annotateNodeRequires(LexScope* scope, ASTNode* node, bool log) {
  annotateChild(scope, node, 0, log); // value
  annotateChild(scope, node, 1, log); // predicate
}

// ---------------------------------------------------------------------------

void
annotateNodeUnaryOp(LexScope* scope, ASTNode* node, bool log) {
  annotateChild(scope, node, 1, log); // operand
}

// ---------------------------------------------------------------------------

void
annotateNodeWhere(LexScope* scope, ASTNode* node, bool log) {
  ASTNode* obj = getChildNode(node, 1);
  LexScope* newScope = makeLexScope(scope, node);
  
  annotateChildren(newScope, obj, 0, log); // defs
  for (ASTNode* def = getChildNode(obj, 0); def; def = def->next) {
    annotateChild(newScope, def, 1, log); // rhs
  }

  annotateChild(newScope, node, 0, log); // expression
}

// ---------------------------------------------------------------------------

void
annotateNodeWith(LexScope* scope, ASTNode* node, bool log) {
  annotateChild(scope, node, 0, log); // value

  LexScope* newScope = makeLexScope(scope, node);
  addLexChars(newScope, "$", 1, true, node); // isLocal = true

  ASTNode* def = getChildNode(node, 1);
  while (def) {
    annotateChild(newScope, def, 0, log);
    annotateChild(newScope, def, 1, log);
    def = def->next;
  }
}

// ---------------------------------------------------------------------------

void
annotateNode(LexScope* scope, ASTNode* node, bool log) {
  switch (node->nodeType) {
    case Node_Bool:   break;
    case Node_Number: break;
    case Node_String: break;
    case Node_Label:  break;
    // -----
    case Node_Def:    annotateNodeDef(scope, node); break;
    case Node_Import: annotateNodeImport(scope, node); break;
    case Node_Name:   annotateNodeName(scope, node); break;
    // -----
    case Node_Array:       annotateNodeIterable(scope, node, log); break;
    case Node_BinaryOp:    annotateNodeBinaryOp(scope, node, log); break;
    case Node_Call:        annotateNodeCall(scope, node, log); break;
    case Node_Conditional: annotateNodeConditional(scope, node, log); break;
    case Node_FieldRef:    annotateNodeFieldRef(scope, node, log); break;
    case Node_Func:        annotateNodeFunc(scope, node, log); break;
    case Node_Index:       annotateNodeIndex(scope, node, log); break;
    case Node_List:        annotateNodeIterable(scope, node, log); break;
    case Node_Map:         annotateNodeIterable(scope, node, log); break;
    case Node_Object:      annotateNodeObject(scope, node, log); break;
    case Node_Pair:        annotateNodePair(scope, node, log); break;
    case Node_Program:     annotateNodeProgram(scope, node, log); break;
    case Node_Requires:    annotateNodeRequires(scope, node, log); break;
    case Node_Set:         annotateNodeIterable(scope, node, log); break;
    case Node_Tuple:       annotateNodeIterable(scope, node, log); break;
    case Node_UnaryOp:     annotateNodeUnaryOp(scope, node, log); break;
    case Node_Where:       annotateNodeWhere(scope, node, log); break;
    case Node_With:        annotateNodeWith(scope, node, log); break;

    default: assert(false);
  }

  if (log && node->nodeType == Node_Name) {
    showNodeAnnotations(node);

  } else if (log && node->scope) {
    showLexScope(node->scope);
  }
}
