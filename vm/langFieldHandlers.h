
if (inst->arg == getAddElemInd) {
  if (tos.type == Val_Set) {
    PtlsValue value = popCheck(Val_Set);
    pushValue(makeBuiltIn(getAddElemInd, value));
    inst++;
    gotoHandler;
  }
}

// -------------------------------------------------------------------------

if (inst->arg == getZerosInd) {
  int  arrayLabelInd = strLiteralIndex("PtlsArray");
  if (tos.type == Val_Label && tos.value == arrayLabelInd) {
    PtlsValue value = popCheck(Val_Label);
    pushValue(makeBuiltIn(getZerosInd, value));
    inst++;
    gotoHandler;
  }
}

// -------------------------------------------------------------------------

if (inst->arg == getDelElemInd) {
  if (tos.type == Val_Set) {
    PtlsValue value = popCheck(Val_Set);
    pushValue(makeBuiltIn(getDelElemInd, value));
    inst++;
    gotoHandler;
  }
}

// -------------------------------------------------------------------------

if (inst->arg == getDelKeyInd) {
  if (tos.type == Val_Map) {
    PtlsValue value = popCheck(Val_Map);
    pushValue(makeBuiltIn(getDelKeyInd, value));
    inst++;
    gotoHandler;
  }
}

// -------------------------------------------------------------------------

if (inst->arg == getFloatInd && tos.type == Val_String) {
  PtlsValue value = popCheck(Val_String);
  StringRef* ref = getRef(value, stringRef);

  char* endPtr;
  PtlsValue result = makeNumber(0);
  result.value = strtod(ref->bytes, &endPtr);

  if (!ref->numBytes || endPtr != ref->bytes + ref->numBytes) {
    errorHeader("Conversion Error");
    fprintf(stderr,
      "Can't convert string \"%s\" to float", ref->bytes);
    showEnvTrace();
    throwError();
  }

  pushValue(result);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getFloatInd && tos.type == Val_Bool) {
  // bool already stores true / false as 1 / 0
  tos.type = Val_Number;
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getFloatInd && tos.type == Val_Number) {
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getHeadInd && tos.type == Val_Cons) {
  ConsRef* ref = getRef(tos, consRef);

  if (ref->head.hasValue) {
    popCheck(Val_Cons);
    pushValue(ref->head.value);
    inst++;
    gotoHandler;
  }

  pushEnv(ref->head.env, inst);
  inst = ref->head.inst;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getIntInd && tos.type == Val_String) {
  PtlsValue value = popCheck(Val_String);
  StringRef* ref = getRef(value, stringRef);

  char* endPtr;
  PtlsValue result = makeNumber(0);
  result.value = strtol(ref->bytes, &endPtr, 10);

  if (!ref->numBytes || endPtr != ref->bytes + ref->numBytes) {
    errorHeader("Conversion Error");
    fprintf(stderr,
      "Can't convert string \"%s\" to int", ref->bytes);
    showEnvTrace();
    throwError();
  }

  pushValue(result);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getIntInd && tos.type == Val_Bool) {
  // bool already stores true / false as 1 / 0
  tos.type = Val_Number;
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getIntInd && tos.type == Val_Number) {
  tos.value = floor(tos.value);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getLineInd && tos.type == Val_Label) {
  if (tos.value == strLiteralIndex("IO")) {
    popCheck(Val_Label);

    char* chars = NULL;
    size_t size;
    int numBytes = getline(&chars, &size, stdin);

    PtlsValue result;
    if (numBytes == -1) {
      result = makeLabel(strLiteralIndex("EOF"));

    } else {
      chars[numBytes-1] = '\0';
      numBytes--;
      result = makeString(true, numBytes, chars);
    }

    pushValue(result);
    inst++;
    gotoHandler;
  }
}

// -------------------------------------------------------------------------

