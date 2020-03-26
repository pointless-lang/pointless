
#include <assert.h>

#include "ASTNode.h"
#include "../files/files.h"

// ---------------------------------------------------------------------------

ASTNode*
makeNode(NodeType nodeType, Location loc) {
  ASTNode* node = alloc(sizeof(ASTNode));
  *node = (ASTNode) {
    nodeType,      // nodeType
    loc,           // loc
    {0},           // children
    NULL,          // next
    node,          // last
    Access_Global, // access
    0,             // index
    NULL,          // scope
  };
  return node;
}

// ---------------------------------------------------------------------------
// returns new list head node (in case original head was NULL)
// newElem must not be NULL

ASTNode*
linkNodes(ASTNode* elems, ASTNode* newElem) {
  assert(newElem);

  if (elems == NULL) {
    // new elem is new list head
    return newElem;
  }

  elems->last->next = newElem;
  elems->last = newElem;
  return elems;
}

// ---------------------------------------------------------------------------

int
countNodes(ASTNode* node) {
  int n = 0;
  for (; node; node = node->next) {
    n++;
  }
  return n;
}
