import { checkType } from "../../src/values.js";
import { checkKey, isMatch } from "../../src/obj.js";
import { is, OrderedMap } from "immutable";

export function has(object, key) {
  checkType(object, "object");
  return object.has(key);
}

export function matches(object, matcher) {
  return isMatch(object, matcher);
}

export function get(object, key) {
  checkKey(object, key);
  return object.get(key);
}

export function getDefault(object, key, $default) {
  checkType(object, "object");
  return object.get(key, $default);
}

export function set(object, key, value) {
  checkType(object, "object");
  return object.set(key, value);
}

export function put(value, object, key) {
  checkType(object, "object");
  return object.set(key, value);
}

export function setDefault(object, key, value) {
  checkType(object, "object");
  return object.has(key) ? object : object.set(key, value);
}

export function merge(objects) {
  checkType(objects, "list");
  objects.forEach((object) => checkType(object, "object"));
  return OrderedMap().concat(...objects);
}

export function keys(object) {
  checkType(object, "object");
  return object.keySeq().toList();
}

export function values(object) {
  checkType(object, "object");
  return object.valueSeq().toList();
}

export function len(object) {
  checkType(object, "object");
  return object.size;
}

export function isEmpty(object) {
  return len(object) === 0;
}

export function select(object, keys) {
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
  checkType(object, "object");
  return object.delete(key);
}

export function removeAll(object, keys) {
  checkType(object, "object");
  checkType(keys, "list");
  return object.deleteAll(keys);
}

export function rename(object, old, $new) {
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
