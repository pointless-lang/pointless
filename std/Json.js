import { checkType } from "../lang/values.js";
import { Panic } from "../lang/panic.js";
import im from "../immutable/immutable.js";
import { readFile } from "node:fs/promises";

function convert(jsonVal) {
  if (jsonVal === null) {
    return null;
  }

  if (Array.isArray(jsonVal)) {
    return im.List(jsonVal.map(convert));
  }

  if (typeof jsonVal === "object") {
    const map = new Map();

    for (const [key, value] of Object.entries(jsonVal)) {
      map.set(key, convert(value));
    }

    return im.OrderedMap(map);
  }

  return jsonVal;
}

function loadJson(string) {
  // needs improvements, better error reporting
  return convert(JSON.parse(string));
}

export async function read(path) {
  // Read the JSON file at `path` and return the parsed value. JSON arrays
  // become lists, objects become ptls objects, and primitives map directly.
  //
  // ```ptls
  // Json = import "std:Json"
  // Json.read("data.json")
  // ```

  checkType(path, "string");

  let source;

  try {
    source = await readFile(path, "utf8");
  } catch (err) {
    throw new Panic("file read error", { path, err: String(err) });
  }

  try {
    return loadJson(source);
  } catch (err) {
    if (err instanceof Panic) throw err;
    throw new Panic("JSON parse error", { path, err: String(err) });
  }
}
