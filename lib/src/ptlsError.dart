
import "dart:collection";

import "location.dart";

// -----------------------------------------------------------------------------

class PtlsError implements Exception {
  String header;
  String message;
  var locs = LinkedHashSet<Location>();

  // ---------------------------------------------------------------------------

  PtlsError(this.header);

  // ---------------------------------------------------------------------------
  // example:
  //
  // ---------------------------------------------------------------------------
  // Tokenizer Error
  // 
  // Unmatched quote
  // ---------------------------------------------------------------------------
  // 
  // At (line 1) (column 1) in 'scratchpad'
  // "foo
  // ^
  //

  String toString() {
    var sep = "-" * 79;
    var locStr = locs.join("");
    return "$sep\n$header:\n\n$message\n$sep\n$locStr";
  }
}
