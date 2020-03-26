
handleCall: {
  PtlsValue func = popValue();

  if (func.type == Val_Label) {
    // make tuple from label call
    PtlsValue* members = calloc(inst->arg, sizeof(PtlsValue));
    PtlsValue value = makeTupleLabel(func, inst->arg, members);

    int index = inst->arg;
    while (index--) {
      members[index] = popValue();
    }

    pushValue(value);
    inst++;
    gotoHandler;
  }

  if (func.type == Val_BuiltIn) {
    assert(inst->arg == 1);

    PtlsValue arg = popValue();
    BuiltInRef* ref = getRef(func, builtInRef);
    pushValue(handleBuiltIn(ref, arg));

    inst++;
    gotoHandler;
  }

  if (func.type == Val_Func) {
    // func should never have zero params - only happens when
    // trying to call temp func value stored from upval in recursive func
    if (getRef(func, funcRef)->numParams == 0) {
      errorHeader("Runtime Error");
      fprintf(stderr,
        "Illegal recursion during function definition");
      showEnvTrace();
      throwError();
    }

    #include "handleFuncCall.h"
  }

  // can only call labels / functions / builtIns
  errorHeader("Type Error");
  fprintf(stderr, "Cannot call type '%s'", getTypeStr(func.type));
  showEnvTrace();
  throwError();
}

// -------------------------------------------------------------------------

