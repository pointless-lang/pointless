
import "package:collection/collection.dart";

import "ASTNode.dart";
import "env.dart";
import "interpreter.dart";
import "location.dart";
import "ptlsLabel.dart";
import "ptlsValue.dart";
import "thunk.dart";

// ---------------------------------------------------------------------------

class PtlsList extends PtlsValue {
  Thunk headThunk;
  Thunk tailThunk;

  // -------------------------------------------------------------------------
  
  PtlsList(this.headThunk, this.tailThunk);  

  // -------------------------------------------------------------------------

  static PtlsValue fromValues(Iterable<PtlsValue> values) {
    PtlsValue result = PtlsLabel("Empty");

    for (var value in [...values].reversed) {
      var headThunk = Thunk.fromValue("", value);
      var tailThunk = Thunk.fromValue("", result);
      result = PtlsList(headThunk, tailThunk);
    }

    return result;
  }

  // -------------------------------------------------------------------------

  PtlsValue checkIsList() => this;

  // -------------------------------------------------------------------------

  PtlsValue get head => headThunk.getValue();
  PtlsValue get tail => tailThunk.getValue();

  // -------------------------------------------------------------------------

  List<PtlsValue> toList() {
    var tailIter = tail;
    var result = [head];

    while (!tailIter.isEmpty) {
      result.add((tailIter as PtlsList).head);
      tailIter = (tailIter as PtlsList).tail;
    }

    return result;
  }

  // -------------------------------------------------------------------------

  PtlsValue getField(String name, Location loc) {
    switch (name) {
      case "!getHead":
        return head;

      case "!getTail":
        return tail;

      case "!getList":
        return this;

      case "!getType":
        return PtlsLabel("PtlsList");

      default: super.getField(name, loc); // throws error
    }

    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  PtlsValue concat(Env env, ASTNode rhsNode) {
    if (tail.isEmpty) {
      var thunk = Thunk("", () => eval(env, rhsNode).checkIsList());
      return PtlsList(headThunk, thunk);
    }

    var thunk = Thunk("", () => (tail as PtlsList).concat(env, rhsNode));
    return PtlsList(headThunk, thunk);
  }

  // -------------------------------------------------------------------------

  bool operator==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    
    if (other is PtlsList) {
      return ListEquality().equals(other.toList(), toList());
    }

    return false;
  }

  // -------------------------------------------------------------------------

  int get hashCode => PtlsValue.hashCodeIter(toList());

  // -------------------------------------------------------------------------

  String toString() {
    dynamic list = this;
    var memberStrs = <String>[];

    while (list is PtlsList) {
      memberStrs.add(list.headThunk.value?.toString() ?? "?");
      list = list.tailThunk.value;
    }

    if (list == null) {
      memberStrs.add("...");
    }

    return "[${memberStrs.join(", ")}]";
  }
}
