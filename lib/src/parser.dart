
import "dart:collection";
import "package:string_unescape/string_unescape.dart" as string_unescape;

import "ASTNode.dart";
import "location.dart";
import "nodeTypes.dart";
import "ptlsError.dart";
import "token.dart";
import "tokenTypes.dart";

// ---------------------------------------------------------------------------

typedef NodeHandler = ASTNode Function();

// ---------------------------------------------------------------------------

class Parser {
  int index = 0;
  List<Token> tokens;

  // -------------------------------------------------------------------------

  Parser(this.tokens);

  // -------------------------------------------------------------------------

  bool hasTokens() => index < tokens.length;

  // -------------------------------------------------------------------------
  
  void advance() => index++;

  // -------------------------------------------------------------------------
  
  Token currentToken() => tokens[index];

  // -------------------------------------------------------------------------
  // tokens skipped by default

  static const defSkip = [
    Tok.Newline,
    Tok.Whitespace,
    Tok.Comment,
  ];

  // -------------------------------------------------------------------------

  PtlsError wrongToken(List<Tok> expected, Token got) {
    var error = PtlsError("Parser Error");
    var expStr = expected.join(" or ").replaceAll("Tok.", "");
    var gotStr = got.typeStr();
    error.message = "Expected '$expStr', got '$gotStr'";
    error.locs.add(got.loc);
    return error;
  }

  // -------------------------------------------------------------------------
  // check if next token has type in testTypes (ignoring leading tokens with
  // type in skipTypes)
  //
  // small lists faster than sets

  bool isNext(List<Tok> testTypes, [List<Tok> skip = defSkip]) {
    for (var token in tokens.getRange(index, tokens.length)) {
      if (testTypes.contains(token.tokType)) {
        return true;
      }

      if (!skip.contains(token.tokType)) {
        return false;
      }
    }
    return false;
  }

  // -------------------------------------------------------------------------
  // check the n_th next token has the n_th type in testTypes, ignoring skips

  bool isNextMulti(List<Tok> testTypes, [List<Tok> skip = defSkip]) {
    var tokenQueue = Queue.of(testTypes);
    for (var token in tokens.getRange(index, tokens.length)) {
      if (tokenQueue.isEmpty) {
        return true;
      }
      
      if (tokenQueue.first == token.tokType) {
        tokenQueue.removeFirst();

      } else if (!skip.contains(token.tokType)) {
        return false;
      }
    }
    return false;
  }

  // -------------------------------------------------------------------------
  // advance parser and get matching token (throw error if next non-skip
  // token has wrong type)

  Token getNext(List<Tok> testTypes, [List<Tok> skip = defSkip]) {
    while (hasTokens()) {
      var token = currentToken();
      if (testTypes.contains(token.tokType)) {
        advance();
        return token;
      }

      if (!skip.contains(token.tokType)) {
        throw wrongToken(testTypes, token);
      }

      advance();
    }

    throw wrongToken(testTypes, currentToken());
  }

  // -------------------------------------------------------------------------
  // return matching token without advancing parser

  Token peek(List<Tok> testTypes, [List<Tok> skip = defSkip]) {
    var oldIndex = index;
    var token = getNext(testTypes, skip);
    index = oldIndex;
    return token;
  }

  // -------------------------------------------------------------------------
  // peek for any token type not in skip

  Token peekAny([List<Tok> skip = defSkip]) {
    var oldIndex = index;
    while (skip.contains(currentToken().tokType)) {
      advance();
    }

    var result = currentToken();
    index = oldIndex;
    return result;
  }

  // -------------------------------------------------------------------------
  // get a sequence of elements, where elements are parsed by function handler
  // starts with start token, ends with end, separated by sep
  // allow / disallow trailing separator

  List<ASTNode> getSeq(
    Tok start, Tok end, Tok sep, NodeHandler handler, bool allowTrailSep) {

    getNext([start]);
    List<ASTNode> result = [];

    if (isNext([end])) {
      getNext([end]);
      return result;
    }

    result.add(handler());

    while (!isNext([end])) {
      getNext([sep]);

      if (allowTrailSep && isNext([end])) {
        break;
      }

      result.add(handler());
    }

    getNext([end]);
    return result;
  }

