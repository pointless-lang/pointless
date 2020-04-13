
#include <stdbool.h>
#include <assert.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "parserFuncs.h"
#include "convertNum.h"
#include "../error/error.h"

// ---------------------------------------------------------------------------
// parser hierarchy:
// 
// program is at the top, is a sequence of imports
// and definitions (names defs or functions defs)
// right hand side of a definition is a clause
// from there, parsers form a hierarchy, where "a > b"
// means "b can be parsed as a"
//
// clause     (where)
// statement  (if, for, switch, lambda)
// expression (requires, with, as)
// operation  (binary op, unary op)
// unit       (field ref, index, call)
// unitBase   (literals, collections, parenthesized clauses)

// note that function calls can go up the hierarchy:
// for example, getUnitBase calls getclause to get parenthetized clauses
// functions that are called by lower functions get forward declared:

ASTNode* getUnit(Parser* parser);
ASTNode* getExpression(Parser* parser);
ASTNode* getStatement(Parser* parser);
ASTNode* getClause(Parser* parser);

// ---------------------------------------------------------------------------
// unit base
// ---------------------------------------------------------------------------

ASTNode*
getName(Parser* parser) {
  Token* token = getNext(parser, tokSet(Tok_Name), defSkip);
  ASTNode* node = makeNode(Node_Name, token->loc);

  addChild(node, 0, token->chars);
  addChild(node, 1, token->length);
  return node;
}

// ---------------------------------------------------------------------------

ASTNode*
getString(Parser* parser) {
  Token* token = getNext(parser, tokSet(Tok_String), defSkip);
  ASTNode* node = makeNode(Node_String, token->loc);

  // skip / drop quote chars
  addChild(node, 0, token->chars + 1);
  addChild(node, 1, token->length - 2);
  return node;
}

// ---------------------------------------------------------------------------

ASTNode*
getNumber(Parser* parser) {
  Token* token = getNext(parser, tokSet(Tok_Number), defSkip);
  ASTNode* node = makeNode(Node_Number, token->loc);

  int64_t value = fromDouble(strtod(token->chars, NULL));
  addChild(node, 0, value);
  return node;
}

// ---------------------------------------------------------------------------

ASTNode*
getBool(Parser* parser) {
  Token* token = getNext(parser, tokSet(Tok_Bool), defSkip);
  ASTNode* node = makeNode(Node_Bool, token->loc);

  // token chars are either 'true' or 'false'
  // only need to check first char
  bool isTrue = token->chars[0] == 't';

  addChild(node, 0, isTrue);
  return node;
}

// ---------------------------------------------------------------------------

ASTNode*
getLabel(Parser* parser) {
  Token* token = getNext(parser, tokSet(Tok_Label), defSkip);
  ASTNode* node = makeNode(Node_Label, token->loc);

  addChild(node, 0, token->chars);
  addChild(node, 1, token->length);
  return node;
}

// ---------------------------------------------------------------------------
//  examples:
//  [1, 2, 3]
//  [1]
//  []

ASTNode*
getList(Parser* parser) {
  Location loc;
  // 'true' to allow trailing comma
  ASTNode* elems = getSeq(
    parser, Tok_LArray, Tok_RArray, Tok_Comma, getClause, &loc, true
  );

  ASTNode* node = makeNode(Node_List, loc);
  addChild(node, 0, elems);
  return node;
}

// ---------------------------------------------------------------------------
//  example: [1 2 3]

ASTNode*
getArray1D(Parser* parser) {
  Location loc;
  // use getUnit for elements
  // (helps visually disambiguate space separators) 
  ASTNode* elems = getSeq(
    parser, Tok_LArray, Tok_RArray, Tok_Whitespace, getUnit, &loc, true
  );

  ASTNode* node = makeNode(Node_Array, loc);
  addChild(node, 0, elems);
  return node;
}

// ---------------------------------------------------------------------------
//  example:
//  x = 
//    [1 0 0]
//    [0 1 0]
//    [0 0 1]

ASTNode*
getArray2D(Parser* parser) {
  ASTNode* array1DList = getArray1D(parser);
  TokenType skip[] = tokSetDef(Tok_Whitespace, Tok_Comment);

  // if there's a new 1D array on the next line, then it's part of this
  // 2D matrix
  while (isNextMulti(parser, tokSet(Tok_Newline, Tok_LArray), skip)) {
    array1DList = linkNodes(array1DList, getArray1D(parser));
  }

  // only return matrix with 2 or more rows, array otherwise
  if (array1DList->next == NULL) {
    return array1DList;
  }

  ASTNode* node = makeNode(Node_Array, array1DList->loc);
  addChild(node, 0, array1DList);
  return node;
}

