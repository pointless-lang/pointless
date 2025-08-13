import { checkType } from "../../src/values.js";
import { OrderedSet, List } from "immutable";

export const _docs = "Functions for working with sets (collections of unique values).";

export function of(values) {
  // Get a set containing each value in `values`. `values` may be
  // a list, table, or set. If `values` is a table then `set.of(values)`
  // returns a set of the table's rows.
  //
  // ```ptls
  // l = ["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "FL"]
  // set.of(l)
  // t = table.of({ name: ["Ducky", "Clementine"], type: ["dog", "bird"] })
  // set.of(t)
  // ```

  checkType(values, "set", "list", "table");
  return OrderedSet(values);
}

export function len(set) {
  // Return the number of elements in `set`.
  //
  // ```ptls
  // s = set.of(["a", "b", "c", "d"])
  // len(s)
  // ```

  checkType(set, "set");
  return set.size;
}

export function isEmpty(set) {
  // Check whether `set` is empty.
  //
  // ```ptls
  // isEmpty(set.of([]))
  // isEmpty(set.of(["a", "b", "c", "d"]))
  // ```

  return len(set) == 0;
}

export function has(set, value) {
  // Return whether `set` contains `value`.
  //
  // ```ptls
  // s = set.of(["a", "b", "c"])
  // has(s, "b")
  // has(s, "d")
  // ```

  checkType(set, "set");
  return set.has(value);
}

export function hasAll(set, values) {
  // Return whether `set` contains every value in `values`, where `values`
  // is a set, list, or table. In other words, check whether `set` is a
  // superset of `values`, and `values` is a subset of `set`.
  //
  // ```ptls
  // s = set.of(["a", "b", "c"])
  // set.hasAll(s, ["b", "c"])
  // set.hasAll(s, ["d", "c"])
  // ```

  checkType(set, "set");
  return set.isSuperset(of(values));
}

export function add(set, value) {
  // Add `value` to `set`.
  //
  // ```ptls
  // s = set.of(["a", "b", "c"])
  // set.add(s, "b")
  // set.add(s, "d")
  // ```

  checkType(set, "set");
  return set.add(value);
}

export function addAll(set, values) {
  // Add each of `values` to `set`, where `values` is a set, list, or table.
  // In other words, get the union of `set` and `values`.
  //
  // ```ptls
  // s = set.of(["a", "b", "c"])
  // set.addAll(s, ["b", "e"])
  // set.addAll(s, ["d", "e"])
  // ```

  checkType(set, "set");
  return set.union(of(values));
}

export function remove(set, value) {
  // Remove `value` from `set`, if present.
  //
  // ```ptls
  // s = set.of(["a", "b", "c"])
  // set.remove(s, "b")
  // set.remove(s, "d")
  // ```

  checkType(set, "set");
  return set.delete(value);
}

export function removeAll(set, values) {
  // Remove each of `values` to `set`, if present, where `values` is a set,
  // list, or table. In other words, get the difference of `set` and `values`.
  //
  // ```ptls
  // s = set.of(["a", "b", "c"])
  // set.removeAll(s, ["b", "c"])
  // set.removeAll(s, ["d", "c"])
  // ```

  checkType(set, "set");
  return set.subtract(of(values));
}

export function merge(sets) {
  // Merge (flatten) a list of `sets` into a single set. In other words, get
  // the union of `sets`.
  //
  // ```ptls
  // s1 = set.of(["a", "b", "c"])
  // s2 = set.of(["d", "b", "e"])
  // set.merge([s1, s2])
  // ```

  checkType(sets, "list");
  return OrderedSet().concat(...sets.map(of));
}

export function intersection(set, values) {
  // Get the set of elements that appear in both `set` and `values`, where
  // `values` is a set, list, or table. In other words, get the intersection
  // of `set` and `values`.
  //
  // ```ptls
  // s1 = set.of(["a", "b", "c"])
  // s2 = set.of(["c", "b", "e"])
  // set.intersection(s1, s2)
  // ```

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
  // Get a list of all of the subsets of `set` (the powerset of `set`).
  //
  // ```ptls
  // set.powerset(set.of(["a", "b", "c"]))
  // ```

  checkType(set, "set");
  const sets = subsets([...set]).map((elems) => OrderedSet(elems));
  return List(sets);
}
