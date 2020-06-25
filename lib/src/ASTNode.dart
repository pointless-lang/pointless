
import "dart:convert";

import "location.dart";
import "nodeTypes.dart";

// ---------------------------------------------------------------------------

class ASTNode {
  Node nodeType;
  Location loc;
  List<dynamic> values;

  // -------------------------------------------------------------------------

  ASTNode(this.nodeType, this.loc, this.values);

  // -------------------------------------------------------------------------

  dynamic operator[](int index) {
    return values[index];
  }

  // -------------------------------------------------------------------------
  // get string representation for tokenType

  String typeStr() => nodeType.toString().split(".").last;

  // -------------------------------------------------------------------------

  String indent(String text) {
    var lines = text.split("\n");
    return [for (var line in lines) " " + line].join("\n");
  }

  // -------------------------------------------------------------------------

  String showValue(value) {
    if (value is List) {
      if (value.isEmpty) {
        return "[]";
      }
      return value.join("\n");
    }

    if (value is String) {
      return json.encode(value);
    }
    
    return value.toString();
  }

  // -------------------------------------------------------------------------

  String toString() {
    var valueStr = values
      .map(showValue)
      .where((s) => s.isNotEmpty)
      .join("\n");

    if (valueStr.split("\n").length > 1) {
      valueStr = "\n" + indent(valueStr);
    }

    if (valueStr.isNotEmpty) {
      valueStr = " " + valueStr;
    }

    return "(${typeStr()}$valueStr)";
  }
}