// ---------------------------------------------------------------------------
//  get elements in parens, separated by commas
//  takes an optional list of starting elements (used when disambiguating
//  between tuples and parenthesized expressions)

ASTNode*
getParenElements(Parser* parser, NodeHandler handler, Location* loc) {
  ASTNode* elems = getSeq(
    parser, Tok_LParen, Tok_RParen, Tok_Comma, handler, loc, false
  );
  
  // check for empty (NULL) list head
  if (!elems) {
    errorHeader("Parser Error");
    fprintf(stderr, "construct requires 1 or more arguments or elements");
    pushLocError(*loc);
    throwError();
  }

  return elems;
}

// ---------------------------------------------------------------------------
//  example: (a, b, c)

ASTNode*
getTupleHandler(Parser* parser, NodeHandler handler) {
  Location loc;
  ASTNode* elems = getParenElements(parser, handler, &loc);

  // if linked list has no second element
  if (!elems->next) {
    errorHeader("Parser Error");
    fprintf(stderr, "Tuple must have 2 or more elements");
    pushLocError(elems->loc);
    throwError();
  }

  ASTNode* node = makeNode(Node_Tuple, loc);
  addChild(node, 0, elems);
  return node;
}

ASTNode*
getTuple(Parser* parser) {
  return getTupleHandler(parser, getClause);
}

// ---------------------------------------------------------------------------
// tuple lhs member name can be name or blank "_" (for ignored params)

ASTNode*
getTupleName(Parser* parser) {
  if (isNext(parser, tokSet(Tok_Blank), defSkip)) {
    Token* token = getNext(parser, tokSet(Tok_Blank), defSkip);
    return makeNode(Node_Blank, token->loc);
  }
  return getName(parser);
}

// ---------------------------------------------------------------------------
// single name or tuple of names

ASTNode*
getDefLHS(Parser* parser) {
  if (isNext(parser, tokSet(Tok_LParen), defSkip)) {
    Location loc;
    ASTNode* elems = getParenElements(parser, getTupleName, &loc);
    ASTNode* node = makeNode(Node_Tuple, loc);
    addChild(node, 0, elems);
    return node;
  }
  return getName(parser);
}

// ---------------------------------------------------------------------------

ASTNode*
getNameDef(Parser* parser) {
  ASTNode* lhs = getDefLHS(parser);

  getNext(parser, tokSet(Tok_Assign), defSkip);
  ASTNode* rhs = getClause(parser);

  ASTNode* node = makeNode(Node_Def, lhs->loc);
  addChild(node, 0, lhs);
  addChild(node, 1, rhs);

  return node;
}

// ---------------------------------------------------------------------------
//  example: foo(a, b, c) = bar

ASTNode*
getFuncDef(Parser* parser) {
  ASTNode* name = getName(parser);
  Location loc;
  // have to pass loc for debugging, even if not used in calling function
  ASTNode* params = getParenElements(parser, getName, &loc);

  getNext(parser, tokSet(Tok_Assign), defSkip);
  ASTNode* body = getClause(parser);

  // function desugars to name definition with lambda expression
  // the following are equivalent 
  // 
  // foo(bar) = baz
  // foo = (bar) => baz

  ASTNode* func = makeNode(Node_Func, name->loc);
  addChild(func, 0, params);
  addChild(func, 1, body);

  ASTNode* node = makeNode(Node_Def, name->loc);
  addChild(node, 0, name);
  addChild(node, 1, func);
  return node;
}

// ---------------------------------------------------------------------------
// example function def:
// double(n) = n * 2
// 
// example single assignment:
// x = 123
// 
// example tuple assignment:
// (a, b) = (1, 23)

ASTNode*
getDef(Parser* parser) {
  if (isNextMulti(parser, tokSet(Tok_Name, Tok_LParen), defSkip)) {
    return getFuncDef(parser);
  }
  
  return getNameDef(parser);
}

// ---------------------------------------------------------------------------
// {foo = "bar"}

