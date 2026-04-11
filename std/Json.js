import { checkType } from "../lang/values.js";
import { Panic } from "../lang/panic.js";
import { loadJson } from "../lang/json.js";
import { readFile } from "node:fs/promises";

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
