
#pragma once
#include <stdint.h>
#include <stdio.h>

#include "nodeTypes.h"
#include "../tokenizer/token.h"
#include "../compiler/lexScopeStructs.h"

// ---------------------------------------------------------------------------
// lexical scope annotations

typedef enum {
  Access_Prelude, // variable def exists in prelude
  Access_Global,  // variable def exists in global table
  Access_Local,   // variable def exists in current stack frame
} Access;

// ---------------------------------------------------------------------------

#define maxNodeChildren 3

struct ASTNode {
  NodeType nodeType;
  Location loc;
  // all node types use at most maxNodeChildren children
  // for example, conditional needs condition, then, and else children
  // nodes with variable numbers of elements (list, array, ...) use
  // a single child linked-list
  int64_t children[maxNodeChildren];
  
  // pointers for linked lists of children
  // used by function 'linkNodes' in parser
  // store last pointer for efficient appends
  struct ASTNode* next;
  struct ASTNode* last;

  // lexical scope annotations
  Access access;
  int index;       // variable index in local / global table
  LexScope* scope; // scope object for node
};

typedef struct ASTNode ASTNode;

// ---------------------------------------------------------------------------
// create new node in global node array

ASTNode*
makeNode(NodeType nodeType, Location loc);

// ---------------------------------------------------------------------------
// add value to child array at index

#define addChild(node, index, child) \
  node->children[index] = (int64_t)(child);

// ---------------------------------------------------------------------------
// get child cast as node

#define getChildNode(node, index) \
  ((ASTNode*)(node)->children[index])

// ---------------------------------------------------------------------------
// add new node to linked list of nodes

ASTNode*
linkNodes(ASTNode* elems, ASTNode* newElem);

// ---------------------------------------------------------------------------
// return number of nodes in linked list

int
countNodes(ASTNode* node);