ASTNode*
getObject(Parser* parser) {
  Token* token = getNext(parser, tokSet(Tok_LBracket), defSkip);

  ASTNode* defs = NULL; // initial empty list
  while (!isNext(parser, tokSet(Tok_RBracket), defSkip)) {
    defs = linkNodes(defs, getDef(parser));

    if (isNext(parser, tokSet(Tok_RBracket), defSkip)) {
      break;
    }
    
    // statements can be seperated by newline or semicolon
    getNext(parser, tokSet(Tok_Newline, Tok_Semicolon), defSkip);
  }

  getNext(parser, tokSet(Tok_RBracket), defSkip);

  ASTNode* node = makeNode(Node_Object, token->loc);
  addChild(node, 0, defs);
  return node;
}

// ---------------------------------------------------------------------------
//  {123: false, 4: true}

ASTNode* 
getPair(Parser* parser) {
  ASTNode* key = getClause(parser);
  getNext(parser, tokSet(Tok_Colon), defSkip);
  ASTNode* val = getClause(parser); 

  ASTNode* node = makeNode(Node_Pair, key->loc);
  addChild(node, 0, key);
  addChild(node, 1, val);
  return node;
}

ASTNode*
getMap(Parser* parser) {
  Location loc;
  ASTNode* elems = getSeq(
    parser, Tok_LBracket, Tok_RBracket, Tok_Comma, getPair, &loc, true
  );

  ASTNode* node = makeNode(Node_Map, loc);
  addChild(node, 0, elems);
  return node;
}

// ---------------------------------------------------------------------------
//  {1, 2, 3}

ASTNode*
getSet(Parser* parser) {
  Location loc;
  ASTNode* elems = getSeq(
    parser, Tok_LBracket, Tok_RBracket, Tok_Comma, getClause, &loc, true
  );

  ASTNode* node = makeNode(Node_Set, loc);
  addChild(node, 0, elems);
  return node;
}

// ---------------------------------------------------------------------------
// get square-bracketed collection (list, 1D array, or 2D array)

ASTNode*
getArrayLiteral(Parser* parser) {
  if (isNextMulti(parser, tokSet(Tok_LArray, Tok_RArray), defSkip)) {
    return getList(parser);
  }

  Token* oldHead = parser->head;
  getNext(parser, tokSet(Tok_LArray), defSkip);
  // this parse-then-restore strategy is theoretically infficient, 
  // but shouldn't matter in real-world cases
  getClause(parser);

  if (isNext(parser, tokSet(Tok_Comma, Tok_RArray), defSkip)) {
    // restore original index
    parser->head = oldHead;
    return getList(parser);
  }

  // restore original index
  parser->head = oldHead;
  return getArray2D(parser);
}

// ---------------------------------------------------------------------------
// get an element starting with an open paren: either a tuple or parenthesized
// expression; lambdas are handled separately, since their param list may or 
// may not start with an open paren

ASTNode*
getParenLiteral(Parser* parser) {
  Token* oldHead = parser->head;
  getNext(parser, tokSet(Tok_LParen), defSkip);
  ASTNode* clause = getClause(parser);

  if (isNext(parser, tokSet(Tok_RParen), defSkip)) {
    getNext(parser, tokSet(Tok_RParen), defSkip);
    // return clause in patenthetized expression
    return clause;
  }

  parser->head = oldHead;
  return getTuple(parser);
}

// ---------------------------------------------------------------------------
// get curly-bracketed collection (map, set, or object)

ASTNode*
getBracketLiteral(Parser* parser) {
  // empty brackets "{}" are an empty map
  // use toSet([]) for empty set
  if (isNextMulti(parser, tokSet(Tok_LBracket, Tok_RBracket), defSkip)) {
    return getMap(parser);
  }

  Token* oldHead = parser->head;
  getNext(parser, tokSet(Tok_LBracket), defSkip);
  getClause(parser);

  if (isNext(parser, tokSet(Tok_Assign), defSkip)) {
    parser->head = oldHead;
    return getObject(parser);
  }

  if (isNext(parser, tokSet(Tok_Colon), defSkip)) {
    parser->head = oldHead;
    return getMap(parser);
  }

  parser->head = oldHead;
  return getSet(parser);
}

// ---------------------------------------------------------------------------

