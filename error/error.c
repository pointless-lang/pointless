
#include <assert.h>
#include <unistd.h>
#include <string.h>

#include "error.h"

// ---------------------------------------------------------------------------
// contains locations for error messages

ErrorTrace errorTrace;

// ---------------------------------------------------------------------------
// print dotten separator line for error messages

#define numCols 79

void
printDotted(void) {
  for (int n = numCols; n--;) {
    fprintf(stderr, "-");
  }
  fprintf(stderr, "\n");
}

// ---------------------------------------------------------------------------
// print location line / column info along with file name

void
printLocHeader(Location* loc) {
  fprintf(stderr,
    "\nAt (line %d) (column %d)",
    loc->lineNum, loc->colNum
  );
  fprintf(stderr, " in '%s'\n", loc->path);
}

// ---------------------------------------------------------------------------

void
printLocLine(FILE* stream, Location* loc) {
  int lineLen = strcspn(loc->lineChars, "\n");
  fprintf(stream, "%.*s\n", lineLen, loc->lineChars);
}

// ---------------------------------------------------------------------------
// print column pointer for line

void
printLineCaret(FILE* stream, int offset) {
  for (int i = 0; i < offset - 1; i++) {
    fprintf(stream, " ");
  }
  fprintf(stream, "^");
}

// ---------------------------------------------------------------------------
// print locations stored in error trace
// for consecutive locations with the same lineNum from the same file, only
// print the first

void
printLocs(void) {
  int lastLoc = errorTrace.numLocs - 1;
  for (int n = lastLoc; n >= 0; n--) {
    Location* loc = &errorTrace.locs[n];
    printLocHeader(loc);
    printLocLine(stderr, loc);
    printLineCaret(stderr, loc->colNum);
  }
}

// ---------------------------------------------------------------------------

void
errorHeader(char* errType) {
  printDotted();
  fprintf(stderr, "%s:\n\n", errType);
}

// ---------------------------------------------------------------------------

noreturn void
throwError(void) {
  fprintf(stderr, "\n");
  printDotted();
  printLocs();
  fprintf(stderr, "\n");
  _exit(1);
}

// ---------------------------------------------------------------------------

void
pushLocError(Location loc) {
  if (errorTrace.numLocs + 1 < maxLocs) {
    errorTrace.locs[errorTrace.numLocs++] = loc;
  }
}

// ---------------------------------------------------------------------------

void
popLocError(void) {
  assert(errorTrace.numLocs);
  errorTrace.numLocs--;
}