  // -------------------------------------------------------------------------
  // parser hierarchy:
  // 
  // program is at the top, is a sequence of imports
  // and definitions (names defs or functions defs)
  // right hand side of a definition is a clause
  // from there, parsers form a hierarchy, where "a > b"
  // means "b can be parsed as a"
  //
  // clause     (where, with, requires)
  // expression (if, for, cond, lambda, try, throw)
  // operation  (binary op, unary op)
  // unit       (field ref, index, call)
  // unitBase   (literals, collections, parenthesized clauses, upvals)

  // note that function calls can go up the hierarchy:
  // for example, getUnitBase calls getclause to get parenthetized clauses

  // use getExpression instead of getClause for structures with trailing
  // parser calls (else, lambda, throw, etc)
  // to avoid this:
  //  (if a then b else c) where d
  //
  // at the cost of sometimes requiring this:
  //   if a then b else (c where d)

  // -------------------------------------------------------------------------
  // unit base
  // -------------------------------------------------------------------------

  ASTNode getName() {
    var token = getNext([Tok.Name]);
    return ASTNode(Node.Name, token.loc, [token.value]);
  }

  // -------------------------------------------------------------------------

  ASTNode getString() {
    var token = getNext([Tok.String]);
    var value;

    if (token.value.startsWith('"""')) {
      value = token.value.substring(3, token.value.length - 3);

    } else {
      value = token.value.substring(1, token.value.length - 1);
    }

    value = string_unescape.unescape(value);
    return ASTNode(Node.String, token.loc, [value]);
  }

  // -------------------------------------------------------------------------

  ASTNode getNumber() {
    var token = getNext([Tok.Number]);
    var value = num.parse(token.value);
    return ASTNode(Node.Number, token.loc, [value]);
  }

  // -------------------------------------------------------------------------

  ASTNode getBool() {
    var token = getNext([Tok.Bool]);
    var value = token.value == "true";
    return ASTNode(Node.Bool, token.loc, [value]);
  }

  // -------------------------------------------------------------------------

  ASTNode getLabel() {
    var token = getNext([Tok.Label]);
    var label = ASTNode(Node.Label, token.loc, [token.value]);

    if (isNext([Tok.LParen])) {
      var tuple = getTuple();
      var field = ASTNode(Node.Name, token.loc, ["!getWrapTuple"]);
      var ref = ASTNode(Node.FieldRef, token.loc, [label, field]);
      return ASTNode(Node.Call, token.loc, [ref, [tuple]]);
    }

    if (isNext([Tok.LBracket])) {
      var object = getObject();
      var field = ASTNode(Node.Name, token.loc, ["!getWrapObject"]);
      var ref = ASTNode(Node.FieldRef, token.loc, [label, field]);
      return ASTNode(Node.Call, token.loc, [ref, [object]]);
    }

    return label;
  }

  // -------------------------------------------------------------------------
  //  examples:
  //  [1, 2, 3]
  //  [1]
  //  []

  ASTNode getList() {
    // 'true' to allow trailing comma
    var loc = peek([Tok.LArray]).loc;
    var elems = getSeq(Tok.LArray, Tok.RArray, Tok.Comma, getClause, true);
    return ASTNode(Node.List, loc, [elems]);
  }
  
  // -------------------------------------------------------------------------
  //  example: [1 2 3]

  ASTNode getArray1D() {
    // 'true' to allow trailing comma
    var loc = peek([Tok.LArray]).loc;
    var elems = getSeq(
      Tok.LArray, Tok.RArray, Tok.Whitespace, getOperation, true
    );
    return ASTNode(Node.Array, loc, [elems]);
  }

  // -------------------------------------------------------------------------
  //  example:
  //  x = 
  //    [1 0 0]
  //    [0 1 0]
  //    [0 0 1]

