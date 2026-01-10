import { Panic } from "./panic.js";
import { Loc } from "./loc.js";
import { keywords } from "./keywords.js";
import { symbols } from "./symbols.js";

export const ident = /^[a-zA-Z][a-zA-Z0-9]*$/;

export const dateTime =
  /`((\d{4}-\d\d-\d\d[T ])?\d\d:\d\d(:\d\d(\.\d+)?)?(Z|[+\-]\d\d:\d\d)?|(\d{4}-\d\d-\d\d))`/;

function rule(name, pattern) {
  const source = pattern instanceof RegExp ? pattern.source : pattern;
  // Use "y" for sticky regex
  return { name, pattern: new RegExp(source, "y") };
}

function escape(chars) {
  return chars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Need "\b" to avoid matching names with keyword prefixes, like "note" vs "not"
const keywordRules = keywords.map((kwd) => rule(kwd, kwd + "\\b"));

// Symbol rules get reverse-sorted to match longest prefix, for example we want
// to match '==' as '==', not '=' '='

const symbolRules = symbols
  .sort()
  .reverse()
  .map((sym) => rule(sym, escape(sym)));

// Rules are checked in order, so the ordering of rules is important.
// For example, the comment rule needs to come before the minus symbol rule.
// Otherwise a comment's double dashes would be parsed as two minus signs

const rules = [
  ...keywordRules,
  rule("field", /\.[a-zA-Z][a-zA-Z0-9]*/),
  rule("newline", /\r?\n/),
  rule("number", /\d*\.?\d+([eE][+-]?\d+)?/),
  // Strings can contain newlines
  rule("string", /"(\\.|[^\\])*?"/),
  // Rust-style raw strings, must come before name rule
  rule("rawString", /r(#*)"[^]*?"\1/),
  // unmatchedQuote rule must come after string rule
  rule("unmatchedQuote", /(r#*)?"/),
  rule("dateTime", dateTime),
  rule("invalidDateTime", /`[^`\n]*`?/),
  rule("whitespace", /[ \t]+/),
  // Name rule must come after keyword and raw string rules
  rule("name", /[a-zA-Z][a-zA-Z0-9]*/),
  // Comment rule must come before '-' symbol rule
  rule("comment", /--.*/),
  ...symbolRules,
  // unexpectedCharacter rule must come last
  rule("unexpectedCharacter", /[^]/),
];

class Token {
  constructor(type, loc, value) {
    this.type = type;
    this.loc = loc;
    this.value = value;
  }

  matches(...types) {
    return types.includes(this.type);
  }

  validate() {
    switch (this.type) {
      case "unmatchedQuote":
        throw new Panic("unmatched quote", {}, this.loc);
      case "invalidDateTime":
        throw new Panic(
          "invalid datetime string",
          { $datetime: this.value },
          this.loc,
        );
      case "unexpectedCharacter":
        throw new Panic(
          "unexpected character",
          { character: this.value },
          this.loc,
        );
    }
  }
}

// Tokenize doesn't throw errors when invalid tokens are found.
// Instead, the parser validates tokens before parsing.
// This lets us use the tokenizer for syntax highlighting

export function tokenize(path, source) {
  const tokens = [];
  let index = 0;
  // Line and column are 1 indexed
  let loc = new Loc(1, 1, path, () => source);

  while (index < source.length) {
    // Check rules in order
    for (const { name, pattern } of rules) {
      // Sticky regex forces match to start at given offset
      pattern.lastIndex = index;
      const value = pattern.exec(source)?.[0];

      if (value !== undefined) {
        index += value.length;
        tokens.push(new Token(name, loc, value));
        loc = loc.next(value);
        break;
      }
    }

    // unexpectedCharacter rule will match if no other rule does
  }

  // Add endOfFile at the end
  tokens.push(new Token("endOfFile", loc, ""));
  return tokens;
}