if (inst->arg == getKeysInd && tos.type == Val_Map) {
  PtlsValue value = popCheck(Val_Map);
  MapRef* ref = getRef(value, mapRef);

  PtlsValue keys[ref->table->numElems];
  mapGetKeys(ref->table, keys);

  PtlsValue result = makeLabel(0); // Empty

  for (int index = ref->table->numElems - 1; index >= 0; index--) {
    PtlsValue elem = keys[index];
    Thunk head = makeThunkValue(elem);
    Thunk tail = makeThunkValue(result);
    result = makeCons(head, tail);
  }

  pushValue(result);

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getLabelStrInd) {
  PtlsValue value = popValue();

  char* chars = NULL;
  switch (value.type) {
    case Val_Array:   chars = "PtlsArray"; break;
    case Val_Bool:    chars = "PtlsBool"; break;
    case Val_Cons:    chars = "PtlsList"; break;
    case Val_Func:    chars = "PtlsFunc"; break;
    case Val_Map:     chars = "PtlsMap"; break;
    case Val_Number:  chars = "PtlsNumber"; break;
    case Val_Object:  chars = "PtlsObject"; break;
    case Val_Set:     chars = "PtlsSet"; break;
    case Val_String:  chars = "PtlsString"; break;
    case Val_BuiltIn: chars = "PtlsBuiltIn"; break;
    case Val_Label:   chars = getText(value.value); break;

    case Val_Tuple: {
      TupleRef* ref = getRef(value, tupleRef);
      if (ref->hasLabel) {
        chars = getText(ref->label.value);
        break;
      }
      chars = "";
      break;
    }
  }

  // string is not heap allocated
  pushValue(makeString(false, strlen(chars), chars));
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getLengthInd && tos.type == Val_String) {
  PtlsValue value = popCheck(Val_String);
  StringRef* ref = getRef(value, stringRef);
  int length = strGetLength(ref);

  pushValue(makeNumber(length));
  inst++;
  gotoHandler;;
}

// -------------------------------------------------------------------------

if (inst->arg == getLengthInd && tos.type == Val_Array) {
  PtlsValue value = popCheck(Val_Array);
  ArrayRef* ref = getRef(value, arrayRef);

  pushValue(makeNumber(ref->length));
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getLengthInd && tos.type == Val_Set) {
  PtlsValue value = popCheck(Val_Set);
  SetRef* ref = getRef(value, setRef);

  pushValue(makeNumber(ref->elems->numElems));
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getLengthInd && tos.type == Val_Map) {
  PtlsValue value = popCheck(Val_Map);
  MapRef* ref = getRef(value, mapRef);

  pushValue(makeNumber(ref->table->numElems));
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getLengthInd && tos.type == Val_Tuple) {
  PtlsValue value = popCheck(Val_Tuple);
  TupleRef* ref = getRef(value, tupleRef);

  pushValue(makeNumber(ref->length));
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getListInd && tos.type == Val_Cons) {
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getListInd && tos.type == Val_String) {
  PtlsValue value = popCheck(Val_String);
  StringRef* ref = getRef(value, stringRef);
  pushValue(getListString(ref, 0));

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getListInd && tos.type == Val_Array) {
  PtlsValue value = popCheck(Val_Array);
  ArrayRef* ref = getRef(value, arrayRef);

  PtlsValue result = makeLabel(0); // Empty

  for (int index = ref->length - 1; index >= 0; index--) {
    PtlsValue elem = ref->elems[index];
    Thunk head = makeThunkValue(elem);
    Thunk tail = makeThunkValue(result);
    result = makeCons(head, tail);
  }
  
  pushValue(result);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getListInd && tos.type == Val_Set) {
  PtlsValue value = popCheck(Val_Set);
  SetRef* ref = getRef(value, setRef);

  PtlsValue result = makeLabel(0); // Empty

  PtlsValue elems[ref->elems->numElems];
  mapGetKeys(ref->elems, elems);

  for (int index = ref->elems->numElems - 1; index >= 0; index--) {
    PtlsValue elem = elems[index];
    Thunk head = makeThunkValue(elem);
    Thunk tail = makeThunkValue(result);
    result = makeCons(head, tail);
  }
  
  pushValue(result);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getListInd && tos.type == Val_Tuple) {
  PtlsValue value = popCheck(Val_Tuple);
  TupleRef* ref = getRef(value, tupleRef);

  PtlsValue result = makeLabel(0); // Empty

  for (int index = ref->length - 1; index >= 0; index--) {
    PtlsValue member = ref->members[index];
    Thunk head = makeThunkValue(member);
    Thunk tail = makeThunkValue(result);
    result = makeCons(head, tail);
  }
  
  pushValue(result);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getMapInd && tos.type == Val_Object) {
  PtlsValue value = popCheck(Val_Object);
  ObjectRef* ref = getRef(value, objectRef);
  int length = ref->env->numDefs;

  // quadratic, but fine for small objects
  for (int index = 0; index < length; index++) {
    Def* def = &ref->env->defs[index];
    
    if (!def->hasValue) {
      // will get popped in eval, need extra copy when getMap runs again
      pushValue(value);
      pushEnv(ref->env, inst);
      assert(def->inst);
      
      inst = def->inst;
      gotoHandler;
    }
  }

  HashMap* table = makeHashMap();
  PtlsValue result = makeMap(table);

  for (int index = 0; index < length; index++) {
    Def* def = &ref->env->defs[index];
    assert(def->hasValue);
    
    char* chars = getText(def->nameIndex);
    PtlsValue key = makeString(false, strlen(chars), chars);
    PtlsValue val = def->value;
    mapAdd(table, key, val);
  }

  pushValue(result);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getRandInd) {
  // can only call getSet on PtlsFloat label
  if (tos.type == Val_Label && tos.value == strLiteralIndex("IO")) {
    popCheck(Val_Label);
    pushValue(makeNumber((float)rand()/(float)RAND_MAX));
    inst++;
    gotoHandler;
  }
}

