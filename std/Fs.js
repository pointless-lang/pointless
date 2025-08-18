import { show } from "../src/repr.js";
import { checkType } from "../src/values.js";
import { Panic } from "../src/panic.js";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readdir } from "node:fs/promises";
import im from "immutable";

export const _docs = `
Read and manipulate files and directories.

Paths are resolved relative to the current working directory.
`;

export async function read(path) {
  // Read the text file at `path`.
  //
  // ```ptls --no-eval
  // Fs.read("lyrics.txt")
  // ```
  //
  // *Tip:* To read files from a fixed path, consider using `import`, which
  // which allows you to load and process file contents from a path relative
  // to a script's source file.
  //
  // ```ptls --no-eval
  // someVar = import "text:some-file.txt"  -- Import text as a string
  // someVar = import "lines:some-file.txt" -- Import text as a list of lines
  // someVar = import "csv:some-file.csv"   -- Import CSV as a table
  // someVar = import "json:some-file.json" -- Import JSON as a ptls value
  // ```

  checkType(path, "string");

  try {
    return await readFile(path, { encoding: "utf8" });
  } catch (err) {
    throw new Panic("file read error", { path, err: String(err) });
  }
}

export async function readBytes(path) {
  try {
    return im.List(await readFile(path));
  } catch (err) {
    throw new Panic("file read error", { path, err: String(err) });
  }
}

export async function write(value, path) {
  // Convert `value` to a string and write to the file at `path`,
  // creating the file if it doesn't already exist.
  //
  // ```ptls --no-eval
  // Fs.write("I hope you understand, everybody scams", "lyrics.txt")
  // ```

  checkType(path, "string");

  try {
    await writeFile(path, show(value));
    return null;
  } catch (err) {
    throw new Panic("file write error", { path, err: String(err) });
  }
}

export async function writeBytes(bytes, path) {
  checkType(path, "string");
  checkType(bytes, "list");
  throw Error("unimplemented");
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
    return im.List(
      entries.map((entry) =>
        entry.isDirectory() ? `${entry.name}/` : entry.name,
      ),
    );
  } catch (err) {
    throw new Panic("cannot access", { path: fullPath });
  }
}
