
import "package:dartz/dartz.dart" as dartz;

import "env.dart";
import "ptlsDict.dart";
import "ptlsError.dart";
import "ptlsLabel.dart";
import "ptlsString.dart";
import "ptlsValue.dart";
import "thunk.dart";

// ---------------------------------------------------------------------------

class PtlsObject extends PtlsValue {
  PtlsLabel label;
  Env env;

  static var defaultLabel = PtlsLabel("PtlsObject");

  // -------------------------------------------------------------------------
  
  PtlsObject(this.env, [this.label]) {
    label ??= defaultLabel;
  }  

  // -------------------------------------------------------------------------

  PtlsValue getField(String name) {
    if (env.defs.containsKey(name)) {
      return env.lookupName(name);
    }

    switch (name) {
      case "!getLabel":
        return label;

      case "!getType":
        return PtlsLabel("PtlsObject");

      case "!getDict":
        var map = dartz.IHashMap<PtlsValue, PtlsValue>.from({
          for (var name in env.defs.keys)
          PtlsString(name): env.lookupName(name)
        });
        return PtlsDict(map);

      default: if (name[0] == "!") { super.getField(name); };
    }

    var error = PtlsError("Type Error");
    var fields = env.defs.keys.join(", ");
    error.message = "Invalid field '$name' for Object with fields {$fields}";
    throw error;
  }

  // -------------------------------------------------------------------------

  PtlsValue updateField(String name, PtlsValue result) {
    var newEnv = env.clone();

    if (newEnv.defs.containsKey(name)) {
      newEnv.defs.remove(name);
    }

    var thunk = Thunk.fromValue(name, result);
    newEnv.addDefThunk(thunk);
    return PtlsObject(newEnv, label);
  }

  // -------------------------------------------------------------------------

  String toString() {
    if (label == defaultLabel) {
       return "${env.defs}";

    }

   return "$label ${env.defs}";
  }
}
