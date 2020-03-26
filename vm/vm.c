
#include <assert.h>
#include <string.h>
#include <stdbool.h>
#include <math.h>

#include "vm.h"

#include "../compiler/text.h"
#include "../compiler/lexScope.h"
#include "../compiler/compiler.h"
#include "../compiler/showInstructions.h"
#include "../error/error.h"

// ---------------------------------------------------------------------------

void
checkOutputDef(FileStruct* file) {
  if (!getLexEntry(file->lexScope, "output", 6)) {
    errorHeader("Runtime Error");
    fprintf(stderr, "Top-level source file missing 'output' field");
    pushLocError(file->node->loc);
    throwError();
  }
}

// ---------------------------------------------------------------------------

void
showEnvTrace(void);

// ---------------------------------------------------------------------------
// get top of stack - some commands replace tos value instead of pushing
// and popping (for example a + b) - better performance and shorter code

#define tos (stack[stackInd - 1])

// used for printing command debug information
#define instIndex (inst - base)

// multi-line macro ok here?
#define gotoHandler                            \
  goto *inst->handler;

/*
  ^ move me up there to print instructions!
  showInstruction(inst, instIndex);            \
  if (inst->loc) {                             \
    printLocLine(stdout, inst->loc);           \
    printLineCaret(stdout, inst->loc->colNum); \
    printf("\n");                              \
  }                                            \
  (hack to avoid multi-line comments)
*/

// ---------------------------------------------------------------------------
// include defs and function implementations in headers
// using the preprocessor like this is a mess - but it seems to allow
// the compiler to inline more effectively

#include "ptlsValue.h"
#include "env.h"

Instruction* inst;

// set by savePrelude
Env* prelude;

// set by saveImports
PtlsValue* imports;
int numImports;

// ---------------------------------------------------------------------------

#include "stack.h"
#include "map.h"
#include "bytes.h"
#include "gc.h"

#include "checkType.h"
#include "builtInFieldInds.h"
#include "labelInds.h"
#include "effectHandler.h"
#include "handleBuiltIns.h"

#include "compare.h"
#include "printDebug.h"

// ---------------------------------------------------------------------------

void
showEnvTrace(void) {
  while (callStackInd > 1) {
    Instruction* retInst = popEnv();

    // env for with construct will not have retInst set
    if (!retInst) {
      continue;
    }

    Location* loc = retInst->loc;
    if (!loc) {
      continue;
    }

    // dispatch insts may not have locs set
    pushLocError(*loc);
  }
  if (inst->loc) {
    pushLocError(*inst->loc);
  }
}

// ---------------------------------------------------------------------------

void
run(FileStruct* file) {
  Instruction* base = compile(file, true);

  checkOutputDef(file);

  // annotate instructions with handler pointers for faster dispatch
  for (Instruction* inst = base; inst - base < numInsts(); inst++) {
    switch (inst->op) {
      // case ...: inst->handler = ...; break;
      #include "handlersMap.h"
    }
  }

  initBuiltInFields();
  initLabels();

  // make sure the Empty label interned to 0 index
  assert(strLiteralIndex("Empty") == 0);

  inst = base;

  // set by savePrelude
  prelude = NULL;

  // set by saveImports
  imports = NULL;
  numImports = 0;

  // has to come after other initialization, but before opHandlers defs
  // jump to first instruction handler
  gotoHandler;

  #include "opHandlers.h"
}