ASTNode*
getUnitBase(Parser* parser) {

  TokenType unitTokens[] = tokSetDef(
    Tok_Number, Tok_String, Tok_Name, Tok_Label, Tok_Bool,
    Tok_LArray, Tok_LParen, Tok_LBracket
  );

  // throw error if next token is not in unitTokens
  switch(peek(parser, unitTokens, defSkip)->tokType) {
    case Tok_Number:
      return getNumber(parser); 
    case Tok_String:
      return getString(parser); 
    case Tok_Name:
      return getName(parser); 
    case Tok_Label:
      return getLabel(parser); 
    case Tok_Bool:
      return getBool(parser); 
    case Tok_LArray:
      return getArrayLiteral(parser); 
    case Tok_LParen:
      return getParenLiteral(parser); 
    case Tok_LBracket:
      return getBracketLiteral(parser); 
    default:
      // should never get here
      assert(false);
  }
}

// ---------------------------------------------------------------------------
// unit
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// index: lhs[rhs]

ASTNode*
getIndex(Parser* parser, ASTNode* lhs) {
  Token* token = getNext(parser, tokSet(Tok_LArray), defSkip);
  ASTNode* rhs = getClause(parser);
  getNext(parser, tokSet(Tok_RArray), defSkip);

  ASTNode* node = makeNode(Node_Index, token->loc);

  addChild(node, 0, lhs);
  addChild(node, 1, rhs);
  return node;
}

// ---------------------------------------------------------------------------
//  fieldRef: lhs.rhs

ASTNode*
getFieldRef(Parser* parser, ASTNode* lhs) {
  Token* token = getNext(parser, tokSet(Tok_Field), defSkip);

  ASTNode* nameNode = makeNode(Node_Name, token->loc);
  addChild(nameNode, 0, token->chars + 1);
  addChild(nameNode, 1, token->length - 1);

  ASTNode* node = makeNode(Node_FieldRef, token->loc);
  addChild(node, 0, lhs);
  addChild(node, 1, nameNode);
  return node;
}

// ---------------------------------------------------------------------------
//  func(arg1, arg2, ...)

ASTNode*
getCall(Parser* parser, ASTNode* func) {
  Location loc;
  ASTNode* args = getParenElements(parser, getClause, &loc);
  ASTNode* node = makeNode(Node_Call, loc);

  if (args == NULL) {
    errorHeader("Parser Error");
    fprintf(stderr, "function call missing arguments");
    pushLocError(loc);
    throwError();
  }

  addChild(node, 0, func);
  addChild(node, 1, args);
  return node;
}

// ---------------------------------------------------------------------------
// units are syntactically contained (are literals or collections, plus
// field / index / call extensions

ASTNode*
getUnit(Parser* parser) {
  ASTNode* value = getUnitBase(parser);

  // don't skip any tokens (not whitespace before index / call)
  TokenType skipNone[] = {Tok_NULL};

  // get trailing field / index / call extensions
  while (isNext(parser, tokSet(Tok_LArray, Tok_LParen), skipNone)
      || isNext(parser, tokSet(Tok_Field), defSkip)) {

    TokenType extTokens[] = tokSetDef(Tok_LArray, Tok_LParen, Tok_Field);

    switch(peek(parser, extTokens, defSkip)->tokType) {
      case Tok_LArray:
        value = getIndex(parser, value);
        break;
      case Tok_LParen:
        value = getCall(parser, value);
        break;
      case Tok_Field:
        value = getFieldRef(parser, value);
        break;
      default:
        // should never get here
        assert(false);
    }
  }

  return value;
}

// ---------------------------------------------------------------------------
// operations
// ---------------------------------------------------------------------------

typedef struct {
  bool leftAssoc;
  TokenType tokTypes[5];
} OpEntry;


// lowest to hightest precedence
OpEntry opEntries[] = {
  {true,  tokSetDef(Tok_Pipe)},
  {false, tokSetDef(Tok_Concat)},
  {true,  tokSetDef(Tok_Or)},
  {true,  tokSetDef(Tok_And)},
  {true,  tokSetDef(Tok_Equals, Tok_NotEq)},
  {true,  tokSetDef(Tok_In)},
  {true,  tokSetDef(Tok_Is)},
  {true,  tokSetDef(Tok_LessThan, Tok_LessEq, Tok_GreaterThan, Tok_GreaterEq)},
  {true,  tokSetDef(Tok_Add, Tok_Sub)},
  {true,  tokSetDef(Tok_Mul, Tok_Div, Tok_Mod)},
  {false, tokSetDef(Tok_Pow)},
};

// ---------------------------------------------------------------------------

