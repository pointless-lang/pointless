
import "dart:io";
import "package:path/path.dart" as dartPath;

import "ASTNode.dart";
import "env.dart";
import "interpreter.dart";
import "parser.dart";
import "ptlsError.dart";
import "ptlsObject.dart";
import "token.dart";
import "tokenizer.dart";
import "tokenTypes.dart";

// ---------------------------------------------------------------------------

class SourceFile {
  String path;
  String chars;
  List<Token> tokens;
  ASTNode node;
  Env env;

  static Map<String, SourceFile> cache = {};

  // -------------------------------------------------------------------------

  static var prelude = PreludeFile();

  // -------------------------------------------------------------------------

  SourceFile(this.path, this.chars);

  // -------------------------------------------------------------------------

  List<Token> getTokens() {
    if (tokens == null) {
      var tokenizer = Tokenizer(chars, path);
      tokens = List.of(tokenizer.getTokens());
    }

    return tokens;
  }

  // -------------------------------------------------------------------------

  ASTNode getNode() {
    if (node == null) {
      var parser = Parser(getTokens());
      node = parser.getProgram();
    }

    return node;
  }

  // -------------------------------------------------------------------------

  Env getEnv() {
    if (env == null) {
      env = Env(prelude.getEnv());
      eval(env, getNode());
    }

    return env;
  }

  // -------------------------------------------------------------------------

  static SourceFile loadPath(String imptPath, String basePath) {
    var absPath = dartPath.normalize(dartPath.absolute(basePath, imptPath));
    var path = dartPath.join(basePath, imptPath);

    if (!cache.containsKey(absPath)) {
      cache[absPath] = SourceFile(path, getChars(absPath));
    }

    return cache[absPath];
  }

  // -------------------------------------------------------------------------

  static SourceFile loadImport(ASTNode node) {
    String imptPath = node[0][0];
    // need path relative to current source file
    var basePath = dartPath.dirname(node.loc.path);
    return SourceFile.loadPath(imptPath, basePath);
  }

  // -------------------------------------------------------------------------

  static String getChars(String path) {
    try {
      var file = File(path);
      return file.readAsStringSync();

    } on FileSystemException {
      var error = PtlsError("File Error");
      error.message = "Cannot locate file '$path'";
      throw error;
    }
  }
}

// ---------------------------------------------------------------------------

class PreludeFile extends SourceFile {

  PreludeFile(): super("<prelude>", "");

  // -------------------------------------------------------------------------
  // exports must come first

  static var preludeFiles = [
    "../prelude/exports.ptls",
    "../prelude/array.ptls",
    "../prelude/boolean.ptls",
    "../prelude/chars.ptls",
    "../prelude/dict.ptls",
    "../prelude/err.ptls",
    "../prelude/format.ptls",
    "../prelude/function.ptls",
    "../prelude/io.ptls",
    "../prelude/iter.ptls",
    "../prelude/label.ptls",
    "../prelude/list.ptls",
    "../prelude/numerical.ptls",
    "../prelude/random.ptls",
    "../prelude/set.ptls",
    "../prelude/show.ptls",
    "../prelude/sort.ptls",
    "../prelude/string.ptls",
    "../prelude/tuple.ptls",
    "../prelude/types.ptls",
  ];

  // -------------------------------------------------------------------------

  List<Token> getTokens() {
    if (tokens == null) {
      var uri = Platform.script;
      var basePath = dartPath.dirname(uri.toFilePath());
      tokens = [];

      for (var path in preludeFiles) {
        var tmp = SourceFile.loadPath(path, basePath);
        tokens.addAll(tmp.getTokens());
      }

      var lastEOF = tokens.last;
      tokens.removeWhere((tok) => tok.tokType == Tok.EOF);
      tokens.add(lastEOF);
    }

    return tokens;
  }

  // -------------------------------------------------------------------------

  Env getEnv() {
    if (env == null) {
      PtlsObject obj = eval(Env(null), getNode());
      // need to get obj env to get exports
      env = obj.env;
    }

    return env;
  }
}
