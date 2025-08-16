import { Panic } from "./panic.js";
import { Loc } from "./loc.js";
import { keywords } from "./keywords.js";
import { symbols } from "./symbols.js";

function rule(name, pattern) {
  // "y" for sticky regex
  return { name, pattern: new RegExp(pattern.source, "y") };
}

function escape(chars) {
  return chars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseStr(string) {
  // ptls strings can contain newlines, js can't
  // otherwise ptls escape syntax is a subset of js
  const escaped = string.replaceAll("\n", "\\n");
  return JSON.parse(`"${escaped}"`);
}

// need "\b" to avoid matching names with keyword prefixes, like "note" vs "not"
const keywordRules = keywords.map((kwd) => rule(kwd, new RegExp(kwd + "\\b")));

// symbol rules get reverse-sorted to match longest prefix
const symbolRules = symbols
  .sort()
  .reverse()
  .map((sym) => rule(sym, new RegExp(escape(sym))));

// rules are checked in order, so the ordering of rules is important
// for example, the comment rule needs to come before the minus symbol rule
// otherwise a comment's double dashes would be parsed as two minus signs

const rules = [
  ...keywordRules,
  rule("field", /\.[a-zA-Z][a-zA-Z0-9]*/),
  rule("newline", /\r?\n/),
  rule("number", /\d*\.?\d+([eE][+-]?\d+)?/),
  // strings can contain newlines
  rule("string", /"(\\.|[^\\])*?"/),
  // rust-style raw strings
  // must come before name rule
  rule("rawString", /r(#*)"[^]*?"\1/),
  // unmatchedQuote rule must come after string rule
  rule("unmatchedQuote", /(r#*)?"/),
  rule("whitespace", /[ \t]+/),
  // name rule must come after keyword and raw string rules
  rule("name", /[a-zA-Z][a-zA-Z0-9]*/),
  // comment rule must come before '-' symbol rule
  rule("comment", /--.*/),
  ...symbolRules,
  // unexpectedCharacter rule must come last
  rule("unexpectedCharacter", /./),
];

const invalidEscape =
  /(^|[^\\])(\\\\)*(\\([^\\"nrtu]|u.{0,3}([^0-9a-fA-F]|$)))/;

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
          // +1 to skip '\'
          const prefix = this.value.slice(0, match.index + 1);
          // get loc of invalid char
          const loc = this.loc.next(prefix);
          throw new Panic(
            "invalid escape sequence",
            // need to display raw so `repr` doesn't re-escape the string
            { $escape: `"${match[1]}"` },
            loc,
          );
        }
      }
    }
  }
}

// tokenize doesn't throw errors when invalid tokens are found
// instead, the parser validates tokens before parsing
// this lets us use the tokenizer for syntax highlighting

export function tokenize(path, source) {
  source = source.trimEnd();

  const tokens = [];
  let index = 0;
  // line and column are 1 indexed
  let loc = new Loc(1, 1, path, () => source);

  while (index < source.length) {
    // check rules in order
    for (const { name, pattern } of rules) {
      // sticky regex forces match to start at given offset
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

  // add endOfFile at the end
  tokens.push(new Token("endOfFile", loc, ""));
  return tokens;
}
