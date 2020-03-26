
#include <assert.h>
#include <string.h>

#include "../tokenizer/tokenizer.h"
#include "../files/files.h"

// ---------------------------------------------------------------------------

int main(int argc, char *argv[]) {
  assert(argc == 2);
  char* path = argv[1];
  
  FileStruct* file = getFileStruct(path, strlen(path));
  tokenize(file);
  showTokens(file->tokens);

  return 0;
}
