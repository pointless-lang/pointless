import { checkType, getType } from "./values.js";
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
  return matchHelper(object, matcher);
}

function matchHelper(value, goal) {
  if (getType(value) !== "object" && getType(goal) !== "object") {
    return im.is(value, goal);
  }

  return goal.every((v, k) => value.has(k) && matchHelper(value.get(k), v));
}
