// This code is AI written, and has not been fully human-reviewed
// http://pointless.dev/articles/ai-and-pointless/

import { tokenize } from "../lang/tokenizer.js";
import { parse } from "../lang/parser.js";
import { ident } from "../lang/tokenizer.js";

// Operator precedences matching ops array in parser.js
// Higher = tighter binding
const PREC = {
  or: 0,
  and: 1,
  not: 2, // unary not
  in: 3,
  "not in": 3,
  "==": 3,
  "!=": 3,
  "<": 3,
  "<=": 3,
  ">": 3,
  ">=": 3,
  "+": 4,
  "-": 4,
  "*": 5,
  "/": 5,
  "//": 5,
  "%": 5,
  "**": 6,
  neg: 7, // unary -
  "??": 8,
  suffix: 9, // call, access
};

const PIPE_OPS = { pipe: "|", map: "$", filter: "?", extend: "#" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isIdent(s) {
  return ident.test(s);
}

function escapeString(s) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(
      /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,
      (c) => `\\u{${c.codePointAt(0).toString(16)}}`,
    );
}

// Is this node a block statement (ends with `end`, takes multiple lines)?
function isBlockStmt(node) {
  if (!node) return false;
  switch (node.type) {
    case "for":
    case "tandemFor":
    case "anonFor":
    case "while":
    case "match":
      return true;
    case "if":
      return Array.isArray(node.value.branches[0].body);
    case "def":
      return node.value.rhs?.type === "fn" &&
        node.value.rhs.value.name === node.value.name;
    default:
      return false;
  }
}

// Is the rhs of an assignment an inline-if expression?
function isBlockExprRhs(node) {
  return node.type === "if" && !Array.isArray(node.value.branches[0].body);
}

// Does this node contain a block-level subexpression?
// Used to decide whether containing collections should break to multi-line.
function isComplex(node) {
  if (!node) return false;
  if (node.type === "fn") return true;
  if (isBlockStmt(node)) return true;
  if (PIPE_OPS[node.type]) {
    let n = node;
    let count = 0;
    while (PIPE_OPS[n.type]) {
      count++;
      n = n.value.lhs;
    }
    return count >= 2;
  }
  return false;
}

// Rough flat character length estimate for deciding whether to break inline-if.
// Returns Infinity if the node should always be broken.
function flatLength(node) {
  if (!node) return 0;
  switch (node.type) {
    case "name":
      return node.value.length;
    case "number":
      return String(node.value).length;
    case "bool":
      return node.value ? 4 : 5;
    case "none":
      return 4;
    case "string":
      return node.value.length + 2;
    case "fmtString": {
      const { fragments, fmtNodes } = node.value;
      let len = 2; // quotes
      for (const frag of fragments) len += frag.length;
      for (const fmtNode of fmtNodes) len += flatLength(fmtNode) + 3; // $( + expr + )
      return len;
    }
    case "dateTime":
      return node.value.length + 2;
    case "binaryOp": {
      const { op, lhs, rhs } = node.value;
      return flatLength(lhs) + op.length + 2 + flatLength(rhs);
    }
    case "unaryOp": {
      const { op, rhs } = node.value;
      return (op === "not" ? 4 : 1) + flatLength(rhs);
    }
    case "call": {
      const argsLen = node.value.args.reduce(
        (s, a) => s + flatLength(a) + 2,
        0,
      );
      return flatLength(node.value.func) + argsLen + 2;
    }
    case "access": {
      const { lhs, rhs } = node.value;
      if (rhs.type === "string" && isIdent(rhs.value)) {
        return flatLength(lhs) + 1 + rhs.value.length;
      }
      return flatLength(lhs) + 2 + flatLength(rhs);
    }
    case "if": {
      const { branches, fallback } = node.value;
      if (Array.isArray(branches[0].body)) return Infinity;
      let len = flatLength(branches[0].cond) + 6 + flatLength(branches[0].body);
      for (let i = 1; i < branches.length; i++) {
        len += 7 + flatLength(branches[i].cond) + 6 +
          flatLength(branches[i].body);
      }
      if (fallback !== undefined) {
        const fb = Array.isArray(fallback) ? fallback[0] : fallback;
        len += 7 + flatLength(fb);
      }
      return len;
    }
    case "list":
      return node.value.reduce((s, e) => s + flatLength(e) + 2, 2);
    case "set":
      return node.value.reduce((s, e) => s + flatLength(e) + 2, 3);
    default:
      return Infinity;
  }
}

// Collect comment tokens from the token stream
function extractComments(tokens) {
  return tokens
    .filter((t) => t.type === "comment")
    .map((t) => ({ line: t.loc.line, text: t.value, used: false }));
}

