
#include <stdio.h>
#include <assert.h>
#include <string.h>
#include <stdlib.h>
#include <dirent.h>
#include <limits.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

#include "files.h"
#include "../parser/parser.h"
#include "../error/error.h"

// -----------------------------------------------------------------------------
// pool allocator - no need to free!
// numBytes limits total size of source that compiler can handle

#define numBytes 10000000

// -----------------------------------------------------------------------------

void*
alloc(int n) {
  static char mem[numBytes];
  static int index = 0;

  // check that new allocation won't exceed allocator pool size
  assert(index + n < numBytes);
  index += n;
  return &mem[index - n];
}

// -----------------------------------------------------------------------------
// cache imports to avoid importing same file twice

static FileStruct* imports;

// -----------------------------------------------------------------------------

FileStruct*
getImports(void) {
  return imports;
}

// -----------------------------------------------------------------------------
// make new file structure with given path (relative for trace messages,
// absolute for file structure cache)
// path and absPath must both be null-terminated

FileStruct*
openNewFile(char* path, char* absPath) {
  FileStruct* file = alloc(sizeof(FileStruct));

  // absPath helps detect duplicate imports from different relative paths
  file->path = alloc(strlen(path) + 1);
  file->absPath = alloc(strlen(absPath) + 1);

  strcpy(file->path, path);
  strcpy(file->absPath, absPath);
  return file;
}

// -----------------------------------------------------------------------------
// return file struct with matching absolute path or make new structure

#define setNext(value) value = value->next

FileStruct*
makeFileStruct(char* path, int length) {
  char pathChars[PATH_MAX] = {0};
  strncpy(pathChars, path, length);

  char absPath[PATH_MAX];
  // get absolute path, checking for success
  bool gotFile = realpath(pathChars, absPath);
  
  if (!gotFile) {
    errorHeader("File Error");
    fprintf(stderr, "Cannot locate file '%s'", pathChars);
    throwError();
  }

  struct stat path_stat;
  stat(path, &path_stat);
  bool isFile = S_ISREG(path_stat.st_mode);

  if (!isFile) {
    errorHeader("File Error");
    fprintf(stderr, "'%s' is not a file", pathChars);
    throwError();
  }

  // iterate through existing file structures, compare absolute paths
  for (FileStruct* file = imports; file; setNext(file)) {
    if (strncmp(file->absPath, absPath, PATH_MAX) == 0) {
      return file;
    }
  }

  return openNewFile(pathChars, absPath);
}

// -----------------------------------------------------------------------------
// add char to file struct chars array

void
fileAddChar(FileStruct* file, char newChar) {
  file->chars[file->length++] = newChar;
}

// -----------------------------------------------------------------------------

void
fileAddToken(FileStruct* file, Token* token) {
  if (!file->tokens) {
    file->tokens = token;
  } else {
    file->lastToken->next = token;
  }

  file->lastToken = token;
}

// -----------------------------------------------------------------------------
// takes path length as well as char pointer, since chars may come from
// larger char array (like path in an import statement within the text of the
// program)

FileStruct*
processFileStruct(char* path, int length) {
  FileStruct* file = makeFileStruct(path, length);

  FILE* cFile = fopen(file->path, "r");
  assert(cFile);

  fseek(cFile, 0, SEEK_END);
  file->chars = alloc(ftell(cFile) + 1);
  rewind(cFile);

  char newChar;
  while ((newChar = fgetc(cFile)) != EOF) {
    fileAddChar(file, newChar);
  }

  fclose(cFile);
  return file;
}

// -----------------------------------------------------------------------------
// process file struct and add to list of file structs
// (intermediate prelude file structs don't get added to list, since
// to avoid erroneously handling them as imports in the compiler)
// 
// it's fine to not add prelude file structs to imports, since the
// prelude doesn't contain imports

FileStruct*
getFileStruct(char* path, int length) {
  FileStruct* file = processFileStruct(path, length);

  FileStruct* currentImport = imports;
  // don't add file to imports list if it's already been added
  while (currentImport) {
    if (currentImport == file) {
      return file;
    }
    currentImport = currentImport->next;
  }

  // all files added to imports list should be imports
  file->next = imports;
  imports = file;

  return file;
}

// -----------------------------------------------------------------------------
// base should come from some node->loc.path, thus should be null-terminated

FileStruct*
getFileRelative(char* base, char* path, int length) {
  // need copy, since dirname modifies path!??!
  char saveLocPath[strlen(base) + 1];
  memset(saveLocPath, 0, strlen(base) + 1);
  
  strncpy(saveLocPath, base, strlen(base));
  char* dir = dirname(saveLocPath);

  // +2 for slash, null terminator
  int relLength = strlen(path) + strlen(dir) + 2;

  // get import path relative to base path
  char relPath[relLength];
  snprintf(relPath, relLength, "%s/%.*s", dir, length, path);

  return getFileStruct(relPath, relLength);
}

// -----------------------------------------------------------------------------
// need to remove EOFs from all but the last file when collating
// prelude source files

void
removeEOFs(FileStruct* prelude) {
  Token* token = prelude->tokens;
  while (token) {
    // if there's an EOF next
    if (token->next && token->next->tokType == Tok_EOF) {
      // keep it if it's at the end
      if (!token->next->next) {
        break;
      }
      // skip it otherwise
      token->next = token->next->next;

    } else {
      // otherwise advance to the next token
      token = token->next;
    }
  }
}

// -----------------------------------------------------------------------------

char preludeDir[] = "lib/prelude";

void
addTokensPrelude(struct dirent* file, FileStruct* prelude) {
  if (file->d_name[0] != '.') {
    // get path to file in prelude dierctory
    static char path[PATH_MAX];

    int length = snprintf(
      path, PATH_MAX, "%s/%s", preludeDir, file->d_name
    );
    
    FileStruct* source = processFileStruct(path, length);
    tokenize(source);

    // add new tokens to current tokens list
    if (!prelude->tokens) {
      prelude->tokens = source->tokens;

    } else {
      prelude->lastToken->next = source->tokens;
    }

    // update prelude token information
    prelude->length += source->length;
    prelude->lastToken = source->lastToken;
  }
}

// -----------------------------------------------------------------------------

FileStruct*
getPrelude(void) {
  // prelude doesn't have file path set, but that's ok since location
  // data for tokens / nodes is carried over from original source files
  static FileStruct prelude = {0};

  if (!prelude.tokens) {
    DIR *dir;
    struct dirent *file;

    // collate tokens from all source files in prelude directory
    // prelude dir must only contains pointless source files 
    if ((dir = opendir(preludeDir))) {
      while ((file = readdir(dir))) {
        addTokensPrelude(file, &prelude);
      }
      closedir(dir);

    } else {
      assert(false);
    }
    // remove interstitial EOF tokens
    removeEOFs(&prelude);
  }

  if (!prelude.node) {
    parse(&prelude);
  }

  return &prelude;
}
