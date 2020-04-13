
typedef enum {
  Val_Array,
  Val_Bool,
  Val_BuiltIn,
  Val_Cons,
  Val_Func,
  Val_Label,
  Val_Map,
  Val_Number,
  Val_Object,
  Val_Set,
  Val_String,
  Val_Tuple,
} ValType;

// ---------------------------------------------------------------------------

char*
getTypeStr(ValType type) {
  switch(type) {
    case Val_Array:   return "PtlsArray";
    case Val_Bool:    return "PtlsBool";
    case Val_BuiltIn: return "PtlsBuiltIn";
    case Val_Cons:    return "PtlsList";
    case Val_Func:    return "PtlsFunc";
    case Val_Label:   return "PtlsLabel";
    case Val_Map:     return "PtlsMap";
    case Val_Number:  return "PtlsNumber";
    case Val_Object:  return "PtlsObject";
    case Val_Set:     return "PtlsSet";
    case Val_String:  return "PtlsString";
    case Val_Tuple:   return "PtlsTuple";
  }

  assert(false);
}

// ---------------------------------------------------------------------------

typedef struct Env Env;
typedef struct PtlsRef PtlsRef;
typedef struct PtlsValue PtlsValue;
typedef struct HashMap HashMap;

// ---------------------------------------------------------------------------

struct PtlsValue {
  ValType type;
  union {
    double value;
    PtlsRef* ref;
  };
};

// ---------------------------------------------------------------------------

typedef struct {
  Env* env;
  Instruction* inst;
  bool hasValue;
  PtlsValue value;
} Thunk;

Thunk
makeThunk(Env* env, Instruction* inst) {
  return (Thunk){env, inst, false, {0}};
}

Thunk
makeThunkValue(PtlsValue value) {
  return (Thunk){NULL, NULL, true, value};
}

// ---------------------------------------------------------------------------

typedef struct {
  int length;
  PtlsValue* elems;
} ArrayRef;

int
checkArrayIndex(ArrayRef* ref, double indexVal) {
  if ((int)indexVal != indexVal) {
    errorHeader("Index Error");
    fprintf(stderr, "Expected integer index value, got %g", indexVal);
    showEnvTrace();
    throwError();
  }

  if (indexVal >= ref->length || indexVal < 0) {
    errorHeader("Runtime Error");
    fprintf(stderr,
      "Index index %d for array with length %d", (int)indexVal, ref->length);
    showEnvTrace();
    throwError();
  }

  return indexVal;
}

// ---------------------------------------------------------------------------

typedef struct {
  Thunk head;
  Thunk tail;
} ConsRef;

// ---------------------------------------------------------------------------

typedef struct {
  int numParams;
  int paramInd;
  struct Env* env;
  Instruction* inst;
} FuncRef;

// ---------------------------------------------------------------------------

typedef struct {
  struct HashMap* table;
} MapRef;

// ---------------------------------------------------------------------------

typedef struct {
  struct HashMap* elems;
} SetRef;

// ---------------------------------------------------------------------------

typedef struct {
  struct Env* env;
} ObjectRef;

// ---------------------------------------------------------------------------

typedef struct {
  bool isHeap;
  bool hasLength;
  int length;
  int numBytes;
  char* bytes;
} StringRef;

// ---------------------------------------------------------------------------

typedef struct {
  bool hasLabel;
  PtlsValue label;
  int length;
  PtlsValue* members;
} TupleRef;

// ---------------------------------------------------------------------------

typedef struct {
  int fieldInd;
  PtlsValue value;
} BuiltInRef;

// ---------------------------------------------------------------------------

typedef enum {
  GC_White,
  GC_Gray,
  GC_Black,
} GCColor;

struct PtlsRef {
  ValType type;
  // bool valid;
  GCColor color;
  PtlsRef* next;
  PtlsRef* prev;
  union {
    ArrayRef arrayRef;
    ConsRef consRef;
    FuncRef funcRef;
    MapRef mapRef;
    SetRef setRef;
    ObjectRef objectRef;
    StringRef stringRef;
    TupleRef tupleRef;
    BuiltInRef builtInRef;
  };
};

// ---------------------------------------------------------------------------

bool
isPrimitive(PtlsValue value) {
  switch (value.type) {
    case Val_Bool:
    case Val_Label:
    case Val_Number:
      return true;

    default:
      return false;
  }
}

bool
isList(PtlsValue value) {
  if (value.type == Val_Cons) {
    return true;
  }

  // empty label should always have label str index 0
  if (value.type == Val_Label && value.value == 0) {
    return true;
  }

  return false;
}

void
checkIsList(PtlsValue value) {
  if (isList(value)) {
    return;
  }

  errorHeader("Type Error");
  fprintf(stderr,
    "Expected PtlsList or Empty, get  type '%s'", getTypeStr(value.type));
  showEnvTrace();
  throwError();
}

// ---------------------------------------------------------------------------

PtlsValue
makeBool(double value) {
  bool boolVal = value == 1;
  return (PtlsValue){Val_Bool, .value = boolVal};
}

