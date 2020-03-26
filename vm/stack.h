
// ---------------------------------------------------------------------------

#define stackSize 1000

int stackInd = 0;
PtlsValue stack[stackSize];

// ---------------------------------------------------------------------------

void
pushValue(PtlsValue value) {
  stack[stackInd++] = value;

  if (stackInd >= stackSize) {
    errorHeader("Runtime Error");
    fprintf(stderr, "Stack overflow");
    showEnvTrace();
    throwError();
  }
}

// ---------------------------------------------------------------------------

PtlsValue
popValue(void) {
  assert(stackInd);
  PtlsValue value = stack[--stackInd];
  return value;
}

// ---------------------------------------------------------------------------

void
printDebug(PtlsValue value);

PtlsValue
popCheck(ValType type) {
  PtlsValue value = popValue();
  
  if(value.type != type) {
    printDebug(value);
  }
  assert(value.type == type);
  return value;
}