  ASTNode getArray2D() {
    var elems = [getArray1D()];
    var skip = [Tok.Whitespace, Tok.Comment];
    
    // if there's a new 1D array on the next line, then it's part of this
    // 2D matrix
    while (isNextMulti([Tok.Newline, Tok.LArray], skip)) {
      elems.add(getArray1D());
    }

    // only return matrix with 2 or more rows, array otherwise
    if (elems.length == 1) {
      return elems[0];
    }

    // will always have at least 1 element
    return ASTNode(Node.Array, elems[0].loc, [elems]);
  }

  // -------------------------------------------------------------------------
  //  get elements in parens, separated by commas
  //  takes an optional list of starting elements (used when disambiguating
  //  between tuples and parenthesized expressions)

  List<ASTNode> getParenElements(NodeHandler handler) {
    // 'false' to dis-allow trailing comma
    var loc = peek([Tok.LParen]).loc;
    var elems = getSeq(Tok.LParen, Tok.RParen, Tok.Comma, handler, false);

    if (elems.isEmpty) {
      var error = PtlsError("Parser Error");
      error.message = "Construct requires 1 or more arguments or elements";
      error.locs.add(loc);
      throw error;
    }

    return elems;
  }

  // -------------------------------------------------------------------------

  ASTNode getTuple() {
    var loc = peek([Tok.LParen]).loc;
    var elems = getParenElements(getClause);
    return ASTNode(Node.Tuple, loc, [elems]);
  }

  // -------------------------------------------------------------------------
  // tuple assignment name can be name or blank "_" (for ignored params)

  ASTNode getTupleName() {
    if (isNext([Tok.Blank])) {
      var token = getNext([Tok.Blank]);
      return ASTNode(Node.Blank, token.loc, []);
    }

    return getName();
  }

  // -------------------------------------------------------------------------
  // single name or tuple of names

  ASTNode getDefLHS() {
    if (isNext([Tok.LParen])) {
      var loc = peek([Tok.LParen]).loc;
      var elems = getParenElements(getTupleName);
      return ASTNode(Node.Tuple, loc, [elems]);
    }

    return getName();
  }

  // -------------------------------------------------------------------------
  // attach doc string to assignment node

  ASTNode getNameDef() {
    var lhs = getDefLHS();
    getNext([Tok.Assign]);
    var rhs = getClause();

    return ASTNode(Node.Def, lhs.loc, [lhs, rhs]);
  }

  // -------------------------------------------------------------------------
  //  example: foo(a, b, c) = bar

  ASTNode getFuncDef() {
    var name = getName();
    var params = getParenElements(getName);

    getNext([Tok.Assign]);
    var body = getClause();

    // function desugars to name definition with lambda expression
    // the following are equivalent 
    // 
    // foo(bar) = baz
    // foo = (bar) => baz

    var func = ASTNode(Node.Func, name.loc, [params, body]);
    return ASTNode(Node.Def, name.loc, [name, func]);
  }

  // -------------------------------------------------------------------------
  // example function def:
  // double(n) = n * 2
  // 
  // example single assignment:
  // x = 123
  // 
  // example tuple assignment:
  // (a, b) = (1, 23)

  ASTNode getDef() {
    if (isNextMulti([Tok.Name, Tok.LParen])) {
      return getFuncDef();
    }

    return getNameDef();
  }

  // -------------------------------------------------------------------------
  // example: {foo = "bar"}

  ASTNode getObject() {
    var loc = getNext([Tok.LBracket]).loc;
    List<ASTNode> defs = [];

    while (!isNext([Tok.RBracket])) {
      defs.add(getDef());

      if (isNext([Tok.RBracket])) {
        break;
      }

      // statements can be seperated by newline or semicolon
      getNext([Tok.Newline, Tok.Semicolon]);
    }

    getNext([Tok.RBracket]);
    return ASTNode(Node.Object, loc, [defs]);
  }

  // -------------------------------------------------------------------------

  ASTNode getPair() {
    var key = getClause();
    getNext([Tok.Colon]);
    var val = getClause();

    return ASTNode(Node.Pair, key.loc, [key, val]);
  }

  // -------------------------------------------------------------------------
  // example: {123: false, 4: true}

