import { OrderedMap, List } from "immutable";

export function loadJson(string) {
  // needs improvements, better error reporting
  return convert(JSON.parse(string));
}

function convert(jsonVal) {
  if (Array.isArray(jsonVal)) {
    return List(jsonVal.map(convert));
  }

  if (typeof jsonVal === "object") {
    const map = new Map();

    for (const [key, value] of Object.entries(jsonVal)) {
      map.set(key, convert(value));
    }

    return OrderedMap(map);
  }

  return jsonVal;
}
