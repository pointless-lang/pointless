
import "ASTNode.dart";
import "env.dart";
import "location.dart";
import "ptlsLabel.dart";
import "ptlsList.dart";
import "ptlsString.dart";
import "ptlsValue.dart";

// ---------------------------------------------------------------------------

class PtlsFunc extends PtlsValue {
  Env env;
  ASTNode body;
  List<String> params;
  List<String> newParams;
  List<String> appliedParams;
  List<PtlsValue> appliedArgs;

  // -------------------------------------------------------------------------
  
  PtlsFunc(this.env, this.params, this.body) {
    newParams = [...params.getRange(env.defs.length, params.length)];
    appliedParams = [...params.getRange(0, env.defs.length)];

    appliedArgs = [
      for (var param in params.getRange(0, env.defs.length))
      env.lookupName(param)
    ];
  }

  // -------------------------------------------------------------------------

  PtlsValue getField(String name, Location loc) {
    switch (name) {
      case "!getType":
        return PtlsLabel("PtlsFunc");

      default: super.getField(name, loc); // throws error
    }

    throw false; // should never get here
  }

  // -------------------------------------------------------------------------

  String toString() {
    if (appliedParams.isEmpty) {
      return "PtlsFunc(${newParams.join(", ")})";

    } else {
      return "PtlsFunc(${appliedArgs.join(", ")})(${newParams.join(", ")})";
    }
  }
}