handleConcat: {
  checkIsList(tos);
  if (tos.type == Val_Label) {
    assert(tos.value == 0); // empty

    pushEnv(getEnv(), inst + 1);
    inst += 2;
    gotoHandler;
  }

  PtlsValue lhs = popCheck(Val_Cons);
  Thunk thunk = makeThunk(getEnv(), inst + 2);
  PtlsValue result = copyList(lhs, thunk);

  pushValue(result);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------
// dispatch sequence
//
// 11 [ FieldRef     ] 6       (output)
// 12 [ Jump         ] 6       (-> 18)
// 13 [ Dup          ]
// 14 [ LangFieldRef ] 13      (!getHead)
// 15 [ Pop          ] 1       
// 16 [ Jump         ] 2       (-> 18)
// 17 [ LangFieldRef ] 22      (!getTail)
// 18 [ Dispatch     ]

handleDispatch: {
  PtlsValue value = popValue();
  
  if (!isList(value)) {
    errorHeader("Type Error");
    fprintf(stderr,
      "VM expected output command sequence, got type '%s'",
      getTypeStr(value.type));
    showEnvTrace();
    throwError();
  }

  if (value.type == Val_Cons) {
    ConsRef* ref = getRef(value, consRef);

    if (!ref->head.hasValue) {
      pushValue(value);
      inst -= 5; // jump to dup -> getHead -> pop
      gotoHandler;
    }

    runCommand(ref->head.value);

    pushValue(value);
    inst -= 1; // jump to getTail
    gotoHandler;
  }

  // should terminate on empty label
  assert(value.type == Val_Label && value.value == 0);
  return;
}

// -------------------------------------------------------------------------

handleDup: {
  pushValue(tos);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleFieldRef: {
  checkTOS("Field ref", Val_Object);
  ObjectRef* ref = getRef(tos, objectRef);
  Def* def = getFieldDefOrNull(ref->env, inst->arg);

  if (!def) {
    errorHeader("Index Error");
    fprintf(stderr,
      "Object does not have field '%s'", getText(inst->arg));
    showEnvTrace();
    throwError();
  }

  if (def->hasValue) {
    // object value is still on the stack, pop it
    popCheck(Val_Object);
    pushValue(def->value);

    inst++;
    gotoHandler;
  }

  // re-run fieldRef inst after field is computed
  // obj is still tos at this point
  pushEnv(ref->env, inst);

  // if def doesn't have value, should have instruction pointer
  // (some defs don't have inst pointers but do have values (ex: args))
  assert(def->inst);
  inst = def->inst;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleIndex: {
  PtlsValue value = popValue();

  if (value.type == Val_Array) {
    ArrayRef* ref = getRef(value, arrayRef);

    checkTOS("Array index", Val_Number);
    PtlsValue index = popCheck(Val_Number);

    int indexVal = checkArrayIndex(ref, index.value);
    pushValue(ref->elems[indexVal]);

    inst++;
    gotoHandler;
  }

  if (value.type == Val_Map) {
    PtlsValue key = popValue();
    MapRef* ref = getRef(value, mapRef);

    if (!mapHasKey(ref->table, key)) {
      errorHeader("Index Error");
      fprintf(stderr, "Given key does not exist in map");
      showEnvTrace();
      throwError();
    }

    pushValue(mapGet(ref->table, key));
    inst++;
    gotoHandler;
  }

  errorHeader("Index Error");
  fprintf(stderr, "Cannot index type '%s'", getTypeStr(value.type));
  showEnvTrace();
  throwError();
}

// -------------------------------------------------------------------------

handleJump: {
  inst += (int)inst->arg;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleJumpIfFalse: {
  checkTOS("Conditional", Val_Bool);
  PtlsValue pred = popCheck(Val_Bool);

  if (!pred.value) {
    inst += (int)inst->arg;
    gotoHandler;
  }

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleLangFieldRef: {
  #include "langFieldHandlers.h"
  throwFieldError(getText(inst->arg), popValue());
}

// -------------------------------------------------------------------------

handleLoadBool: {
  pushValue(makeBool(inst->arg));
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleLoadGlobal: {
  Def* def = getGlobalDef(inst->arg);

  if (def->hasValue) {
    pushValue(def->value);
    inst++;
    gotoHandler;
  }

  // need to evaluate def insts in original env
  // push current inst to re-run command after value is saved
  // load* commands should have inst at end of def inst block
  // to save value back to original env
  pushEnv(getGlobalEnv(), inst);
  assert(def->inst);

  inst = def->inst;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleLoadImport: {
  // imports should have already been allocated by saveImports
  assert(imports);
  pushValue(imports[(int)inst->arg]);

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleLoadLocal: {
  Def* def = getLocalDef(inst->arg);
  
  if (def->hasValue) {
    pushValue(def->value);
    inst++;
    gotoHandler;
  }

  if (def->lock) {
    // need to accomodate recursive functions which need their
    // own definitions loaded as upvalues
    // start by making placeholder func in def
    // funcRef of value gets replaced in saveVal
    //
    // recursion through local vars for non-function types is disallowed,
    // gets caught on resolution of definition - global recursion is ok,
    // since no upvals are closed over

    PtlsValue value = makeRefVal(Val_Func);
    addDefValue(def, value);

    pushValue(value);
    inst++;
    gotoHandler;
  }

  def->lock = true;
  pushEnv(getEnv(), inst);
  assert(def->inst);
  
  inst = def->inst;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleLoadPrelude: {
  Def* def = getEnvDef(prelude, inst->arg);

  if (def->hasValue) {
    pushValue(def->value);
    inst++;
    gotoHandler;
  }

  pushEnv(prelude, inst);
  assert(def->inst);

  inst = def->inst;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleLoadStr: {
  char* chars = getText(inst->arg);
  PtlsValue value = makeString(false, strlen(chars), chars);

  pushValue(value);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleMakeArray: {
  PtlsValue* elems = calloc(inst->arg, sizeof(PtlsValue));
  PtlsValue value = makeArray(inst->arg, elems);

  int index = inst->arg;
  while (index--) {
    elems[index] = popValue();
  }

  pushValue(value);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleMakeDef: {
  // number for def name index (used when accessing fields)
  int nameIndex = popCheck(Val_Number).value;

  Def newDef = makeDef(nameIndex, inst + 2);
  *getLocalDef(inst->arg) = newDef;

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleMakeEnv: {
  // env needs to keep track of its own globals
  // important for making loadGlobal work in code loaded from
  // another file (with import) - can't use globals from current file
  Env* globals = callStackInd ? getGlobalEnv() : NULL;
  Env* env = makeEnv(inst->arg, globals);

  pushEnv(env, NULL);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleMakeFunc: {
  Instruction* bodyInst = inst + 2;
  // capture current env for function env
  // (current env loaded specifically for function def)
  PtlsValue value = makeFunc(inst->arg, 0, getEnv(), bodyInst);

  pushValue(value);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleMakeNumber: {
  PtlsValue value = makeNumber(inst->arg);
  pushValue(value);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleMakeLabel: {
  PtlsValue value = makeLabel(inst->arg);
  pushValue(value);
  inst++;
  gotoHandler;
}


// -------------------------------------------------------------------------

handleSaveHead: {
  PtlsValue value = popValue();

  assert(tos.type == Val_Cons);
  ConsRef* ref = getRef(tos, consRef);

  ref->head.value = value;
  ref->head.hasValue = true;

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleSaveTail: {
  PtlsValue tail = popValue();
  checkIsList(tail);
  checkIsList(tos);

  if (tos.type == Val_Label) {
    assert(tos.value == 0); // empty
    popCheck(Val_Label);

    pushValue(tail);
    inst++;
    gotoHandler;
  }

  ConsRef* ref = getRef(tos, consRef);

  ref->tail.value = tail;
  ref->tail.hasValue = true;

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleMakeCons: {
  Thunk headThunk = makeThunk(getEnv(), inst + 3);
  Thunk tailThunk = makeThunk(getEnv(), inst + 2);
  PtlsValue value = makeCons(headThunk, tailThunk);

  pushValue(value);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleMakeMap: {
  HashMap* table = makeHashMap();
  PtlsValue value = makeMap(table);

  int index = inst->arg;
  while (index--) {
    PtlsValue val = popValue();
    PtlsValue key = popValue();
    mapAdd(table, key, val);
  }

  pushValue(value);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleMakeObj: {
  PtlsValue value = makeObject(getEnv());
  pushValue(value);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleMakeSet: {
  HashMap* elems = makeHashMap();
  PtlsValue value = makeSet(elems);

  int index = inst->arg;
  while (index--) {
    PtlsValue elem = popValue();
    mapAddKey(elems, elem);
  }

  pushValue(value);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleMakeTuple: {
  PtlsValue* members = calloc(inst->arg, sizeof(PtlsValue));
  PtlsValue value = makeTuple(inst->arg, members);

  int index = inst->arg;
  while (index--) {
    members[index] = popValue();
  }

  pushValue(value);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleSub: {
  checkTOS("Operator (-)", Val_Number);
  PtlsValue rhs = popCheck(Val_Number);

  checkTOS("Operator (-)", Val_Number);
  tos.value -= rhs.value;

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleMul: {
  checkTOS("Operator (*)", Val_Number);
  PtlsValue rhs = popCheck(Val_Number);
  tos.value *= rhs.value;

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleDiv: {
  checkTOS("Operator (/)", Val_Number);
  PtlsValue rhs = popCheck(Val_Number);

  if (rhs.value == 0) {
    errorHeader("Arithmetic Error");
    fprintf(stderr, "Division by zero");
    showEnvTrace();
    throwError();
  }

  checkTOS("Operator (/)", Val_Number);
  tos.value /= rhs.value;

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleLessThan: {
  checkTOS("Operator (<)", Val_Number);
  PtlsValue rhs = popCheck(Val_Number);

  checkTOS("Operator (<)", Val_Number);
  tos.value = tos.value < rhs.value;
  tos.type = Val_Bool;

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleLessEq: {
  checkTOS("Operator (<=)", Val_Number);
  PtlsValue rhs = popCheck(Val_Number);

  checkTOS("Operator (<=)", Val_Number);
  tos.value = tos.value <= rhs.value;
  tos.type = Val_Bool;

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleGreaterThan: {
  checkTOS("Operator (>)", Val_Number);
  PtlsValue rhs = popCheck(Val_Number);

  checkTOS("Operator (>)", Val_Number);
  tos.value = tos.value > rhs.value;
  tos.type = Val_Bool;

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleGreaterEq: {
  checkTOS("Operator (>=)", Val_Number);
  PtlsValue rhs = popCheck(Val_Number);

  checkTOS("Operator (>=)", Val_Number);
  tos.value = tos.value >= rhs.value;
  tos.type = Val_Bool;

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleAdd: {
  PtlsValue rhs = popValue();

  if (tos.type == Val_Number) {
    checkType("Numerical operator (+)", Val_Number, rhs);
    tos.value += rhs.value;
    inst++;
    gotoHandler;
  }

  if (tos.type == Val_String) {
    checkType("String operator (+)", Val_String, rhs);
    PtlsValue lhs = popValue();

    StringRef* lhsRef = getRef(lhs, stringRef);
    StringRef* rhsRef = getRef(rhs, stringRef);

    int numBytes = lhsRef->numBytes + rhsRef->numBytes;
    char* chars = calloc(numBytes + 1, sizeof(char));

    strncpy(chars, lhsRef->bytes, lhsRef->numBytes);
    strncpy(chars + lhsRef->numBytes, rhsRef->bytes, rhsRef->numBytes);

    // isHeap = true (chars get free'd when string ref is free'd)
    PtlsValue value = makeString(true, numBytes, chars);
    StringRef* ref = getRef(value, stringRef);

    ref->hasLength = true;
    ref->length = strGetLength(lhsRef) + strGetLength(rhsRef);

    pushValue(value);
    inst++;
    gotoHandler;
  }

  errorHeader("Type Error");
  fprintf(stderr,
    "Invalid lhs type '%s', for operator (+)", getTypeStr(tos.type));
  showEnvTrace();
  throwError();
}

// -------------------------------------------------------------------------

handleMod: {
  checkTOS("Operator (%)", Val_Number);
  PtlsValue rhs = popCheck(Val_Number);
  tos.value = tos.value - floor(tos.value / rhs.value) * rhs.value;

  checkTOS("Operator (%)", Val_Number);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handlePow: {
  checkTOS("Operator (**)", Val_Number);
  PtlsValue rhs = popCheck(Val_Number);

  checkTOS("Operator (**)", Val_Number);
  tos.value = pow(tos.value, rhs.value);

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleCheckBool: {
  // checking bool from (inst->arg ? 'and' : 'or') operation
  if (inst->arg) {
    checkTOS("Operator (and)", Val_Bool);
  } else {
    checkTOS("Operator (or)", Val_Bool);
  }
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleOr: {
  checkTOS("Operator (or)", Val_Bool);
  if (tos.value) {
    inst++;
    gotoHandler;
  }

  popCheck(Val_Bool);
  // rhs code will re-run operation to force type-check
  inst = inst + 2;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleAnd: {
  checkTOS("Operator (and)", Val_Bool);
  if (!tos.value) {
    inst++;
    gotoHandler;
  }

  popCheck(Val_Bool);
  // rhs code will re-run operation to force type-check
  inst = inst + 2;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleEq: {
  PtlsValue rhs = popValue();

  if (isPrimitive(rhs)) {
    tos.value = valsEqual(tos, rhs);
    tos.type = Val_Bool;

  } else {
    PtlsValue lhs = popValue();
    pushValue(makeBool(valsEqual(lhs, rhs)));
  }

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleNotEq: {
  PtlsValue rhs = popValue();

  if (isPrimitive(rhs)) {
    tos.value = !valsEqual(tos, rhs);
    tos.type = Val_Bool;

  } else {
    PtlsValue lhs = popValue();
    pushValue(makeBool(!valsEqual(lhs, rhs)));
  }

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleIn: {
  PtlsValue value = popValue();

  if (value.type != Val_Map && value.type != Val_Set) {
    errorHeader("Type Error");
    fprintf(stderr,
      "Invalid operator (in) for type '%s'", getTypeStr(value.type));
    showEnvTrace();
    throwError();
  }

  MapRef* ref = getRef(value, mapRef);
  PtlsValue elem = popValue();
  PtlsValue result = makeBool(mapHasKey(ref->table, elem));

  pushValue(result);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleIs: {
  checkTOS("Operator (is)", Val_Label);
  int labelInd = popCheck(Val_Label).value;
  PtlsValue value = popValue();

  bool result = false;
  switch (value.type) {
    case Val_Array:   result = labelInd == ArrayLabelInd; break;
    case Val_Bool:    result = labelInd == BoolLabelInd; break;
    case Val_Cons:    result = labelInd == ListLabelInd; break;
    case Val_Func:    result = labelInd == FuncLabelInd; break;
    case Val_Map:     result = labelInd == MapLabelInd; break;
    case Val_Number:  result = labelInd == NumberLabelInd; break;
    case Val_Object:  result = labelInd == ObjectLabelInd; break;
    case Val_Set:     result = labelInd == SetLabelInd; break;
    case Val_String:  result = labelInd == StringLabelInd; break;
    case Val_BuiltIn: result = labelInd == BuiltInLabelInd; break;

    case Val_Label: {
      result = labelInd == LabelLabelInd;
      result = result || value.value == labelInd;
      break;
    }

    case Val_Tuple: {
      result = labelInd == TupleLabelInd;
      TupleRef* ref = getRef(value, tupleRef);
      if (ref->hasLabel) {
        result = result || ref->label.value == labelInd;
      }
      break;
    }
  }
  pushValue(makeBool(result));
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleNeg: {
  checkTOS("Operator (-)", Val_Number);
  tos.value = -tos.value;
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleNot: {
  checkTOS("Operator (not)", Val_Bool);
  tos.value = !tos.value;
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handlePop: {
  popValue();
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handlePopEnv: {
  Instruction* retInst = popEnv();
  // should popEnv iff no ret inst is set, should return otherwise
  assert(!retInst);
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleResolveList: {
  checkIsList(tos);

  if (tos.type == Val_Label) {
    popCheck(Val_Label);
    inst++;
    gotoHandler;
  }

  ConsRef* ref = getRef(tos, consRef);

  if (ref->tail.hasValue) {
    popCheck(Val_Cons);
    pushValue(ref->tail.value);

    // un-roll list
    goto handleResolveList;
  }

  pushEnv(ref->tail.env, inst);
  inst = ref->tail.inst;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleRequire: {
  checkTOS("Require", Val_Bool);
  PtlsValue value = popCheck(Val_Bool);

  if (!value.value) {
    errorHeader("Runtime Error");
    fprintf(stderr, "Assertion failed");
    showEnvTrace();
    throwError();
  }

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleReturn: {
  Instruction* retInst = popEnv();
  // should popEnv iff no ret inst is set, should return otherwise
  assert(retInst);
  inst = retInst;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleSaveImports: {
  numImports = (int)inst->arg;
  imports = calloc(numImports, sizeof(PtlsValue));
  // global envs for import source files need to be saved,
  // since evaluating code from import sources may refer back to
  // source global env
  // the objects stored in imports have these source global envs
  // as their envs, keep env refc = 1 until imports are free'd
  for (int index = numImports - 1; index >= 0; index--) {
    imports[index] = popValue();
  }

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleSavePrelude: {
  prelude = getEnv();
  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleSaveVal: {
  Def* def = getLocalDef(inst->arg);
  PtlsValue value = popValue();

  if (def->hasValue) {
    if (value.type != Val_Func) {
      errorHeader("Type Error");
      fprintf(stderr,
        "Illegal recursion through non-global, non-function structure");
      showEnvTrace();
      throwError();
    }

    // temp value in def should be set to func
    assert(def->value.type == Val_Func);

    FuncRef* oldRef = getRef(value, funcRef);
    FuncRef* newRef = getRef(def->value, funcRef);
    memcpy(newRef, oldRef, sizeof(FuncRef));

  } else {
    addDefValue(def, value);
  }

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleDestructure: {
  int memberInd = inst->arg;

  checkTOS("Destructure assignment", Val_Tuple);
  PtlsValue rhs = popCheck(Val_Tuple);
  TupleRef* ref = getRef(rhs, tupleRef);

  if (ref->length != memberInd) {
    errorHeader("Type Error");
    fprintf(stderr,
      "Cannot destructure tuple with length %d to %d names",
      ref->length, memberInd);
    showEnvTrace();
    throwError();
  }

  while (memberInd--) {
    pushValue(ref->members[memberInd]);
  }

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleUpdateField: {
  checkTOS("Field ref", Val_Object);
  PtlsValue lhs = popCheck(Val_Object);
  PtlsValue value = popValue();

  ObjectRef* ref = getRef(lhs, objectRef);
  Def* def = getFieldDefOrNull(ref->env, inst->arg);

  if (!def) {
    int numDefs = ref->env->numDefs + 1;
    Env* newEnv = makeEnv(numDefs, ref->env->globals);

    int index;
    for (index = 0; index < ref->env->numDefs; index++) {
      newEnv->defs[index] = ref->env->defs[index];
    }

    // typedef struct {
    //   bool lock;
    //   bool hasValue;
    //   int nameIndex;
    //   PtlsValue value;
    //   Instruction* inst;
    // } Def;

    def = &newEnv->defs[index];
    *def = (Def){false, false, (int)inst->arg, {0}, NULL};

    ref->env = newEnv;
  }

  def->hasValue = true;
  def->value = value;

  inst++;
  gotoHandler;
}

// -------------------------------------------------------------------------

handleUpdateIndex: {
  PtlsValue index = popValue();
  PtlsValue lhs = popValue();
  PtlsValue value = popValue();

  if (lhs.type == Val_Array) {
    ArrayRef* ref = getRef(lhs, arrayRef);

    checkType("Array index", Val_Number, index);
    int indexVal = checkArrayIndex(ref, index.value);
    ref->elems[indexVal] = value;

    inst++;
    gotoHandler;
  }

  if (lhs.type == Val_Map) {
    MapRef* ref = getRef(lhs, mapRef);
    mapAdd(ref->table, index, value);
    inst++;
    gotoHandler;
  }

  errorHeader("Type Error");
  fprintf(stderr, "Cannot index type '%s'", getTypeStr(lhs.type));
  showEnvTrace();
  throwError();
}