// Best-effort end-line estimate for a statement (for blank line detection)
function endLine(node) {
  if (!node) return 0;
  switch (node.type) {
    case "def": {
      const { rhs } = node.value;
      if (rhs?.type === "fn") return endLine(rhs);
      if (rhs && PIPE_OPS[rhs.type]) return rhs.loc.line;
      return node.loc.line;
    }
    case "fn": {
      const { body } = node.value;
      return body.length
        ? endLine(body[body.length - 1]) + 1
        : node.loc.line + 1;
    }
    case "if": {
      const { branches, fallback } = node.value;
      const lastBody = fallback !== undefined
        ? fallback
        : branches[branches.length - 1].body;
      if (!Array.isArray(lastBody)) return node.loc.line;
      return lastBody.length
        ? endLine(lastBody[lastBody.length - 1]) + 1
        : node.loc.line + 1;
    }
    case "for":
    case "tandemFor":
    case "anonFor":
    case "while": {
      const { body } = node.value;
      return body.length
        ? endLine(body[body.length - 1]) + 1
        : node.loc.line + 1;
    }
    case "match": {
      const { cases, fallback } = node.value;
      const lastBody = fallback !== undefined
        ? fallback
        : cases.length
        ? cases[cases.length - 1].body
        : [];
      return lastBody.length
        ? endLine(lastBody[lastBody.length - 1]) + 1
        : node.loc.line + 1;
    }
    default:
      return node.loc.line;
  }
}

// Effective start line of a statement: for pipelines, use the anchor's line
function stmtStartLine(node) {
  let n = node;
  while (PIPE_OPS[n.type]) n = n.value.lhs;
  return n.loc.line;
}

// Build leading/trailing comment maps for a single statement list.
// leadingMap values are arrays of { line, text } objects (not just text strings).
// minLine: ignore comments before this line when assigning leading to first statement
// (used to prevent condition-zone comments from leaking into body blocks).
function buildCommentMaps(allComments, stmts, minLine = 0) {
  const leadingMap = new Map();
  const trailingMap = new Map();
  if (!stmts.length) return { leadingMap, trailingMap };

  for (let i = 0; i < stmts.length; i++) {
    const node = stmts[i];
    const startLine = stmtStartLine(node);
    const prevEnd = i > 0 ? endLine(stmts[i - 1]) : minLine;

    const leading = [];
    for (const c of allComments) {
      if (c.used) continue;
      if (c.line === startLine) {
        trailingMap.set(node, c.text);
        c.used = true;
      } else if (c.line > prevEnd && c.line < startLine) {
        leading.push(c);
        c.used = true;
      }
    }
    if (leading.length) leadingMap.set(node, leading);
  }

  return { leadingMap, trailingMap };
}

// Unroll a pipeline chain: node -> { anchor, steps }
// steps are in left-to-right order (anchor | steps[0] | steps[1] ...)
function collectChain(node) {
  const steps = [];
  let n = node;
  while (PIPE_OPS[n.type]) {
    steps.unshift(n);
    n = n.value.lhs;
  }
  return { anchor: n, steps };
}

// Is this an implicit-arg fn wrapper: fn(arg) expr (one param "arg", one body stmt)
function isImplicitArgFn(node) {
  return (
    node.type === "fn" &&
    node.value.params.length === 1 &&
    node.value.params[0] === "arg" &&
    node.value.body.length === 1
  );
}

// Prettier-style number normalization: add leading zero, lowercase e
function formatNumber(node) {
  let s = node.fmtInto?.raw ?? String(node.value);
  if (s.startsWith(".")) s = "0" + s;
  return s.replace(/[eE]([+-]?\d+)$/, (_, exp) => "e" + exp);
}

// Try to get dotted path for a fmtString node reference
function fmtNodePath(node) {
  if (node.type === "name") return node.value;
  if (node.type === "access") {
    const { lhs, rhs } = node.value;
    if (rhs.type === "string" && isIdent(rhs.value)) {
      const lhsPath = fmtNodePath(lhs);
      if (lhsPath !== null) return `${lhsPath}.${rhs.value}`;
    }
  }
  return null;
}

