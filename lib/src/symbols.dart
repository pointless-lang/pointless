
import "tokenTypes.dart";

// ---------------------------------------------------------------------------
// language keywords, operators, and symbols, and associated token types

var keywords = {
  "if": Tok.If,
  "then": Tok.Then,
  "else": Tok.Else,
  "where": Tok.Where,
  "with": Tok.With,
  "cond": Tok.Cond,
  "case": Tok.Case,
  "and": Tok.And,
  "or": Tok.Or,
  "not": Tok.Not,
  "in": Tok.In,
  "as": Tok.As,
  "true": Tok.Bool,
  "false": Tok.Bool,
  "for": Tok.For,
  "when": Tok.When,
  "yield": Tok.Yield,
  "import": Tok.Import,
  "export": Tok.Export,
  "requires": Tok.Requires,
  "throw": Tok.Throw,
  "try": Tok.Try,
  "catch": Tok.Catch,
  "upval": Tok.Upval,
};

// ---------------------------------------------------------------------------

var opSyms = {
  "+": Tok.Add,
  "-": Tok.Sub,
  "*": Tok.Mul,
  "/": Tok.Div,
  "**": Tok.Pow,
  "%": Tok.Mod,
  "+=": Tok.AddAssign,
  "-=": Tok.SubAssign,
  "*=": Tok.MulAssign,
  "/=": Tok.DivAssign,
  "**=": Tok.PowAssign,
  "%=": Tok.ModAssign,
  "|>": Tok.Pipe,
  "=": Tok.Assign,
  "==": Tok.Equals,
  "!=": Tok.NotEq,
  "<": Tok.LessThan,
  ">": Tok.GreaterThan,
  "<=": Tok.LessEq,
  ">=": Tok.GreaterEq,
  "=>": Tok.Lambda,
  "\$": Tok.Dollar,
  "++": Tok.Concat,
};

var opSymChars = {for (var sym in opSyms.keys) sym[0]};

// ---------------------------------------------------------------------------
// keep left and right separate to help keep track of
// when tokenizer is at the start of a new expression
// used to disambiguate negation and subtraction

var leftSyms = {
  "(": Tok.LParen,
  "{": Tok.LBracket,
  "[": Tok.LArray,
};

var rightSyms = {
  ")": Tok.RParen,
  "}": Tok.RBracket,
  "]": Tok.RArray,
};

// ---------------------------------------------------------------------------

var separators = {
  ";": Tok.Semicolon,
  ":": Tok.Colon,
  ",": Tok.Comma,
};