ASTNode*
getPrefixOp(Parser* parser) {
  if (isNext(parser, tokSet(Tok_Neg, Tok_Not), defSkip)) {

    Token* token = getNext(parser, tokSet(Tok_Neg, Tok_Not), defSkip);
    ASTNode* rhs = getPrefixOp(parser); 

    ASTNode* node = makeNode(Node_UnaryOp, token->loc);

    addChild(node, 0, token->tokType);
    addChild(node, 1, rhs);
    return node;
  }

  return getUnit(parser); // get unit in base case
}

// ---------------------------------------------------------------------------
// recursively iterate through operators, starting with lowest precedence
// older parsers versions had support for postfix operators (factorial);
// removed support when factorial operator was removed from grammar
// also: new simplified parser puts all unary operators at higher precedence
// than all binary operators!!! (this is non-ideal, but ok for now)

ASTNode*
getBinaryOp(Parser* parser, int precedence) {
  static int maxPrec = sizeof(opEntries) / sizeof(OpEntry);

  // already cycled through all binary ops
  if (precedence == maxPrec) {
    return getPrefixOp(parser); // get unary op in base case
  }

  // get initial operand
  ASTNode* node = getBinaryOp(parser, precedence + 1);
  OpEntry* opEntry = &opEntries[precedence];

  while (isNext(parser, opEntry->tokTypes, defSkip)) {
    // get rhs at +1 precedence for left assoc, +0 for right
    int increment = opEntry->leftAssoc;

    Token* token = getNext(parser, opEntry->tokTypes, defSkip);
    ASTNode* rhs = getBinaryOp(parser, precedence + increment);

    ASTNode* oldNode = node;

    // desugar pipe as call
    if (token->tokType == Tok_Pipe) {
      node = makeNode(Node_Call, token->loc);
      addChild(node, 0, rhs);
      addChild(node, 1, oldNode);

    } else {
      node = makeNode(Node_BinaryOp, token->loc);
      addChild(node, 0, token->tokType);
      addChild(node, 1, oldNode);
      addChild(node, 2, rhs);
    }
  }
  return node;
}

// ---------------------------------------------------------------------------
// get a series of expressions separated by prefix / infix operators
// (original version was based on shunting-yard algorithm, stack-based, could
// handle large expressions - moved to recursion based scheme for simplicity,
// but will now overflow the call stack on large expressions)

ASTNode*
getOperation(Parser* parser) {
  return getBinaryOp(parser, 0);
}

// ---------------------------------------------------------------------------
// expression
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// example:
// 1 / n requires n != 0

ASTNode*
getRequires(Parser* parser, ASTNode* lhs) {
  Token* token = getNext(parser, tokSet(Tok_Requires), defSkip);
  ASTNode* condition = getOperation(parser);

  ASTNode* node = makeNode(Node_Requires, token->loc);

  addChild(node, 0, lhs);
  addChild(node, 1, condition);
  return node;
}

// ---------------------------------------------------------------------------
// iteratively get fields attached to lhs

void
checkNotBuiltIn(int length, char* fieldName, Location loc) {
  // "!" prefixed fields are reserved for built-in functions
  if (fieldName[0] == '!') {
    errorHeader("Parser Error");
    fprintf(stderr, "cannot create special field '%.*s'", length, fieldName);
    pushLocError(loc);
    throwError();
  }
}

ASTNode*
getDefinable(Parser* parser, ASTNode* lhs) {
  TokenType rhsTokens[] = tokSetDef(Tok_Field, Tok_LArray);

  // must have at least one field or index ref
  // peek throws error otherwise
  peek(parser, rhsTokens, defSkip);

  while (isNext(parser, rhsTokens, defSkip)) {
    if (isNext(parser, tokSet(Tok_LArray), defSkip)) {
      lhs = getIndex(parser, lhs);

    } else if (isNext(parser, tokSet(Tok_Field), defSkip)) {
      lhs = getFieldRef(parser, lhs);
      checkNotBuiltIn(lhs->children[2], (char*)lhs->children[1], lhs->loc);
    }
  }

  return lhs;
}

// ---------------------------------------------------------------------------
// only with clauses can have compound assignments
// desugar compound assignments to normal assignment and binary op

TokenType assignTokens[] = tokSetDef(
  Tok_Assign,
  Tok_AddAssign,
  Tok_SubAssign,
  Tok_MulAssign,
  Tok_DivAssign,
  Tok_PowAssign,
  Tok_ModAssign
);

