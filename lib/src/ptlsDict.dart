
import "package:collection/collection.dart";
import "package:dartz/dartz.dart" as dartz;

import "location.dart";
import "ptlsBuiltIn.dart";
import "ptlsError.dart";
import "ptlsLabel.dart";
import "ptlsList.dart";
import "ptlsNumber.dart";
import "ptlsValue.dart";

// ---------------------------------------------------------------------------

class PtlsDict extends PtlsValue {
  dartz.IHashMap<PtlsValue, PtlsValue> map;

  // -------------------------------------------------------------------------
  
  PtlsDict(this.map);

  // -------------------------------------------------------------------------

  bool contains(PtlsValue value) {
    return map.get(value) is! dartz.None;
  }

  // -------------------------------------------------------------------------

  PtlsValue getIndex(PtlsValue rhs) {
    var result = map[rhs];

    if (result.isNone()) {
      var error = PtlsError("Index Error");
      error.message = "Given key does not exist in dict";
      throw error;
    }

    return (result as dartz.Some).value;
  }

  // -------------------------------------------------------------------------

  PtlsValue updateIndex(PtlsValue index, PtlsValue result) {
    return PtlsDict(map.put(index, result));
  }

  // -------------------------------------------------------------------------

  PtlsValue delKey(PtlsValue key) {
    return PtlsDict(map.remove(key));
  }

  // -------------------------------------------------------------------------

  PtlsValue getField(String name, Location loc) {
    switch (name) {
      case "!getDelKey":
        return PtlsBuiltIn("!getDelKey(key)", delKey);

      case "!getKeys":
        return PtlsList.fromValues(map.keyIterable());

      case "!getVals":
        return PtlsList.fromValues(map.valueIterable());

      case "!getType":
        return PtlsLabel("PtlsDict");

      case "!getLength":
        return PtlsNumber(map.length());

      default: super.getField(name, loc); // throws error
    }

    throw false; // should never get here
  }
  
  // -------------------------------------------------------------------------

  bool operator==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    
    if (other is PtlsDict) {
      return MapEquality().equals(other.map.toMap(), map.toMap());
    }

    return false;
  }

  // -------------------------------------------------------------------------

  int get hashCode => PtlsValue.hashCodeMap(map.toMap());

  // -------------------------------------------------------------------------

  String toString() => "$map";
}
