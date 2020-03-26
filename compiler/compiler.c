
#include <assert.h>
#include <string.h>
#include <libgen.h>
#include <ctype.h>

#include "compiler.h"
#include "lexScope.h"
#include "text.h"

#include "../parser/parser.h"
#include "../parser/convertNum.h"
#include "../error/error.h"

// ---------------------------------------------------------------------------

#define maxInsts 100000

Instruction insts[maxInsts];
int instIndex = 0;

// ---------------------------------------------------------------------------

Instruction*
getInsts(void) {
  return insts;
}

// ---------------------------------------------------------------------------

int
numInsts(void) {
  return instIndex;
}

// ---------------------------------------------------------------------------
// location of current node being used to generate instructions
// (location pointer gets stored in each new instruction)

Location* nodeLoc;

int
makeInstruction(OpCode op, double arg) {
  assert(instIndex < maxInsts - 1); // minus one for zero indexing
  insts[instIndex] = (Instruction){op, arg, nodeLoc, NULL};
  return instIndex++;
}

// ---------------------------------------------------------------------------
// set jump (relative index) to jump to next instruction index
// takes index of jump instruction to update
// (many compiler routines generate a jump inst then set its argument
// once the instructions to jump past have been generated)

void
jumpOffset(int jmpInd) {
  int relIndex = instIndex - jmpInd;
  insts[jmpInd].arg = relIndex;
}

// ---------------------------------------------------------------------------
// convert each jump instruction in a series of jumps which leads to a 
// return instruction to return instructions
//
// makes code more efficient, but more imporantly it allows the vm
// to detect tail-calls in structures like conditional
//
// example: foo(n) = if n == 0 then "zero" else "non-zero"
//
// 17 [ Equals       ]
// 18 [ JumpIfFalse  ] 3       
// 19 [ LoadStr      ] 6       ("zero")
// 20 [ Jump         ] 2       (-> 22)
// 21 [ LoadStr      ] 11      ("non-zero")
// 22 [ Return       ]
//
// becomes: 
//
// 17 [ Equals       ]
// 18 [ JumpIfFalse  ] 3       
// 19 [ LoadStr      ] 6       ("zero")
// 20 [ Return       ]
// 21 [ LoadStr      ] 11      ("non-zero")
// 22 [ Return       ]

void
convertJumps(void) {
  // go in reverse so that conversion is propagted back up sequences
  // of jumps (all jump instructions should be forward jumps except for
  // jumps to import defs, which won't be important to convert for tco)
  for (int ind = instIndex - 1; ind; ind--) {
    // use pointer to allow for mutation
    Instruction* inst = &insts[ind];

    int jmpInd = ind + (int)inst->arg;
    if (inst->op == Op_Jump && insts[jmpInd].op == Op_Return) {
      inst->op = Op_Return;
      inst->arg = 0;
    }
  }
}

// ---------------------------------------------------------------------------
// for a node that introduces a scope, generate instructions to load
// upvalues needed for the scope, make the scope, and save upvalues
//
// example: captures local at index 0 to env with 1 local, 1 upvalue
// 7 [ LoadLocal    ] 0       
// 8 [ MakeEnv      ] 2       
// 9 [ SaveVal      ] 1

void
saveUpValsReversed(LexEntry* upVal) {
  // save upVals in reverse order
  if (!upVal) {
    return;
  }
  saveUpValsReversed(upVal->next);
  makeInstruction(Op_SaveVal, upVal->index);
}

void
compileEnv(ASTNode* node) {
  LexEntry* upVal = getNonLocals(node->scope);
  while (upVal) {
    // should never be global, since globals shouldn't have to be captured
    makeInstruction(Op_LoadLocal, upVal->upIndex);
    upVal = upVal->next;
  }

  int numDefs = node->scope->numLocals + node->scope->numNonLocals;
  makeInstruction(Op_MakeEnv, numDefs);

  upVal = getNonLocals(node->scope);
  // get pushed in forward order, so have to pop in reverse
  saveUpValsReversed(upVal);
}

// ---------------------------------------------------------------------------
// need forward decl for mutual recursion with compile

