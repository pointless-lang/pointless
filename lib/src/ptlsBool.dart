
import "location.dart";
import "ptlsLabel.dart";
import "ptlsNumber.dart";
import "ptlsString.dart";
import "ptlsValue.dart";

// ---------------------------------------------------------------------------

class PtlsBool extends PtlsValue {
  bool value;

  // -------------------------------------------------------------------------
  
  PtlsBool(this.value);  

  // -------------------------------------------------------------------------

  PtlsValue getField(String name, Location loc) {
    switch (name) {
      case "!getInt":
        return PtlsNumber(value ? 1 : 0);


      case "!getFloat":
        return PtlsNumber(value ? 1.0 : 0.0);

      case "!getString":
        return PtlsString(value ? "true" : "false");

      case "!getType":
        return PtlsLabel("PtlsBool");

      default: super.getField(name, loc); // throws error
    }

    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  bool operator==(Object other) {
    if (other is PtlsBool) {
      return other.value == value;
    }

    return false;
  }

  // -------------------------------------------------------------------------

  int get hashCode => value.hashCode;

  // -------------------------------------------------------------------------

  String toString() => "$value";
}
