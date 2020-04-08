
typedef struct {
  bool lock;
  bool hasValue;
  int nameIndex;
  PtlsValue value;
  Instruction* inst;
} Def;

// ---------------------------------------------------------------------------

Def
makeDef(int nameIndex, Instruction* inst) {
  return (Def){false, false, nameIndex, {0}, inst};
}

// ---------------------------------------------------------------------------

typedef struct Env Env;

struct Env {
  int numDefs;
  GCColor color;
  Env* next;
  Env* prev;
  struct Env* globals;
  Def defs[];
};

// ---------------------------------------------------------------------------

#define callStackSize 1000

int callStackInd;
Env* callStack[callStackSize];
Instruction* retStack[callStackSize];

// ---------------------------------------------------------------------------

void
markWhiteEnv(Env* env);

Env*
makeEnv(int numDefs, Env* globals) {
  int size = sizeof(Env) + numDefs * sizeof(Def);
  Env* env = calloc(1, size);
  *env = (Env){numDefs, GC_Black, NULL, NULL, globals};
  markWhiteEnv(env);
  trackAlloc(size);
  return env;
}

// ---------------------------------------------------------------------------

Env*
getEnv(void) {
  return callStack[callStackInd - 1];
}

// ---------------------------------------------------------------------------

Env*
getGlobalEnv(void) {
  return getEnv()->globals ? getEnv()->globals : getEnv();
}

// ---------------------------------------------------------------------------

Env*
copyEnv(Env* env) {
  // assert env not freed (freed env has numDefs = 0)
  assert(env->numDefs);
  Env* newEnv = makeEnv(env->numDefs, env->globals);

  for (int index = 0; index < newEnv->numDefs; index++) {
    newEnv->defs[index] = env->defs[index];
  }

  return newEnv;
}

// ---------------------------------------------------------------------------

Def*
getFieldDefOrNull(Env* env, int nameIndex) {
  for (int index = 0; index < env->numDefs; index++) {
    if (env->defs[index].nameIndex == nameIndex) {
      return &env->defs[index];
    }
  }
  return NULL;
}

// ---------------------------------------------------------------------------

Def*
getEnvDef(Env* env, int defIndex) {
  assert(defIndex < env->numDefs);
  return &env->defs[defIndex];
}

// ---------------------------------------------------------------------------

Def*
getLocalDef(int defIndex) {
  return getEnvDef(getEnv(), defIndex);
}

// ---------------------------------------------------------------------------

Def*
getGlobalDef(int defIndex) {
  return getEnvDef(getGlobalEnv(), defIndex);
}

// ---------------------------------------------------------------------------

void
addDefValue(Def* def, PtlsValue value) {
  assert(!def->hasValue);
  def->value = value;
  def->hasValue = true;
}

// ---------------------------------------------------------------------------

void
pushEnv(Env* env, Instruction* inst) {
  retStack[callStackInd] = inst;
  callStack[callStackInd++] = env;
  
  if (callStackInd >= callStackSize) {
    errorHeader("Runtime Error");
    fprintf(stderr, "Call stack overflow");
    showEnvTrace();
    throwError();
  }
}

// ---------------------------------------------------------------------------

Instruction*
popEnv(void) {
  assert(callStackInd);
  callStackInd--;
  if (!callStackInd) {
    return NULL;
  }
  return retStack[callStackInd]; 
}
