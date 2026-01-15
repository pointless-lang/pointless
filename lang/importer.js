import { Panic } from "./panic.js";
import { parse } from "./parser.js";
import { tokenize } from "./tokenizer.js";
import { Table } from "./table.js";
import { loadJson } from "./json.js";
import im from "../immutable/immutable.js";

const prefixChars = /^(?:([a-z]+):)?/;

export class Importer {
  constructor(loader, runtime) {
    this.loader = loader;
    this.runtime = runtime;
    this.cache = new Map();
  }

  async get(root, path, save = true) {
    let prefix = path.match(prefixChars)[1];

    if (prefix) {
      // skip prefix and colon
      path = path.slice(prefix.length + 1);
    } else {
      prefix = "";
    }

    const absPath = this.loader.resolve(root, path);
    const realPath = await this.loader.realPath(absPath);
    const key = `${prefix}:${realPath}`;

    if (save && this.cache.has(key)) {
      const result = this.cache.get(key);

      // use temp value 'undefined' to mark pending import resolution
      // and check for circular imports
      if (result === undefined) {
        throw new Panic("circular import", { path: absPath });
      }

      return result;
    }

    this.cache.set(key, undefined);
    const result = await this.dispatch(absPath, prefix);
    this.cache.set(key, result);
    return result;
  }

  async dispatch(absPath, prefix) {
    if (prefix === "raw") {
      return im.List(await this.loader.readRaw(absPath));
    }

    const source = await this.loader.readTxt(absPath);

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
        const statements = parse(tokenize(absPath, source));
        return await this.runtime.spawnEnv().eval(statements);
      }
      default:
        throw new Panic("invalid import prefix", { prefix });
    }
  }
}