void
compileNode(ASTNode* node);

// ---------------------------------------------------------------------------

int
compileFile(FileStruct* file) {
  annotate(file, false); // don't log annotations
  compileNode(file->node);
  convertJumps();
  return instIndex;
}

// ---------------------------------------------------------------------------
// dispatch sequence
//
// 11 [ FieldRef     ] 6       (output)
// 12 [ Jump         ] 6       (-> 18)
// 13 [ Dup          ]
// 14 [ LangFieldRef ] 13      (!getHead)
// 15 [ Pop          ] 1       
// 16 [ Jump         ] 2       (-> 18)
// 17 [ LangFieldRef ] 22      (!getTail)
// 18 [ Dispatch     ]

Instruction*
compile(FileStruct* file, bool withPrelude) {
  if (withPrelude) {
    compileFile(getPrelude());
    makeInstruction(Op_SavePrelude, 0);
    makeInstruction(Op_PopEnv, 0);
  }

  annotate(file, false);

  FileStruct* source = getImports();
  int numImports = 0;

  // file should be last in imports list 
  while (source != file) {
    source->index = numImports++;
    compileFile(source);
    makeInstruction(Op_MakeObj, 0);
    makeInstruction(Op_PopEnv, 0);

    source = source->next;
    assert(source);
  }

  // file should be last in imports list 
  assert(!source->next);

  makeInstruction(Op_SaveImports, numImports);

  compileFile(file);
  makeInstruction(Op_MakeObj, 0);
  makeInstruction(Op_FieldRef, strLiteralIndex("output"));

  makeInstruction(Op_Jump, 6);
  // dispatch jumps back to getTail inst to evaluate output list

  makeInstruction(Op_Dup, 0);
  makeInstruction(Op_LangFieldRef, strLiteralIndex("!getHead"));
  makeInstruction(Op_Pop, 1);
  makeInstruction(Op_Jump, 2);

  makeInstruction(Op_LangFieldRef, strLiteralIndex("!getTail"));

  makeInstruction(Op_Dispatch, 0);
  return insts;
}

// ---------------------------------------------------------------------------
// generate instructions for child node at a given child index 

void
compileChild(ASTNode* node, int index) {
  compileNode(getChildNode(node, index));
}

// ---------------------------------------------------------------------------
// generate instructions for list of children nodes at a given child index
// return length of the child node list (so that instructions like
// Op_MakeArray know how many child elements to pop)

int
compileChildren(ASTNode* node, int index) {
  ASTNode* child = getChildNode(node, index);
  int numChildren = 0;
  while (child) {
    compileNode(child);
    child = child->next;
    numChildren++;
  }
  return numChildren;
}

// ---------------------------------------------------------------------------
// example compiler output in comments may be outdated / inaccurate

// ---------------------------------------------------------------------------
// example: [1 2 3]
//
// 4 [ MakeNumber   ] 1       
// 5 [ MakeNumber   ] 2       
// 6 [ MakeNumber   ] 3       
// 7 [ MakeArray    ] 3

void
compileNodeArray(ASTNode* node) {
  int numChildren = compileChildren(node, 0); // elems
  makeInstruction(Op_MakeArray, numChildren);
}

// ---------------------------------------------------------------------------
// example: 1 + 2
//
// 4 [ MakeNumber   ] 1       
// 5 [ MakeNumber   ] 2       
// 6 [ Add          ]
//
// example: a ++ b
//
//  5 [ LoadGlobal   ] 1       (a)
//  6 [ Dup          ]
//  7 [ ResolveList  ]
//  8 [ Concat       ]
//  9 [ Jump         ] 4       (-> 13)
// 10 [ LoadGlobal   ] 2       (b)
// 11 [ SaveTail     ]
// 12 [ Return       ]
//
//
// example: true and 123 == 4
//
//  5 [ LoadBool     ] 1       
//  6 [ And          ]
//  7 [ Jump         ] 4       (-> 12)
//  8 [ MakeNumber   ] 123     
//  9 [ MakeNumber   ] 4       
// 10 [ Equals       ]
// 11 [ CheckBool    ] true

