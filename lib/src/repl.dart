
import "dart:io";
// import "package:dart_console/dart_console.dart";

import "command.dart";
import "env.dart";
import "interpreter.dart";
import "parser.dart";
import "ptlsError.dart";
import "ptlsObject.dart";
import "source.dart";
import "token.dart";
import "tokenTypes.dart";

// ---------------------------------------------------------------------------

var splash = r"""
      ___           ___           ___           ___          ___      
     /\  \         /\  \         /\  \         /\__\        /\  \     
    /::\  \       /::\  \        \:\  \       /::|  |       \:\  \    
   /:/\:\  \     /:/\:\  \        \:\  \     /:|:|  |        \:\  \   
  /::\~\:\  \   /:/  \:\  \   ___ /::\  \   /:/|:|  |__      /::\  \  
 /:/\:\ \:\__\ /:/__/ \:\__\ /\  /:/\:\__\ /:/ |:| /\__\    /:/\:\__\ 
 \/__\:\/:/  / \:\  \ /:/  / \:\/:/  \/__/ \/__|:|/:/  /   /:/  \/__/ 
      \::/  /   \:\  /:/  /   \::/__/          |:/:/  /   /:/  /      
       \/__/     \:\/:/  /     \:\  \          |::/  /    \/__/       
                  \::/  /       \:\__\         /:/  /                 
                   \/__/         \/__/         \/__/                  
     ___        ___           ___           ___     
    /\__\      /\  \         /\  \         /\  \      Pointless (0.1.0)
   /:/  /     /::\  \       /::\  \       /::\  \     
  /:/  /     /:/\:\  \     /:/\ \  \     /:/\ \  \    A scripting language
 /:/  /     /::\~\:\  \   _\:\~\ \  \   _\:\~\ \  \   for learning and fun
/:/__/     /:/\:\ \:\__\ /\ \:\ \ \__\ /\ \:\ \ \__\  
\:\  \     \:\~\:\ \/__/ \:\ \:\ \/__/ \:\ \:\ \/__/  copyright (c) 2020
 \:\  \     \:\ \:\__\    \:\ \:\__\    \:\ \:\__\    
  \:\  \     \:\ \/__/     \:\/:/  /     \:\/:/  /    Avery N. Nortonsmith
   \:\__\     \:\__\        \::/  /       \::/  /     
    \/__/      \/__/         \/__/         \/__/      https://plts.dev
    """;

// ---------------------------------------------------------------------------

bool isDef(List<Token> tokens) {
  for (var token in tokens) {
    switch (token.tokType) {
      case Tok.Name:
      case Tok.LParen:
      case Tok.RParen:
      case Tok.Comma:
      case Tok.Whitespace:
        continue;

      case Tok.Assign:
      case Tok.Import:
        return true;

      default:
        return false;
    }
  }

  throw false; // should never get here
}

// ---------------------------------------------------------------------------

bool runLineRepl(Env env, String line) {
  var source = SourceFile("<repl>", line);
  var tokens = source.getTokens();
  var parser = Parser(tokens);

  var node;
  try {
    if (isDef(tokens)) {
      node = parser.getProgram();

    } else {
      node = parser.getClause();
      parser.getNext([Tok.EOF]);
    }

  } on PtlsError catch (_) {
    if (parser.hasTokens() && parser.isNext([Tok.EOF])) {
      return false;   
    }
    rethrow;    
  }

  var newEnv = Env(env);
  var result = eval(newEnv, node);

  if (!isDef(tokens)) {
    print(result);

  } else {
    PtlsObject obj = result;
    env.defs.addAll(obj.env.defs);

    if (newEnv.defs.containsKey("output")) {
      for (var command in newEnv.getOutput()) {
        runCommand(command);
      }
    }
  }

  return true;
}

// ---------------------------------------------------------------------------

// bool runLine(Env env, Console console) {
bool runLine(Env env) {
  stdout.write(">> ");
  var line = stdin.readLineSync();
  // var line = console.readLine(cancelOnBreak: true, cancelOnEOF: true);

  if (line == null) {
    return true;
  }

  if (line == "") {
    return false;
  }

  while (!runLineRepl(env, line)) {
    stdout.write(".. ");
    line += "\n" + stdin.readLineSync();
  }
  return false;
}

// ---------------------------------------------------------------------------

void repl() {

  print(splash);

  var env = SourceFile.prelude.getEnv();
  // var console = Console.scrolling(recordBlanks: false);

  for (;;) {
    try {
      // var stopped = runLine(env, console);
      var stopped = runLine(env);
      if (stopped) {
        print("");
        return;
      }

    } on PtlsError catch(err) {
      print(err.toString());
    }
  }
}
