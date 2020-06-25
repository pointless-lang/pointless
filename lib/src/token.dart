
import "location.dart";
import "tokenTypes.dart";

// ---------------------------------------------------------------------------

class Token {
  Tok tokType;
  String value;
  Location loc;

  // -------------------------------------------------------------------------

  Token(this.tokType, this.value, this.loc);

  // -------------------------------------------------------------------------
  // get string representation for tokenType

  String typeStr() => tokType.toString().split(".").last;

  // -------------------------------------------------------------------------
  // get string for a token, showing its location, type, and contents

  // example:
  //  1:1  [ Newline      ]

  String toString() {
    var lineStr = loc.lineNum.toString().padLeft(3);
    var colStr = loc.colNum.toString().padRight(2);
    var tokStr = typeStr().padRight(12);

    // trim to suppress newline, neaten output
    return "$lineStr:$colStr [ $tokStr ] ${value.trim()}";
  }
}
