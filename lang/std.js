import { checkType, getType } from "./values.js";
import { Func } from "./func.js";

export class Std {
  constructor(impl) {
    this.makeModules(impl);
    this.makeGlobals();
    this.makeOverloads();
  }

  makeModules(impl) {
    this.modules = {};

    // Wrapped functions shouldn't destructure arguments
    // or use spread syntax or default param values
    const paramChars = /\(([$\w\s,]*)\)/;

    for (const [modName, native] of Object.entries(impl)) {
      const mod = {};

      for (let [name, value] of Object.entries(native)) {
        if (name.startsWith("_")) {
          continue;
        }

        // Module export names and param names can be escaped with '$' prefix
        // for js keywords, for example a param '$default' in js would get
        // converted to 'default' in ptls
        name = name.replaceAll("$", "");

        if (value instanceof Function) {
          const paramStr = value
            .toString()
            .match(paramChars)[1]
            .replaceAll(" ", "")
            .replaceAll("$", "");

          // Wrap js functions
          const fullName = `${modName}.${name.replaceAll("$", "")}`;
          const params = paramStr.length ? paramStr.split(",") : [];
          value = new Func(value, fullName, params);
        }

        mod[name] = value;
      }

      this.modules[modName] = {};

      // Need to sort to account for removed `$` prefixes
      for (const name of Object.keys(mod).toSorted()) {
        this.modules[modName][name] = mod[name];
      }
    }
  }

  makeGlobals() {
    this.globals = {
      assert: this.modules.Test.assert,
      bottom: this.modules.Table.bottom,
      chars: this.modules.Str.chars,
      clear: this.modules.Console.clear,
      join: this.modules.Str.join,
      max: this.modules.List.max,
      min: this.modules.List.min,
      parse: this.modules.Str.parse,
      print: this.modules.Console.print,
      prompt: this.modules.Console.prompt,
      range: this.modules.List.range,
      round: this.modules.Math.round,
      roundTo: this.modules.Math.roundTo,
      sleep: this.modules.Async.sleep,
      sort: this.modules.List.sort,
      sortDesc: this.modules.List.sortDesc,
      span: this.modules.List.span,
      split: this.modules.Str.split,
      sum: this.modules.List.sum,
      top: this.modules.Table.top,
    };
  }

  makeOverloads() {
    const overloads = {
      drop: ["values", "count"],
      isEmpty: ["values"],
      len: ["values"],
      push: ["values", "item"],
      remove: ["values", "item"],
      reverse: ["values"],
      select: ["collection", "keys"],
      sortBy: ["values", "ranker"],
      sortDescBy: ["values", "ranker"],
      take: ["values", "count"],
    };

    const typesMap = {
      list: "List",
      none: "None",
      number: "Math",
      object: "Obj",
      set: "Set",
      string: "Str",
      table: "Table",
    };

    this.variants = {};
    this.modules.Overloads = {};

    for (const [name, params] of Object.entries(overloads)) {
      const types = [];
      this.variants[name] = [];

      for (const [type, modName] of Object.entries(typesMap)) {
        // Types may not all have modules
        const value = this.modules[modName]?.[name];

        if (value) {
          this.variants[name].push(value);
          types.push(type);
        }
      }

      const handler = (...args) => {
        checkType(args[0], ...types);
        const modName = typesMap[getType(args[0])];
        return this.modules[modName][name].call(...args);
      };

      const fullName = `Overloads.${name}`;
      const overload = new Func(handler, fullName, params);
      this.globals[name] = overload;
      this.modules.Overloads[name] = overload;
    }
  }
}
