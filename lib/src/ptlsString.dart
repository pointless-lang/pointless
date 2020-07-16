
import "location.dart";
import "ptlsLabel.dart";
import "ptlsList.dart";
import "ptlsNumber.dart";
import "ptlsValue.dart";

// ---------------------------------------------------------------------------

class PtlsString extends PtlsValue {
  String value;

  // -------------------------------------------------------------------------
  
  PtlsString(this.value); 

  // -------------------------------------------------------------------------

  PtlsValue getField(String name, Location loc) {
    switch (name) {
      case "!getLower":
        return PtlsString(value.toLowerCase());

      case "!getUpper":
        return PtlsString(value.toUpperCase());

      case "!getInt":
        return PtlsNumber(int.parse(value));

      case "!getFloat":
        return PtlsNumber(double.parse(value));

      case "!getString":
        return this;

      case "!getList":
        var chars = value.runes.map(
          (rune) => PtlsString(String.fromCharCode(rune))
        ).toList();
        return PtlsList.fromValues(chars);

      case "!getType":
        return PtlsLabel("PtlsString");

      case "!getLength":
        return PtlsNumber(value.runes.length);

      default: super.getField(name, loc); // throws error
    }

    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  bool operator==(Object other) {
    if (other is PtlsString) {
      return other.value == value;
    }

    return false;
  }

  // -------------------------------------------------------------------------

  int get hashCode => value.hashCode;

  // -------------------------------------------------------------------------

  String toString() => "\"$value\"";
}