// -------------------------------------------------------------------------

if (inst->arg == getSetInd) {
  // can only call getSet on empty label
  if (tos.type == Val_Label && tos.value == 0) {
    PtlsValue value = popCheck(Val_Label);
    assert(value.value == 0); // Empty

    HashMap* elems = makeHashMap();
    pushValue(makeSet(elems));

    inst++;
    gotoHandler;
  }
}

// -------------------------------------------------------------------------

if (inst->arg == getStringInd && tos.type == Val_String) {
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getStringInd && tos.type == Val_Number) {
  PtlsValue value = popValue();

  int numBytes = snprintf(NULL, 0, "%.17g", value.value);
  char* chars = calloc(numBytes + 1, sizeof(char));
  snprintf(chars, numBytes + 1, "%.17g", value.value);
  pushValue(makeString(true, numBytes, chars));
  
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getStringInd && tos.type == Val_Bool) {
  PtlsValue value = popValue();

  char* chars = value.value ? "true" : "false"; 
  pushValue(makeString(false, strlen(chars), chars));
  
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getStringInd && tos.type == Val_Label) {
  PtlsValue value = popValue();

  char* chars = getText(value.value); 
  pushValue(makeString(false, strlen(chars), chars));
  
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getTailInd && tos.type == Val_Cons) {
  ConsRef* ref = getRef(tos, consRef);

  if (ref->tail.hasValue) {
    popCheck(Val_Cons);
    pushValue(ref->tail.value);

    inst++;
    gotoHandler;
  }

  pushEnv(ref->tail.env, inst);
  inst = ref->tail.inst;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getUnwrapInd && tos.type == Val_Tuple) {
  PtlsValue value = popCheck(Val_Tuple);
  TupleRef* ref = getRef(value, tupleRef);

  if (ref->length == 1) {
    pushValue(ref->members[0]);

  } else {
    PtlsValue* members = calloc(ref->length, sizeof(PtlsValue));
    PtlsValue result = makeTuple(ref->length, members);

    for (int index = 0; index < ref->length; index++) {
      members[index] = ref->members[index];
    }

    pushValue(result);
  }

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

if (inst->arg == getValsInd && tos.type == Val_Map) {
PtlsValue value = popValue();
  MapRef* ref = getRef(value, mapRef);

  PtlsValue vals[ref->table->numElems];
  mapGetVals(ref->table, vals);

  PtlsValue result = makeLabel(0); // Empty

  for (int index = ref->table->numElems - 1; index >= 0; index--) {
    PtlsValue elem = vals[index];
    Thunk head = makeThunkValue(elem);
    Thunk tail = makeThunkValue(result);
    result = makeCons(head, tail);
  }

  pushValue(result);

  inst++;
  gotoHandler;
}