void
compileNodeBinaryOp(ASTNode* node) {
  TokenType opTok = node->children[0];
  compileChild(node, 1); // lhs

  // concat handled as special case to eval lhs list
  if (opTok == Tok_Concat) { 

    // make duplicate for resolveList to process
    makeInstruction(Op_Dup, 0);
    // evaluate all entries in dup list (list should be finite for concat)
    // (eval updates values in the original list as well)
    makeInstruction(Op_ResolveList, 0);

    makeInstruction(Op_Concat, 0);
    int jmpInd = makeInstruction(Op_Jump, 0);
    compileChild(node, 2); // rhs
    makeInstruction(Op_SaveTail, 0);
    makeInstruction(Op_Return, 0);
    jumpOffset(jmpInd);

  } else if (opTok == Tok_And || opTok == Tok_Or) {
    // handle these ops separately to accomodate short circuit eval
    OpCode op = opTok == Tok_And ? Op_And : Op_Or;
    makeInstruction(op, 0);
    // jump past operand instructions to avoid executing right away
    int jmpInd = makeInstruction(Op_Jump, 0);

    // op will save this index (second after Op_Concat inst)
    compileChild(node, 2); // rhs
    makeInstruction(Op_CheckBool, opTok == Tok_And);
    jumpOffset(jmpInd); // don't need return, unlike concat

  } else {
    OpCode op;
    switch (opTok) {
      case Tok_Sub:         op = Op_Sub; break;
      case Tok_Mul:         op = Op_Mul; break;
      case Tok_Div:         op = Op_Div; break;
      case Tok_LessThan:    op = Op_LessThan; break;
      case Tok_LessEq:      op = Op_LessEq; break;
      case Tok_GreaterThan: op = Op_GreaterThan; break;
      case Tok_GreaterEq:   op = Op_GreaterEq; break;
      case Tok_Add:         op = Op_Add; break;
      case Tok_Mod:         op = Op_Mod; break;
      case Tok_Pow:         op = Op_Pow; break;
      case Tok_Equals:      op = Op_Eq; break;
      case Tok_NotEq:       op = Op_NotEq; break;
      case Tok_In:          op = Op_In; break;
      case Tok_Is:          op = Op_Is; break;

      default: assert(false);
    }

    compileChild(node, 2); // rhs
    makeInstruction(op, 0);
  }
}

// ---------------------------------------------------------------------------
// bool stored as double

void
compileNodeBool(ASTNode* node) {
  makeInstruction(Op_LoadBool, node->children[0]);
}

// ---------------------------------------------------------------------------
// example: add(1, 2)
//
// 4 [ MakeNumber   ] 1       
// 5 [ MakeNumber   ] 2       
// 6 [ LoadGlobal   ] 28      
// 7 [ Call         ] 2  

void
compileNodeCall(ASTNode* node) {
  int numArgs = compileChildren(node, 1);
  compileChild(node, 0);
  makeInstruction(Op_Call, numArgs);
}

// ---------------------------------------------------------------------------
// cast becomes type assertion at run-time
//
// example: x as PtlsNumber
//
// 14 [ LoadGlobal   ] 103     
// 15 [ Dup          ]
// 16 [ MakeLabel    ] 4       
// 17 [ Is           ]
// 18 [ Require      ]  

void
compileNodeCast(ASTNode* node) {
  compileChild(node, 0);
  makeInstruction(Op_Dup, 0); // copy gets popped in by "is"
  compileChild(node, 1);
  makeInstruction(Op_Is, 0);
  makeInstruction(Op_Require, 0);
}

// ---------------------------------------------------------------------------
// example: if val then "true" else "false"
//
// 10 [ LoadGlobal   ] 103     
// 11 [ JumpIfFalse  ] 3       
// 12 [ LoadStr      ] 6       ("true")
// 13 [ Jump         ] 2       (-> 15)
// 14 [ LoadStr      ] 11      ("false")

void
compileNodeConditional(ASTNode* node) {
  compileChild(node, 0);
  int falseJmpInd = makeInstruction(Op_JumpIfFalse, 0);

  compileChild(node, 1);
  int trueJmpInd = makeInstruction(Op_Jump, 0);

  jumpOffset(falseJmpInd);
  compileChild(node, 2);

  jumpOffset(trueJmpInd);
}

