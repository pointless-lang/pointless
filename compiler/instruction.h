
#pragma once

#include "../tokenizer/token.h"

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
