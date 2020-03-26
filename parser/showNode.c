
#include <stdbool.h>
#include <assert.h>

#include "showNode.h"
#include "convertNum.h"

// ---------------------------------------------------------------------------
// print node at given indentation

void
showNodeLevel(ASTNode* node, int level);

// ---------------------------------------------------------------------------
// get child, cast to node, print indented

#define showChild(node, index) \
  showNodeLevel(getChildNode(node, index), level + 1)

// ---------------------------------------------------------------------------
// print child node linked list at given child index

#define showChildren(node, index) \
  showChildrenFunc(node, index, level);

void
showChildrenFunc(ASTNode* node, int index, int level) {
  // child list at give child index
  ASTNode* child = (ASTNode*)node->children[index];
  while (child) {
    showNodeLevel(child, level + 1);
    child = child->next;
  }
}

// ---------------------------------------------------------------------------

void indent(int level) {
  if (level) {
    printf("\n");
  }    
  while (level--) {
    printf(" ");
  }
}

// ---------------------------------------------------------------------------

void
showNodeBinaryOp(ASTNode* node, int level) {
  indent(level);
  printf("(BinaryOp");

  indent(level + 1);
  printf("%s", getTokTypeStr(node->children[0])); // operator

  showChild(node, 1); // lhs
  showChild(node, 2); // rhs
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodeBlank(int level) {
  indent(level);
  printf("(Blank)");
}

// ---------------------------------------------------------------------------

void
showNodeBool(ASTNode* node, int level) {
  indent(level);
  printf("(Bool %s)", node->children[0] ? "true" : "false");
}

// ---------------------------------------------------------------------------

void
showNodeCall(ASTNode* node, int level) {
  indent(level);
  printf("(Call");
  showChild(node, 0);    // func
  showChildren(node, 1); // args
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodeConditional(ASTNode* node, int level) {
  indent(level);
  printf("(Conditional");
  showChild(node, 0); // predicate
  showChild(node, 1); // then
  showChild(node, 2); // else
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodeDef(ASTNode* node, int level) {
  indent(level);
  printf("(Def");
  showChild(node, 0); // lhs
  showChild(node, 1); // rhs
  printf(")");
}
 
// ---------------------------------------------------------------------------

void
showNodeFieldRef(ASTNode* node, int level) {
  indent(level);
  printf("(FieldRef");
  showChild(node, 0); // lhs
  showChild(node, 1); // rhs
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodeFunc(ASTNode* node, int level) {
  indent(level);
  printf("(Func");
  showChildren(node, 0); // params
  showChild(node, 1);    // body
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodeImport(ASTNode* node, int level) {
  indent(level);
  printf("(Import");
  showChild(node, 0); // path
  showChild(node, 1); // name
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodeIndex(ASTNode* node, int level) {
  indent(level);
  printf("(Index");
  showChild(node, 0); // lhs
  showChild(node, 1); // rhs
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodeIterable(ASTNode* node, int level, char* name) {
  indent(level);
  printf("(%s", name);
  showChildren(node, 0); // elems
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodeNumber(ASTNode* node, int level) {
  indent(level);
  // https://stackoverflow.com/a/54162486/6680182
  // 16 chars seems to be the max for reliable float precision
  // only print as many chars as needed, up to the max
  printf("(Number %.16g)", toDouble(node->children[0]));
}

// ---------------------------------------------------------------------------

void
showNodeObject(ASTNode* node, int level) {
  indent(level);
  printf("(Object");
  showChildren(node, 0); // defs
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodePair(ASTNode* node, int level) {
  indent(level);
  printf("(Pair");
  showChildren(node, 0); // key / case
  showChildren(node, 1); // val / handler
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodeProgram(ASTNode* node, int level) {
  indent(level);
  printf("(Program");
  showChildren(node, 0); // imports
  showChildren(node, 1); // defs
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodeRequires(ASTNode* node, int level) {
  indent(level);
  printf("(Requires");
  showChild(node, 0); // value
  showChild(node, 1); // predicate
  printf(")");
}

// ---------------------------------------------------------------------------
// print node with string child

void
showNodeText(ASTNode* node, int level, char* name) {
  indent(level);
  int length = (int)node->children[1];
  char* chars = (char*)node->children[0];
  printf("(%s \"%.*s\")", name, length, chars);
}

// ---------------------------------------------------------------------------

void
showNodeUnaryOp(ASTNode* node, int level) {
  indent(level);
  printf("(UnaryOp");

  indent(level + 1);
  printf("%s", getTokTypeStr(node->children[0])); // operator

  showChild(node, 1); // operand
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodeWhere(ASTNode* node, int level) {
  indent(level);
  printf("(Where");
  showChild(node, 0); // expression
  showChild(node, 1); // defs
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodeWith(ASTNode* node, int level) {
  indent(level);
  printf("(With");
  showChild(node, 0);    // value
  showChildren(node, 1); // defs
  printf(")");
}

// ---------------------------------------------------------------------------

void
showNodeLevel(ASTNode* node, int level) {
  switch (node->nodeType) {
    case Node_BinaryOp:    showNodeBinaryOp(node, level); break;
    case Node_Bool:        showNodeBool(node, level); break;
    case Node_Call:        showNodeCall(node, level); break;
    case Node_Conditional: showNodeConditional(node, level); break;
    case Node_Def:         showNodeDef(node, level); break;
    case Node_FieldRef:    showNodeFieldRef(node, level); break;
    case Node_Func:        showNodeFunc(node, level); break;
    case Node_Import:      showNodeImport(node, level); break;
    case Node_Index:       showNodeIndex(node, level); break;
    case Node_Number:      showNodeNumber(node, level); break;
    case Node_Object:      showNodeObject(node, level); break;
    case Node_Pair:        showNodePair(node, level); break;
    case Node_Program:     showNodeProgram(node, level); break;
    case Node_Requires:    showNodeRequires(node, level); break;
    case Node_UnaryOp:     showNodeUnaryOp(node, level); break;
    case Node_Where:       showNodeWhere(node, level); break;
    case Node_With:        showNodeWith(node, level); break;
    // -----
    case Node_Blank:       showNodeBlank(level); break;
    // -----
    case Node_Label:       showNodeText(node, level, "Label"); break;
    case Node_Name:        showNodeText(node, level, "Name"); break;
    case Node_String:      showNodeText(node, level, "String"); break;
    // -----
    case Node_Array:       showNodeIterable(node, level, "Array"); break;
    case Node_List:        showNodeIterable(node, level, "List"); break;
    case Node_Map:         showNodeIterable(node, level, "Map"); break;
    case Node_Set:         showNodeIterable(node, level, "Set"); break;
    case Node_Tuple:       showNodeIterable(node, level, "Tuple"); break;

    default: assert(false);
  }
}

// ---------------------------------------------------------------------------

void
showNode(ASTNode* node) {
  showNodeLevel(node, 0);
  printf("\n");
}
