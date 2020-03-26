
#include <assert.h>
#include <string.h>

#include "../parser/parser.h"
#include "../parser/showNode.h"
#include "../files/files.h"

// ---------------------------------------------------------------------------

int main(int argc, char *argv[]) {
  assert(argc == 2);
  char* path = argv[1];
  
  FileStruct* file = getFileStruct(path, strlen(path));
  parse(file);
  showNode(file->node);

  return 0;
}
