import { checkType } from "../../src/values.js";
import { show } from "../../src/repr.js";
import { OrderedMap, List } from "immutable";

const cache = new Map();

function lookup(pattern) {
  if (!cache.has(pattern)) {
    cache.set(pattern, new RegExp(pattern, "g"));
  }

  return cache.get(pattern);
}

export function escape(chars) {
  checkType(chars, "string");
  return chars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function test(string, pattern) {
  checkType(string, "string");
  checkType(pattern, "string");
  return lookup(pattern).test(string);
}

export function match(string, pattern) {
  checkType(string, "string");
  checkType(pattern, "string");

  const matches = string.matchAll(lookup(pattern)) ?? [];

  return matches.map((result) => {
    const value = result[0];
    const index = result.index;
    const groups = result.slice(1);
    const named = OrderedMap(Object.entries(result.groups ?? {}));
    return OrderedMap(Object.entries({ value, index, groups, named }));
  });
}

export function split(string, pattern) {
  checkType(string, "string");
  checkType(pattern, "string");
  return List(string.split(lookup(pattern)));
}

export async function replace(string, pattern, replacement) {
  checkType(string, "string");
  checkType(pattern, "string");
  replacement = show(replacement);
  return string.replaceAll(lookup(pattern), () => replacement);
}

export async function replaceBy(string, pattern, replacer) {
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
