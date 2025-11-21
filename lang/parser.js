import { keywords } from "./keywords.js";
import { checkNumResult } from "./num.js";
import { Panic } from "./panic.js";

// skipped by default
const skip = ["whitespace", "newline", "comment"];

// keywords can be used as object key names
const identifier = ["name", ...keywords];

// definition operators
const def = ["=", "|=", "$=", "?=", "+=", "-=", "*=", "/=", "**=", "%="];

// operators from lowest to highest precedence
const ops = [
  { type: "binary", assoc: "left", symbols: ["or"] },
  { type: "binary", assoc: "left", symbols: ["and"] },
  { type: "unary", symbols: ["not"] },
  {
    type: "binary",
    assoc: "left",
    symbols: ["in", "==", "!=", "<", "<=", ">", ">="],
  },
  { type: "binary", assoc: "left", symbols: ["+", "-"] },
  { type: "binary", assoc: "left", symbols: ["*", "/", "%"] },
  { type: "binary", assoc: "right", symbols: ["**"] },
  { type: "unary", symbols: ["-"] },
];

const escapeSeq = /\\["\\nrt]|\\u{([\dA-Fa-f]{1,6})}/g;
const stringInner = /^r?#*"([\s\S]*)"#*$/;
const indent = /^[ ]*/;

const fmtVar =
  /\$(?:[_a-zA-Z]\w*(?:\.[_a-zA-Z]\w*)*|\([_a-zA-Z]\w*(?:\.[_a-zA-Z]\w*)*\))/g;

function parseStr(string, loc) {
  return string.replaceAll(escapeSeq, (match, code, index) => {
    switch (match) {
      case "\\\\":
        return "\\";
      case '\\"':
        return '"';
      case "\\n":
        return "\n";
      case "\\r":
        return "\r";
      case "\\t":
        return "\t";
    }

    try {
      return String.fromCodePoint(parseInt(code, 16));
    } catch (_) {
      // Make error point to start of invalid code sequence
      loc = loc.next('"' + string.slice(0, index) + "\\u{");
      throw new Panic("invaild code point", { $code: `'${code}'` }, loc);
    }
  });
}

class Node {
  constructor(type, loc, value) {
    this.type = type;
    this.loc = loc;
    this.value = value;
  }
}

function unexpectedToken(token, details = {}) {
  // for easier repl line continuations
  if (token.type === "endOfFile") {
    throw new Panic("unexpected end-of-file", {}, token.loc);
  }

  return new Panic(
    "unexpected token",
    { $token: token.value, ...details },
    token.loc,
  );
}

export function parse(tokens) {
  // parse requires that tokens are valid (when un-escaping strings, for example)
  tokens.forEach((token) => token.validate());
  const parser = new Parser(tokens);
  const statements = parser.getStatements(true);
  parser.get("endOfFile");
  return statements;
}

class Parser {
  index = 0;
  fnDepth = 0;
  implicits = [];
  locals = [];

  constructor(tokens) {
    this.tokens = tokens;
  }

  *upcomingTokens() {
    for (let index = this.index; index < this.tokens.length; index++) {
      yield this.tokens[index];
    }
  }

  // check type of next token
  has(...types) {
    for (const token of this.upcomingTokens()) {
      if (token.matches(...types)) {
        return true;
      }

      if (!token.matches(...skip)) {
        break;
      }
    }

    // out of possible matches
    return false;
  }

  // check types of next tokens
  hasMulti(...types) {
    for (const token of this.upcomingTokens()) {
      if (!types.length) {
        return true;
      }

      if (token.matches(types[0])) {
        types.shift();
      } else if (!token.matches(...skip)) {
        return false;
      }
    }

    // out of tokens to match
    return false;
  }

  // advance parser and get the next matching token
  // (throw an error if next token has the wrong type)
  get(...types) {
    for (const token of this.upcomingTokens()) {
      this.index++;

      if (token.matches(...types)) {
        return token;
      }

      if (!token.matches(...skip)) {
        throw unexpectedToken(
          token,
          types.length === 1 ? { $expected: types[0] } : {},
        );
      }

      // should fail at endOfFile token
    }
  }

  // get the next non-skip token without advancing the parser
  peek() {
    for (const token of this.upcomingTokens()) {
      if (!token.matches(...skip)) {
        return token;
      }
    }
    // will return endOfFile token if no other tokens are left
  }

  updateImplicit(name, loc) {
    if (name === "arg") {
      if (!this.implicits.length) {
        throw new Panic("pipeline placeholder cannot be used here", {}, loc);
      }

      this.implicits[this.implicits.length - 1] ??= loc;
    }
  }

  addLocal(name) {
    this.locals.at(-1)?.add(name);
  }

  // get a sequence of elements (using the handler method),
  // with given start, end, and separator token types
  // a trailing separator is allowed
  seq(start, end, sep, handler) {
    const elems = [];
    this.get(start);

    while (!this.has(end)) {
      elems.push(handler.call(this));
      if (!this.has(end)) {
        this.get(sep);
      }
    }

    this.get(end);
    return elems;
  }

  getName() {
    const { value, loc } = this.get("name", "arg");
    this.updateImplicit(value, loc);
    return new Node("name", loc, value);
  }

  getNumber() {
    const { value, loc } = this.get("number");
    const n = checkNumResult(Number(value));
    return new Node("number", loc, n);
  }

  getNone() {
    const { loc } = this.get("none");
    return new Node("none", loc, null);
  }

  getBool() {
    const { value, loc } = this.get("true", "false");
    return new Node("bool", loc, value === "true");
  }

  getStringInner(string) {
    return string.match(stringInner)[1];
  }

  getAligned(value) {
    value = this.getStringInner(value);

    if (!value.includes("\n")) {
      return value;
    }

    const lines = value.split(/\r?\n/);
    let minIndent = lines.at(-1).match(indent)[0].length;

    if (lines[0].trim() === "") {
      lines.shift();
    }

    if (lines.at(-1).trim() === "") {
      lines.pop();
    }

    for (const line of lines) {
      const newIndent = line.match(indent)[0].length;

      if (newIndent < line.length) {
        minIndent = Math.min(minIndent, newIndent);
      }
    }

    return lines.map((line) => line.slice(minIndent).trimEnd()).join("\n");
  }

  getFmt(value, loc) {
    const rawFragments = value.split(fmtVar);
    const fmtVars = value.match(fmtVar);

    const fragments = [];
    const fmtNodes = [];
    let innerLoc = loc.next('"');

    for (const [index, varStr] of fmtVars.entries()) {
      fragments.push(parseStr(rawFragments[index], innerLoc));

      // remove '$' or '$()'
      const fmtInner = varStr.startsWith("$(")
        ? varStr.slice(2, -1)
        : varStr.slice(1);

      // split into name and keys
      const varSegments = fmtInner.split(".");
      const name = varSegments[0];

      innerLoc = innerLoc.next(rawFragments[index], "$");
      this.updateImplicit(name, innerLoc);
      let fmtNode = new Node("name", innerLoc, name);
      innerLoc = innerLoc.next(name);

      for (const segment of varSegments.slice(1)) {
        fmtNode = new Node("access", innerLoc, {
          lhs: fmtNode,
          rhs: new Node("string", innerLoc, segment),
        });
        innerLoc = innerLoc.next(".", segment);
      }

      fmtNodes.push(fmtNode);
    }

    fragments.push(parseStr(rawFragments.at(-1), innerLoc));
    return new Node("fmtString", loc, { fragments, fmtNodes });
  }

  getString() {
    const { value, loc } = this.get("string");
    const aligned = this.getAligned(value);

    // wait to parse fragments in getFmt so that we can keep
    // track of fragment locations correctly
    if (fmtVar.test(aligned)) {
      return this.getFmt(aligned, loc);
    }

    return new Node("string", loc, parseStr(aligned, loc));
  }

  getRawString() {
    const { value, loc } = this.get("rawString");
    const aligned = this.getAligned(value);
    return new Node("string", loc, aligned);
  }

  getList() {
    const { loc } = this.peek();
    const elems = this.seq("[", "]", ",", this.getExpression);
    return new Node("list", loc, elems);
  }

  getSet() {
    const { loc } = this.peek();
    const elems = this.seq("#[", "]", ",", this.getExpression);
    return new Node("set", loc, elems);
  }

  getEntry() {
    if (this.has(...identifier)) {
      const { value: name, loc } = this.get(...identifier);
      // de-sugar raw key name as string
      const key = new Node("string", loc, name);

      if (this.has(",", "}")) {
        // de-sugar key punning
        return { key, value: new Node("name", loc, name) };
      }

      this.get(":");
      return { key, value: this.getExpression() };
    }

    const key = this.getBase();
    this.get(":");
    const value = this.getExpression();
    return { key, value };
  }

  getObject() {
    const { loc } = this.peek();
    const entries = this.seq("{", "}", ",", this.getEntry);
    return new Node("object", loc, entries);
  }

  getHeader() {
    if (this.has(...identifier)) {
      const { value, loc } = this.get(...identifier);
      // de-sugar raw header name as string
      return new Node("string", loc, value);
    }

    return this.getBase();
  }

  getRow(handler) {
    if (this.has("}")) {
      return [];
    }

    const row = [handler.call(this)];

    while (this.has(",")) {
      this.get(",");
      row.push(handler.call(this));
    }

    if (!this.has("}")) {
      this.get("newline", ";");
    }

    return row;
  }

  getTable() {
    const { loc } = this.get("#{");
    const headers = this.getRow(this.getHeader);
    const rows = [];

    while (!this.has("}")) {
      const { loc } = this.peek();
      const row = this.getRow(this.getExpression);

      if (row.length !== headers.length) {
        throw new Panic("mismatched row length", {
          expected: headers.length,
          got: row.length,
        }, loc);
      }

      rows.push(row);
    }

    this.get("}");
    return new Node("table", loc, { headers, rows });
  }

  getParens() {
    this.get("(");
    const expression = this.getExpression();
    this.get(")");
    return expression;
  }

  getBase() {
    const token = this.peek();

    switch (token.type) {
      case "arg":
      case "name":
        return this.getName();
      case "number":
        return this.getNumber();
      case "string":
        return this.getString();
      case "rawString":
        return this.getRawString();
      case "true":
      case "false":
        return this.getBool();
      case "none":
        return this.getNone();
      case "[":
        return this.getList();
      case "#[":
        return this.getSet();
      case "{":
        return this.getObject();
      case "#{":
        return this.getTable();
      case "(":
        return this.getParens();
      default:
        throw unexpectedToken(token);
    }
  }

  getSuffix() {
    let lhs = this.getBase();

    // don't allow whitespace, newlines, or comments before suffixes
    // `foo.bar` is valid, `foo .bar` is not
    while (this.has("field", "[", "(") && !this.has(...skip)) {
      const { type, loc } = this.peek();

      switch (type) {
        case "field": {
          // get rid of leading '.'
          const key = this.get("field").value.slice(1);
          const rhs = new Node("string", loc, key);
          lhs = new Node("access", loc, { lhs, rhs });
          break;
        }

        case "[": {
          this.get("[");
          const rhs = this.getExpression();
          this.get("]");
          lhs = new Node("access", loc, { lhs, rhs });
          break;
        }

        case "(": {
          const args = this.seq("(", ")", ",", this.getExpression);
          lhs = new Node("call", loc, { args, func: lhs });
          break;
        }
      }
    }

    return lhs;
  }

  getFnDef() {
    const { loc } = this.get("fn");
    const name = this.get("name").value;
    const rhs = new Node("fn", loc, { name, ...this.getFnInner() });
    return new Node("def", loc, { name, keys: [], isCompound: false, rhs });
  }

  getReturn() {
    const { loc } = this.get("return");

    if (!this.fnDepth) {
      throw new Panic("Cannot use `return` outside of function", {}, loc);
    }

    const value = this.has("elif", "else", "end")
      ? new Node("none", loc, null)
      : this.getExpression();

    return new Node("return", loc, value);
  }

  getRangeBody() {
    const range = this.getExpression();
    this.get("do");
    const body = this.getStatements();
    this.get("end");
    return { range, body };
  }

  getFor() {
    const { loc } = this.get("for");

    if (this.hasMulti("name", "in")) {
      const name = this.get("name").value;
      this.addLocal(name);
      this.get("in");
      return new Node("for", loc, { name, ...this.getRangeBody() });
    }

    if (this.hasMulti("name", ",")) {
      const keyName = this.get("name").value;
      this.addLocal(keyName);
      this.get(",");

      const valName = this.get("name").value;
      this.addLocal(valName);
      this.get("in");

      return new Node("tandemFor", loc, {
        keyName,
        valName,
        ...this.getRangeBody(),
      });
    }

    return new Node("anonFor", loc, this.getRangeBody());
  }

  getWhile() {
    const { loc } = this.get("while");
    const cond = this.getExpression();
    this.get("do");
    const body = this.getStatements();
    this.get("end");
    return new Node("while", loc, { cond, body });
  }

  unrollKeys(node) {
    // in `foo.bar[baz]`: `foo` is the base, `"bar"` and `baz` are keys
    const keys = [];

    while (node.type === "access") {
      keys.push(node.value.rhs);
      // walked linked from right to left, outside in
      node = node.value.lhs;
    }

    // pushing keys then reversing is more efficient than unshift
    keys.reverse();
    return { base: node, keys };
  }

  getAssign(symbols) {
    const { value, loc } = this.get(...symbols);
    let op = value;

    if (op.length > 1 && op.endsWith("=")) {
      op = op.slice(0, -1);
    }

    // de-sugar compound assignments into binary ops with `prev`
    // placeholder to avoid evaluating asignee multiple times

    switch (op) {
      case "|":
      case "$":
      case "?": {
        // statement is a compound assignment with a pipe op
        const rhs = this.getChain(new Node("prev", loc), this.getExpression, {
          value: op,
          loc,
        });
        return { loc, rhs, isCompound: true };
      }
    }

    if (op !== "=") {
      // statement is a compound assignment with a numerical op
      const rhs = new Node("binaryOp", loc, {
        op,
        lhs: new Node("prev", loc),
        rhs: this.getExpression(),
      });
      return { loc, rhs, isCompound: true };
    }

    return { loc, rhs: this.getExpression(), isCompound: false };
  }

  getDef() {
    const lhs = this.getExpression();

    if (this.has(...def)) {
      const { base, keys } = this.unrollKeys(lhs);

      if (base.type !== "name") {
        // complains about the upcoming `=` sign if we try to
        // define an invalid lhs like `a + b = 0`
        throw new Panic(
          "assignment target must be a variable name",
          {},
          base.loc,
        );
      }

      const name = base.value;
      this.addLocal(name);
      const { loc, isCompound, rhs } = this.getAssign(def);
      return new Node("def", loc, { name, keys, isCompound, rhs });
    }

    return lhs;
  }

  getStatement(topLevel = false) {
    if (this.hasMulti("fn", "name")) {
      const fnDef = this.getFnDef();

      if (!topLevel) {
        const { name, rhs } = fnDef.value;
        const paramStr = rhs.value.params.join(", ");
        const $solution =
          `use anon function syntax here instead: ${name} = fn(${paramStr}) ... end`;

        throw new Panic(
          "function declarations can only occur at top level",
          { $solution },
          fnDef.loc,
        );
      }

      return fnDef;
    }

    const { type } = this.peek();

    switch (type) {
      case "return":
        return this.getReturn();
      case "for":
        return this.getFor();
      case "while":
        return this.getWhile();
    }

    return this.getDef();
  }

  getFnInner() {
    const params = this.seq("(", ")", ",", () => this.get("name").value);

    this.fnDepth++;
    this.locals.push(new Set());
    const body = this.getStatements();
    const locals = this.locals.pop();
    this.fnDepth--;

    this.get("end");
    return { params, body, locals };
  }

  getStatements(topLevel = false) {
    const statements = [];

    while (!this.has("case", "elif", "else", "end", "endOfFile", "do")) {
      if (statements.length) {
        // statement separator
        this.get("newline", ";");
      }

      statements.push(this.getStatement(topLevel));
    }

    return statements;
  }

  getFn() {
    const { loc } = this.get("fn");
    return new Node("fn", loc, { name: "fn", ...this.getFnInner() });
  }

  getBranch() {
    // get `<condition> then <expression>`, so we can use it
    // for `if` or `elif`
    const cond = this.getExpression();
    this.get("then");
    const body = this.getStatements();
    return { cond, body };
  }

  getIf() {
    const { loc } = this.get("if");
    const branches = [this.getBranch()];

    while (this.has("elif")) {
      this.get("elif");
      branches.push(this.getBranch());
    }

    let fallback;

    if (this.has("else")) {
      this.get("else");
      fallback = this.getStatements();
    }

    this.get("end");
    return new Node("if", loc, { branches, fallback });
  }

  getMatch() {
    const { loc } = this.get("match");
    const cond = this.getExpression();
    const cases = [];

    while (this.has("case")) {
      const patterns = this.seq("case", "then", ",", this.getExpression);
      const body = this.getStatements();
      cases.push({ patterns, body });
    }

    let fallback;

    if (this.has("else")) {
      this.get("else");
      fallback = this.getStatements();
    }

    this.get("end");
    return new Node("match", loc, { cond, cases, fallback });
  }

  getImport() {
    const { loc } = this.get("import");
    // remove quotes from path string
    const path = this.get("string").value.slice(1, -1);
    return new Node("import", loc, path);
  }

  getPrefix() {
    switch (this.peek().type) {
      case "fn":
        return this.getFn();
      case "if":
        return this.getIf();
      case "match":
        return this.getMatch();
      case "import":
        return this.getImport();
      default:
        return this.getSuffix();
    }
  }

  getOp(precedence = 0) {
    // https://en.wikipedia.org/wiki/Operator-precedence_parser#Pratt_parsing
    if (precedence === ops.length) {
      // base case
      return this.getPrefix();
    }

    const { type, assoc, symbols } = ops[precedence];

    if (type === "unary") {
      if (this.has(...symbols)) {
        const { type: op, loc } = this.get(...symbols);
        const rhs = this.getOp(precedence + 1);
        return new Node("unaryOp", loc, { op, rhs });
      }

      return this.getOp(precedence + 1);
    }

    const hasParen = this.has("(");

    // get initial operand
    let lhs = this.getOp(precedence + 1);

    if (this.has("**") && lhs.value.op === "-" && !hasParen) {
      throw new Panic(
        "exponentiation of negated operand requires parentheses",
        {},
        lhs.loc,
      );
    }

    while (this.has(...symbols)) {
      // Subtraction needs whitespace before second operand to differentiate
      // from negation
      if (
        this.has("-") &&
        !(this.hasMulti("-", "whitespace") || this.hasMulti("-", "newline"))
      ) {
        break;
      }

      const { type: op, loc } = this.get(...symbols);

      // left-associative operators and unary gets +1 precedence
      const rhs = assoc === "left"
        ? this.getOp(precedence + 1)
        : this.getOp(precedence);

      lhs = new Node("binaryOp", loc, { op, lhs, rhs });
    }

    return lhs;
  }

  getChain(lhs, handler, op) {
    const nodeType = { "|": "pipe", $: "map", "?": "filter" }[op.value];

    this.implicits.push(undefined);
    const result = handler.call(this);
    const loc = this.implicits.pop();

    const rhs = loc
      ? new Node("fn", loc, {
        name: "fn",
        params: ["arg"],
        body: [result],
        locals: new Set(),
      })
      : result;

    if (rhs.type === "call") {
      return new Node(nodeType, op.loc, {
        lhs,
        args: rhs.value.args,
        func: rhs.value.func,
      });
    }

    return new Node(nodeType, op.loc, { lhs, args: [], func: rhs });
  }

  getExpression() {
    // get initial operand
    let lhs = this.getOp();

    while (this.has("|", "$", "?")) {
      const op = this.get("|", "$", "?");
      lhs = this.getChain(lhs, this.getOp, op);
    }

    return lhs;
  }
}