// ---------------------------------------------------------------------------

PtlsValue
makeNumber(double value) {
  return (PtlsValue){Val_Number, .value = value};
}

// ---------------------------------------------------------------------------

PtlsValue
makeLabel(int charsIndex) {
  return (PtlsValue){Val_Label, .value = charsIndex};
}

// ---------------------------------------------------------------------------

void
markWhiteRef(PtlsRef* ref);

void
trackAlloc(int n);

PtlsValue
makeRefVal(ValType type) {
  PtlsRef* ref = calloc(1, sizeof(PtlsRef));
  ref->type = type;
  // ref->valid = true;
  ref->color = GC_Black;
  markWhiteRef(ref);
  trackAlloc(sizeof(PtlsRef));
  return (PtlsValue){type, .ref = ref};
}

// ---------------------------------------------------------------------------

#define getRef(value, refField) (&((value).ref)->refField)

// ---------------------------------------------------------------------------

// #define getRef(value, refField) (&checkValid((value).ref)->refField)

// PtlsRef*
// checkValid(PtlsRef* ref) {
//   if (!ref->valid) {
//     errorHeader("Mutation Error");
//     fprintf(stderr, "Invalid update to previously modified object");
//     showEnvTrace();
//     throwError();
//   }
//   return ref;
// }

// ---------------------------------------------------------------------------

PtlsValue
makeString(bool isHeap, int numBytes, char* bytes) {
  PtlsValue result = makeRefVal(Val_String);
  StringRef* ref = getRef(result, stringRef);
  ref->isHeap = isHeap;
  ref->hasLength = false;
  ref->length = 0;
  ref->numBytes = numBytes;
  ref->bytes = bytes;
  return result;
}

// ---------------------------------------------------------------------------

PtlsValue
makeFunc(int numParams, int paramInd, Env* env, Instruction* inst) {
  PtlsValue result = makeRefVal(Val_Func);
  FuncRef* ref = getRef(result, funcRef);

  ref->env  = env;
  ref->inst = inst;
  ref->numParams = numParams;
  ref->paramInd  = paramInd;

  return result;
}

// ---------------------------------------------------------------------------

PtlsValue
makeArray(int length, PtlsValue* elems) {
  PtlsValue result = makeRefVal(Val_Array);
  ArrayRef* ref = getRef(result, arrayRef);
  ref->length = length;
  ref->elems = elems;
  return result;
}

// ---------------------------------------------------------------------------

PtlsValue
makeMap(HashMap* table) {
  PtlsValue result = makeRefVal(Val_Map);
  MapRef* ref = getRef(result, mapRef);
  ref->table = table;
  return result;
}

// ---------------------------------------------------------------------------

PtlsValue
makeSet(HashMap* elems) {
  PtlsValue result = makeMap(elems);
  result.type = Val_Set;
  result.ref->type = Val_Set;
  return result;
}

// ---------------------------------------------------------------------------

PtlsValue
makeCons(Thunk head, Thunk tail) {
  PtlsValue result = makeRefVal(Val_Cons);
  ConsRef* ref = getRef(result, consRef);

  ref->head = head;
  ref->tail = tail;
  return result;
}

PtlsValue
copyList(PtlsValue head, Thunk tail) {
  assert(head.type == Val_Cons);
  ConsRef* headRef = getRef(head, consRef);
  // assert tail of each cons is eval'd
  assert(headRef->tail.hasValue);

  if (headRef->tail.value.type == Val_Label) {   
    assert(headRef->tail.value.value == 0); // Empty
    return makeCons(headRef->head, tail);
  }

  PtlsValue tailCons = copyList(headRef->tail.value, tail);
  Thunk tailThunk = makeThunkValue(tailCons);
  return makeCons(headRef->head, tailThunk);
}

// ---------------------------------------------------------------------------

PtlsValue
makeObject(Env* env) {
  PtlsValue result = makeRefVal(Val_Object);
  ObjectRef* ref = getRef(result, objectRef);
  ref->env = env;
  return result;
}

// ---------------------------------------------------------------------------

PtlsValue
makeTuple(int length, PtlsValue* members) {
  PtlsValue result = makeRefVal(Val_Tuple);
  TupleRef* ref = getRef(result, tupleRef);
  ref->hasLabel = false;
  ref->length = length;
  ref->members = members;
  return result;
}

// ---------------------------------------------------------------------------

PtlsValue
makeTupleLabel(PtlsValue label, int length, PtlsValue* members) {
  PtlsValue result = makeTuple(length, members);
  TupleRef* ref = getRef(result, tupleRef);
  ref->hasLabel = true;
  ref->label = label;
  return result;
}

// ---------------------------------------------------------------------------

PtlsValue
makeBuiltIn(int fieldInd, PtlsValue value) {
  PtlsValue result = makeRefVal(Val_BuiltIn);
  BuiltInRef* ref = getRef(result, builtInRef);
  ref->fieldInd = fieldInd;
  ref->value = value;
  return result;
}
