import { checkType, getType } from "../../src/values.js";
import { checkKey, isMatch } from "../../src/obj.js";
import { is, OrderedMap } from "immutable";

export const _docs = "Functions for working with objects.";

export function of(value) {
  // Convert `value` to an object, where `value` is either a table or an
  // object. If `value` is a table, return an object whose keys are column
  // names and values are lists of the column values in `table`. If `value`
  // is an object then return it.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  // ])
  //
  // obj.of(cities)
  // ```

  checkType(value, "table", "object");
  return getType(value) === "table" ? value.data : value;
}

export function has(object, key) {
  // Check whether `object` contains `key`.
  //
  // ```ptls
  // has({ q: 9, r: 5, b: 3, n: 3, p: 1 }, "q")
  // has({ q: 9, r: 5, b: 3, n: 3, p: 1 }, "k")
  // ```

  checkType(object, "object");
  return object.has(key);
}

export function matches(object, matcher) {
  // Check whether `object` contains the entries in `matcher`.
  //
  // ```ptls
  // ducky = { name: "Ducky", type: "dog", age: 9 }
  // obj.matches(ducky, { name: "Ducky", age: 9 })
  // obj.matches(ducky, { name: "Ducky", type: "cat" })
  // ```

  return isMatch(object, matcher);
}

export function get(object, key) {
  // Get the value corresponding to `key` in `object`.
  //
  // ```ptls
  // obj.get({ q: 9, r: 5, b: 3, n: 3, p: 1 }, "q")
  // ```
  //
  // *Note that this can also be accomplished using the index `[]` operator*:
  //
  // ```ptls
  // { q: 9, r: 5, b: 3, n: 3, p: 1 }["q"]
  // ```

  checkKey(object, key);
  return object.get(key);
}

export function getDefault(object, key, $default) {
  // Get the value corresponding to `key` in `object`, or `default`
  // if `object` does not have `key`.
  //
  // ```ptls
  // capitals = { Maine: "Augusta", Maryland: "Annapolis", Massachusetts: "Boston" }
  // obj.getDefault(capitals, "Massachusetts", "idk")
  // obj.getDefault(capitals, "Massocheichei", "idk")
  // ```

  checkType(object, "object");
  return object.get(key, $default);
}

export function set(object, key, value) {
  // Assign `key` to `value` in `object`.
  //
  // ```ptls
  // phrases = { "Hello": "Ola", "Good afternoon": "Boa tarde" }
  // obj.set(phrases, "Good night", "Boa noite")
  // ```
  //
  // *Note that if you want to update an existing variable, you could also
  // use variable assignment*:
  //
  // ```ptls
  // phrases = { "Hello": "Ola", "Good afternoon": "Boa tarde" }
  // phrases["Good night"] = "Boa noite"
  // ```

  checkType(object, "object");
  return object.set(key, value);
}

export function put(value, object, key) {
  // Assign `key` to `value` in `object`.
  //
  // ```ptls
  // phrases = { "Hello": "Ola", "Good afternoon": "Boa tarde" }
  // obj.put("Good night", phrases, "Boa noite")
  // ```

  checkType(object, "object");
  return object.set(key, value);
}

export function setDefault(object, key, value) {
  // Assign `key` to `value` in `object` only if `key` is not already present.
  //
  // ```ptls
  // phrases = { "Hello": "Ola", "Good afternoon": "Boa tarde" }
  // obj.setDefault(phrases, "Hello", "E aí")
  // obj.setDefault(phrases, "Good night", "Boa noite")
  // ```

  checkType(object, "object");
  return object.has(key) ? object : object.set(key, value);
}

export function merge(objects) {
  // Merge (flatten) a list of `objects` into a single object.
  //
  // ```ptls
  // obj.merge([
  //   { "Hello": "Ola", "Good afternoon": "Boa tarde" },
  //   { "Hello": "E aí?", "Good night": "Boa noite" },
  // ])
  // ```

  checkType(objects, "list");
  objects.forEach((object) => checkType(object, "object"));
  return OrderedMap().concat(...objects);
}

export function keys(object) {
  // Get the keys in `object` as a list.
  //
  // ```ptls
  // obj.keys({ q: 9, r: 5, b: 3, n: 3, p: 1 })
  // ```

  checkType(object, "object");
  return object.keySeq().toList();
}

export function values(object) {
  // Get the values in `object` as a list.
  //
  // ```ptls
  // obj.values({ q: 9, r: 5, b: 3, n: 3, p: 1 })
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
  // Get a subset of the entries in `object` with the given `keys`. Entries
  // will appear in the order given in `keys`.
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

  return OrderedMap(map);
}

export function focus(object, keys) {
  // Reorder the entries in `object` so that the given `keys` appear first,
  // in the given order.
  //
  // ```ptls
  // obj.focus({ name: "Lamar", yards: 4172, tds: 41, ints: 4 }, ["name", "tds"])
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

  return OrderedMap(map);
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
  // obj.removeAll(
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4, fumbles: 10 },
  //   ["ints", "fumbles"]
  // )
  // ```

  checkType(object, "object");
  checkType(keys, "list");
  return object.deleteAll(keys);
}

export function rename(object, old, $new) {
  // Update the entry in `object` with key `old` to have key `new`.
  //
  // ```ptls
  // obj.rename(
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4 },
  //   "tds",
  //   "touchdowns"
  // )
  // ```

  checkType(object, "object");
  checkKey(object, old);

  // need to recreate map to keep order the same
  const map = new Map();

  for (const [key, value] of object) {
    const newKey = is(key, old) ? $new : key;
    map.set(newKey, value);
  }

  return OrderedMap(map);
}
