
import "dart:math";

import "ptlsLabel.dart";
import "ptlsString.dart";
import "ptlsValue.dart";

// ---------------------------------------------------------------------------

class PtlsNumber extends PtlsValue {
  num value;

  // -------------------------------------------------------------------------
  
  PtlsNumber(this.value);

  // -------------------------------------------------------------------------

  PtlsValue getField(String name) {
    switch (name) {
      case "!getInt":
        return PtlsNumber(value.toInt());

      case "!getFloat":
        return PtlsNumber(value.toDouble());

      case "!getAsin":
        return PtlsNumber(asin(value));

      case "!getAcos":
        return PtlsNumber(acos(value));

      case "!getAtan":
        return PtlsNumber(atan(value));

      case "!getSin":
        return PtlsNumber(sin(value));

      case "!getCos":
        return PtlsNumber(cos(value));

      case "!getTan":
        return PtlsNumber(tan(value));

      case "!getLn":
        return PtlsNumber(log(value));

      case "!getString":
        return PtlsString(value.toString());

      case "!getType":
        return PtlsLabel("PtlsNumber");

      default: super.getField(name); // throws error
    }

    throw false; // should never get here
  }
  
  // -------------------------------------------------------------------------

  bool operator==(Object other) {
    if (other is PtlsNumber) {
      return other.value == value;
    }

    return false;
  }

  // -------------------------------------------------------------------------

  int get hashCode => value.hashCode;

  // -------------------------------------------------------------------------

  String toString() => "$value";
}
