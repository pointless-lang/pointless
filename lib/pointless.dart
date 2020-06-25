
import "src/debug.dart";
import "src/ptlsError.dart";
import "src/repl.dart";

// ---------------------------------------------------------------------------

export "src/command.dart";
export "src/env.dart";
export "src/interpreter.dart";
export "src/symbols.dart";
export "src/ptlsError.dart";
export "src/ptlsLabel.dart";
export "src/ptlsString.dart";
export "src/ptlsTuple.dart";
export "src/ptlsValue.dart";
export "src/source.dart";
export "src/token.dart";
export "src/tokenTypes.dart";

// ---------------------------------------------------------------------------

void main(List<String> args) {
  if (args.isEmpty) {
    repl();

  } else if (args.length == 1) {
    runProgram(args[0], "-eval");

  } else {
    var error = PtlsError("Argument Error");
    error.message = "Too many args (${args.length})";
    throw error;
  }
}
