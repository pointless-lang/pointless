import * as tableMod from "./Table.js";
import { checkType, getType } from "../lang/values.js";
import { checkKey, isMatch } from "../lang/obj.js";
import im from "../immutable/immutable.js";

export function of(value) {
  // Convert `value` to an object, where `value` is either a table or an object.
  // If `value` is a table, return an object whose keys are column names and
  // values are lists of the column values in `table`. If `value` is an object
  // then return it.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  // ])
  //
  // Obj.of(cities)
  // ```

  checkType(value, "table", "object");
  return getType(value) === "table" ? value.data : value;
}

export function has(object, key) {
  // Check whether `object` contains `key`.
  //
  // ```ptls
  // Obj.has({ q: 9, r: 5, b: 3, n: 3, p: 1 }, "q")
  // Obj.has({ q: 9, r: 5, b: 3, n: 3, p: 1 }, "k")
  // ```
  //
  // _Note that this can also be accomplished using the `in` operator._
  //
  // ```ptls
  // "q" in { q: 9, r: 5, b: 3, n: 3, p: 1 }
  // "k" in { q: 9, r: 5, b: 3, n: 3, p: 1 }
  // ```

  checkType(object, "object");
  return object.has(key);
}

export function matches(object, matcher) {
  // Check whether `object` [matches](/language/objects#object-matching) the
  // object `matcher`.
  //
  // ```ptls
  // ducky = { name: "Ducky", type: "dog", age: 9 }
  // Obj.matches(ducky, { name: "Ducky", age: 9 })
  // Obj.matches(ducky, { name: "Ducky", type: "cat" })
  //
  // route = { from: { city: "philadelphia" }, to: { city: "baltimore" } }
  // Obj.matches(route, { from: { city: "philadelphia" } })
  // Obj.matches(route, { from: { city: "pittsburg" } })
  // ```

  return isMatch(object, matcher);
}

export function get(object, key) {
  // Get the value corresponding to `key` in `object`.
  //
  // ```ptls
  // Obj.get({ q: 9, r: 5, b: 3, n: 3, p: 1 }, "q")
  // ```
  //
  // _Note that this can also be accomplished using the index `[]` operator_:
  //
  // ```ptls
  // { q: 9, r: 5, b: 3, n: 3, p: 1 }["q"]
  // ```

  checkKey(object, key);
  return object.get(key);
}

export function getDefault(object, key, $default) {
  // Get the value corresponding to `key` in `object`, or `default` if `object`
  // does not have `key`.
  //
  // ```ptls
  // capitals = { Maine: "Augusta", Maryland: "Annapolis", Massachusetts: "Boston" }
  // Obj.getDefault(capitals, "Massachusetts", "idk")
  // Obj.getDefault(capitals, "Massocheichei", "idk")
  // ```

  checkType(object, "object");
  return object.get(key, $default);
}

export function set(object, key, value) {
  // Assign `key` to `value` in `object`.
  //
  // ```ptls
  // phrases = { "Hello": "Ola", "Good afternoon": "Boa tarde" }
  // Obj.set(phrases, "Good night", "Boa noite")
  // ```
  //
  // _Note that if you want to update an existing variable, you could also use
  // variable assignment_:
  //
  // ```ptls
  // phrases = { "Hello": "Ola", "Good afternoon": "Boa tarde" }
  // phrases["Good night"] = "Boa noite"
  // ```

  checkType(object, "object");
  return object.set(key, value);
}

export function setDefault(object, key, value) {
  // Assign `key` to `value` in `object` only if `key` is not already present.
  //
  // ```ptls
  // phrases = { "Hello": "Ola", "Good afternoon": "Boa tarde" }
  // Obj.setDefault(phrases, "Hello", "E aí")
  // Obj.setDefault(phrases, "Good night", "Boa noite")
  // ```

  checkType(object, "object");
  return object.has(key) ? object : object.set(key, value);
}

export function merge(objects) {
  // Merge (flatten) a list of `objects` into a single object.
  //
  // ```ptls
  // o1 = { "Hello": "Ola", "Good afternoon": "Boa tarde" }
  // o2 = { "Hello": "E aí?", "Good night": "Boa noite" }
  // Obj.merge([o1 + o2])
  // ```
  //
  // _Note that objects can also be merged using the `+` operator._
  //
  // ```ptls
  // o1 + o2
  // ```

  checkType(objects, "list");
  objects.forEach((object) => checkType(object, "object"));
  return im.OrderedMap().concat(...objects);
}

