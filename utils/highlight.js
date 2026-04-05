function escapeHtml(string) {
  return string
    .replaceAll(`&`, "&amp;")
    .replaceAll(`<`, "&lt;")
    .replaceAll(`>`, "&gt;")
    .replaceAll(`"`, "&quot;")
    .replaceAll(`'`, "&#39;");
}

const globals = new Set([
  "assert",
  "chars",
  "drop",
  "dropLast",
  "isEmpty",
  "join",
  "len",
  "max",
  "min",
  "parse",
  "print",
  "prompt",
  "push",
  "range",
  "remove",
  "reverse",
  "round",
  "roundTo",
  "select",
  "sleep",
  "sort",
  "sortBy",
  "sortDesc",
  "sortDescBy",
  "span",
  "split",
  "sum",
  "take",
  "takeLast",
]);

const strInner = [
  {
    regex: /\$\([a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*\)/g,
    className: "interpolated",
  },
  {
    regex: /\$[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*/g,
    className: "interpolated",
  },
  { regex: /\\["\\nrt]|\\u{[\dA-Fa-f]{1,6}}/g, className: "escape" },
];

const identifier = /[a-zA-Z][a-zA-Z0-9]*/;

const classNames = {
  comment: "comment",
  number: "number",
  dateTime: "number",
  arg: "keyword",
  break: "keyword",
  case: "keyword",
  continue: "keyword",
  do: "keyword",
  elif: "keyword",
  else: "keyword",
  end: "keyword",
  fn: "keyword",
  for: "keyword",
  if: "keyword",
  import: "keyword",
  match: "keyword",
  return: "keyword",
  then: "keyword",
  while: "keyword",
  true: "constant",
  false: "constant",
  none: "constant",
  and: "operator",
  or: "operator",
  not: "operator",
  "not in": "operator",
  in: "operator",
  "??=": "operator",
  "??": "operator",
  ">=": "operator",
  ">": "operator",
  "==": "operator",
  "=": "operator",
  "<=": "operator",
  "<": "operator",
  "//=": "operator",
  "/=": "operator",
  "//": "operator",
  "/": "operator",
  "-=": "operator",
  "-": "operator",
  "+=": "operator",
  "+": "operator",
  "*=": "operator",
  "**=": "operator",
  "**": "operator",
  "*": "operator",
  "%=": "operator",
  "%": "operator",
  "#=": "operator",
  "#": "operator",
};

function isStd(name) {
  return globals.has(name) || /^[A-Z]/.test(name)
}

export class Highlighter {
  index = 0;

  constructor(tokens) {
    this.tokens = tokens;
    this.annotated = [];

    while (this.index < this.tokens.length) {
      this.advance();
    }
  }

  html() {
    return this.annotated.map(({ className, value }) => {
      const escaped = escapeHtml(value);
      return className
        ? `<span class="${className}">${escaped}</span>`
        : escaped;
    }).join("");
  }

  has(...types) {
    for (let index = this.index; index < this.tokens.length; index++) {
      const token = this.tokens[index];

      if (token.matches(...types)) {
        return true;
      }

      if (!token.matches("whitespace", "newline")) {
        return false;
      }
    }
  }

  next() {
    while (this.index < this.tokens.length) {
      const token = this.tokens[this.index];
      this.index++;

      if (token.matches("whitespace", "newline")) {
        this.add(token.value);
      } else {
        return token;
      }
    }
  }

  add(value, className = undefined) {
    this.annotated.push({ className, value });
  }

  addNext(className = undefined) {
    this.add(this.next().value, className);
  }

  advance() {
    if (this.has("string")) {
      const chars = this.next().value.slice(1, -1);
      this.add(`"`, "quotes");

      let index = 0;

      while (index < chars.length) {
        let next;

        for (const { regex, className } of strInner) {
          regex.lastIndex = index;
          const match = regex.exec(chars);

          if (match && (!next || match.index < next.match.index)) {
            next = { className, match };
          }
        }

        if (next) {
          const { className, match } = next;

          if (match.index > index) {
            this.add(chars.slice(index, match.index), "string");
          }

          this.add(match[0], className);

          index = match.index + match[0].length;
        } else {
          this.add(chars.slice(index), "string");
          index = chars.length;
        }
      }

      this.add(`"`, "quotes");
      return;
    }

    if (this.has("rawString")) {
      const { value } = this.next();
      const prefixLen = value.indexOf(`"`) + 1;
      this.add(value.slice(0, prefixLen), "quotes");
      this.add(value.slice(prefixLen, -prefixLen + 1), "string");
      this.add(value.slice(-prefixLen + 1), "quotes");
      return;
    }

    if (this.has("unmatchedQuote")) {
      const { value } = this.next();
      const prefixLen = value.indexOf(`"`) + 1;
      this.add(value.slice(0, prefixLen), "quotes");
      this.add(value.slice(prefixLen), "string");
      return;
    }

    if (this.has("field")) {
      const { value } = this.next();

      if (this.has("(")) {
        this.add(".");
        this.add(value.slice(1), "call");
        this.addNext();
        return;
      }

      this.add(value);
      return;
    }

    if (this.has("fn")) {
      this.addNext("keyword");

      if (this.has("name")) {
        this.addNext("function");
      }

      while (this.has("(", "name", ",")) {
        if (this.has("name")) {
          this.addNext("argument");
        } else {
          this.addNext();
        }
      }

      return;
    }

    if (this.has("|=", "|", "?=", "?", "$=", "$", "#=", "#")) {
      this.addNext("operator");

      if (this.has("name")) {
        let last = this.next();

        while (this.has("field")) {
          if (isStd(last.value)) {
            this.add(last.value, "std");
          } else {
            this.add(last.value);
          }

          last = this.next();
        }

        if (
          this.has(
            "$",
            "(",
            ")",
            ",",
            ":",
            ";",
            "?",
            "]",
            "}",
            "|",
            "newline",
            "comment",
            "elif",
            "else",
            "end",
            "endOfFile",
          )
        ) {
          if (last.type === "name") {
            this.add(last.value, "call");
          } else {
            this.add(".");
            this.add(last.value.slice(1), "call");
          }
        } else {
          this.add(last.value);
        }
      }

      return;
    }

    if (this.has("name")) {
      const { value } = this.next();

      if (this.has(":")) {
        this.add(value);
        this.addNext();
        return;
      }

      if (this.has("(")) {
        this.add(value, "call");
        this.addNext();
        return;
      }

      if (isStd(value)) {
        this.add(value, "std");
        return;
      }

      this.add(value);
      return;
    }

    const { type, value } = this.next();

    if (identifier.test(value) && this.has(":")) {
      this.add(value);
      return;
    }

    this.add(value, classNames[type]);

    if (value === "for" && this.has("name")) {
      this.addNext();

      if (this.has("in")) {
        this.addNext("keyword");
      }
    }
  }
}
