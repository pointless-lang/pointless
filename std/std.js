import { checkType, getType } from "../src/values.js";
import { Func } from "../src/func.js";
import { Env } from "../src/env.js";
import { readdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { OrderedMap } from "immutable";

// wrapped functions shouldn't destructure arguments
// or use spread syntax or default param values
const paramChars = /\(([$\w\s,]*)\)/;

const native = {};
const root = dirname(fileURLToPath(import.meta.url));
const entries = await readdir(root, { withFileTypes: true });
const dirs = entries.filter((entry) => entry.isDirectory());

for (const { name: modName } of dirs) {
  const mod = await import(`./${modName}/mod.js`);
  native[modName] = {};

  for (let [name, value] of Object.entries(mod)) {
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

    native[modName][name] = value;
  }
}

export const modules = {};

for (let [name, mod] of Object.entries(native)) {
  // convert modules to ptls objects
  modules[name] = OrderedMap(mod);
}

export const overloadParents = new Map();
export const overloadChildren = new Map();
modules.overloads = OrderedMap();

export const globals = {
  assert: native.err.assert,
  chars: native.str.chars,
  clear: native.console.clear,
  join: native.str.join,
  max: native.list.max,
  min: native.list.min,
  print: native.console.print,
  prompt: native.console.prompt,
  range: native.list.range,
  round: native.math.round,
  roundTo: native.math.roundTo,
  sleep: native.async.sleep,
  sort: native.list.sort,
  sortBy: native.table.sortBy,
  sortDesc: native.list.sortDesc,
  sortDescBy: native.table.sortDescBy,
  span: native.list.span,
  split: native.str.split,
  sum: native.list.sum,
};

function addOverload(name, params, ...types) {
  const typesMap = {
    boolean: "bool",
    function: "func",
    list: "list",
    none: "nada",
    number: "num",
    object: "obj",
    set: "set",
    string: "str",
    table: "table",
  };

  function handler(...args) {
    checkType(args[0], ...types);
    const modName = typesMap[getType(args[0])];
    return native[modName][name].call(...args);
  }

  const fullName = `overloads.${name}`;
  const overload = new Func(handler, fullName, params);

  globals[name] = overload;

  for (const type of types) {
    const modName = typesMap[type];
    const original = native[modName][name];
    overloadParents.set(original, overload);

    if (!overloadChildren.has(overload)) {
      overloadChildren.set(overload, []);
    }

    overloadChildren.get(overload).push(original);
  }

  modules.overloads = modules.overloads.set(name, overload);
}

addOverload("drop", ["values", "count"], "list", "table", "string");
addOverload("dropLast", ["values", "count"], "list", "table", "string");
addOverload("has", ["value", "elem"], "set", "list", "object", "table");
addOverload("isEmpty", ["values"], "list", "object", "set", "table", "string");
addOverload("len", ["values"], "list", "object", "set", "table", "string");
addOverload("push", ["values", "item"], "list", "table");
addOverload("remove", ["values", "elem"], "set", "list", "object", "table");
addOverload("reverse", ["values"], "list", "table", "string");
addOverload("select", ["collection", "keys"], "object", "table");
// addOverload("sortBy", ["values", "ranker"], "list", "table");
// addOverload("sortDescBy", ["values", "ranker"], "list", "table");
addOverload("take", ["values", "count"], "list", "table", "string");
addOverload("takeLast", ["values", "count"], "list", "table", "string");

const defs = { ...modules, ...globals };
defs.std = OrderedMap(defs);

export const std = new Env(null, new Map(Object.entries(defs)));
