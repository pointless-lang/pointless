
bool
effectHandlerTuple(int labelInd, TupleRef* ref) {
  if (ref->length != 1) {
    errorHeader("Type Error");
    fprintf(stderr,
      "Expected single wrapped value, got '%d' values", ref->length);
    showEnvTrace();
    throwError();
  }

  PtlsValue member = ref->members[0];

  if (labelInd == strLiteralIndex("IOPrint")) {
    checkType("VM handler for IOPrint", Val_String, member);
    printf("%s", getRef(member, stringRef)->bytes);
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------

bool
effectHandlerLabel(int labelInd) {
  if (labelInd == strLiteralIndex("IOClearConsole")) {
    system("clear");
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------

void
runCommand(PtlsValue value) {
  bool isValid = false;
  int labelInd;

  switch (value.type) {
    case Val_Tuple: {
      TupleRef* tupleRef = getRef(value, tupleRef);
      labelInd = tupleRef->label.value;
      isValid = effectHandlerTuple(labelInd, tupleRef);
      break;
    }

    case Val_Label: {
      labelInd = value.value;
      isValid = effectHandlerLabel(labelInd);
      break;
    }

    default: {
      errorHeader("Type Error");
      fprintf(stderr,
        "Invalid VM command type '%s'", getTypeStr(value.type));
      showEnvTrace();
      throwError();
    }
  }

  if (!isValid) {
    errorHeader("Type Error");
    fprintf(stderr, "Invalid VM command '%s'", getText(labelInd));
    showEnvTrace();
    throwError();
  }
}
