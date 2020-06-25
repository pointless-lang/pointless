
import "command.dart";
import "ptlsError.dart";
import "source.dart";

// ---------------------------------------------------------------------------

void runFlag(String path, String flag) {
  var source = SourceFile.loadPath(path, "");

  switch (flag) {
    case "-tokenize":
      source.getTokens().forEach(print);
      return;

    case "-parse":
      print(source.getNode());
      return;

    case "-eval":
      var env = source.getEnv();
      for (var command in env.getOutput()) {
        runCommand(command);
      }
      return;

    default:
      var error = PtlsError("Argument Error");
      error.message = "Invalid flag '$flag'";
      throw error;
  }
}

// ---------------------------------------------------------------------------

void runProgram(String path, String flag) {
  try {
    runFlag(path, flag);

  } on PtlsError catch(err) {
    print(err.toString());
  }
}

// ---------------------------------------------------------------------------

void main(List<String> args) {
  var flag = args.length > 1 ? args[1] : null;
  runProgram(args[0], flag);
}
