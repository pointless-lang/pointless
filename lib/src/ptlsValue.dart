
import "ASTNode.dart";
import "env.dart";
import "interpreter.dart";
import "location.dart";
import "nodeTypes.dart";
import "ptlsArray.dart";
import "ptlsDict.dart";
import "ptlsError.dart";
import "ptlsObject.dart";
import "ptlsSet.dart";
import "ptlsTuple.dart";

// ---------------------------------------------------------------------------

class PtlsValue {
  Location loc;

  // -------------------------------------------------------------------------

  bool contains(PtlsValue value) {
    checkType([PtlsDict, PtlsSet]); // throw error
    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  PtlsValue getMember(int index) {
    checkType([PtlsTuple]); // throw error
    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  PtlsValue getIndex(PtlsValue rhs) {
    checkType([PtlsDict, PtlsArray]); // throw error
    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  PtlsValue updateIndex(PtlsValue index, PtlsValue result) {
    checkType([PtlsDict, PtlsArray]); // throw error
    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  PtlsValue getField(String name) {
    // if is language field
    if (name[0] == "!") {
      var error = PtlsError("Type Error");
      error.message = "No built-in field '$name' for type '$runtimeType'";
      error.locs.add(loc);
      throw error;
    }

    checkType([PtlsObject]); // throw error
    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  PtlsValue updateField(String name, PtlsValue result) {
    checkType([PtlsObject]); // throw error
    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  static PtlsValue update(Env env, ASTNode accessor, PtlsValue result) {
    if (accessor.nodeType == Node.Name) {
      // base case: accessor is '$' name
      return result;
    }

    // example: $.foo[123].baz is accessor, $.foo[123] is lhs, baz = name
    var lhs = eval(env, accessor[0]);

    if (accessor.nodeType == Node.Index) {
      var index = eval(env, accessor[1]);
      result = lhs.updateIndex(index, result);

    } else {
      String name = accessor[1][0];
      result = lhs.updateField(name, result);
    }

    return update(env, accessor[0], result);
  }

  // -------------------------------------------------------------------------

  PtlsValue checkType(List<Type> types) {
    if (!types.contains(runtimeType)) {
      var typesStr = types.join(" or ");
      var error = PtlsError("Type Error");
      error.message = "Expected type '$typesStr', got '$runtimeType'";
      error.locs.add(loc);
      throw error;
    }

    return this;
  }

  // -------------------------------------------------------------------------

  bool get isEmpty => false;

  PtlsValue checkIsList() {
    var error = PtlsError("Type Error");
    error.message = "Expected type 'PtlsList or Empty', got '$runtimeType'";
    error.locs.add(loc);
    throw error;
  }

  // -------------------------------------------------------------------------

  int get hashCode {
    var error = PtlsError("Type Error");
    error.message = "Cannot hash type '$runtimeType'";
    error.locs.add(loc);
    throw error;
  }
}
