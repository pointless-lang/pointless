
import "dart:io";

import "ptlsError.dart";
import "ptlsLabel.dart";
import "ptlsString.dart";
import "ptlsTuple.dart";
import "ptlsValue.dart";

// ---------------------------------------------------------------------------

void runCommand(PtlsValue command) {
  command.checkType([PtlsLabel, PtlsTuple]);

  if (command is PtlsTuple) {
    runTuple(command.label.value, command.members);

  } else {
    runLabel((command as PtlsLabel).value);
  }
}

// ---------------------------------------------------------------------------

void runLabel(String label) {
  switch (label) {
    case "IOClearConsole": 
      // https://stackoverflow.com/a/21275519/6680182
      print("\x1B[2J\x1B[0;0H"); // clear entire screen, move cursor to 0;0
      break;

    default: invalidLabel(label);
  }
}

// ---------------------------------------------------------------------------

void runTuple(String label, List<PtlsValue> args) {
  switch (label) {
    case "IOPrint": 
      checkArity(label, args, 1);
      PtlsString string = args[0].checkType([PtlsString]);
      stdout.write(string.value);
      break;

    default: invalidLabel(label);
  }
}

// ---------------------------------------------------------------------------

void checkArity(String label, List<PtlsValue> args, int arity) {
  if (args.length != arity) {
    var error = PtlsError("Output Error");
    var argStr = args.map((arg) => arg.runtimeType).join(", ");
    error.message = "$label expected $arity args, got $label($argStr)";
    throw error;
  }
}

// ---------------------------------------------------------------------------

void invalidLabel(String label) {
  var error = PtlsError("Output Error");
  error.message = "Invalid output command label '$label'";
  throw error;
}
