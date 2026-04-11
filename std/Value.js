import {
  checkDumpable,
  checkType,
  evalLiteral,
  getType,
} from "../lang/values.js";
import { repr } from "../lang/repr.js";
import { Panic } from "../lang/panic.js";
import { readFile, writeFile } from "node:fs/promises";

export function typeOf(value) {
  return getType(value);
}

export function dump(value) {
  // Convert `value` to a string containing a ptls literal. Panics if `value`
  // contains non-literal types like functions. The resulting string can be
  // parsed back with `parse`.
  //
  // ```ptls
  // Value = import "std:Value"
  // Value.dump([1, 2, 3])
  // Value.dump({name: "Alice", age: 30})
  // ```

  checkDumpable(value);
  return repr(value, "compact");
}

export function parse(string) {
  // Parse `string` as a ptls literal value. Supports all literal types:
  // numbers, strings, booleans, `none`, lists, sets, objects, and tables.
  // Panics if `string` contains non-literal syntax like variables, function
  // calls, or operators.
  //
  // ```ptls
  // parse("[1, 2, 3]")
  // parse(`#{ name, age; "Alice", 30 }`)
  // parse("42")
  // ```

  checkType(string, "string");
  return evalLiteral(string);
}

export async function read(path) {
  // Read the `.ptd` file at `path` and parse its contents as a ptls literal.
  //
  // ```ptls --no-eval
  // Value = import "std:Value"
  // Value.read("data.ptd")
  // ```

  checkType(path, "string");

  let source;

  try {
    source = await readFile(path, { encoding: "utf8" });
  } catch (err) {
    throw new Panic("file read error", { path, err: String(err) });
  }

  return evalLiteral(source, path);
}

export async function write(value, path) {
  // Dump `value` as a ptls literal and write it to the file at `path`. Return
  // the dumped string.
  //
  // ```ptls --no-eval
  // Value = import "std:Value"
  // Value.write({name: "Alice", age: 30}, "user.ptd")
  // ```

  checkType(path, "string");
  checkDumpable(value);
  const string = repr(value, "compact");

  try {
    await writeFile(path, string);
  } catch (err) {
    throw new Panic("file write error", { path, err: String(err) });
  }

  return string;
}