  ASTNode getDict() {
    var loc = peek([Tok.LBracket]).loc;
    // 'true' to allow trailing comma
    var elems = getSeq(Tok.LBracket, Tok.RBracket, Tok.Comma, getPair, true);
    return ASTNode(Node.Dict, loc, [elems]);
  }

  // -------------------------------------------------------------------------
  // example: {1, 2, 3}

  ASTNode getSet() {
    // 'true' to allow trailing comma
    var loc = peek([Tok.LBracket]).loc;
    var elems = getSeq(Tok.LBracket, Tok.RBracket, Tok.Comma, getClause, true);
    return ASTNode(Node.Set, loc, [elems]);
  }

  // -------------------------------------------------------------------------
  // get square-bracketed collection (list, 1D array, or 2D array)

  ASTNode getArrayLiteral() {
    // '[]' parsed as empty list
    if (isNextMulti([Tok.LArray, Tok.RArray])) {
      return getList();
    }

    int oldIndex = index;
    getNext([Tok.LArray]);
    // this parse-then-restore strategy is theoretically infficient, 
    // but shouldn't matter in real-world cases
    getClause();

    if (isNext([Tok.Comma, Tok.RArray])) {
      // restore original index
      index = oldIndex;
      return getList();
    }

    // restore original index
    index = oldIndex;
    return getArray2D();
  }

  // -------------------------------------------------------------------------
  // get an element starting with an open paren: either a tuple or 
  // parenthesized expression; lambdas are handled separately, since their
  // param list may or may not start with an open paren

  ASTNode getParenLiteral() {
    int oldIndex = index;
    getNext([Tok.LParen]);
    var clause = getClause();

    if (isNext([Tok.RParen])) {
      getNext([Tok.RParen]);
      // return clause in patenthetized expression
      return clause;
    }

    index = oldIndex;
    return getTuple();
  }

  // -------------------------------------------------------------------------
  // get curly-bracketed collection (map, set, or object)

  ASTNode getBracketLiteral() {
    // empty brackets "{}" are an empty map
    // use toSet([]) for empty set
    if (isNextMulti([Tok.LBracket, Tok.RBracket])) {
      return getDict();
    }

    int oldIndex = index;
    getNext([Tok.LBracket]);
    getClause();

    if (isNext([Tok.Assign])) {
      index = oldIndex;
      return getObject();
    }

    if (isNext([Tok.Colon])) {
      index = oldIndex;
      return getDict();
    }

    index = oldIndex;
    return getSet();
  }

  // -------------------------------------------------------------------------
  // example: upval name

  ASTNode getUpval() {
    var loc = getNext([Tok.Upval]).loc;
    var name = getName()[0];
    return ASTNode(Node.Upval, loc, [name]);
  }

  // -------------------------------------------------------------------------

  ASTNode getUnitBase() {
    var unitTokens = [
      Tok.Number, Tok.String, Tok.Name, Tok.Upval, Tok.Label,
      Tok.Bool, Tok.LArray, Tok.LParen, Tok.LBracket
    ];

    // throw error if next token is not in unitTokens
    switch(peek(unitTokens).tokType) {
      case Tok.Number:
        return getNumber(); 

      case Tok.String:
        return getString(); 

      case Tok.Name:
        return getName();

      case Tok.Upval:
        return getUpval();

      case Tok.Label:
        return getLabel(); 

      case Tok.Bool:
        return getBool(); 

      case Tok.LArray:
        return getArrayLiteral(); 

      case Tok.LParen:
        return getParenLiteral(); 

      case Tok.LBracket:
        return getBracketLiteral(); 

      default:
        // should never get here
        throw false;
    }
  }

  // -------------------------------------------------------------------------
  // unit
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // index: lhs[rhs]

  ASTNode getIndex(ASTNode lhs) {
    var loc = getNext([Tok.LArray]).loc;
    var rhs = getClause();
    getNext([Tok.RArray]);
    return ASTNode(Node.Index, loc, [lhs, rhs]);
  }

  // -------------------------------------------------------------------------
  // example: lhs.rhs

