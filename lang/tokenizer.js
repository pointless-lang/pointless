import { Panic } from "./panic.js";
import { Loc } from "./loc.js";
import { keywords } from "./keywords.js";
import { symbols } from "./symbols.js";

export const ident = /^[a-zA-Z][a-zA-Z0-9]*$/;

function rule(name, pattern) {
  // Use "y" for sticky regex
  return { name, pattern: new RegExp(pattern.source, "y") };
}

function escape(chars) {
  return chars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Need "\b" to avoid matching names with keyword prefixes, like "note" vs "not"
const keywordRules = keywords.map((kwd) => rule(kwd, new RegExp(kwd + "\\b")));

// Symbol rules get reverse-sorted to match longest prefix, for example we want
// to match '==' as '==', not '=' '='

const symbolRules = symbols
  .sort()
  .reverse()
  .map((sym) => rule(sym, new RegExp(escape(sym))));

// Rules are checked in order, so the ordering of rules is important.
// For example, the comment rule needs to come before the minus symbol rule.
// Otherwise a comment's double dashes would be parsed as two minus signs fmt!!md

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
  rule("dateTime", /\^[+.0-9:\-TZ]+/),
  rule("whitespace", /[ \t]+/),
  // Name rule must come after keyword and raw string rules
  rule("name", /[a-zA-Z][a-zA-Z0-9]*/),
  // Comment rule must come before '-' symbol rule
  rule("comment", /--.*/),
  ...symbolRules,
  // unexpectedCharacter rule must come last
  rule("unexpectedCharacter", /[^]/),
];

const invalidEscape =
  /(?:^|[^\\])(?:\\\\)*(\\([^\\"nrtu]|u(?!{[0-9a-fA-F]{1,6}})))/;

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
      case "unexpectedCharacter":
        throw new Panic(
          "unexpected character",
          { character: this.value },
          this.loc,
        );
      case "string": {
        const match = this.value.match(invalidEscape);

        if (match) {
          // Get loc of invalid char
          const prefix = this.value.slice(0, match.index + match[0].length - 1);
          const loc = this.loc.next(prefix);

          if (match[1] == "\\u") {
            throw new Panic(
              "invalid unicode escape sequence",
              {
                $expected:
                  "'\\u{...}' where '...' is a sequence of between 1 and 6 hex digits",
              },
              loc,
            );
          }

          throw new Panic(
            "invalid escape sequence",
            { $escape: `'${match[1]}'` },
            loc,
          );
        }
      }
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