// Operator precedence for a node (for parenthesization)
function nodePrec(node) {
  switch (node.type) {
    case "binaryOp":
      return PREC[node.value.op] ?? 4;
    case "unaryOp":
      return node.value.op === "not" ? PREC.not : PREC.neg;
    case "pipe":
    case "map":
    case "filter":
    case "extend":
      return -1;
    case "if":
      return Array.isArray(node.value.branches[0].body) ? null : -2;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Printer
// ---------------------------------------------------------------------------

class Printer {
  constructor(allComments) {
    this.allComments = allComments;
    this.indent = 0;
    this.output = [];
  }

  pad() {
    return "  ".repeat(this.indent);
  }

  emit(line) {
    this.output.push(this.pad() + line.trimEnd());
  }

  emitBlank() {
    this.output.push("");
  }

  pushIndent() {
    this.indent++;
  }

  popIndent() {
    this.indent--;
  }

  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------

  // Build dotted/bracketed LHS string: name.key1[key2]...
  buildLhs(name, keys) {
    let lhs = name;
    for (const key of keys) {
      if (key.type === "string" && isIdent(key.value)) {
        lhs += "." + key.value;
      } else {
        lhs += "[" + this.printExpr(key) + "]";
      }
    }
    return lhs;
  }

  // If node is a long or/and chain, returns the lines to emit (first operand,
  // then "or operand" / "and operand" for each continuation). Returns null if
  // the chain is short enough to stay inline.
  boolChainLines(node, threshold = 60) {
    if (node.type !== "binaryOp") return null;
    const { op } = node.value;
    if (op !== "or" && op !== "and") return null;
    const flat = this.printExpr(node);
    if (flat.length <= threshold) return null;

    // Collect left spine
    const items = [];
    let n = node;
    while (
      n.type === "binaryOp" && (n.value.op === "or" || n.value.op === "and")
    ) {
      items.unshift({ op: n.value.op, node: n.value.rhs });
      n = n.value.lhs;
    }
    items.unshift({ op: null, node: n });
    return items.map((item, i) => {
      const str = this.printExpr(item.node);
      return i < items.length - 1 ? `${str} ${items[i + 1].op}` : str;
    });
  }

  // Emit the body lines of a multi-line inline-if (then/elif/else).
  // The caller is responsible for emitting the first condition and managing indent.
  emitMultilineInlineIf(branches, fallback) {
    this.emit(`then ${this.printExpr(branches[0].body)}`);
    for (let i = 1; i < branches.length; i++) {
      this.emit(
        `elif ${this.printExpr(branches[i].cond)} then ${
          this.printExpr(branches[i].body)
        }`,
      );
    }
    if (fallback !== undefined) {
      const fb = Array.isArray(fallback) ? fallback[0] : fallback;
      this.emit(`else ${this.printExpr(fb)}`);
    }
  }

  // Find and consume a trailing comment on the given source line.
  findTrailingComment(line) {
    const c = this.allComments.find((c) => !c.used && c.line === line);
    if (c) {
      c.used = true;
      return "  " + c.text;
    }
    return "";
  }

  // ---------------------------------------------------------------------------
  // Statement list
  // ---------------------------------------------------------------------------

  printStatements(stmts, minLine = 0) {
    if (!stmts.length) return;
    const { leadingMap, trailingMap } = buildCommentMaps(
      this.allComments,
      stmts,
      minLine,
    );

    for (let i = 0; i < stmts.length; i++) {
      const node = stmts[i];
      const prev = stmts[i - 1];
      const leading = leadingMap.get(node);

      if (prev) {
        // For gap detection, use the anchor line for pipelines (their node.loc is the | operator)
        const nodeFirstLine = leading ? leading[0].line : stmtStartLine(node);
        if (isBlockStmt(prev) || isBlockStmt(node)) {
          this.emitBlank();
        } else if (nodeFirstLine - prev.loc.line >= 2) {
          this.emitBlank();
        }
      }

      // Leading comments: preserve blank lines between comments and before statement
      if (leading) {
        this.emit(leading[0].text);
        for (let j = 1; j < leading.length; j++) {
          if (leading[j].line > leading[j - 1].line + 1) this.emitBlank();
          this.emit(leading[j].text);
        }
        // Blank between last comment and statement (if there was one in source)
        if (stmtStartLine(node) > leading[leading.length - 1].line + 1) {
          this.emitBlank();
        }
      }

      const trailing = trailingMap.get(node);
      this.printStatement(node, trailing ? "  " + trailing : "");
    }
  }

  // ---------------------------------------------------------------------------
  // Statement
  // ---------------------------------------------------------------------------

  printStatement(node, suffix = "") {
    switch (node.type) {
      case "def":
        this.printDef(node, suffix);
        break;
      case "for":
      case "tandemFor":
      case "anonFor":
        this.printFor(node, suffix);
        break;
      case "while":
        this.printWhile(node, suffix);
        break;
      case "if":
        if (Array.isArray(node.value.branches[0].body)) {
          this.printIfBlock(node, suffix);
        } else {
          this.printInlineIfStmt(node, suffix);
        }
        break;
      case "match":
        this.printMatch(node, suffix);
        break;
      case "break":
      case "continue":
        this.emit(node.type + suffix);
        break;
      case "return": {
        const v = node.value;
        if (v.type === "none") {
          this.emit("return" + suffix);
        } else {
          this.emit("return " + this.printExpr(v) + suffix);
        }
        break;
      }
      case "import":
        this.emit(`import "${node.value}"${suffix}`);
        break;
      default:
        // Expression statement — may be a pipeline chain
        this.printExprStatement(node, suffix);
    }
  }

  printExprStatement(node, suffix) {
    if (PIPE_OPS[node.type]) {
      const { anchor, steps } = collectChain(node);
      if (steps.length >= 2) {
        this.emitPipelineChain(anchor, steps, suffix);
        return;
      }
    }
    this.emit(this.printExpr(node) + suffix);
  }

  // ---------------------------------------------------------------------------
  // Def / assignment
  // ---------------------------------------------------------------------------

  printDef(node, suffix) {
    const { name, keys, isCompound, rhs } = node.value;
    const { compoundOp } = node.fmtInto ?? {};

    // Named function definition
    if (rhs.type === "fn" && rhs.value.name === name && !isCompound) {
      this.printFnDef(name, rhs, suffix);
      return;
    }

    const lhs = this.buildLhs(name, keys);

    if (isCompound) {
      this.printCompoundAssign(lhs, compoundOp, rhs, suffix);
      return;
    }

    // Inline-if as RHS: may need multi-line treatment
    if (!isBlockStmt(node) && isBlockExprRhs(rhs)) {
      this.printAssignRhs(lhs, rhs, suffix);
      return;
    }

    if (PIPE_OPS[rhs.type]) {
      const { anchor, steps } = collectChain(rhs);
      if (steps.length >= 2) {
        this.emit(`${lhs} = ${this.printExpr(anchor)}${suffix}`);
        this.pushIndent();
        this.emitPipelineChainSteps(steps);
        this.popIndent();
        return;
      }
    }

    const boolLines = this.boolChainLines(rhs);
    if (boolLines) {
      this.emit(`${lhs} =${suffix}`);
      this.pushIndent();
      for (const l of boolLines) this.emit(l);
      this.popIndent();
    } else {
      this.emit(`${lhs} = ${this.printExpr(rhs)}${suffix}`);
    }
  }

  printCompoundAssign(lhs, op, rhs, suffix) {
    if (PIPE_OPS[rhs.type] && rhs.value.lhs.type === "prev") {
      // Pipeline compound: lhs |= func  or  lhs |= a | b | c
      const { steps } = collectChain(rhs);
      this.emit(`${lhs} ${op} ${this.stepRhsStr(steps[0])}${suffix}`);
      if (steps.length > 1) {
        this.pushIndent();
        for (let i = 1; i < steps.length; i++) {
          this.emitStep(steps[i]);
        }
        this.popIndent();
      }
    } else if (rhs.type === "binaryOp" && rhs.value.lhs.type === "prev") {
      // Arithmetic compound: lhs += expr
      this.emit(`${lhs} ${op} ${this.printExpr(rhs.value.rhs)}${suffix}`);
    } else {
      this.emit(`${lhs} = ${this.printExpr(rhs)}${suffix}`);
    }
  }

  // Handles assignment where RHS is an inline-if expression
  printAssignRhs(lhs, rhs, suffix) {
    // Short inline-if: put everything on one line
    if (flatLength(rhs) <= 50) {
      this.emit(`${lhs} = ${this.printExprInner(rhs)}${suffix}`);
      return;
    }
    // Long inline-if: break to multi-line
    const { branches, fallback } = rhs.value;
    this.emit(`${lhs} = ${this.printExpr(branches[0].cond)}${suffix}`);
    this.pushIndent();
    this.emitMultilineInlineIf(branches, fallback);
    this.popIndent();
  }

  printFnDef(name, fnNode, suffix) {
    const { params, body } = fnNode.value;
    this.emit(`fn ${name}(${params.join(", ")})${suffix}`);
    this.pushIndent();
    this.printStatements(body);
    this.popIndent();
    this.emit("end");
  }

  printIfBlock(node, suffix) {
    const { branches, fallback } = node.value;

    for (let i = 0; i < branches.length; i++) {
      const { cond, body } = branches[i];
      const keyword = i === 0 ? "if" : "elif";

      if (i > 0) {
        // cond.loc.line is the elif line; emit blank if one existed in source
        const prevBody = branches[i - 1].body;
        const prevEnd = prevBody.length
          ? endLine(prevBody[prevBody.length - 1])
          : branches[i - 1].cond.loc.line;
        if (cond.loc.line - prevEnd >= 2) this.emitBlank();
      }

      const boolLines = this.boolChainLines(cond);
      if (boolLines) {
        this.emit(keyword);
        this.pushIndent();
        for (const l of boolLines) this.emit(l);
        this.popIndent();
        this.emit("then" + (i === 0 ? suffix : ""));
      } else {
        this.emit(
          `${keyword} ${this.printExpr(cond)} then` + (i === 0 ? suffix : ""),
        );
      }
      this.pushIndent();
      this.printStatements(body, cond.loc.line);
      this.popIndent();
    }

    if (fallback !== undefined) {
      if (fallback.length > 0) {
        // else keyword is one line before fallback[0]; gap of 3 = blank + else + first stmt
        // Use stmtStartLine so pipelines resolve to the anchor line, not the operator line
        const lastBranch = branches[branches.length - 1];
        const prevEnd = lastBranch.body.length
          ? endLine(lastBranch.body[lastBranch.body.length - 1])
          : lastBranch.cond.loc.line;
        if (stmtStartLine(fallback[0]) - prevEnd >= 3) this.emitBlank();
      }
      this.emit("else");
      this.pushIndent();
      const lastBranch = branches[branches.length - 1];
      const elseMinLine = lastBranch.body.length > 0
        ? endLine(lastBranch.body[lastBranch.body.length - 1])
        : lastBranch.cond.loc.line;
      this.printStatements(fallback, elseMinLine);
      this.popIndent();
    }

    this.emit("end");
  }

  // Inline-if as a statement expression: break to multi-line when long
  printInlineIfStmt(node, suffix) {
    if (flatLength(node) + this.indent * 2 <= 60) {
      this.emit(this.printExprInner(node) + suffix);
      return;
    }
    const { branches, fallback } = node.value;
    this.emit(this.printExpr(branches[0].cond) + suffix);
    this.pushIndent();
    this.emitMultilineInlineIf(branches, fallback);
    this.popIndent();
  }

  printMatch(node, suffix) {
    const { cond, cases, fallback } = node.value;
    this.emit(`match ${this.printExpr(cond)}${suffix}`);
    this.pushIndent();

    for (let i = 0; i < cases.length; i++) {
      const { patterns, body } = cases[i];
      const caseStartLine = patterns[0].loc.line;
      const isInlineCase = body.length === 1 && !isBlockStmt(body[0]);

      // Compute the end of the previous case (or match header for i=0)
      const prevCaseEnd = i > 0
        ? (cases[i - 1].body.length
          ? endLine(cases[i - 1].body[cases[i - 1].body.length - 1])
          : cases[i - 1].patterns[0].loc.line)
        : node.loc.line;

      // Collect leading comments before this case
      const leadingComments = [];
      for (const c of this.allComments) {
        if (!c.used && c.line > prevCaseEnd && c.line < caseStartLine) {
          leadingComments.push(c);
          c.used = true;
        }
      }

      if (i > 0) {
        const prevBody = cases[i - 1].body;
        const prevIsInlineCase = prevBody.length === 1 &&
          !isBlockStmt(prevBody[0]);
        // Preserve blank if either adjacent case is multi-line
        if (!isInlineCase || !prevIsInlineCase) {
          const firstLine = leadingComments.length > 0
            ? leadingComments[0].line
            : caseStartLine;
          if (firstLine - prevCaseEnd >= 2) this.emitBlank();
        }
      }

      for (const c of leadingComments) this.emit(c.text);

      const patStr = patterns.map((p) => this.printExpr(p)).join(", ");
      if (isInlineCase) {
        this.emit(`case ${patStr} then ${this.printStmtInline(body[0])}`);
      } else {
        this.emit(`case ${patStr} then`);
        this.pushIndent();
        this.printStatements(body);
        this.popIndent();
      }
    }

    if (fallback !== undefined) {
      if (fallback.length > 0 && cases.length > 0) {
        const lastCase = cases[cases.length - 1];
        const prevEnd = lastCase.body.length
          ? endLine(lastCase.body[lastCase.body.length - 1])
          : lastCase.patterns[0].loc.line;
        if (fallback[0].loc.line - prevEnd >= 3) this.emitBlank();
      }
      this.emit("else");
      this.pushIndent();
      this.printStatements(fallback);
      this.popIndent();
    }

    this.popIndent();
    this.emit("end");
  }

  printFor(node, suffix) {
    let header;
    if (node.type === "for") {
      header = `for ${node.value.name} in ${
        this.printExpr(node.value.range)
      } do`;
    } else if (node.type === "tandemFor") {
      header = `for ${node.value.keyName}, ${node.value.valName} in ${
        this.printExpr(node.value.range)
      } do`;
    } else {
      header = `for ${this.printExpr(node.value.range)} do`;
    }
    this.emit(header + suffix);
    this.pushIndent();
    this.printStatements(node.value.body);
    this.popIndent();
    this.emit("end");
  }

  printWhile(node, suffix) {
    this.emit(`while ${this.printExpr(node.value.cond)} do${suffix}`);
    this.pushIndent();
    this.printStatements(node.value.body);
    this.popIndent();
    this.emit("end");
  }

  // ---------------------------------------------------------------------------
  // Pipeline chain emission
  // ---------------------------------------------------------------------------

  emitPipelineChain(anchor, steps, suffix) {
    this.emit(this.printExpr(anchor) + suffix);
    this.pushIndent();
    this.emitPipelineChainSteps(steps);
    this.popIndent();
  }

  emitPipelineChainSteps(steps) {
    for (const step of steps) {
      this.emitStep(step);
    }
  }

  emitStep(step) {
    const op = PIPE_OPS[step.type];
    const { func } = step.value;
    const trailingComment = this.findTrailingComment(step.loc.line);

    // extend with multi-line object: # {\n  entries\n}
    if (step.type === "extend" && isImplicitArgFn(func)) {
      const inner = func.value.body[0];
      if (inner.type === "object" && inner.value.length >= 2) {
        this.emit(op + " {" + trailingComment);
        this.pushIndent();
        for (const { key, value } of inner.value) {
          this.emit(this.objectEntryStr(key, value) + ",");
        }
        this.popIndent();
        this.emit("}");
        return;
      }
    }

    this.emit(op + " " + this.stepRhsStr(step) + trailingComment);
  }

  stepStr(step) {
    return PIPE_OPS[step.type] + " " + this.stepRhsStr(step);
  }

  stepRhsStr(step) {
    const { func, args } = step.value;

    // Unwrap implicit-arg fn: fn(arg) expr -> print expr directly (no parens)
    if (isImplicitArgFn(func)) {
      return this.printExprInner(func.value.body[0]);
    }

    if (args.length === 0) {
      return this.printExpr(func, PREC.suffix);
    }

    return this.printExpr(func, PREC.suffix) + "(" +
      args.map((a) => this.printExpr(a)).join(", ") + ")";
  }

  // ---------------------------------------------------------------------------
  // Expression printer
  // ---------------------------------------------------------------------------

  printExpr(node, minPrec = -1) {
    const result = this.printExprInner(node);
    const prec = nodePrec(node);
    if (prec !== null && prec < minPrec) {
      return "(" + result + ")";
    }
    return result;
  }

  printExprInner(node) {
    switch (node.type) {
      case "name":
        return node.value;

      case "number":
        return formatNumber(node);

      case "bool":
        return node.value ? "true" : "false";

      case "none":
        return "none";

      case "dateTime":
        return "`" + node.value + "`";

      case "string":
        return this.stringStr(node);

      case "fmtString":
        return this.fmtStringStr(node);

      case "list":
        return this.collectionStr("[", "]", node.value);

      case "set":
        return this.collectionStr("#[", "]", node.value);

      case "object":
        return this.objectStr(node);

      case "table":
        return this.tableStr(node);

      case "unaryOp": {
        const { op, rhs } = node.value;
        const opStr = op === "not" ? "not " : "-";
        const rhsPrec = op === "not" ? PREC.not + 1 : PREC.neg + 1;
        return opStr + this.printExpr(rhs, rhsPrec);
      }

      case "binaryOp": {
        const { op, lhs, rhs } = node.value;
        const level = PREC[op] ?? 4;
        const rhsPrec = op === "**" ? level : level + 1;
        return `${this.printExpr(lhs, level)} ${op} ${
          this.printExpr(rhs, rhsPrec)
        }`;
      }

      case "access": {
        const { lhs, rhs } = node.value;
        const lhsStr = this.printExpr(lhs, PREC.suffix);
        if (rhs.type === "string" && isIdent(rhs.value)) {
          return `${lhsStr}.${rhs.value}`;
        }
        return `${lhsStr}[${this.printExpr(rhs)}]`;
      }

      case "call": {
        const { func, args } = node.value;
        const funcStr = this.printExpr(func, PREC.suffix);
        if (args.length === 0) return `${funcStr}()`;

        // Format at current indent to detect multi-line args
        const inlineStrs = args.map((a) => this.printExpr(a));
        const anyMultiline = args.some(isComplex) ||
          inlineStrs.some((s) => s.includes("\n"));

        if (!anyMultiline) {
          return `${funcStr}(${inlineStrs.join(", ")})`;
        }

        if (args.length === 1) {
          // Single complex arg: hug the arg's delimiters to the call parens
          return `${funcStr}(${inlineStrs[0]})`;
        }

        // Multiple args, some multi-line: reformat each arg at deeper indent
        const pad = this.pad();
        const innerPad = pad + "  ";
        this.pushIndent();
        const deepArgStrs = args.map((a) => this.printExpr(a));
        this.popIndent();
        const lines = deepArgStrs.map((s, i) =>
          innerPad + s + (i < deepArgStrs.length - 1 ? "," : "")
        );
        return `${funcStr}(\n${lines.join("\n")}\n${pad})`;
      }

      case "pipe":
      case "map":
      case "filter":
      case "extend": {
        // Single-step inline pipeline
        const { anchor, steps } = collectChain(node);
        const anchorStr = this.printExpr(anchor);
        if (steps.length === 1) {
          return `${anchorStr} ${this.stepStr(steps[0])}`;
        }
        // Multi-step pipelines should not normally appear as sub-expressions,
        // but handle gracefully inline
        return anchorStr + " " + steps.map((s) => this.stepStr(s)).join(" ");
      }

      case "if": {
        const { branches, fallback } = node.value;
        if (Array.isArray(branches[0].body)) {
          // Block form — shouldn't appear as a sub-expression; emit inline as best effort
          const b = branches[0];
          const bodyStr = b.body.map((s) => this.printStmtInline(s)).join("; ");
          return `if ${this.printExpr(b.cond)} then ${bodyStr} end`;
        }
        // Inline shorthand: cond then body else fallback
        let result = `${this.printExpr(branches[0].cond)} then ${
          this.printExpr(branches[0].body)
        }`;
        for (let i = 1; i < branches.length; i++) {
          result += ` elif ${this.printExpr(branches[i].cond)} then ${
            this.printExpr(branches[i].body)
          }`;
        }
        if (fallback !== undefined) {
          const fb = Array.isArray(fallback) ? fallback[0] : fallback;
          result += ` else ${this.printExpr(fb)}`;
        }
        return result;
      }

      case "fn": {
        const { params, body } = node.value;
        const paramStr = params.join(", ");
        if (body.length === 1 && !isBlockStmt(body[0])) {
          return `fn(${paramStr}) ${this.printStmtInline(body[0])}`;
        }
        // Multi-statement anonymous fn — inline as best effort
        return `fn(${paramStr}) ${
          body.map((s) => this.printStmtInline(s)).join("; ")
        } end`;
      }

      case "import":
        return `import "${node.value}"`;

      case "def":
        return this.defInlineStr(node);

      default:
        throw new Error(`formatter: unhandled node type "${node.type}"`);
    }
  }

  // Inline representation of a statement (for match case bodies, fn single-line bodies)
  printStmtInline(node) {
    switch (node.type) {
      case "def":
        return this.defInlineStr(node);
      case "return":
        return node.value.type === "none"
          ? "return"
          : `return ${this.printExpr(node.value)}`;
      case "break":
      case "continue":
        return node.type;
      default:
        return this.printExpr(node);
    }
  }

  defInlineStr(node) {
    const { name, keys, isCompound, rhs } = node.value;
    const { compoundOp } = node.fmtInto ?? {};
    const lhs = this.buildLhs(name, keys);
    if (isCompound) {
      if (rhs.type === "binaryOp" && rhs.value.lhs.type === "prev") {
        return `${lhs} ${compoundOp} ${this.printExpr(rhs.value.rhs)}`;
      }
      if (PIPE_OPS[rhs.type] && rhs.value.lhs.type === "prev") {
        return `${lhs} ${compoundOp} ${this.stepRhsStr(rhs)}`;
      }
    }
    return `${lhs} = ${this.printExprInner(rhs)}`;
  }

  // ---------------------------------------------------------------------------
  // String helpers
  // ---------------------------------------------------------------------------

  stringStr(node) {
    if (node.fmtInto?.raw) {
      return `r"${node.value}"`;
    }
    if (node.value.includes("\n")) {
      const lines = node.value.split("\n");
      const contentLines = lines.filter((l) => l.trim().length > 0);
      // Only use multi-line literal format when there are 2+ substantive lines.
      // Use a leading newline so getAligned correctly strips indentation on re-parse.
      if (contentLines.length >= 2) {
        const pad = this.pad();
        const escaped = lines.map((l) =>
          l.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t")
        );
        // Indent content lines at current level; getAligned strips it back on re-parse.
        const body = escaped.map((l) => "\n" + (l ? pad + l : "")).join("") +
          "\n" + pad;
        return `"${body}"`;
      }
    }
    return `"${escapeString(node.value)}"`;
  }

  fmtStringStr(node) {
    const { fragments, fmtNodes } = node.value;
    let result = '"';
    for (let i = 0; i < fmtNodes.length; i++) {
      result += escapeString(fragments[i]);
      const path = fmtNodePath(fmtNodes[i]);
      // Must wrap in $(...) if path is null OR if the next fragment starts with an
      // identifier char (which would make $name + "mfoo" read as $namemfoo)
      const nextFrag = fragments[i + 1];
      const needsParens = path === null ||
        (nextFrag.length > 0 && /^[a-zA-Z0-9_]/.test(nextFrag));
      result += needsParens
        ? `$(${path !== null ? path : this.printExpr(fmtNodes[i])})`
        : `$${path}`;
    }
    result += escapeString(fragments[fragments.length - 1]);
    result += '"';
    return result;
  }

  // ---------------------------------------------------------------------------
  // Collection helpers
  // ---------------------------------------------------------------------------

  collectionStr(open, close, elements) {
    if (elements.length === 0) return open + close;
    const items = elements.map((e) => this.printExpr(e));
    if (elements.some(isComplex)) {
      return this.multilineCollection(open, close, items);
    }
    const inline = open + items.join(", ") + close;
    return inline.length > 60
      ? this.multilineCollection(open, close, items)
      : inline;
  }

  objectEntryStr(key, value, forceQuote = false) {
    // Key punning: { x } when key = string "x" and value = name "x"
    if (
      !forceQuote && key.type === "string" && value.type === "name" &&
      key.value === value.value
    ) {
      return key.value;
    }
    if (key.type === "string") {
      const keyStr = !forceQuote && isIdent(key.value)
        ? key.value
        : `"${escapeString(key.value)}"`;
      return `${keyStr}: ${this.printExpr(value)}`;
    }
    // Computed (non-literal) key: (expr): value
    return `(${this.printExpr(key)}): ${this.printExpr(value)}`;
  }

  objectStr(node) {
    if (node.value.length === 0) return "{}";
    const forceQuote = node.value.some(({ key }) =>
      key.type === "string" && !isIdent(key.value)
    );
    const entries = node.value.map(({ key, value }) =>
      this.objectEntryStr(key, value, forceQuote)
    );
    if (!node.value.some((e) => isComplex(e.value))) {
      const inlineStr = "{ " + entries.join(", ") + " }";
      if (inlineStr.length <= 60) return inlineStr;
    }
    // Multi-line: look for trailing comments on each entry's value line
    const pad = this.pad();
    const innerPad = pad + "  ";
    const lines = entries.map((entry, i) => {
      const trailingComment = node.value[i].value.loc
        ? this.findTrailingComment(node.value[i].value.loc.line)
        : "";
      return `${innerPad}${entry},${trailingComment}`;
    });
    return `{\n${lines.join("\n")}\n${pad}}`;
  }

  tableStr(node) {
    const { headers, rows } = node.value;
    const headerStrs = headers.map((h) =>
      h.type === "string" && isIdent(h.value)
        ? h.value
        : `"${escapeString(h.value)}"`
    );

    if (rows.length === 0) {
      return "#{ " + headerStrs.join(" , ") + " }";
    }

    // Format each cell as a source string
    const cellStrs = rows.map((row) => row.map((cell) => this.printExpr(cell)));

    // Determine per-column: is it all number literals?
    const isNumCol = headers.map((_, ci) =>
      rows.every((row) => row[ci].type === "number")
    );

    // Split a numeric source string into base and exponent parts
    function numParts(s) {
      const eIdx = s.search(/[eE]/);
      return eIdx >= 0 ? [s.slice(0, eIdx), s.slice(eIdx)] : [s, ""];
    }

    // For numeric columns: compute max decimal width from base only (excluding exponent).
    // Mirrors ColInfo.decimals in table.js
    const colDecimals = headers.map((_, ci) => {
      if (!isNumCol[ci]) return 0;
      return Math.max(
        0,
        ...cellStrs.map((row) => {
          const [base] = numParts(row[ci]);
          const dot = base.indexOf(".");
          return dot >= 0 ? base.length - dot : 0;
        }),
      );
    });

    // Normalize numeric cells: pad decimals with trailing zeros before exponent
    const normStrs = cellStrs.map((row) =>
      row.map((s, ci) => {
        if (!isNumCol[ci] || colDecimals[ci] === 0) return s;
        const [base, exp] = numParts(s);
        const dot = base.indexOf(".");
        if (dot < 0) {
          return base + ".0".padEnd(colDecimals[ci], "0") + exp;
        }
        return base + "0".repeat(colDecimals[ci] - (base.length - dot)) + exp;
      })
    );

    // Column widths: max of header and all (normalized) cell lengths
    const colWidths = headers.map((_, ci) =>
      Math.max(headerStrs[ci].length, ...normStrs.map((row) => row[ci].length))
    );

    // Pad headers (left-aligned) and cells (right for numbers, left for others)
    const paddedHeader = headerStrs.map((h, ci) => h.padEnd(colWidths[ci]));
    const paddedRows = normStrs.map((row) =>
      row.map((s, ci) =>
        isNumCol[ci] ? s.padStart(colWidths[ci]) : s.padEnd(colWidths[ci])
      )
    );

    const pad = this.pad();
    const innerPad = pad + "  ";
    const sep = " , ";
    const parts = ["#{", (innerPad + paddedHeader.join(sep)).trimEnd()];
    for (const row of paddedRows) {
      parts.push((innerPad + row.join(sep)).trimEnd());
    }
    parts.push(pad + "}");
    return parts.join("\n");
  }

  // Multi-line collection: returns a string with embedded newlines (use from printExprInner)
  multilineCollection(open, close, items) {
    if (!items.length) return open + close;
    const pad = this.pad();
    const innerPad = pad + "  ";
    const lines = items.map((item) => innerPad + item + ",");
    return `${open}\n${lines.join("\n")}\n${pad}${close}`;
  }

  // ---------------------------------------------------------------------------
  // Top-level
  // ---------------------------------------------------------------------------

  format(stmts) {
    this.printStatements(stmts);
    // Ensure exactly one trailing newline
    while (this.output.length && this.output[this.output.length - 1] === "") {
      this.output.pop();
    }
    return this.output.join("\n") + "\n";
  }
}

export function format(source, path = "<input>") {
  const tokens = tokenize(path, source);
  const statements = parse(tokens);
  const allComments = extractComments(tokens);
  const printer = new Printer(allComments);
  return printer.format(statements);
}
