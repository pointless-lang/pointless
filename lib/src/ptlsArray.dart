
import "package:collection/collection.dart";
import "package:dartz/dartz.dart" as dartz;

import "location.dart";
import "ptlsError.dart";
import "ptlsLabel.dart";
import "ptlsList.dart";
import "ptlsNumber.dart";
import "ptlsTuple.dart";
import "ptlsValue.dart";

// ---------------------------------------------------------------------------

class PtlsArray extends PtlsValue {
  dartz.IVector<PtlsValue> elems;

  // -------------------------------------------------------------------------
  
  PtlsArray(this.elems);

  // -------------------------------------------------------------------------

  List<PtlsValue> get elemsList => [...elems.toIterable()];

  // -------------------------------------------------------------------------

  int checkIndex(num index) {
    if (index.toInt() != index) {
      var error = PtlsError("Index Error");
      error.message = "Expected integer index value, got $index";
      throw error;
    }

    if (index < 0 || index >= elems.length()) {
      var error = PtlsError("Index Error");
      var len = elems.length();
      error.message = "Invalid index $index, for array with length $len";
      throw error;
    }

    return index.toInt();
  }

  // -------------------------------------------------------------------------

  PtlsValue getIndex(PtlsValue rhs) {
    PtlsNumber numVal = rhs.checkType([PtlsNumber]);
    var index = checkIndex(numVal.value);
    return (elems[index] as dartz.Some).value;
  }

  // -------------------------------------------------------------------------

  PtlsValue updateIndex(PtlsValue index, PtlsValue result) {
    PtlsNumber numVal = index.checkType([PtlsNumber]);
    var ind = checkIndex(numVal.value);
    return PtlsArray(elems.setIfPresent(ind, result));
  }

  // -------------------------------------------------------------------------

  PtlsValue getField(String name, Location loc) {
    switch (name) {
      case "!getList":
        return PtlsList.fromValues(elems.toIterable());

      case "!getTuple":
        return PtlsTuple([...elems.toIterable()]);

      case "!getType":
        return PtlsLabel("PtlsArray");

      case "!getLength":
        return PtlsNumber(elems.length());

      default: super.getField(name, loc); // throws error
    }

    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  bool operator==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    
    if (other is PtlsArray) {
      return ListEquality().equals(other.elemsList, elemsList);
    }

    return false;
  }

  // -------------------------------------------------------------------------

  int get hashCode => PtlsValue.hashCodeIter(elemsList);

  // -------------------------------------------------------------------------

  String toString() => "$elems";
}
