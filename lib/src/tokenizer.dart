
import "location.dart";
import "ptlsError.dart";
import "symbols.dart";
import "token.dart";
import "tokenTypes.dart";

// ---------------------------------------------------------------------------

class Tokenizer {
  int index = 0;            // current position in chars
  int tokIndex = 0;         // start position of current token
  String chars;             // source string
  String path;              // path of chars source file
  List<Location> locs = []; // locations of each char in chars

  // -------------------------------------------------------------------------

  Tokenizer(String chars, this.path) {
    this.chars = chars.replaceAll("\r", "\n");
    getLocs();
  }

  // -------------------------------------------------------------------------
  // advance a character in the input string

  String advance() => chars[index++];

  // -------------------------------------------------------------------------
  // are there still chars left to parse

  bool hasChars(int offset) => index + offset < chars.length;

  // -------------------------------------------------------------------------
  // get char at offset from current position, or null if past end of input

  String getChar(int offset) =>
    hasChars(offset) ? chars[index+ offset] : null; 

  // -------------------------------------------------------------------------
  // get substring from source that token covers

  String getTokValue() => chars.substring(tokIndex, index);

  // -------------------------------------------------------------------------
  // get locations for each input char

  void getLocs() {
    var lineNum = 1;
    var colNum = 1;

    var lines = chars.split("\n");

    for (var c in chars.split("")) {
      locs.add(Location(lineNum, colNum, path, lines[lineNum - 1]));

      if (c == "\n") {
        colNum = 1;
        lineNum++;

      } else {
        colNum++;
      }
    }

    // loc for EOF
    locs.add(Location(lineNum, colNum, path, chars));
  }

  // -------------------------------------------------------------------------

  Token makeToken(Tok tokType) {
    var value = getTokValue();
    var token = Token(tokType, value, locs[tokIndex]);
    tokIndex = index; // set next token to start at upcoming char
    return token;
  }

  // -------------------------------------------------------------------------
  // get token type of upcoming token

