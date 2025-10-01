import { Panic } from "./panic.js";
import { parse } from "./parser.js";
import { tokenize } from "./tokenizer.js";
import { Table } from "./table.js";
import { loadJson } from "./json.js";
import { spawnStd } from "./std.js";
import { readFile, realpath } from "node:fs/promises";
import { resolve } from "node:path";
import im from "../immutable/immutable.js";

const cache = new Map();
const prefixChars = /^(?:([a-z]+):)?/;

async function evalProgram(statements) {
  return (await spawnStd()).eval(statements);
}

export async function getImport(root, path) {
  let prefix = path.match(prefixChars)[1];

  if (prefix) {
    // skip prefix and colon
    path = path.slice(prefix.length + 1);
  } else {
    prefix = "";
  }

  const relPath = resolve(root, path);
  let absPath;

  try {
    absPath = await realpath(relPath);
  } catch {
    throw new Panic("cannot read file", { path: relPath });
  }

  const cachePath = `${prefix}:${absPath}`;

  if (cache.has(cachePath)) {
    const result = cache.get(cachePath);

    // use temp value 'undefined' to mark pending import resolution
    // and check for circular imports
    if (result === undefined) {
      throw new Panic("circular import", { path: relPath });
    }

    return result;
  }

  cache.set(cachePath, undefined);
  const result = await dispatch(prefix, relPath, absPath);
  cache.set(cachePath, result);
  return result;
}

async function dispatch(prefix, relPath, absPath) {
  if (prefix === "raw") {
    return im.List(await readFile(absPath));
  }

  const source = await readFile(absPath, "utf8");

  switch (prefix) {
    case "text":
      return source;
    case "lines":
      return im.List(source.replace(/\r?\n^/, "").split(/\r?\n/g));
    case "csv":
      return Table.fromCsv(source);
    case "json":
      return loadJson(source);
    case "": {
      const statements = parse(tokenize(relPath, source));
      return await evalProgram(statements);
    }
    default:
      throw new Panic("invalid import prefix", { prefix });
  }
}