ASTNode*
getWithDef(Parser* parser) {
  Token* token = getNext(parser, tokSet(Tok_Dollar), defSkip);

  // with clause uses dollar sign as target name
  ASTNode* dollar = makeNode(Node_Name, token->loc);

  addChild(dollar, 0, token->chars);
  addChild(dollar, 1, token->length);

  ASTNode* lhs = getDefinable(parser, dollar);

  // get compound assignment token or normal assignment
  Token* opToken = getNext(parser, assignTokens, defSkip);

  ASTNode* rhs = getOperation(parser);

  // desugar compound assignment 
  if (opToken->tokType != Tok_Assign) {
    ASTNode* rhsOld = rhs;
    rhs = makeNode(Node_BinaryOp, opToken->loc);
    addChild(rhs, 0, opToken->tokType - 1);
    addChild(rhs, 1, lhs);
    addChild(rhs, 2, rhsOld);
  }
  
  ASTNode* node = makeNode(Node_Def, lhs->loc);
  addChild(node, 0, lhs);
  addChild(node, 1, rhs);
  return node;
}

// ---------------------------------------------------------------------------

ASTNode*
getWithDefs(Parser* parser) {
  getNext(parser, tokSet(Tok_LBracket), defSkip);

  ASTNode* defs = NULL;
  while (!isNext(parser, tokSet(Tok_RBracket), defSkip)) {
    defs = linkNodes(defs, getWithDef(parser));

    if (isNext(parser, tokSet(Tok_RBracket), defSkip)) {
      break;
    }

    // definitions can be separated by newline or semicolon
    getNext(parser, tokSet(Tok_Newline, Tok_Semicolon), defSkip);
  }

  getNext(parser, tokSet(Tok_RBracket), defSkip);
  return defs;
}

// ---------------------------------------------------------------------------
// example: arr with $[0] = 0
// example: arr with {$[0] = 0; $[1].foo = Bar}

ASTNode*
getWith(Parser* parser, ASTNode* lhs) {
  Token* token = getNext(parser, tokSet(Tok_With), defSkip);

  ASTNode* defs;
  if (isNext(parser, tokSet(Tok_LBracket), defSkip)) {
    // get a set of statements
    defs = getWithDefs(parser);

  } else {
    // get a single statement
    defs = getWithDef(parser);
  }

  ASTNode* node = makeNode(Node_With, token->loc);

  addChild(node, 0, lhs);
  addChild(node, 1, defs);
  return node;
}

// ---------------------------------------------------------------------------

ASTNode*
getExpression(Parser* parser) {
  ASTNode* value = getOperation(parser);

  TokenType clauseTokens[] = tokSetDef(
    Tok_Requires, Tok_With
  );

  while (isNext(parser, clauseTokens, defSkip)) {
    switch(peek(parser, clauseTokens, defSkip)->tokType) {
      case Tok_Requires:
        value = getRequires(parser, value);
        break;
      case Tok_With:
        value = getWith(parser, value);
        break;
      default:
        // should never get here
        assert(false);
    }
  }
  return value;
} 

// ---------------------------------------------------------------------------
// statement
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// example: if n < 0 then -n else n
// example: if list is Empty then [] else head(list)

ASTNode*
getConditional(Parser* parser) {
  Token* token = getNext(parser, tokSet(Tok_If), defSkip);
  ASTNode* condition = getExpression(parser);

  getNext(parser, tokSet(Tok_Then), defSkip);
  ASTNode* thenClause = getClause(parser);

  getNext(parser, tokSet(Tok_Else), defSkip);
  // get else as statement rather than clause to make following where
  // scope definitions encompass entire conditional
  ASTNode* elseExpr = getStatement(parser);

  ASTNode* node = makeNode(Node_Conditional, token->loc);

  addChild(node, 0, condition);
  addChild(node, 1, thenClause);
  addChild(node, 2, elseExpr);
  return node;
}

// ---------------------------------------------------------------------------
// example:
//
// switch {
//   case n is PtlsNumber "number"
//   otherwise "non-number"
// }
//
// switch {
//   case n % 2 == 0 "even"
//   otherwise "odd"
// }

ASTNode* 
getCases(Parser* parser) {
  Token* token = getNext(parser, tokSet(Tok_Case), defSkip);
  ASTNode* condition = getExpression(parser);
  ASTNode* thenClause = getClause(parser);

  if (isNext(parser, tokSet(Tok_RBracket), defSkip)) {
    ASTNode* node = makeNode(Node_Requires, token->loc);

    addChild(node, 0, thenClause);
    addChild(node, 1, condition);
    return node;
  }

  ASTNode* elseClause;
  if (isNext(parser, tokSet(Tok_Otherwise), defSkip)) {
    getNext(parser, tokSet(Tok_Otherwise), defSkip);
    elseClause = getClause(parser);

  } else {
    elseClause = getCases(parser);
  }

  ASTNode* node = makeNode(Node_Conditional, token->loc);

  addChild(node, 0, condition);
  addChild(node, 1, thenClause);
  addChild(node, 2, elseClause);
  return node;
}

