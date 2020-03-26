
FuncRef* funcRef = getRef(func, funcRef);

int oldInd = funcRef->paramInd;
int paramInd = funcRef->paramInd + inst->arg;

// check that call doesn't provide too many params
if (paramInd > funcRef->numParams) {
  errorHeader("Type Error");
  fprintf(stderr,
    "Too many args (%d) for function with arity %d",
    paramInd, funcRef->numParams);
  showEnvTrace();
  throwError();
}

Env* funcEnv = copyEnv(funcRef->env);

// call is tail-call if next instruction is a return
bool isTailCall = (inst + 1)->op == Op_Return;
bool isPartApp  = paramInd < funcRef->numParams;

// args come on stack in reverse order, have to pop in reverse
for (int argIndex = paramInd - 1; argIndex >= oldInd; argIndex--) {
  addDefValue(&funcEnv->defs[argIndex], popValue());
}

// partial application - still more params to go
if (isPartApp) {
  PtlsValue newFunc = makeFunc(
    funcRef->numParams, paramInd, funcEnv, funcRef->inst
  );

  pushValue(newFunc);
  inst++;
  gotoHandler;
}

// return address of upcoming return inst becomes new return addr
if (isTailCall) {
  Instruction* retInst = popEnv();
  
  // handleMakeEnv pushes null inst to ret stack - make sure that
  // a null hasn't made its way here
  assert(retInst);
  pushEnv(funcEnv, retInst);

} else {
  pushEnv(funcEnv, inst + 1);
}

inst = funcRef->inst;
collect();
gotoHandler;
