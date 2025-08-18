import { checkType } from "./values.js";
import { Panic } from "./panic.js";
import im from "immutable";

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
  return matcher.every(
    (value, key) => object.has(key) && im.is(object.get(key), value),
  );
}