export function keys(object) {
  // Get the keys in `object` as a list.
  //
  // ```ptls
  // Obj.keys({ q: 9, r: 5, b: 3, n: 3, p: 1 })
  // ```

  checkType(object, "object");
  return object.keySeq().toList();
}

export function values(object) {
  // Get the values in `object` as a list.
  //
  // ```ptls
  // Obj.values({ q: 9, r: 5, b: 3, n: 3, p: 1 })
  // ```

  checkType(object, "object");
  return object.valueSeq().toList();
}

export function len(object) {
  // Return the number of entries in `object`.
  //
  // ```ptls
  // len({ q: 9, r: 5, b: 3, n: 3, p: 1 })
  // ```

  checkType(object, "object");
  return object.size;
}

export function isEmpty(object) {
  // Check whether `object` is empty.
  //
  // ```ptls
  // len({ q: 9, r: 5, b: 3, n: 3, p: 1 })
  // len({})
  // ```

  return len(object) === 0;
}

export function select(object, keys) {
  // Get a subset of the entries in `object` with the given `keys`. Entries will
  // appear in the order given in `keys`.
  //
  // ```ptls
  // select({ name: "Lamar", yards: 4172, tds: 41, ints: 4 }, ["name", "tds"])
  // ```

  checkType(object, "object");
  checkType(keys, "list");

  const map = new Map();

  for (const key of keys) {
    checkKey(object, key);
    map.set(key, object.get(key));
  }

  return im.OrderedMap(map);
}

export function focus(object, keys) {
  // Reorder the entries in `object` so that the given `keys` appear first, in
  // the given order.
  //
  // ```ptls
  // Obj.focus({ name: "Lamar", yards: 4172, tds: 41, ints: 4 }, ["name", "tds"])
  // ```

  checkType(object, "object");
  checkType(keys, "list");

  const map = new Map();

  for (const key of keys) {
    checkKey(object, key);
    map.set(key, object.get(key));
  }

  for (const [key, value] of object) {
    checkKey(object, key);
    map.set(key, value);
  }

  return im.OrderedMap(map);
}

export function remove(object, key) {
  // Remove the entry with `key` from `object`.
  //
  // ```ptls
  // remove(
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4, fumbles: 10 },
  //   "fumbles"
  // )
  // ```

  checkType(object, "object");
  return object.delete(key);
}

export function removeAll(object, keys) {
  // Remove the entries with the given `keys` from `object`.
  //
  // ```ptls
  // Obj.removeAll(
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4, fumbles: 10 },
  //   ["ints", "fumbles"]
  // )
  // ```

  checkType(object, "object");
  checkType(keys, "list");
  return object.deleteAll(keys);
}

export function rename(object, oldToNew) {
  // For every `old: new` entry in the object `oldToNew`, rename the
  // entry in `object` with the key `old` to have the name `new`.
  //
  // ```ptls
  // Obj.rename(
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4 },
  //   { tds: "touchdowns", ints: "interceptions" }
  // )
  // ```

  checkType(object, "object");
  checkType(oldToNew, "object");

  for (const key of oldToNew.keys()) {
    checkKey(object, key);
  }

  // need to recreate map to keep order the same
  const map = new Map();

  for (const [key, value] of object) {
    map.set(oldToNew.get(key, key), value);
  }

  return im.OrderedMap(map);
}

export function product(object) {
  // Get the cartesian product of the entries in `object`.
  //
  // Given an `object`, convert each non-list value to a list of length `1`.
  // Then create a table containing a row for each possible combination of items
  // from the lists of values. The keys of `objects` must be strings.
  //
  // ```ptls
  // Obj.product({
  //   rank: ["A", "2", "3", "4" ],
  //   symbol: ["♣", "♦", "♥", "♠"],
  //   count: 1,
  // })
  //
  // ```
  //
  // _Note that this is equivalent to:_
  //
  // ```ptls --no-echo
  // Table.product([
  //   Table.of({ rank: ["A", "2", "3", "4" ] }),
  //   Table.of({ symbol: ["♣", "♦", "♥", "♠"] }),
  //   Table.of({ count: 1 }),
  // ])
  //
  // ```

  checkType(object, "object");

  let rows = [im.OrderedMap()];

  for (let [column, values] of object) {
    checkType(column, "string");

    if (getType(values) !== "list") {
      values = [values];
    }

    const newRows = [];

    for (const row of rows) {
      for (const value of values) {
        newRows.push(row.set(column, value));
      }
    }

    rows = newRows;
  }

  return tableMod.of(im.List(rows));
}
