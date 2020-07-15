
import "package:collection/collection.dart";

import "ptlsError.dart";
import "ptlsLabel.dart";
import "ptlsList.dart";
import "ptlsNumber.dart";
import "ptlsValue.dart";

// ---------------------------------------------------------------------------

class PtlsTuple extends PtlsValue {
  PtlsLabel label;
  List<PtlsValue> members;
  
  static var defaultLabel = PtlsLabel("PtlsTuple");

  // -------------------------------------------------------------------------
  
  PtlsTuple(this.members, [this.label]) {
    label ??= defaultLabel;
  }

  // -------------------------------------------------------------------------

  PtlsValue checkLength(int length) {
    if (length != members.length) {
      var error = PtlsError("Type Error");
      error.message = 
        "Cannot destructure length $length tuple to ${members.length} names";
      throw error;
    }

    return this;
  }

  // -------------------------------------------------------------------------

  PtlsValue getMember(int index) {
    return members[index];
  }

  // -------------------------------------------------------------------------

  PtlsValue getField(String name) {
    switch (name) {
      case "!getLabel":
        return label;

      case "!getType":
        return PtlsLabel("PtlsTuple");

      case "!getLength":
        return PtlsNumber(members.length);

      case "!getList":
        return PtlsList.fromValues(members);

      default: super.getField(name); // throws error
    }

    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  bool operator==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    
    if (other is PtlsTuple) {
      if (other.label != label) {
        return false;
      }

      return ListEquality().equals(other.members, members);
    }

    return false;
  }

  // -------------------------------------------------------------------------

  int get hashCode => PtlsValue.hashCodeIter([label, ...members]);

  // -------------------------------------------------------------------------

  String toString() => "$label(${members.join(", ")})";
}
