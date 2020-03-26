
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <unistd.h>
#include <string.h>

#include "files/files.h"
#include "tokenizer/tokenizer.h"
#include "parser/showNode.h"
#include "parser/parserFuncs.h"
#include "compiler/compiler.h"
#include "compiler/showInstructions.h"
#include "vm/vm.h"

// -----------------------------------------------------------------------------

int main(int argc, char *argv[]) {
  assert(argc == 2);
  char* path = argv[1];
  
  FileStruct* file = getFileStruct(path, strlen(path));
  run(file);
}
