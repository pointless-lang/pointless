import { Panic } from "./panic.js";
import { parse } from "./parser.js";
import { tokenize } from "./tokenizer.js";
import { evalLiteral } from "./values.js";
import im from "../immutable/immutable.js";

export class Importer {
  constructor(loader, runtime) {
    this.loader = loader;
    this.runtime = runtime;
    this.clearImports();
  }

  clearImports() {
    this.cache = new Map();
  }

  async resolvePath(root, path) {
    const absPath = this.loader.resolve(root, path);
    return await this.loader.realPath(absPath);
  }

  async get(root, path) {
    if (path.startsWith("std:")) {
      if (this.cache.has(path)) {
        return this.cache.get(path);
      }

      const modName = path.slice(4);
      const mod = this.runtime.std.modules[modName];

      if (!mod) {
        throw new Panic("unknown stdlib module", { name: modName });
      }

      const result = im.OrderedMap(mod);
      this.cache.set(path, result);
      return result;
    }

    const fullPath = await this.resolvePath(root, path);

    if (this.cache.has(fullPath)) {
      const result = this.cache.get(fullPath);

      // use temp value 'undefined' to mark pending import resolution
      // and check for circular imports
      if (result === undefined) {
        throw new Panic("circular import", { path: fullPath });
      }

      return result;
    }

    this.cache.set(fullPath, undefined);

    try {
      const source = await this.loader.readTxt(fullPath);
      const statements = parse(tokenize(fullPath, source));
      const result = await this.runtime.spawnEnv().eval(statements);
      this.cache.set(fullPath, result);
      return result;
    } catch (err) {
      this.cache.delete(fullPath);
      throw err;
    }
  }
}
