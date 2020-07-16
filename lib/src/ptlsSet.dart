
import "package:collection/collection.dart";
import "package:dartz/dartz.dart" as dartz;

import "location.dart";
import "ptlsBuiltIn.dart";
import "ptlsLabel.dart";
import "ptlsList.dart";
import "ptlsNumber.dart";
import "ptlsValue.dart";

// ---------------------------------------------------------------------------

class PtlsSet extends PtlsValue {
  // dartz doesn't have IHashSet, so use IHashMap instead
  dartz.IHashMap<PtlsValue, PtlsValue> map;

  // -------------------------------------------------------------------------
  
  PtlsSet(this.map);

  // -------------------------------------------------------------------------

  bool contains(PtlsValue value) {
    return map.get(value) is! dartz.None;
  }

  // -------------------------------------------------------------------------

  PtlsValue addElem(PtlsValue elem) {
    return PtlsSet(map.put(elem, null));
  }

  // -------------------------------------------------------------------------

  PtlsValue delElem(PtlsValue elem) {
    return PtlsSet(map.remove(elem));
  }

  // -------------------------------------------------------------------------

  PtlsValue getField(String name, Location loc) {
    switch (name) {
      case "!getAddElem":
        return PtlsBuiltIn("!getAddElem(elem)", addElem);

      case "!getDelElem":
        return PtlsBuiltIn("!getDelElem(elem)", delElem);

      case "!getType":
        return PtlsLabel("PtlsSet");

      case "!getLength":
        return PtlsNumber(map.length());

      case "!getList":
        return PtlsList.fromValues(map.keyIterable());

      default: super.getField(name, loc); // throws error
    }

    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  bool operator==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    
    if (other is PtlsSet) {
      return MapEquality().equals(other.map.toMap(), map.toMap());
    }

    return false;
  }

  // -------------------------------------------------------------------------

  int get hashCode => PtlsValue.hashCodeMap(map.toMap());

  // -------------------------------------------------------------------------

  String toString() => "$map";
}
