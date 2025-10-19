import { checkType } from "../lang/values.js";
import { checkPositive, checkWhole } from "../lang/num.js";
import * as List from "./List.js";
import { Panic } from "../lang/panic.js";

// Pointless does not have a dedicated character type; single-character strings
// are used instead. The \`Char\` module provides functions for working with
// these single-character strings in terms of their Unicode code points.

export function of(code) {
  // Get a string containing the character with Unicode code point `code`.
  //
  // ```ptls
  // Char.of(65)
  // Char.of(128578)
  // ```

  checkPositive(code);
  checkWhole(code);
  return String.fromCodePoint(code);
}

export function code(char) {
  // Get the Unicode code point of the single-character string `char`.
  //
  // ```ptls
  // Char.code("A")
  // Char.code("🙂")
  // ```

  checkChar(char);
  return char.codePointAt(0);
}

function checkChar(string) {
  checkType(string, "string");

  if ([...string].length != 1) {
    throw new Panic("expected a single character", { string });
  }
}

// ChatGPT gave me the idea for this function

export function span(from, to) {
  // Return the list of characters between `from` to `to`, inclusive.
  //
  // ```ptls --compact
  // Char.span("a", "e")
  // Char.span("α", "ε")
  // ```

  checkChar(from);
  checkChar(to);
  return List.span(from.codePointAt(0), to.codePointAt(0)).map(of);
}