// ---------------------------------------------------------------------------
// example: x = 123
//
// 1 [ MakeNumber   ] 0       
// 2 [ MakeDef      ] 103     ("x")
// 3 [ Jump         ] 4       (-> 7)
// 4 [ MakeNumber   ] 123     
// 5 [ SaveVal      ] 103     
// 6 [ Return       ]

void
compileNameDef(ASTNode* name, ASTNode* rhs) {
  // load number for def name index (used when accessing fields)
  // really only needed for object types, but do it all defs for uniformity
  makeInstruction(Op_MakeNumber, internStr(name)); 
  // makeDef will save this index (second after Op_MakeDef inst)
  // as inst to jump to when evaluating def
  makeInstruction(Op_MakeDef, name->index);
  // jump over def instructions
  int jmpInd = makeInstruction(Op_Jump, 0);
  compileNode(rhs);

  // saveVal stores the computed value in the env
  // thus each def only has its value computed once
  makeInstruction(Op_SaveVal, name->index);
  // when var lookup triggers evaluation, have to return back to calling
  // instruction afterwards - var lookup inst gets re-run, but this time
  // (new env is generated for eval upon lookup)
  // the def entry will have the value computed - should not trigger re-eval
  makeInstruction(Op_Return, 0);
  // jump past def instructions to avoid immediate evaluation
  jumpOffset(jmpInd);
}

// ---------------------------------------------------------------------------
// all names in tuple def get daisy-chained together through jumps, all
// jump to the same instruction upon name lookup - eval of any name results
// in eval and storage of all names in tuple def at once

// example: (a, b, c) = x
//
// 10 [ MakeNumber   ] 13      
// 11 [ MakeDef      ] 1       (a)
// 12 [ Jump         ] 2       (-> 14)
// 13 [ Jump         ] 4       (-> 17)
// 14 [ MakeNumber   ] 15      
// 15 [ MakeDef      ] 2       (b)
// 16 [ Jump         ] 2       (-> 18)
// 17 [ Jump         ] 4       (-> 21)
// 18 [ MakeNumber   ] 17      
// 19 [ MakeDef      ] 3       (c)
// 20 [ Jump         ] 7       (-> 27)
// 21 [ LoadGlobal   ] 4       (x)
// 22 [ Destructure  ] 3       
// 23 [ SaveVal      ] 1       ()
// 24 [ SaveVal      ] 2       ()
// 25 [ SaveVal      ] 3       ()
// 26 [ Return       ]
//
// example: (a, _, c) = x
//
// 10 [ MakeNumber   ] 13      
// 11 [ MakeDef      ] 1       (a)
// 12 [ Jump         ] 2       (-> 14)
// 13 [ Jump         ] 4       (-> 17)
// 14 [ Jump         ] 2       (-> 16)
// 15 [ Jump         ] 1       (-> 16)
// 16 [ Jump         ] 2       (-> 18)
// 17 [ Jump         ] 4       (-> 21)
// 18 [ MakeNumber   ] 15      
// 19 [ MakeDef      ] 2       (c)
// 20 [ Jump         ] 7       (-> 27)
// 21 [ LoadGlobal   ] 3       (x)
// 22 [ Destructure  ] 3       
// 23 [ SaveVal      ] 1       ()
// 24 [ Pop          ] 1       
// 25 [ SaveVal      ] 2       ()
// 26 [ Return       ]

int
compileTupleDefs(ASTNode* member) {
  while (member) {
    if (member->nodeType != Node_Blank) {
      // make def entries for each name member
      makeInstruction(Op_MakeNumber, internStr(member)); 
      makeInstruction(Op_MakeDef, member->index);

    } else {
      // silly hack to keep daisy-chain parity across blank name members
      // want to jump to next jump 2 inst (for setting up defs)
      makeInstruction(Op_Jump, 2); // should always be reached
      makeInstruction(Op_Jump, 1); // should never be reached
    }

    if (member->next) {
      // if this isn't the last name member, daisy-chain jumps:
      // for definition, jump to next name definition
      makeInstruction(Op_Jump, 2);
      // for evaluation, jump to eval inst of next member until the
      // instructions for all members is reached (in the def the last name)
      makeInstruction(Op_Jump, 4);

    } else {
      // return index of jump inst for final name definition
      return makeInstruction(Op_Jump, 0);
    }

    member = member->next;
  }
  
  // should always return from loop after last member 
  assert(false);
}

