
#pragma once
#include <stdnoreturn.h>
#include <stdio.h>

#include "../tokenizer/tokenizer.h"

// ---------------------------------------------------------------------------
// max locs in error trace (limits analyzer depth)
// (might conflict with callStackSize 1000 in vm/env.h)

#define maxLocs 20

typedef struct {
  int numLocs;
  Location locs[maxLocs];
} ErrorTrace;

// ---------------------------------------------------------------------------
// print separator, error type

void
errorHeader(char* errType);

// ---------------------------------------------------------------------------
// find and print original line in source

void
printLocLine(FILE* stream, Location* loc);

// ---------------------------------------------------------------------------
// print separator, trace locations, exit program

noreturn void
throwError(void);

// ---------------------------------------------------------------------------
// add error location to trace

void
pushLocError(Location loc);

// ---------------------------------------------------------------------------
// remove most recent location from trace

void
popLocError(void);
