import { Std } from "../lang/std.js";
import { Importer } from "../lang/importer.js";

export class Runtime {
  constructor(impl, loader) {
    // Need to add impl and loader before making std and importer
    this.impl = impl;
    this.loader = loader;
    this.std = new Std(this);
    this.importer = new Importer(this);
  }
}
