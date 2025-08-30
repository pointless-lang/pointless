import { Panic } from "./panic.js";
import { Table } from "./table.js";
import { Func } from "./func.js";
import { Ref } from "./ref.js";
import im from "immutable";

export function getType(value) {
  if (value === null) {
    // only accept null, not undefined
    return "none";
  }

  switch (value?.constructor) {
    case Boolean:
      return "boolean";
    case Number:
      return "number";
    case String:
      return "string";
    case Table:
      return "table";
    case Func:
      return "function";
    case Ref:
      return "reference";
  }

  if (im.isOrderedMap(value)) {
    return "object";
  }

  if (im.isOrderedSet(value)) {
    return "set";
  }

  if (im.isList(value)) {
    return "list";
  }

  return `<native ${value?.constructor?.name}>`;
}

export function checkType(value, ...types) {
  const $got = getType(value);

  if (!$got) {
    throw new Panic("invalid native value", { value });
  }

  if (types.length && !types.includes($got)) {
    throw new Panic("type error", { $expected: types.join(" or "), $got });
  }

  return value;
}

export function compareAll(a, b, desc) {
  for (let index = 0; index < a.size; index++) {
    const result = compare(a.get(index), b.get(index), desc);

    if (result != 0) {
      return result;
    }
  }

  return 0;
}

export function compare(a, b, desc) {
  checkType(a, "number", "string", "boolean", "none");
  checkType(b, "number", "string", "boolean", "none");

  const typeA = getType(a);
  const typeB = getType(b);

  if (typeA === "none") {
    return 1;
  }

  if (typeB === "none") {
    return -1;
  }

  if (typeA !== typeB) {
    throw new Panic("cannot compare values of different types", {
      typeA,
      typeB,
    });
  }

  if (a < b) {
    return desc ? 1 : -1;
  }

  if (a > b) {
    return desc ? -1 : 1;
  }

  return 0;
}