  ASTNode getFieldRef(ASTNode lhs) {
    var token = getNext([Tok.Field]);
    var nameChars = token.value.substring(1);
    var nameNode = ASTNode(Node.Name, token.loc, [nameChars]);
    return ASTNode(Node.FieldRef, token.loc, [lhs, nameNode]);
  }

  // -------------------------------------------------------------------------
  // example: func(arg1, arg2, ...)

  ASTNode getCall(ASTNode func) {
    var loc = peek([Tok.LParen]).loc;
    var args = getParenElements(getClause);
    return ASTNode(Node.Call, loc, [func, args]);
  }

  // -------------------------------------------------------------------------
  // units are syntactically contained (are literals or collections, plus
  // field / index / call extensions

  ASTNode getUnit() {
    var extTokens = [
      Tok.LArray, Tok.LParen, Tok.Field
    ];

    var lhs = getUnitBase();

    // get trailing field / index / call extensions
    // don't skip whitespace before index / call
    while (isNext([Tok.LArray, Tok.LParen], []) || isNext([Tok.Field])) {

      switch(peek(extTokens).tokType) {
        case Tok.LArray:
          lhs = getIndex(lhs); 
          break;

        case Tok.Field:
          lhs = getFieldRef(lhs);  
          break;

        case Tok.LParen:
          lhs = getCall(lhs);
          break;

        default:
          // should never get here
          throw false;
      }
    }

    return lhs;
  }

  // -------------------------------------------------------------------------
  // operations
  // -------------------------------------------------------------------------

  ASTNode getPrefixOp() {
    if (isNext([Tok.Neg, Tok.Not])) {
      var token = getNext([Tok.Neg, Tok.Not]);
      var rhs = getPrefixOp(); 
      return ASTNode(Node.UnaryOp, token.loc, [token.tokType, rhs]);
    }

    return getUnit(); // get unit in base case
  }

  // -------------------------------------------------------------------------
  // recursively iterate through operators, starting with lowest precedence
  // older parsers versions had support for postfix operators (factorial);
  // removed support when factorial operator was removed from grammar
  // also: new simplified parser puts all unary operators at higher precedence
  // than all binary operators!!! (this is non-ideal, but ok for now)

  ASTNode getBinaryOp(int precedence) {

    var opEntries = [
      [true,  [Tok.Pipe]],
      [false, [Tok.Concat]],
      [true,  [Tok.Or]],
      [true,  [Tok.And]],
      [true,  [Tok.Equals, Tok.NotEq]],
      [true,  [Tok.In]],
      [true,  [Tok.LessThan, Tok.LessEq, Tok.GreaterThan, Tok.GreaterEq]],
      [true,  [Tok.Add, Tok.Sub]],
      [true,  [Tok.Mul, Tok.Div, Tok.Mod]],
      [false, [Tok.Pow]],
    ];

    // already cycled through all binary ops
    if (precedence == opEntries.length) {
      return getPrefixOp(); // get unary op in base case
    }

    // get initial operand
    var lhs = getBinaryOp(precedence + 1);
    var opEntry = opEntries[precedence];

    while (isNext(opEntry[1])) { // while op token type is next
      // get rhs at +1 precedence for left assoc, +0 for right
      int increment = opEntry[0] ? 1 : 0;

      var token = getNext(opEntry[1]);
      var rhs = getBinaryOp(precedence + increment);

      // desugar pipe as call
      if (token.tokType == Tok.Pipe) {
        var args = [lhs];
        lhs = ASTNode(Node.Call, token.loc, [rhs, args]);

      } else {
        lhs = ASTNode(Node.BinaryOp, token.loc, [token.tokType, lhs, rhs]);
      }
    }

    return lhs;
  }

  // -------------------------------------------------------------------------
  // get a series of expressions separated by prefix / infix operators
  // (original version was based on shunting-yard algorithm, stack-based, could
  // handle large expressions - moved to recursion based scheme for simplicity,
  // but will now overflow the call stack on large expressions)

  ASTNode getOperation() {
    return getBinaryOp(0);
  }