// ---------------------------------------------------------------------------
// make instructions to pull out values of each tuple member an save in
// corresponding name defs

void
compileTupleSaves(ASTNode* members) {
  int numMembers = countNodes(members);
  makeInstruction(Op_Destructure, numMembers);
  while (members) {
    if (members->nodeType == Node_Blank) {
      makeInstruction(Op_Pop, 1);

    } else {
      makeInstruction(Op_SaveVal, members->index);
    }

    members = members->next;
  }
}

// ---------------------------------------------------------------------------

void
compileNodeDef(ASTNode* node) {
  ASTNode* lhs = getChildNode(node, 0);
  ASTNode* rhs = getChildNode(node, 1);

  if (lhs->nodeType == Node_Name) {
    compileNameDef(lhs, rhs);

  } else if (lhs->nodeType == Node_Tuple) {
    int jmpInd = compileTupleDefs(getChildNode(lhs, 0));

    // load entire tuple values
    compileChild(node, 1);
    // load entire tuple values
    compileTupleSaves(getChildNode(lhs, 0));
    makeInstruction(Op_Return, 0);

    jumpOffset(jmpInd);

  } else {
    assert(lhs->nodeType == Node_Blank);
  }
}

// ---------------------------------------------------------------------------
// example: x = y.foo
//
// 18 [ LoadGlobal   ] 103     
// 19 [ FieldRef     ] 2       ("foo")

// example: x = false.!getInt
//
// 4 [ LoadBool     ] 0       
// 5 [ LangFieldRef ] 8 

void
compileNodeFieldRef(ASTNode* node) {
  compileChild(node, 0);
  ASTNode* field = getChildNode(node, 1);

  char* fieldChars = (char*)field->children[0];
  int fieldLength = field->children[1];

  if (fieldChars[0] == '!') {
    // getArray needs extra instructions to evaluate all items in list
    // since list might not have evaluated tail fully yet
    if (fieldLength == 9 && strncmp(fieldChars, "!getArray", 9) == 0) {
      makeInstruction(Op_Dup, 0);
      makeInstruction(Op_ResolveList, 0);
    }

    makeInstruction(Op_LangFieldRef, internStr(field));

  } else {
    // have to access / update fields in terms of string
    // to allow for polymorphism
    makeInstruction(Op_FieldRef, internStr(field));
  }
}

// ---------------------------------------------------------------------------
// example: foo(a, b) = a + c
//
// 11 [ MakeEnv      ] 2       
// 12 [ MakeFunc     ] 2       
// 13 [ Jump         ] 5       (-> 18)
// 14 [ LoadLocal    ] 0       
// 15 [ LoadLocal    ] 1       
// 16 [ Add          ]
// 17 [ Return       ]

void
compileNodeFunc(ASTNode* node) {
  // make new env for func
  compileEnv(node);

  ASTNode* params = getChildNode(node, 0);
  // func needs to know how many args to pop when it runs
  makeInstruction(Op_MakeFunc, countNodes(params));
  // jump over func body to avoid immediate evaluation
  int jmpInd = makeInstruction(Op_Jump, 0);
  compileChild(node, 1);
  // pop func env, return to instruction after calling instruction
  makeInstruction(Op_Return, 0);

  jumpOffset(jmpInd);
  // after func is created, func loop env, return to original env
  // (don't use return inst, since we want to go on to the next inst)
  makeInstruction(Op_PopEnv, 0);
}

