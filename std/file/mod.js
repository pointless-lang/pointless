import { show } from "../../src/repr.js";
import { checkType } from "../../src/values.js";
import { Panic } from "../../src/panic.js";
import { readFile, writeFile } from "node:fs/promises";

export async function read(path) {
  checkType(path, "string");

  try {
    return await readFile(path, { encoding: "utf8" });
  } catch (err) {
    throw new Panic("file read error", { path, err: String(err) });
  }
}

export async function write(path, value) {
  checkType(path, "string");

  try {
    await writeFile(path, show(value));
    return null;
  } catch (err) {
    throw new Panic("file write error", { path, err: String(err) });
  }
}
