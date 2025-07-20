import { checkType, getType } from "./values.js";
import { checkWhole } from "./num.js";
import { Panic } from "./panic.js";
import { List } from "immutable";

export function checkIndex(list, index) {
  checkType(list, "list");

  if (getType(index) !== "number") {
    // plain checkType errors are too confusing here, since you
    // have both the type of the indexer and the index at play
    throw new Panic("list requires numerical index");
  }

  checkWhole(index);

  if (index < -list.size || index >= list.size) {
    throw new Panic("list index out of range", { index, length: list.size });
  }

  return index;
}

export function checkNonEmpty(list) {
  checkType(list, "list");

  if (list.size === 0) {
    throw new Panic("empty list");
  }

  return list;
}

export async function filter(list, func) {
  checkType(list, "list");
  checkType(func, "function");

  const elems = [];

  for (const value of list) {
    if (await func.callCondition(value)) {
      elems.push(value);
    }
  }

  return List(elems);
}
