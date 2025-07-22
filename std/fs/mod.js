import { show } from "../../src/repr.js";
import { checkType } from "../../src/values.js";
import { Panic } from "../../src/panic.js";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readdir } from "node:fs/promises";
import { List } from "immutable";

export async function read(path) {
  // Read the text file at `path`.
  //
  // ```ptls --no-eval
  // fs.read("lyrics.txt")
  // ```

  checkType(path, "string");

  try {
    return await readFile(path, { encoding: "utf8" });
  } catch (err) {
    throw new Panic("file read error", { path, err: String(err) });
  }
}

export async function write(path, value) {
  // Convert `value` to a string and write to the file at `path`,
  // creating the file if it doesn't already exist.
  //
  // ```ptls --no-eval
  // fs.write("lyrics.txt", "I hope you understand, everybody scams")
  // ```

  checkType(path, "string");

  try {
    await writeFile(path, show(value));
    return null;
  } catch (err) {
    throw new Panic("file write error", { path, err: String(err) });
  }
}

export async function ls(path) {
  // List the contents of the directory at `path`.
  //
  // ```ptls --no-eval
  // ls("./pointless")
  // ```
  // Example output:
  //
  // ```
  // ["docs/", "examples/", "package.json", "src/", "std/", "test.ptls"]
  // ```

  const fullPath = resolve(path);

  try {
    const entries = await readdir(fullPath, { withFileTypes: true });
    return List(
      entries.map((entry) =>
        entry.isDirectory() ? `${entry.name}/` : entry.name,
      ),
    );
  } catch (err) {
    throw new Panic("cannot access", { path: fullPath });
  }
}
