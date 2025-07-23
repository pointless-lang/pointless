import { Panic } from "./panic.js";
import { Table } from "./table.js";
import { Func } from "./func.js";
import { Ref } from "./ref.js";
import { OrderedMap, OrderedSet, List } from "immutable";

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

  if (OrderedMap.isOrderedMap(value)) {
    return "object";
  }

  if (OrderedSet.isOrderedSet(value)) {
    return "set";
  }

  if (List.isList(value)) {
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

export function compareAll(a, b, down) {
  for (let index = 0; index < a.size; index++) {
    const result = compare(a.get(index), b.get(index), down);

    if (result != 0) {
      return result;
    }
  }

  return 0;
}

export function compare(a, b, down) {
  checkType(a, "number", "string", "boolean");
  checkType(b, "number", "string", "boolean");

  const typeA = getType(a);
  const typeB = getType(b);

  if (typeA !== typeB) {
    throw new Panic("cannot compare values of different types", {
      typeA,
      typeB,
    });
  }

  if (a < b) {
    return down ? 1 : -1;
  }

  if (a > b) {
    return down ? -1 : 1;
  }

  return 0;
}

export function varargs(value) {
  switch (getType(value)) {
    case "list":
      return value;
    case "set":
      return List(value);
    default:
      return List([value]);
  }
}
