
#include <stdio.h>
#include <assert.h>

#include "showInstructions.h"
#include "text.h"

// ---------------------------------------------------------------------------

char*
getInstStr(OpCode op) {
  switch (op) {
    #include "opStrings.h"

    default:
      assert(false);
  }
}

// ---------------------------------------------------------------------------

void
showInstruction(Instruction* inst, int index) {
  printf("%4d [ %-12s ]", index, getInstStr(inst->op));

  // these ops don't have arguments
  if (inst->op <= Op_UpdateIndex) {
    printf("\n");
    return;
  }

  // print double arg up to 16 characters, aligned to 8 characters
  // (16 chars is around max accurate double decimal count)
  // alignment chosen arbitrarily
  printf(" %-8.16g", inst->arg);

  // show labels for interned strings, names, jumps, and operators
  switch (inst->op) {
    
    case Op_LoadStr: {
      printf("(\"%s\")\n", getText(inst->arg));
      break;
    }

    case Op_MakeLabel:
    case Op_FieldRef:
    case Op_LangFieldRef: {
      printf("(%s)\n", getText(inst->arg));
      break;
    }

    case Op_MakeDef: {
      assert(index); // should have pervious makeNumber inst
      printf("(%s)\n", getText((inst - 1)->arg));
      break;
    }

    case Op_Concat:
    case Op_Jump:
    case Op_JumpIfFalse: {
      printf("(-> %d)\n", index + (int)inst->arg);
      break;
    }

    case Op_SaveVal:
    case Op_LoadLocal:
    case Op_LoadGlobal:
    case Op_LoadPrelude: {
      printf("(");
      // load instructions made in top level of compileProgram won't
      // have instruction locs - have to check
      if (inst->loc) {
        Token* token = inst->loc->token;
        // load that do not correspond to name tokens, (like final
        // load of with clause), will not have Tok_Name as loc tok type
        if (token && token->tokType == Tok_Name) {
          printf("%.*s", token->length, token->chars);
        }
        if (token && token->tokType == Tok_With) {
          printf("$");
        }
        if (token && token->tokType == Tok_For) {
          printf("concatMap");
        }
      }
      printf(")\n");
      break;
    }

    default: {
      printf("\n");
    }
  }
}

// ---------------------------------------------------------------------------

void
showInstructions(Instruction* insts) {
  for (int index = 0; index < numInsts(); index++) {
    showInstruction(&insts[index], index);
  }
}
