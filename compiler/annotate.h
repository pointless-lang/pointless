
#include "../files/files.h"

// ---------------------------------------------------------------------------
// annotate source node tree with lex scope information
// can optinally be set to log annotation along with way, since
// doing so after the fact is to cumbersome

LexScope*
annotate(FileStruct* file, bool log);
