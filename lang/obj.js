import { checkType } from "./values.js";
import { Panic } from "./panic.js";
import im from "../immutable/immutable.js";

export function checkKey(object, key) {
  checkType(object, "object");

  if (!object.has(key)) {
    throw new Panic("key not found", { key });
  }

  return key;
}

export function isMatch(object, matcher) {
  checkType(object, "object");
  checkType(matcher, "object");
  // OrderedMap isSubset only works for values.
  // Have to do manually to compare keys and values
  return matcher.every((v, k) => value.has(k) && im.is(value.get(k), v));
}