// ---------------------------------------------------------------------------
// example: import "tests/compiler/number.test" as num
//
// 0 [ MakeEnv      ] 1       
// 1 [ MakeNumber   ] 0       
// 2 [ MakeDef      ] 0       ("x")
// 3 [ Jump         ] 4       (-> 7)
// 4 [ MakeNumber   ] 123     
// 5 [ SaveVal      ] 0       
// 6 [ Return       ]
// 7 [ MakeObj      ]
// 8 [ PopEnv       ]

void
compileNodeImport(ASTNode* node) {
  ASTNode* pathNode = getChildNode(node, 0);
  ASTNode* name = getChildNode(node, 1);

  char* path = (char*)pathNode->children[0];
  int length = pathNode->children[1];
  
  // need path relative to current source file
  FileStruct* file = getFileRelative(node->loc.path, path, length);
  
  // standard instructions for name def
  makeInstruction(Op_MakeNumber, internStr(name));
  makeInstruction(Op_MakeDef, name->index);
  int jmpInd = makeInstruction(Op_Jump, 0);

  // code for import generated in compileNodeProgram - saved at file->index
  // loadImport loads import object from given index (gets export if present)
  makeInstruction(Op_LoadImport, file->index);

  makeInstruction(Op_SaveVal, name->index);
  makeInstruction(Op_Return, 0);
  jumpOffset(jmpInd);
}

// ---------------------------------------------------------------------------
// example: x = y[0]
//
// 13 [ MakeNumber   ] 0       
// 14 [ LoadGlobal   ] 0       
// 15 [ Index        ]

void
compileNodeIndex(ASTNode* node) {
  compileChild(node, 1); // index
  compileChild(node, 0); // lhs
  makeInstruction(Op_Index, 0);
}

// ---------------------------------------------------------------------------

void
compileNodeLabel(ASTNode* node) {
  makeInstruction(Op_MakeLabel, internStr(node));
}

// ---------------------------------------------------------------------------
// example: x = [1, 2, 3]
//
//  5 [ MakeCons     ]
//  6 [ Jump         ] 24      (-> 30)
//  7 [ Jump         ] 4       (-> 11)
//  8 [ MakeNumber   ] 1       
//  9 [ SaveHead     ]
// 10 [ Return       ]
// 11 [ MakeCons     ]
// 12 [ Jump         ] 16      (-> 28)
// 13 [ Jump         ] 4       (-> 17)
// 14 [ MakeNumber   ] 2       
// 15 [ SaveHead     ]
// 16 [ Return       ]
// 17 [ MakeCons     ]
// 18 [ Jump         ] 8       (-> 26)
// 19 [ Jump         ] 4       (-> 23)
// 20 [ MakeNumber   ] 3       
// 21 [ SaveHead     ]
// 22 [ Return       ]
// 23 [ MakeLabel    ] 0       (Empty)
// 24 [ SaveTail     ]
// 25 [ Return       ]
// 26 [ SaveTail     ]
// 27 [ Return       ]
// 28 [ SaveTail     ]
// 29 [ Return       ]

void
compileTail(ASTNode* child) {
  if (!child) {
    makeInstruction(Op_MakeLabel, strLiteralIndex("Empty"));
    return;
  }

  makeInstruction(Op_MakeCons, 0);
  int endInd = makeInstruction(Op_Jump, 0);
  int tailInd = makeInstruction(Op_Jump, 0);
  compileNode(child);
  makeInstruction(Op_SaveHead, 0);
  makeInstruction(Op_Return, 0);

  jumpOffset(tailInd);
  compileTail(child->next);
  makeInstruction(Op_SaveTail, 0);
  makeInstruction(Op_Return, 0);
  jumpOffset(endInd);
}

void
compileNodeList(ASTNode* node) {
  ASTNode* children = getChildNode(node, 0);
  compileTail(children);
}

// example: x = {1: "asdf", 2: false}
// ---------------------------------------------------------------------------
//
// 5 [ MakeNumber   ] 1       
// 6 [ LoadStr      ] 2       ("")
// 7 [ MakeNumber   ] 2       
// 8 [ LoadBool     ] 0       
// 9 [ MakeMap      ] 2   

void
compileNodeMap(ASTNode* node) {
  int numChildren = compileChildren(node, 0);
  makeInstruction(Op_MakeMap, numChildren);
}

