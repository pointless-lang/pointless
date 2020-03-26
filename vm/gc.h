
PtlsRef* whiteRefs;
PtlsRef* grayRefs;
PtlsRef* blackRefs;

// ---------------------------------------------------------------------------

void
takeRef(PtlsRef* ref) {
  if (ref == whiteRefs) { assert(!ref->prev); whiteRefs = ref->next; }
  if (ref == grayRefs)  { assert(!ref->prev); grayRefs = ref->next;  }
  if (ref == blackRefs) { assert(!ref->prev); blackRefs = ref->next; }

  if (ref->next) {
    ref->next->prev = ref->prev;
  }

  if (ref->prev) {
    ref->prev->next = ref->next;
  }

  ref->next = NULL;
  ref->prev = NULL;
}

// ---------------------------------------------------------------------------

PtlsRef*
addRef(PtlsRef* newRef, PtlsRef* refs) {
  takeRef(newRef);

  assert(!newRef->next);
  assert(!newRef->prev);

  newRef->next = refs;

  if (refs) {
    refs->prev = newRef;
  }

  return newRef;
}

// ---------------------------------------------------------------------------

void
markWhiteRef(PtlsRef* ref) {
  assert(ref->color == GC_Black);
  ref->color = GC_White;
  whiteRefs = addRef(ref, whiteRefs);
}

// ---------------------------------------------------------------------------

void
markGrayValue(PtlsValue value) {
  if (isPrimitive(value)) {
    return;
  }

  if (value.ref->color == GC_Black || value.ref->color == GC_Gray) {
    return;
  }

  value.ref->color = GC_Gray;
  grayRefs = addRef(value.ref, grayRefs);
}

// ---------------------------------------------------------------------------

void
markGrayEnv(Env* env);

void
markBlackRef(PtlsRef* ref) {
  assert(ref->color == GC_Gray);
  ref->color = GC_Black;
  blackRefs = addRef(ref, blackRefs);

  switch (ref->type) {
    
    case Val_Array: {
      int length = ref->arrayRef.length;
      for (int index = 0; index < length; index++) {
        markGrayValue(ref->arrayRef.elems[index]);
      }
      break;
    }

    case Val_Func: {
      markGrayEnv(ref->funcRef.env);
      break;
    }

    case Val_String: {
      break;
    }

    case Val_Cons: {
      if (ref->consRef.head.hasValue) {
        markGrayValue(ref->consRef.head.value);

      }

      if (ref->consRef.head.env) {
        markGrayEnv(ref->consRef.head.env);
      }

      if (ref->consRef.tail.hasValue) {
        markGrayValue(ref->consRef.tail.value);

      }

      if (ref->consRef.tail.env) {
        markGrayEnv(ref->consRef.tail.env);
      }

      break;
    }

    case Val_Map:
    case Val_Set: {
      HashMap* table = ref->mapRef.table;

      PtlsValue keys[table->numElems];
      PtlsValue vals[table->numElems];
      mapGetKeys(table, keys);
      mapGetVals(table, vals);

      for (int index = 0; index < table->numElems; index++) {
        markGrayValue(keys[index]);
        markGrayValue(vals[index]);
      }

      break;
    }

    case Val_Object: {
      markGrayEnv(ref->objectRef.env);
      break;
    }

    case Val_Tuple: {
      int length = ref->tupleRef.length;

      for (int index = 0; index < length; index++) {
        markGrayValue(ref->tupleRef.members[index]);
      }

      break;
    }

    case Val_BuiltIn: {
      markGrayValue(ref->builtInRef.value);
      break;
    }

    default: {
      assert(false);
    }
  }
}

// ---------------------------------------------------------------------------

void
freeRef(PtlsRef* ref) {
  assert(ref->color == GC_White);

  switch (ref->type) {
    case Val_Array: {
      free(ref->arrayRef.elems);
      break;
    }

    case Val_Cons:
    case Val_Func:
    case Val_Object:
    case Val_BuiltIn: {
      break;
    }

    case Val_String: {
      if (ref->stringRef.isHeap) {
        free(ref->stringRef.bytes);
      }
      break;
    }

    case Val_Set:
    case Val_Map: {
      freeHashMap(ref->mapRef.table);
      break;
    }

    case Val_Tuple: {
      free(ref->tupleRef.members);
      break;
    }

    default: {
      assert(false);
    }
  }

  free(ref);
}

