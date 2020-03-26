
void
checkType(char* handler, ValType type, PtlsValue value) {
  if (value.type != type) {
    errorHeader("Type Error");
    fprintf(stderr,
      "%s expected type '%s', got type '%s'",
      handler, getTypeStr(type), getTypeStr(value.type));
    showEnvTrace();
    throwError();
  }
}

// ---------------------------------------------------------------------------

#define checkTOS(handler, type) \
  assert(stackInd);             \
  checkType(handler, type, tos);

// ---------------------------------------------------------------------------

void
throwFieldError(char* field, PtlsValue value) {
  errorHeader("Type Error");
  fprintf(stderr,
    "Type '%s' has not field '%s'", getTypeStr(value.type), field);
  showEnvTrace();
  throwError();
}