  // hopefully faster than regex
  static var digits = Set.of("0123456789".split(""));
  static var lowers = Set.of("abcdefghijklmnopqrstuvwxyz".split(""));
  static var uppers = Set.of("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
  static var alnums = {...lowers, ...uppers, ...digits};

  bool isBlank() {
    return getChar(0) == "_";
  }

  bool isComment() {
    return getChar(0) == "-" && getChar(1) == "-";
  }

  bool isNumber() {
    var isInt = digits.contains(getChar(0));
    var isFloat = getChar(0) == "." && digits.contains(getChar(1));
    return isInt || isFloat;
  }

  bool isName() {
    return lowers.contains(getChar(0));
  }

  bool isLabel() {
    return uppers.contains(getChar(0));
  }

  bool isField() {
    var isCustom = getChar(0) == "." && lowers.contains(getChar(1));

    // special built in fields
    var isLangField =
      getChar(0) == "." &&
      getChar(1) == "!" &&
      lowers.contains(getChar(2));

    return isCustom || isLangField;
  }

  bool isOpSym() {
    return opSymChars.contains(getChar(0));
  }

  bool isWhitespace() {
    return getChar(0) == " ";
  }

  bool isNewline() {
    return getChar(0) == "\n";
  }

  bool isSeparator() {
    return separators.containsKey(getChar(0));
  }

  bool isLeftSym() {
    return leftSyms.containsKey(getChar(0));
  }

  bool isRightSym() {
    return rightSyms.containsKey(getChar(0));
  }

  bool isMultiString() {
    return getChar(0) == '"' && getChar(1) == '"' && getChar(2) == '"';
  }

  bool isString() {
    return getChar(0) == '"';
  }

  // -------------------------------------------------------------------------

  Token handleBlank() {
    advance(); // take blank char
    return makeToken(Tok.Blank);
  }

  // -------------------------------------------------------------------------

  Token handleComment() {
    while (getChar(0) == "-") {
      advance(); // take all dashes
    }

    while (hasChars(0) && getChar(0) != "\n") {
      advance(); // take comment chars until the end of the line
    }

    return makeToken(Tok.Comment);
  }

  // -------------------------------------------------------------------------

  Token handleWhitespace() {
    // combine repeated spaces into one token
    while (getChar(0) == " ") {
      advance();
    }

    return makeToken(Tok.Whitespace);
  }

  // -------------------------------------------------------------------------

  Token handleNewline() {
    // combine repeated newline into one token
    while (getChar(0) == "\n") {
      advance();
    }

    return makeToken(Tok.Newline);
  }

  // -------------------------------------------------------------------------

  Token handleSeparator() {
    var sym = advance(); // get symbol char
    return makeToken(separators[sym]);
  }

  // -------------------------------------------------------------------------

  Token handleName() {
    while (alnums.contains(getChar(0))) {
      advance(); // take all alphanumeric chars
    }

    var value = getTokValue();
    // return matching keyword token if name is a keyword
    if (keywords.containsKey(value)) {
      return makeToken(keywords[value]);
    }

    return makeToken(Tok.Name);
  }

  // -------------------------------------------------------------------------

  Token handleField() {
    advance(); // take '.'
    advance(); // take '!' or first char

    while (alnums.contains(getChar(0))) {
      advance(); // take trailing alphanumeric chars
    }

    return makeToken(Tok.Field);
  }

  // -------------------------------------------------------------------------

  Token handleLabel() {
    while (alnums.contains(getChar(0))) {
      advance(); // take all alphanumeric chars
    }

    return makeToken(Tok.Label);
  }

  // -------------------------------------------------------------------------

  Token handleMultiString() {
    // take opening quotes
    advance();
    advance();
    advance();

    while (hasChars(0) && !isMultiString()) {

      // take escape chars in pairs
      if (getChar(0) == "\\" && getChar(1) != null) {
        advance(); // take slash
        advance(); // take escape char
        continue;
      } 

      advance(); // take next non-quote char
    }

    if (!hasChars(0)) {
      var error = PtlsError("Tokenizer Error");
      error.message = "Unmatched quote";
      error.locs.add(locs[tokIndex]);
      throw error;
    }

    // take closing quotes
    advance();
    advance();
    advance();
    return makeToken(Tok.String);
  }

  // -------------------------------------------------------------------------

  Token handleString() {
    advance(); // take opening quote
    while (hasChars(0) && getChar(0) != '"') {

      // take escape chars in pairs
      if (getChar(0) == "\\" && getChar(1) != null) {
        advance(); // take slash
        advance(); // take escape char
        continue;
      } 

      advance(); // take next non-quote char

      if (getChar(0) == "\n") {
        var error = PtlsError("Tokenizer Error");
        error.message = "Unmatched quote (must escape line breaks in string)";
        error.locs.add(locs[tokIndex]);
        throw error;
      }
    }

    if (!hasChars(0)) {
      var error = PtlsError("Tokenizer Error");
      error.message = "Unmatched quote";
      error.locs.add(locs[tokIndex]);
      throw error;
    }

    advance(); // take closing quote
    return makeToken(Tok.String);
  }

  // -------------------------------------------------------------------------

  Token handleNumber() {
    advance(); // take first digit or '.'
    while (digits.contains(getChar(0))) {
      advance(); // take trailing digits
    }

    // will be true if number has digits on both sides of decimal point
    if (getChar(0) == "." && digits.contains(getChar(1))) {
      advance(); // skip '.'

      while (digits.contains(getChar(0))) {
        advance(); // take trailing digits
      }
    }

    return makeToken(Tok.Number);
  }

  // -------------------------------------------------------------------------

  Token handleOpSym() {
    while (opSymChars.contains(getChar(0))) {
      advance();
    }

    var value = getTokValue();
    if (!opSyms.containsKey(value)) {
      var error = PtlsError("Tokenizer Error");
      error.message = "Invalid operator '$value'";
      error.locs.add(locs[tokIndex]);
      throw error;
    }

    return makeToken(opSyms[value]);
  }

  // -------------------------------------------------------------------------

  Token handleLeftSym() {
    var value = advance(); // take sym char
    return makeToken(leftSyms[value]);
  }

  // -------------------------------------------------------------------------

  Token handleRightSym() {
    var value = advance(); // take sym char
    return makeToken(rightSyms[value]);
  }

  // -------------------------------------------------------------------------
  // dispatch token handler

  Token getToken() {
    if (isBlank()) return handleBlank();
    if (isComment()) return handleComment();
    if (isWhitespace()) return handleWhitespace();
    if (isNewline()) return handleNewline();
    if (isSeparator()) return handleSeparator();
    if (isName()) return handleName();
    if (isField()) return handleField();
    if (isLabel()) return handleLabel();
    if (isMultiString()) return handleMultiString();
    if (isString()) return handleString();
    if (isNumber()) return handleNumber();
    if (isOpSym()) return handleOpSym();
    if (isLeftSym()) return handleLeftSym();
    if (isRightSym()) return handleRightSym();

    var error = PtlsError("Tokenizer Error");
    error.message = "Unexpected symbol '${chars[index]}'";
    error.locs.add(locs[index]);
    throw error;
  }

  // -------------------------------------------------------------------------

  Iterable<Token> getInitialTokens() sync* {
    while (hasChars(0)) {
      yield getToken();
    }

    yield makeToken(Tok.EOF);
  }

  // -------------------------------------------------------------------------
  // scan tokens, keeping track of whether '-' corresponds to a negative
  // sign or subtraction operator, depending on whether they occur at the start
  // of an expression, and update (all '-' are initially parsed as subtraction)

  static var startToks = {
    ...opSyms.values, ...separators.values,
    ...leftSyms.values, ...keywords.values,
  };

  static var endSyms = {
    ...rightSyms.values, Tok.Name, Tok.Field, Tok.String, Tok.Number,
  };

  Iterable<Token> getTokens() sync* {
    var isStartExpr = true;

    var tokens = [...getInitialTokens()];
    for (var index = 0; index < tokens.length;) {

      var token = tokens[index];
      var lastToken = index == 0 ? null : tokens[index - 1];
      var nextToken = index == tokens.length - 1 ? null : tokens[index + 1];

      if (token.tokType == Tok.Sub && isStartExpr) {
        token.tokType = Tok.Neg;
      }

      if ( token.tokType == Tok.Sub
        && lastToken?.tokType == Tok.Whitespace
        && [Tok.Number, Tok.Name, Tok.LParen].contains(nextToken?.tokType)) {

        yield Token(Tok.Neg, token.value, token.loc);

      } else {
        yield token;
      }

      index++;

      if (startToks.contains(token.tokType)) {
        isStartExpr = true;

      } else if (endSyms.contains(token.tokType)) {
        isStartExpr = false;
      }
    }
  }
}