// ---------------------------------------------------------------------------

Env* whiteEnvs;
Env* grayEnvs;
Env* blackEnvs;

// ---------------------------------------------------------------------------

void
takeEnv(Env* env) {
  if (env == whiteEnvs) { assert(!env->prev); whiteEnvs = env->next; }
  if (env == grayEnvs)  { assert(!env->prev); grayEnvs = env->next;  }
  if (env == blackEnvs) { assert(!env->prev); blackEnvs = env->next; }

  if (env->next) {
    env->next->prev = env->prev;
  }

  if (env->prev) {
    env->prev->next = env->next;
  }

  env->next = NULL;
  env->prev = NULL;
}

// ---------------------------------------------------------------------------

Env*
addEnv(Env* newEnv, Env* envs) {
  takeEnv(newEnv);

  assert(!newEnv->next);
  assert(!newEnv->prev);

  newEnv->next = envs;

  if (envs) {
    envs->prev = newEnv;
  }

  return newEnv;
}

// ---------------------------------------------------------------------------

void
markWhiteEnv(Env* env) {
  assert(env->color == GC_Black);
  env->color = GC_White;
  whiteEnvs = addEnv(env, whiteEnvs);
}

// ---------------------------------------------------------------------------

void
markGrayEnv(Env* env) {
  if (env->color == GC_Black || env->color == GC_Gray) {
    return;
  }

  env->color = GC_Gray;
  grayEnvs = addEnv(env, grayEnvs);
}

// ---------------------------------------------------------------------------

void
markBlackEnv(Env* env) {
  assert(env->color == GC_Gray);
  env->color = GC_Black;
  blackEnvs = addEnv(env, blackEnvs);

  if (env->globals) {
    markGrayEnv(env->globals);
  }

  for (int n = 0; n < env->numDefs; n++) {
    if (env->defs[n].hasValue) {
      markGrayValue(env->defs[n].value);
    }
  }
}

// ---------------------------------------------------------------------------

void
freeEnv(Env* env) {
  assert(env);
  free(env);
}

// ---------------------------------------------------------------------------

int numBytesAlloc = 0;

void
trackAlloc(int n) {
  numBytesAlloc += n;
}

// ---------------------------------------------------------------------------

void
collect(void) {
  if (numBytesAlloc < 1 << 20) {
    return;
  }

  numBytesAlloc = 0;

  // printf("collect\n");
  assert(!grayRefs);
  assert(!grayEnvs);

  assert(!blackRefs);
  assert(!blackEnvs);

  for (int i = 0; i < stackInd; i++) {
    markGrayValue(stack[i]);
  }

  for (int i = 0; i < numImports; i++) {
    markGrayValue(imports[i]);
  }

  for (int i = 0; i < callStackInd; i++) {
    markGrayEnv(callStack[i]);
  }

  if (prelude) {
    markGrayEnv(prelude);
  }

  while (grayRefs || grayEnvs) {
    if (grayRefs) {
      markBlackRef(grayRefs);
    }

    if (grayEnvs) {
      markBlackEnv(grayEnvs);
    }
  }

  for (PtlsRef* ref = whiteRefs; ref;) {
    assert(ref->color == GC_White);
    PtlsRef* next = ref->next;
    freeRef(ref);
    ref = next;
  }

  for (Env* env = whiteEnvs; env;) {
    assert(env->color == GC_White);
    Env* next = env->next;
    freeEnv(env);
    env = next;
  }

  whiteRefs = NULL;
  whiteEnvs = NULL;

  for (PtlsRef* ref = blackRefs; ref;) {
    PtlsRef* next = ref->next;
    markWhiteRef(ref);
    ref = next;
  }

  for (Env* env = blackEnvs; env;) {
    Env* next = env->next;
    markWhiteEnv(env);
    env = next;
  }

  blackRefs = NULL;
  blackEnvs = NULL;
}
