
#pragma once

#include "annotate.h"
#include "opCodes.h"
#include "../files/files.h"

// ---------------------------------------------------------------------------

typedef struct {
  // instruction argument stored as double to avoid conversion when
  // working with numbers / bools in vm - also works fine for storing
  // small-integer arguments that other instructions use                
  OpCode op;     // type of instruction
  double arg;
  Location* loc; // location of code that inst came from (for error mssg)
  void* handler;
} Instruction;

// ---------------------------------------------------------------------------

int
numInsts(void);

// ---------------------------------------------------------------------------
// get instructions for entire source tree in a single array

Instruction*
compile(FileStruct* file, bool withPrelude);

// ---------------------------------------------------------------------------
// add dispatch code to top-level source file

void
compileDispatch(void);
