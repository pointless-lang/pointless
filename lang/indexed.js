import { checkType, getType } from "./values.js";
import { checkWhole } from "./num.js";
import { Panic } from "./panic.js";

export function checkIndex(value, index) {
  checkType(value, "list", "string");
  const type = getType(index);

  if (type !== "number") {
    // plain checkType errors are too confusing here, since you
    // have both the type of the indexer and the index at play
    throw new Panic(`${value} requires numerical index`);
  }

  checkWhole(index);
  const length = value.size ?? value.length;

  if (index < -length || index >= length) {
    throw new Panic(`${value} index out of range`, { index, length });
  }

  return index;
}

export function checkNonEmpty(value) {
  checkType(value, "list", "string");

  const length = value.size ?? value.length;

  if (length === 0) {
    throw new Panic(`empty ${value}`);
  }

  return value;
}