ASTNode*
getSwitch(Parser* parser) {
  getNext(parser, tokSet(Tok_Switch), defSkip);
  getNext(parser, tokSet(Tok_LBracket), defSkip);

  ASTNode* node = getCases(parser);

  getNext(parser, tokSet(Tok_RBracket), defSkip);
  return node;
}

// ---------------------------------------------------------------------------
// list comprehension must start with for, and have a yield statement in
// its base
//
// example: for x in range(10) yield x * 2
//
// example:
//   for x in range(10)
//   when x % 2 == 0
//   yield x / 2
//
// example:
//   for x in range(10)
//   when x % 2 == 0
//   for y in range(10)
//   yield x / 2 / y

ASTNode*
getListComp(Parser* parser);

ASTNode*
getFor(Parser* parser) {
  Token* token = getNext(parser, tokSet(Tok_For), defSkip);
  ASTNode* variable = getName(parser);

  getNext(parser, tokSet(Tok_In), defSkip);
  ASTNode* iterable = getExpression(parser);
  ASTNode* result = getListComp(parser);

  ASTNode* func = makeNode(Node_Func, token->loc);
  addChild(func, 0, variable);
  addChild(func, 1, result);

  ASTNode* args = linkNodes(func, iterable);

  ASTNode* concatMap = makeNode(Node_Name, token->loc);
  addChild(concatMap, 0, "concatMap");
  addChild(concatMap, 1, 9);

  ASTNode* node = makeNode(Node_Call, token->loc);
  addChild(node, 0, concatMap);
  addChild(node, 1, args);
  return node;
}

// ---------------------------------------------------------------------------
// condition can be expression or type check
// when x % 2 == 0
// when x is Bar

ASTNode*
getWhen(Parser* parser) {
  Token* token = getNext(parser, tokSet(Tok_When), defSkip);
  ASTNode* condition = getExpression(parser);
  ASTNode* result = getListComp(parser);

  ASTNode* empty = makeNode(Node_List, token->loc);
  addChild(empty, 0, NULL);

  ASTNode* node = makeNode(Node_Conditional, token->loc);

  addChild(node, 0, condition);
  addChild(node, 1, result);
  addChild(node, 2, empty);
  return node;
}

// ---------------------------------------------------------------------------

ASTNode*
getYield(Parser* parser) {
  Token* token = getNext(parser, tokSet(Tok_Yield), defSkip);
  ASTNode* result = getExpression(parser);

  ASTNode* node = makeNode(Node_List, token->loc);
  addChild(node, 0, result);
  return node;
}

// ---------------------------------------------------------------------------

ASTNode*
getListComp(Parser* parser) {
  if (isNext(parser, tokSet(Tok_For), defSkip)) {
    return getFor(parser);

  } else if (isNext(parser, tokSet(Tok_When), defSkip)) {
    return getWhen(parser);
  }

  return getYield(parser);
}

// ---------------------------------------------------------------------------
// check whether lambda is upcoming (disambiguate between lambda and tuple)
// called in getStatement

bool
isLambda(Parser* parser) {
  // single-param form, example: n => n + 1
  if ( isNextMulti(parser, tokSet(Tok_Name, Tok_Lambda), defSkip)
    || isNextMulti(parser, tokSet(Tok_Blank, Tok_Lambda), defSkip)) {

    return true;
  }

  // looking for form: (a, b, c, ...) => body
  if ( !isNextMulti(parser, tokSet(Tok_LParen, Tok_Name), defSkip)
    && !isNextMulti(parser, tokSet(Tok_LParen, Tok_Blank), defSkip)) {

    return false;
  }

  Token* oldHead = parser->head;
  getNext(parser, tokSet(Tok_LParen), defSkip);
  getNext(parser, tokSet(Tok_Name, Tok_Blank), defSkip);

  while (isNextMulti(parser, tokSet(Tok_Comma, Tok_Name), defSkip)
    || isNextMulti(parser, tokSet(Tok_Comma, Tok_Blank), defSkip)) {

    getNext(parser, tokSet(Tok_Comma), defSkip);
    getNext(parser, tokSet(Tok_Name, Tok_Blank), defSkip);
  }

  // need closing paren and lambda arrow "=>" after params 
  bool result = isNextMulti(parser, tokSet(Tok_RParen, Tok_Lambda), defSkip);

  // restore original index
  parser->head = oldHead;
  return result;
}

