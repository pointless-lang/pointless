import { show } from "../lang/repr.js";
import { checkType } from "../lang/values.js";
import { checkWhole } from "../lang/num.js";
import { Panic } from "../lang/panic.js";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Buffer } from "node:buffer";
import im from "../immutable/immutable.js";

export async function read(path) {
  // Read the text file at `path`.
  //
  // ```ptls --no-eval
  // Fs.read("lyrics.txt")
  // ```

  checkType(path, "string");

  try {
    return await readFile(path, { encoding: "utf8" });
  } catch (err) {
    throw new Panic("file read error", { path, err: String(err) });
  }
}

export async function readBytes(path) {
  // Read the file at `path` as a list of bytes.
  //
  // ```ptls --no-eval
  // Fs.readBytes("icon.png")
  // ```

  try {
    return im.List(await readFile(path));
  } catch (err) {
    throw new Panic("file read error", { path, err: String(err) });
  }
}

export async function write(value, path) {
  // Convert `value` to a string and write to the file at `path`, creating the
  // file if it doesn't already exist. Return the converted string.
  //
  // ```ptls --no-eval
  // Fs.write("I hope you understand, everybody scams", "lyrics.txt")
  // ```

  checkType(path, "string");

  try {
    const string = show(value);
    await writeFile(path, string);
    return string;
  } catch (err) {
    throw new Panic("file write error", { path, err: String(err) });
  }
}

export async function writeBytes(bytes, path) {
  // Write a list `bytes` to the file at `path`, creating the file if it doesn't
  // already exist. `bytes` must be a list of integers, between `0` and `255`,
  // inclusive. Return `bytes`.
  //
  // ```ptls --no-eval
  // Fs.writeBytes([72, 101, 108, 108, 111], "greeting.txt")
  // ```

  checkType(path, "string");
  checkType(bytes, "list");

  for (const byte of bytes) {
    checkType(byte, "number");
    checkWhole(byte);

    if (byte < 0 || byte > 255) {
      throw new Panic("byte out of range", { byte });
    }
  }

  await writeFile(path, Buffer.from([...bytes]));
  return bytes;
}

export async function ls(path) {
  // List the contents of the directory at `path`.
  //
  // ```ptls --no-eval
  // ls("./school")
  // ```
  //
  // Example output:
  //
  // ```
  // ["classes/", "notes/", "to-do.txt"]
  // ```

  const fullPath = resolve(path);

  try {
    const entries = await readdir(fullPath, { withFileTypes: true });
    return im.List(
      entries.map((entry) =>
        entry.isDirectory() ? `${entry.name}/` : entry.name
      ),
    );
  } catch (_) {
    throw new Panic("cannot access", { path: fullPath });
  }
}