  // -------------------------------------------------------------------------
  // expression
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // example: if n < 0 then -n else n
  // example: if list is Empty then [] else head(list)

  ASTNode getConditional() {
    var loc = getNext([Tok.If]).loc;
    var cond = getExpression();

    getNext([Tok.Then]);
    var thenClause = getClause();

    getNext([Tok.Else]);
    // get else as statement rather than clause to make following where
    // scope definitions encompass entire conditional
    var elseExpr = getExpression();

    return ASTNode(Node.Conditional, loc, [cond, thenClause, elseExpr]);
  }

  // -------------------------------------------------------------------------
  // example:
  //
  // cond {
  //   case n is PtlsNumber "number"
  //   else "non-number"
  // }
  //
  // cond {
  //   case n % 2 == 0 "even"
  //   else "odd"
  // }

  ASTNode getCases() {
    var loc = getNext([Tok.Case]).loc;
    var cond = getExpression();
    var thenClause = getClause();

    var elseClause;
    if (isNext([Tok.Else])) {
      getNext([Tok.Else]);
      elseClause = getClause();

    } else if (isNext([Tok.RBracket])) {
      elseClause = null;

    } else {
      elseClause = getCases();
    }

    return ASTNode(Node.Conditional, loc, [cond, thenClause, elseClause]);
  }

  ASTNode getCond() {
    getNext([Tok.Cond]);
    getNext([Tok.LBracket]);
    var result = getCases();
    getNext([Tok.RBracket]);
    return result;
  }

  // -------------------------------------------------------------------------
  // list comprehension must start with for, and have a yield statement in
  // its base
  //
  // example: for x in range(10) yield x * 2
  //
  // example:
  //   for x in range(10)
  //   when x % 2 == 0
  //   yield x / 2
  //
  // example:
  //   for x in range(10)
  //   when x % 2 == 0
  //   for y in range(10)
  //   yield x / 2 / y

  ASTNode getFor() {
    var loc = getNext([Tok.For]).loc;
    var variable = getDefLHS();

    getNext([Tok.In]);
    var iterable = getExpression();
    var result = getListComp();

    var params = [variable];
    var func = ASTNode(Node.Func, loc, [params, result]);
    var args = [func, iterable];

    var concatMap = ASTNode(Node.Name, loc, ["concatMap"]);
    return ASTNode(Node.Call, loc, [concatMap, args]);
  }

  // -------------------------------------------------------------------------
  // condition can be expression or type check
  // when x % 2 == 0
  // when x is Bar

  ASTNode getWhen() {
    var loc = getNext([Tok.When]).loc;
    var cond = getExpression();
    var result = getListComp();

    List<ASTNode> elems = [];
    var empty = ASTNode(Node.List, loc, [elems]);

    return ASTNode(Node.Conditional, loc, [cond, result, empty]);
  }

  // -------------------------------------------------------------------------

  ASTNode getYield() {
    var loc = getNext([Tok.Yield]).loc;
    var result = [getExpression()];

    return ASTNode(Node.List, loc, [result]);
  }

  // -------------------------------------------------------------------------

  ASTNode getListComp() {
    if (isNext([Tok.For])) {
      return getFor();

    } else if (isNext([Tok.When])) {
      return getWhen();
    }

    return getYield();
  }

  // -------------------------------------------------------------------------
  // check whether lambda is upcoming (disambiguate between lambda and tuple)
  // called in getExpression

  bool isLambda() {
    // single-param form, example: n => n + 1
    if ( isNextMulti([Tok.Name, Tok.Lambda])
      || isNextMulti([Tok.Blank, Tok.Lambda])) {

      return true;
    }

    // looking for form: (a, b, c, ...) => body
    if ( !isNextMulti([Tok.LParen, Tok.Name])
      && !isNextMulti([Tok.LParen, Tok.Blank])) {

      return false;
    }

    var oldIndex = index;
    getNext([Tok.LParen]);
    getNext([Tok.Name, Tok.Blank]);

    while (isNextMulti([Tok.Comma, Tok.Name])
      || isNextMulti([Tok.Comma, Tok.Blank])) {

      getNext([Tok.Comma]);
      getNext([Tok.Name, Tok.Blank]);
    }

    // need closing paren and lambda arrow "=>" after params 
    bool result = isNextMulti([Tok.RParen, Tok.Lambda]);

    // restore original index
    index = oldIndex;
    return result;
  }

