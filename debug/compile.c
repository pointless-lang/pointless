
#include <assert.h>
#include <string.h>

#include "../compiler/compiler.h"
#include "../compiler/showInstructions.h"
#include "../files/files.h"

// ---------------------------------------------------------------------------

int main(int argc, char *argv[]) {
  assert(argc == 2);
  char* path = argv[1];
  
  FileStruct* file = getFileStruct(path, strlen(path));
  showInstructions(compile(file, false));

  return 0;
}
