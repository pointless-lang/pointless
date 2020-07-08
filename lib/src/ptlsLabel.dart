
import "dart:io";
import "dart:math";
import "package:dartz/dartz.dart" as dartz;

import "ptlsArray.dart";
import "ptlsBuiltIn.dart";
import "ptlsError.dart";
import "ptlsList.dart";
import "ptlsNumber.dart";
import "ptlsObject.dart";
import "ptlsSet.dart";
import "ptlsString.dart";
import "ptlsTuple.dart";
import "ptlsValue.dart";
import "thunk.dart";

// ---------------------------------------------------------------------------

class PtlsLabel extends PtlsValue {
  String value;

  // -------------------------------------------------------------------------
  
  PtlsLabel(this.value);  

  // -------------------------------------------------------------------------

  bool get isEmpty => value == "Empty";

  PtlsValue checkIsList() {
    if (isEmpty) {
      return this;
    }

    super.checkIsList(); // throws error
    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  PtlsValue getZeros(PtlsValue val) {
    var n = (val.checkType([PtlsNumber]) as PtlsNumber).value;
    var zeros = List.filled(n, PtlsNumber(0));
    return PtlsArray(dartz.IVector.from(zeros));
  }

  // -------------------------------------------------------------------------
  // online interface reassigns debug handler

  static Function debugHandler = (String str) {
    print(str);
  };

  // -------------------------------------------------------------------------

  PtlsValue getDebug(PtlsValue val) {
    debugHandler(val.toString());
    return val;
  }

  // -------------------------------------------------------------------------

  PtlsValue getLines() {
    var line = stdin.readLineSync();
    if (line == null) {
      return PtlsLabel("Empty");
    }

    var headThunk = Thunk.fromValue("", PtlsString(line));
    var tailThunk = Thunk("", getLines);
    return PtlsList(headThunk, tailThunk);
  }

  // -------------------------------------------------------------------------

  PtlsValue getWrap(PtlsValue value) {
    return PtlsTuple([value], this);
  }

  // -------------------------------------------------------------------------

  PtlsValue getWrapTuple(PtlsValue tuple) {
    tuple.checkType([PtlsTuple]);
    return PtlsTuple((tuple as PtlsTuple).members, this);
  }

  // -------------------------------------------------------------------------

  PtlsValue getWrapObject(PtlsValue object) {
    object.checkType([PtlsObject]);
    return PtlsObject((object as PtlsObject).env, this);
  }

  // -------------------------------------------------------------------------

  static var random = Random();

  PtlsValue getField(String name) {
    switch (name) {
      case "!getLines":
        checkLabel("IO", "!getLines");
        return getLines();

      case "!getDebug":
        checkLabel("IO", "!getDebug");
        return PtlsBuiltIn("!getDebug(value)", getDebug);

      case "!getRand":
        checkLabel("IO", "!getRand");
        return PtlsNumber(random.nextDouble());

      case "!getSet":
        checkLabel("Empty", "!getSet");
        return PtlsSet(dartz.IHashMap.empty());

      case "!getZeros":
        checkLabel("PtlsArray", "!getZeros");
        return PtlsBuiltIn("!getZeros(n)", getZeros);

      case "!getString":
        return PtlsString(value);

      case "!getType":
        return PtlsLabel("PtlsLabel");

      case "!getWrap":
        return PtlsBuiltIn("!getWrap(value)", getWrap);

      case "!getWrapTuple":
        return PtlsBuiltIn("!getWrapTuple(tuple)", getWrapTuple);

      case "!getWrapObject":
        return PtlsBuiltIn("!getWrapObject(obj)", getWrapObject);

      default:
        super.getField(name); // throws error
    }

    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  void checkLabel(String val, String name) {
    if (value != val) {
      var error = PtlsError("Type Error");
      error.message = "No built-in field '$name' for label '$value'";
      throw error;
    }
  }

  // -------------------------------------------------------------------------

  bool operator==(Object other) {
    if (other is PtlsLabel) {
      return other.value == value;
    }

    return false;
  }

  // -------------------------------------------------------------------------

  int get hashCode => value.hashCode;
  
  // -------------------------------------------------------------------------

  String toString() => value;
}
