import { checkType, getType } from "../../src/values.js";
import { OrderedSet, List } from "immutable";

export function of(values) {
  checkType(values, "set", "list");

  switch (getType(values)) {
    case "set":
      return values;
    case "list":
      return OrderedSet(values);
  }
}

export function len(set) {
  checkType(set, "set");
  return set.size;
}

export function isEmpty(set) {
  return len(set) == 0;
}

export function has(set, value) {
  checkType(set, "set");
  return set.has(value);
}

export function hasAll(set, values) {
  checkType(set, "set");
  return set.isSuperset(of(values));
}

export function add(set, value) {
  checkType(set, "set");
  return set.add(value);
}

export function remove(set, value) {
  checkType(set, "set");
  return set.delete(value);
}

export function removeAll(set, values) {
  checkType(set, "set");
  return set.difference(of(values));
}

export function merge(sets) {
  checkType(sets, "list");
  return OrderedSet().concat(...sets.map(of));
}

export function union(set, values) {
  checkType(set, "set");
  return set.union(of(values));
}

export function intersection(set, values) {
  checkType(set, "set");
  return set.intersect(of(values));
}

function subsets(elems) {
  if (!elems.length) {
    return [[]];
  }

  const suffixes = subsets(elems.slice(1));
  return [...suffixes.map((subset) => [elems[0], ...subset]), ...suffixes];
}

export function powerset(set) {
  checkType(set, "set");
  const sets = subsets([...set]).map((elems) => OrderedSet(elems));
  return List(sets);
}