// ---------------------------------------------------------------------------
// example single param:
// n => n + 1
// 
// example with multiple parameters:
// (a, b) => a + b

ASTNode*
getLambda(Parser* parser) {
  ASTNode* params;

  if (isNext(parser, tokSet(Tok_LParen), defSkip)) {
    Location loc;
    params = getParenElements(parser, getName, &loc);
  } else {
    params = getName(parser);
  }

  Token* token = getNext(parser, tokSet(Tok_Lambda), defSkip);
  ASTNode* body = getClause(parser);

  ASTNode* node = makeNode(Node_Func, token->loc);

  addChild(node, 0, params);
  addChild(node, 1, body);
  return node;
}

// ---------------------------------------------------------------------------
// expressions can be conditional, switch, list comprehension, lambda,
// or operator expression, cannot be clause (where, with, requires)

ASTNode*
getStatement(Parser* parser) {
  if (isNext(parser, tokSet(Tok_If), defSkip)) {
    return getConditional(parser);

  } else if (isNext(parser, tokSet(Tok_Switch), defSkip)) {
    return getSwitch(parser);

  } else if (isNext(parser, tokSet(Tok_For), defSkip)) {
    return getListComp(parser);

  } else if (isLambda(parser)) {
    return getLambda(parser);
  }

  return getExpression(parser);
}

// ---------------------------------------------------------------------------
// clause
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// example: a + 1 where a = 2
// example: a + b where {a = 1; b = 2}
// example:
// a + b where {
//   a = 1;
//   b = 2;
// }

ASTNode*
getWhere(Parser* parser, ASTNode* body) {
  Token* token = getNext(parser, tokSet(Tok_Where), defSkip);
  // where uses object parser to get statements
  ASTNode* object;

  if (isNext(parser, tokSet(Tok_LBracket), defSkip)) {
    object = getObject(parser);

  } else {
    // get single definition (put into object for consistency)
    ASTNode* def = getDef(parser);

    object = makeNode(Node_Object, def->loc);
    addChild(object, 0, def);
  }

  ASTNode* node = makeNode(Node_Where, token->loc);
  addChild(node, 0, body);
  addChild(node, 1, object);

  return node;
}

// ---------------------------------------------------------------------------
// where clause or requires clause or with clause

ASTNode*
getClause(Parser* parser) {
  ASTNode* value = getStatement(parser);

  while (isNext(parser, tokSet(Tok_Where), defSkip)) {
    value = getWhere(parser, value);
  }
  return value;
}

// ---------------------------------------------------------------------------
// program
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// example: import "path/to/foo.ptls" as foo

ASTNode*
getImport(Parser* parser) {
  Token* token = getNext(parser, tokSet(Tok_Import), defSkip);
  ASTNode* path = getString(parser);

  getNext(parser, tokSet(Tok_As), defSkip);
  ASTNode* name = getName(parser);
  ASTNode* node = makeNode(Node_Import, token->loc);

  addChild(node, 0, path);
  addChild(node, 1, name);
  return node;
}

// ---------------------------------------------------------------------------
// program:
// 
// imports
// ...
// statements

ASTNode*
getProgram(Parser* parser) {
  Token* token = parser->head;

  // imports must come before statements
  ASTNode* imports = NULL;
  while (isNext(parser, tokSet(Tok_Import), defSkip)) {
    imports = linkNodes(imports, getImport(parser));
  }

  ASTNode* defs = NULL;
  while (!isNext(parser, tokSet(Tok_EOF), defSkip)) {
    defs = linkNodes(defs, getDef(parser));

    if (isNext(parser, tokSet(Tok_EOF), defSkip)) {
      break;
    }
    // statements can be seperated by newline or semicolon
    getNext(parser, tokSet(Tok_Newline, Tok_Semicolon), defSkip);
  }

  getNext(parser, tokSet(Tok_EOF), defSkip);

  ASTNode* node = makeNode(Node_Program, token->loc);
  addChild(node, 0, imports);
  addChild(node, 1, defs);
  return node;
}
