import { checkType } from "../src/values.js";
import { checkPositive, checkWhole } from "../src/num.js";
import * as list from "./list.js";
import { Panic } from "../src/panic.js";

export const _docs = "Manipulate individual Unicode characters.";

// Pointless does not have a dedicated character type; single-character strings
// are used instead. The \`char\` module provides functions for working with
// these single-character strings in terms of their Unicode code points.

export function of(code) {
  // Get a string containing the character with Unicode code point `code`.
  //
  // ```ptls
  // char.of(65)
  // char.of(128578)
  // ```

  checkPositive(code);
  checkWhole(code);
  return String.fromCodePoint(code);
}

function checkChar(string) {
  checkType(string, "string");

  if (string.length != 1) {
    throw new Panic("expected a single character", { string });
  }
}

// ChatGPT gave me the idea for this function

export function span(from, to) {
  // Return the list of characters between `from` to `to`, inclusive.
  //
  // ```ptls --compact
  // char.span("a", "e")
  // char.span("α", "ε")
  // ```

  checkChar(from);
  checkChar(to);
  return list.span(from.charCodeAt(0), to.charCodeAt(0)).map(of);
}
