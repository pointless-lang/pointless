
#include <assert.h>
#include <string.h>

#include "../tokenizer/tokenizer.h"
#include "../files/files.h"

// ---------------------------------------------------------------------------

typedef struct {
  char* sym;
  TokenType tokType;
} Pair;

extern Pair keywords[];
extern Pair opSyms[];
extern Pair separators[];

extern bool matchTokenType(Pair* pairs, TokenType tokType);

// ---------------------------------------------------------------------------

char special[] = "|floor|ceil|randFloat|randRange|randChoice|equals|notEquals|addElem|delElem|delKey|readLines|union|intersection|difference|symDifference|printLines|dropUntil|lazyConcat|peano|pred|printFrame|println|rangeStep|toMap|keys|vals|items|join|concatStrings|split|padLeft|padRight|format|compose|const|iterate|sum|range|toInt|toFloat|round|pi|euler|abs|pow|mul|div|mod|add|sub|max|min|minimum|maximum|lessEq|lessThan|greaterEq|greaterThan|notFunc|notEq|eq|orFunc|andFunc|inFunc|any|all|repr|show|print|copy|head|tail|at|slice|concat|concatMap|intersperse|repeat|take|drop|takeWhile|takeUntil|dropWhile|find|span|groupBy|suffixes|map|filter|reduce|reduceFirst|reverse|zip|toList|toArray|toSet|toNDArray|length|hasPrefix|enumerate|sort|";

int main(int argc, char *argv[]) {
  assert(argc == 2);
  char* path = argv[1];
  
  FileStruct* file = getFileStruct(path, strlen(path));
  tokenize(file);

  for (Token* token = file->tokens; token; token = token->next) {

    char tokChars[token->length + 3];

    tokChars[0] = '|';
    strncpy(&tokChars[1], token->chars, token->length);
    tokChars[token->length + 1] = '|';
    tokChars[token->length + 2] = '\0';

    char* color = NULL;

    if (matchTokenType(keywords, token->tokType)) {
      color = "#c594c5";

    } else if (matchTokenType(opSyms, token->tokType)) {
      color = "#F97B58";

    } else if (token->tokType == Tok_Label) {
      color = "#7986CB";

    } else if (token->tokType == Tok_Neg) {
      color = "#F97B58";

    } else if (token->tokType == Tok_Label) {
      color = "#c594c5";

    } else if (token->tokType == Tok_Number) {
      color = "#F9AE58";

    } else if (token->tokType == Tok_String) {
      color = "#99C794";

    } else if (token->tokType == Tok_Comment) {
      color = "#A6ACB9";

    } else if (strstr(special, tokChars)) {
      color = "#6699cc";

    } else {
      color = "#D8DEE9";
    }

    printf("<span style='color: %s;'>", color);
    printTokString(token);
    printf("</span>");
  }

  return 0;
}