// ---------------------------------------------------------------------------  

void
compileNodeName(ASTNode* node) {
  if (node->access == Access_Local) {
    makeInstruction(Op_LoadLocal, node->index);

  } else if (node->access == Access_Global) {
    makeInstruction(Op_LoadGlobal, node->index);

  } else {
    makeInstruction(Op_LoadPrelude, node->index);
  }
}

// ---------------------------------------------------------------------------

void
compileNodeNumber(ASTNode* node) {
  // nodes store children as int (to accomodate pointers) - have to convert
  makeInstruction(Op_MakeNumber, toDouble(node->children[0]));
}

// ---------------------------------------------------------------------------

void
compileNodeObject(ASTNode* node) {
  compileEnv(node);
  compileChildren(node, 0);
  makeInstruction(Op_MakeObj, 0);
  makeInstruction(Op_PopEnv, 0);
}

// ---------------------------------------------------------------------------

void
compileNodePair(ASTNode* node) {
  compileChild(node, 0); // key
  compileChild(node, 1); // val
}

// ---------------------------------------------------------------------------

void
compileNodeProgram(ASTNode* node) {
  compileEnv(node);
  compileChildren(node, 0);
  compileChildren(node, 1);
}

// ---------------------------------------------------------------------------
// example: x requires y
//
// 5 [ LoadGlobal   ] 1       
// 6 [ Require      ]
// 7 [ LoadGlobal   ] 2

void
compileNodeRequires(ASTNode* node) {
  compileChild(node, 1);
  makeInstruction(Op_Require, 0);
  compileChild(node, 0);
}

// ---------------------------------------------------------------------------

void
compileNodeSet(ASTNode* node) {
  int numChildren = compileChildren(node, 0);
  makeInstruction(Op_MakeSet, numChildren);
}

// ---------------------------------------------------------------------------
// example: ["foo", "bar", "foo"]
//
// 5 [ LoadStr      ] 2       ("foo")
// 6 [ LoadStr      ] 6       ("bar")
// 7 [ LoadStr      ] 2       ("foo")
// 8 [ MakeList     ] 3 

void
compileNodeString(ASTNode* node) {
  makeInstruction(Op_LoadStr, internStr(node));
}

// ---------------------------------------------------------------------------

void
compileNodeTuple(ASTNode* node) {
  int numChildren = compileChildren(node, 0);
  makeInstruction(Op_MakeTuple, numChildren);
}

// ---------------------------------------------------------------------------

void
compileNodeUnaryOp(ASTNode* node) {
  OpCode op;
  switch (node->children[0]) {
    case Tok_Neg: op = Op_Neg; break;
    case Tok_Not: op = Op_Not; break;

    default: assert(false);
  }
  compileChild(node, 1); // operand
  makeInstruction(op, 0);
}

// ---------------------------------------------------------------------------
// example: b where b = 2
//
//  5 [ MakeEnv      ] 1       
//  6 [ MakeNumber   ] 2       
//  7 [ MakeDef      ] 0       ("b")
//  8 [ Jump         ] 4       (-> 12)
//  9 [ MakeNumber   ] 2       
// 10 [ SaveVal      ] 0       
// 11 [ Return       ]
// 12 [ LoadLocal    ] 0       
// 13 [ PopEnv       ]

void
compileNodeWhere(ASTNode* node) {
  ASTNode* obj = getChildNode(node, 1);
  compileEnv(node);
  compileChildren(obj, 0);
  compileChild(node, 0);
  makeInstruction(Op_PopEnv, 0);
}

// ---------------------------------------------------------------------------
// example: 
//
// y = {bar = false} with {
//   $.bar[1] = 4
//   $.bar = [1 2 3]
// }

