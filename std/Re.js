import { checkType } from "../src/values.js";
import { show } from "../src/repr.js";
import { Table } from "../src/table.js";
import im from "immutable";

const cache = new Map();

function lookup(pattern) {
  if (!cache.has(pattern)) {
    cache.set(pattern, new RegExp(pattern, "g"));
  }

  return cache.get(pattern);
}

export function escape(string) {
  // Escape special characters in `string` so it can be used as a literal
  // in a regular expression.
  //
  // ```ptls
  // Re.escape("Hello? Can you *hear* me??")
  // ```

  checkType(string, "string");
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function test(string, pattern) {
  // Check whether `string` matches the regular expression `pattern`.
  //
  // ```ptls
  // Re.test("nessa@example.com", r".+@.+\..+")
  // Re.test("nessa at example dot com", r".+@.+\..+")
  // ```

  checkType(string, "string");
  checkType(pattern, "string");
  return lookup(pattern).test(string);
}

export function match(string, pattern) {
  // Find the matches for `pattern` in `string`.
  //
  // Return a table with the following columns:
  //
  // - `value`: The matched substring.
  // - `index`: Index of `value` in `string`.
  // - `groups`: List of captures.
  // - `named`: Object of named captures.
  //
  // ```ptls
  // Re.match("nessa@example.com, megan@xkcd.com", r"(?<name>\w+)@(\w+\.\w+)")
  // ```

  checkType(string, "string");
  checkType(pattern, "string");

  const matches = im.List(string.matchAll(lookup(pattern)) ?? []);

  const rows = matches.map((result) => {
    const value = result[0];
    const index = result.index;
    const groups = im.List(result.slice(1));
    const named = im.OrderedMap(Object.entries(result.groups ?? {}));
    return im.OrderedMap(Object.entries({ value, index, groups, named }));
  });

  return Table.fromRows(rows, im.List(["value", "index", "groups", "named"]));
}

export function split(string, pattern) {
  // Split `string` using the regular expression `pattern`.
  // The matching separators are not included in the resulting substrings.
  //
  // ```ptls
  // Re.split("NYC NY  USA", " +")
  // ```

  checkType(string, "string");
  checkType(pattern, "string");
  return im.List(string.split(lookup(pattern)));
}

export async function replace(string, pattern, replacement) {
  // Replace all matches of `pattern` in `string` with `replacement`.
  //
  // ```ptls
  // Re.replace("2025  07 22", " +", ".")
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
  // Re.replaceBy("a catalog of cats", r"cat\w*", Str.toUpper)
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
