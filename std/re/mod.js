import { checkType } from "../../src/values.js";
import { show } from "../../src/repr.js";
import { Table } from "../../src/table.js";
import { OrderedMap, List } from "immutable";

const cache = new Map();

function lookup(pattern) {
  if (!cache.has(pattern)) {
    cache.set(pattern, new RegExp(pattern, "g"));
  }

  return cache.get(pattern);
}

export function escape(chars) {
  // Escape special characters in `chars` so it can be used as a literal
  // in a regular expression.
  //
  // ```ptls
  // re.escape("Hello? Can you *hear* me??")
  // ```

  checkType(chars, "string");
  return chars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function test(string, pattern) {
  // Check whether `string` matches the regular expression `pattern`.
  //
  // ```ptls
  // re.test("vanessa@example.com", r".+@.+\..+")
  // re.test("vanessa at example dot com", r".+@.+\..+")
  // ```

  checkType(string, "string");
  checkType(pattern, "string");
  return lookup(pattern).test(string);
}

export function match(string, pattern) {
  // Find the matches for `pattern` in `string`.
  //
  // Returns a table with the following columns:
  //
  // - `value`: The matched substring.
  // - `index`: Index of `value` in `string`.
  // - `groups`: List of captures.
  // - `named`: Object of named captures.
  //
  // ```ptls
  // re.match("nessa@example.com, megan@xkcd.com", r"(?<name>\w+)@(\w+\.\w+)")
  // ```

  checkType(string, "string");
  checkType(pattern, "string");

  const matches = List(string.matchAll(lookup(pattern)) ?? []);

  const rows = matches.map((result) => {
    const value = result[0];
    const index = result.index;
    const groups = List(result.slice(1));
    const named = OrderedMap(Object.entries(result.groups ?? {}));
    return OrderedMap(Object.entries({ value, index, groups, named }));
  });

  return Table.fromRows(rows, List(["value", "index", "groups", "named"]));
}

export function split(string, pattern) {
  // Split `string` using the regular expression `pattern`.
  // The matching separators are not included in the resulting substrings.
  //
  // ```ptls
  // re.split("NYC NY  USA", " +")
  // ```

  checkType(string, "string");
  checkType(pattern, "string");
  return List(string.split(lookup(pattern)));
}

export async function replace(string, pattern, replacement) {
  // Replace all matches of `pattern` in `string` with `replacement`.
  //
  // ```ptls
  // re.replace("2025  07 22", " +", ".")
  // ```

  checkType(string, "string");
  checkType(pattern, "string");
  checkType(replacement, "string");
  return string.replaceAll(lookup(pattern), () => replacement);
}

export async function replaceBy(string, pattern, replacer) {
  // Replace all matches of `pattern` in `string` with `replacement`.
  //
  // ```ptls
  // re.replaceBy("a catalog of cats", r"cat\w*", str.toUpper)
  // ```

  checkType(string, "string");
  checkType(pattern, "string");
  checkType(replacer, "function");

  const replacements = [];

  for (const match of string.matchAll(lookup(pattern))) {
    replacements.push(show(await replacer.call(match[0])));
  }

  replacements.reverse();
  return string.replaceAll(lookup(pattern), () => replacements.pop());
}