//  5 [ MakeEnv      ] 1       
//  6 [ MakeNumber   ] 8       
//  7 [ MakeDef      ] 0       (bar)
//  8 [ Jump         ] 4       (-> 12)
//  9 [ LoadBool     ] 0       
// 10 [ SaveVal      ] 0       (bar)
// 11 [ Return       ]
// 12 [ MakeObj      ]
// 13 [ PopEnv       ]
// 14 [ MakeEnv      ] 1       
// 15 [ SaveVal      ] 0       ($)
// 16 [ MakeNumber   ] 4       
// 17 [ LoadLocal    ] 0       ()
// 18 [ FieldRef     ] 8       (bar)
// 19 [ MakeNumber   ] 1       
// 20 [ UpdateIndex  ]
// 21 [ MakeNumber   ] 1       
// 22 [ MakeNumber   ] 2       
// 23 [ MakeNumber   ] 3       
// 24 [ MakeArray    ] 3       
// 25 [ LoadLocal    ] 0       ()
// 26 [ UpdateField  ] 8       
// 27 [ LoadLocal    ] 0       ($)

void
compileWithUpdate(ASTNode* update) {
  ASTNode* lhs = getChildNode(update, 0);
  compileChild(lhs, 0); // lhs of lhs

  if (lhs->nodeType == Node_Index) {
    compileChild(lhs, 1);
    makeInstruction(Op_UpdateIndex, 0);

  } else {
    assert(lhs->nodeType == Node_FieldRef);
    ASTNode* fieldName = getChildNode(lhs, 1);
    makeInstruction(Op_UpdateField, internStr(fieldName));
  }
}

void
compileWithRHSReversed(ASTNode* update) {
  if (!update) {
    return;
  }
  compileWithRHSReversed(update->next);
  compileChild(update, 1); // compile rhs
}

void
compileNodeWith(ASTNode* node) {
  compileChild(node, 0);

  // make new env for updates - node should be annotated to make 1 def slot
  compileEnv(node);
  // save starting value in env
  // storing / updating working value in env makes things much simpler
  makeInstruction(Op_SaveVal, 0);

  ASTNode* updates = getChildNode(node, 1);
  // evaluate all rhs values before object is updated
  // allows for values being swapped (a with {$[0] = a[1]; $[1] = a[0]})
  compileWithRHSReversed(updates);

  updates = getChildNode(node, 1);
  while (updates) {
    compileWithUpdate(updates);
    updates = updates->next;
  }

  // load updated value from env
  makeInstruction(Op_LoadLocal, 0);
  makeInstruction(Op_PopEnv, 0);
}

// ---------------------------------------------------------------------------

void
compileNode(ASTNode* node) {
  // save parent loc
  Location* oldNodeLoc = nodeLoc;
  // set loc to that of current node in tree
  nodeLoc = &node->loc;
  switch (node->nodeType) {
    case Node_Array:       compileNodeArray(node); break;
    case Node_BinaryOp:    compileNodeBinaryOp(node); break;
    case Node_Bool:        compileNodeBool(node); break;
    case Node_Call:        compileNodeCall(node); break;
    case Node_Conditional: compileNodeConditional(node); break;
    case Node_Def:         compileNodeDef(node); break;
    case Node_FieldRef:    compileNodeFieldRef(node); break;
    case Node_Func:        compileNodeFunc(node); break;
    case Node_Import:      compileNodeImport(node); break;
    case Node_Index:       compileNodeIndex(node); break;
    case Node_Label:       compileNodeLabel(node); break;
    case Node_List:        compileNodeList(node); break;
    case Node_Map:         compileNodeMap(node); break;
    case Node_Name:        compileNodeName(node); break;
    case Node_Number:      compileNodeNumber(node); break;
    case Node_Object:      compileNodeObject(node); break;
    case Node_Pair:        compileNodePair(node); break;
    case Node_Program:     compileNodeProgram(node); break;
    case Node_Requires:    compileNodeRequires(node); break;
    case Node_Set:         compileNodeSet(node); break;
    case Node_String:      compileNodeString(node); break;
    case Node_Tuple:       compileNodeTuple(node); break;
    case Node_UnaryOp:     compileNodeUnaryOp(node); break;
    case Node_Where:       compileNodeWhere(node); break;
    case Node_With:        compileNodeWith(node); break;

    default: assert(false);
  }
  // restore to original parent node after child traversal is complete
  nodeLoc = oldNodeLoc;
}
