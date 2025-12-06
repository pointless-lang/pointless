import { checkType, getType } from "./values.js";
import { checkWhole } from "./num.js";
import { Panic } from "./panic.js";

export function checkIndex(list, index) {
  checkType(list, "list");

  if (getType(index) !== "number") {
    // Plain checkType errors are too confusing here, since you
    // have both the type of the indexer and the index at play
    throw new Panic(`list requires numerical index`);
  }

  checkWhole(index);

  if (index < -list.size || index >= list.size) {
    throw new Panic(`list index out of range`, { index, length: list.size });
  }

  return index;
}
