import { Std } from "../lang/std.js";
import { Importer } from "../lang/importer.js";
import { Env } from "../lang/env.js";
import im from "../immutable/immutable.js";

export class Runtime {
  constructor(impl, loader) {
    this.std = new Std(impl);
    this.importer = new Importer(loader, this);
  }

  makeEnv() {
    const defs = {};

    // Need to sort cause overloads was added later
    for (const name of Object.keys(this.std.modules).toSorted()) {
      // Convert modules to ptls objects
      defs[name] = im.OrderedMap(this.std.modules[name]);
    }

    Object.assign(defs, this.std.globals);
    return new Env(null, new Map(Object.entries(defs)), this);
  }

  spawnEnv() {
    this.env ??= this.makeEnv();
    return this.env.spawn();
  }
}