  // -------------------------------------------------------------------------
  // expressions can be conditional, cond, list comprehension, lambda,
  // or operator expression, cannot be clause (where, with, requires)

  ASTNode getLambda() {
    var params;

    if (isNext([Tok.LParen])) {
      params = getParenElements(getName);
    } else {
      params = [getName()];
    }

    var loc = getNext([Tok.Lambda]).loc;
    var body = getClause();

    return ASTNode(Node.Func, loc, [params, body]);
  }

  // -------------------------------------------------------------------------
  // example: try eval("1 + 2") catch err => 0

  ASTNode getTry() {
    var loc = getNext([Tok.Try]).loc;
    var body = getClause();

    getNext([Tok.Catch]);
    var condition = getExpression();
    var handler = getExpression();

    return ASTNode(Node.Try, loc, [body, condition, handler]);
  }

  // -------------------------------------------------------------------------
  // example: throw ParseError

  ASTNode getThrow() {
    var loc = getNext([Tok.Throw]).loc;
    var err = getExpression();

    return ASTNode(Node.Throw, loc, [err]);
  }
  
  // -------------------------------------------------------------------------

  ASTNode getExpression() {
    if (isNext([Tok.If])) {
      return getConditional();

    } else if (isNext([Tok.Throw])) {
      return getThrow();

    } else if (isNext([Tok.Try])) {
      return getTry();

    } else if (isNext([Tok.Cond])) {
      return getCond();

    } else if (isNext([Tok.For])) {
      return getListComp();

    } else if (isLambda()) {
      return getLambda();
    }

    return getOperation();
  }

  // -------------------------------------------------------------------------
  // clause
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  //  example: a + 1 where a = 2
  //  example: a + b where {a = 1; b = 2}
  //  example:
  //  a + b where {
  //    a = 1;
  //    b = 2;
  //  }

  ASTNode getWhere(ASTNode body) {
    var loc = getNext([Tok.Where]).loc;
    // where uses object parser to get statements

    var object;
    if (isNext([Tok.LBracket])) {
      object = getObject();

    } else {
      // get single definition (put into object for consistency)
      var def = getDef();
      object = ASTNode(Node.Object, def.loc, [[def]]);
    }

    return ASTNode(Node.Where, loc, [body, object]);
  }

  // -------------------------------------------------------------------------
  // iteratively get fields attached to lhs

  void
  checkNotBuiltIn(String fieldName, Location loc) {
    // "!" prefixed fields are reserved for built-in functions
    if (fieldName[0] == "!") {
      var error = PtlsError("Parser Error");
      error.message = "Cannot create special field '$fieldName'";
      error.locs.add(loc);
      throw error;
    }
  }

  ASTNode getDefinable(ASTNode lhs) {
    var rhsTokens = [Tok.Field, Tok.LArray];

    // must have at least one field or index ref
    // peek throws error otherwise
    peek(rhsTokens);

    while (isNext(rhsTokens)) {
      if (isNext([Tok.LArray])) {
        lhs = getIndex(lhs);

      } else if (isNext([Tok.Field])) {
        lhs = getFieldRef(lhs);
        var nameNode = lhs.values[1];
        checkNotBuiltIn(nameNode.values[0], lhs.loc);
      }
    }

    return lhs;
  }

  // -------------------------------------------------------------------------
  // only with clauses can have compound assignments
  // desugar compound assignments to normal assignment and binary op

