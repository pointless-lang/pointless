
#include <assert.h>
#include <string.h>

#include "files/files.h"
#include "vm/vm.h"

// -----------------------------------------------------------------------------

int main(int argc, char *argv[]) {
  assert(argc == 2);
  char* path = argv[1];
  
  FileStruct* file = getFileStruct(path, strlen(path));
  run(file);
}
