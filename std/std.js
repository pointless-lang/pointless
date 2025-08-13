import { checkType, getType } from "../src/values.js";
import { Func } from "../src/func.js";
import { Env } from "../src/env.js";
import { readdir } from "node:fs/promises";
import { OrderedMap } from "immutable";

let std;
let modules;
let globals;
let variants;

async function makeModules() {
  modules = {};

  // wrapped functions shouldn't destructure arguments
  // or use spread syntax or default param values
  const paramChars = /\(([$\w\s,]*)\)/;

  const entries = await readdir(import.meta.dirname, { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory());

  for (const { name: modName } of dirs) {
    const native = await import(`./${modName}/mod.js`);
    const mod = {};

    for (let [name, value] of Object.entries(native)) {
      if (name.startsWith("_")) {
        continue;
      }

      // module export names and param names can be escaped with '$' prefix
      // for js keywords, for example a param '$default' in js would get
      // converted to 'default' in ptls
      name = name.replaceAll("$", "");

      if (value instanceof Function) {
        const paramStr = value
          .toString()
          .match(paramChars)[1]
          .replaceAll(" ", "")
          .replaceAll("$", "");

        // wrap js functions
        const fullName = `${modName}.${name.replaceAll("$", "")}`;
        const params = paramStr.length ? paramStr.split(",") : [];
        value = new Func(value, fullName, params);
      }

      mod[name] = value;
    }

    modules[modName] = {};

    // Need to sort to account for removed `$` prefixes
    for (const name of Object.keys(mod).toSorted()) {
      modules[modName][name] = mod[name];
    }
  }
}

function makeGlobals() {
  globals = {
    assert: modules.test.assert,
    chars: modules.str.chars,
    clear: modules.console.clear,
    join: modules.str.join,
    max: modules.list.max,
    min: modules.list.min,
    print: modules.console.print,
    prompt: modules.console.prompt,
    range: modules.list.range,
    round: modules.math.round,
    roundTo: modules.math.roundTo,
    sleep: modules.async.sleep,
    sort: modules.list.sort,
    sortDesc: modules.list.sortDesc,
    span: modules.list.span,
    split: modules.str.split,
    sum: modules.list.sum,
  };
}

function makeOverloads() {
  const overloads = {
    drop: ["values", "count"],
    dropLast: ["values", "count"],
    has: ["value", "elem"],
    isEmpty: ["values"],
    len: ["values"],
    push: ["values", "item"],
    remove: ["values", "elem"],
    reverse: ["values"],
    select: ["collection", "keys"],
    sortBy: ["values", "ranker"],
    sortDescBy: ["values", "ranker"],
    take: ["values", "count"],
    takeLast: ["values", "count"],
  };

  const typesMap = {
    list: "list",
    none: "nada",
    number: "math",
    object: "obj",
    set: "set",
    string: "str",
    table: "table",
  };

  variants = {};
  modules.overloads = {};

  for (const [name, params] of Object.entries(overloads)) {
    const types = [];
    variants[name] = [];

    for (const [type, modName] of Object.entries(typesMap)) {
      // Types may not all have modules
      const value = modules[modName]?.[name];

      if (value) {
        variants[name].push(value);
        types.push(type);
      }
    }

    const handler = (...args) => {
      checkType(args[0], ...types);
      const modName = typesMap[getType(args[0])];
      return modules[modName][name].call(...args);
    };

    const fullName = `overloads.${name}`;
    const overload = new Func(handler, fullName, params);
    globals[name] = overload;
    modules.overloads[name] = overload;
  }
}

function makeStd() {
  const defs = {};

  // Need to sort cause overloads was added later
  for (let name of Object.keys(modules).toSorted()) {
    // Convert modules to ptls objects
    defs[name] = OrderedMap(modules[name]);
  }

  Object.assign(defs, globals);
  defs.std = OrderedMap(defs);

  std = new Env(null, new Map(Object.entries(defs)));
}

export async function spawnStd() {
  if (!std) {
    await makeModules();
    makeGlobals();
    makeOverloads();
    makeStd();
  }

  return std.spawn();
}

export async function loadMeta() {
  await spawnStd();
  return { modules, globals, variants };
}