  ASTNode getWithDef() {

    var compoundToks = {
      Tok.AddAssign: Tok.Add,
      Tok.SubAssign: Tok.Sub,
      Tok.MulAssign: Tok.Mul,
      Tok.DivAssign: Tok.Div,
      Tok.PowAssign: Tok.Pow,
      Tok.ModAssign: Tok.Mod,
    };

    var loc = getNext([Tok.Dollar]).loc;
    var dollar = ASTNode(Node.Name, loc, ["\$"]);

    var lhs = getDefinable(dollar);
    // get compound assignment token or normal assignment
    var opToken = getNext([Tok.Assign, ...compoundToks.keys]);

    var rhs = getClause();
    if (opToken.tokType != Tok.Assign) {
      var opType = compoundToks[opToken.tokType];
      rhs = ASTNode(Node.BinaryOp, opToken.loc, [opType, lhs, rhs]);
    }

    return ASTNode(Node.Def, lhs.loc, [lhs, rhs]);
  }

  // -------------------------------------------------------------------------

  Iterable<ASTNode> getWithDefs() sync* {
    getNext([Tok.LBracket]);

    while (!isNext([Tok.RBracket])) {
      yield getWithDef();

      if (isNext([Tok.RBracket])) {
        break;
      }

      // definitions can be separated by newline or semicolon
      getNext([Tok.Newline, Tok.Semicolon]);
    }

    getNext([Tok.RBracket]);
  }

  // -------------------------------------------------------------------------
  // example: arr with $[0] = 0
  // example: arr with {$[0] = 0; $[1].foo = Bar}

  ASTNode getWith(ASTNode lhs) {
    var loc = getNext([Tok.With]).loc;

    var defs;
    if (isNext([Tok.LBracket])) {
      // get a set of statements
      // convert iterable to list
      defs = List.of(getWithDefs());

    } else {
      // get a single statement
      defs = [getWithDef()];
    }

    return ASTNode(Node.With, loc, [lhs, defs]);
  }

  // -------------------------------------------------------------------------
  // example:
  // 1 / n requires n != 0

  ASTNode getRequires(ASTNode lhs) {
    var loc = getNext([Tok.Requires]).loc;
    var condition = getOperation();
    return ASTNode(Node.Requires, loc, [lhs, condition]);
  }

  // -------------------------------------------------------------------------
  // where clause or requires clause or with clause

  ASTNode getClause() {
    var result = getExpression();
    var clauseTokens = [Tok.Where, Tok.Requires, Tok.With];

    while (isNext(clauseTokens)) {
      switch (peek(clauseTokens).tokType) {
        case Tok.Where:
          result = getWhere(result);
          break;

        case Tok.Requires:
          result = getRequires(result);
          break;

        case Tok.With:
          result = getWith(result);
          break;

        default:
          // should never get here
          throw false;
      }
    }

    return result;
  }

  // -------------------------------------------------------------------------
  // program
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // example: import "path/to/foo.ptls" as foo

  ASTNode getExport() {
    var loc = getNext([Tok.Export]).loc;
    var names = getSeq(Tok.LBracket, Tok.RBracket, Tok.Comma, getName, true);
    return ASTNode(Node.Export, loc, [names]);
  }

  // -------------------------------------------------------------------------
  // example: import "path/to/foo.ptls" as foo

  ASTNode getImport() {
    var loc = getNext([Tok.Import]).loc;
    var path = getString();

    getNext([Tok.As]);
    return ASTNode(Node.Import, loc, [path, getName()]);
  }

  // -------------------------------------------------------------------------
  // program:
  // 
  // imports
  // ...
  // statements

  ASTNode getProgram() {
    var loc = currentToken().loc;

    // export must come before imports
    ASTNode export = null;
    if (isNext([Tok.Export])) {
      export = getExport();
    }

    // imports must come before statements
    List<ASTNode> imports = [];
    while (isNext([Tok.Import])) {
      imports.add(getImport());
    }

    List<ASTNode> defs = [];
    while (!isNext([Tok.EOF])) {
      defs.add(getDef());

      if (isNext([Tok.EOF])) {
        break;
      }
      // statements can be seperated by newline or semicolon
      getNext([Tok.Newline, Tok.Semicolon]);
    }

    getNext([Tok.EOF]);
    return ASTNode(Node.Program, loc, [export, imports, defs]);
  }
}
