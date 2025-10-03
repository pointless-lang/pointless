import { checkType, getType } from "./values.js";
import { Func } from "./func.js";
import { Env } from "./env.js";
import im from "../immutable/immutable.js";

// Rollup can't handle import expressions withing an object literal
// so we have to put them in the natives object separately
import * as Async from "../std/Async.js";
import * as Bool from "../std/Bool.js";
import * as Char from "../std/Char.js";
import * as Console from "../std/Console.js";
import * as Err from "../std/Err.js";
import * as Fs from "../std/Fs.js";
import * as List from "../std/List.js";
import * as Math from "../std/Math.js";
import * as None from "../std/None.js";
import * as Obj from "../std/Obj.js";
import * as Panic from "../std/Panic.js";
import * as Rand from "../std/Rand.js";
import * as Ref from "../std/Ref.js";
import * as Re from "../std/Re.js";
import * as Set from "../std/Set.js";
import * as Str from "../std/Str.js";
import * as Table from "../std/Table.js";
import * as Test from "../std/Test.js";

const natives = {
  Async,
  Bool,
  Char,
  Console,
  Err,
  Fs,
  List,
  Math,
  None,
  Obj,
  Panic,
  Rand,
  Ref,
  Re,
  Set,
  Str,
  Table,
  Test,
};

let std;
let modules;
let globals;
let variants;

function makeModules() {
  modules = {};

  // wrapped functions shouldn't destructure arguments
  // or use spread syntax or default param values
  const paramChars = /\(([$\w\s,]*)\)/;

  for (const [modName, native] of Object.entries(natives)) {
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
    assert: modules.Test.assert,
    chars: modules.Str.chars,
    clear: modules.Console.clear,
    join: modules.Str.join,
    max: modules.List.max,
    min: modules.List.min,
    parse: modules.Str.parse,
    print: modules.Console.print,
    prompt: modules.Console.prompt,
    range: modules.List.range,
    round: modules.Math.round,
    roundTo: modules.Math.roundTo,
    sleep: modules.Async.sleep,
    sort: modules.List.sort,
    sortDesc: modules.List.sortDesc,
    span: modules.List.span,
    split: modules.Str.split,
    sum: modules.List.sum,
  };
}

function makeOverloads() {
  const overloads = {
    drop: ["values", "count"],
    dropLast: ["values", "count"],
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
    list: "List",
    none: "None",
    number: "Math",
    object: "Obj",
    set: "Set",
    string: "Str",
    table: "Table",
  };

  variants = {};
  modules.Overloads = {};

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

    const fullName = `Overloads.${name}`;
    const overload = new Func(handler, fullName, params);
    globals[name] = overload;
    modules.Overloads[name] = overload;
  }
}

function makeStd() {
  const defs = {};

  // Need to sort cause overloads was added later
  for (const name of Object.keys(modules).toSorted()) {
    // Convert modules to ptls objects
    defs[name] = im.OrderedMap(modules[name]);
  }

  Object.assign(defs, globals);
  std = new Env(null, new Map(Object.entries(defs)));
}

export function spawnStd() {
  if (!std) {
    makeModules();
    makeGlobals();
    makeOverloads();
    makeStd();
  }

  return std.spawn();
}

export function loadMeta() {
  spawnStd();
  return { modules, globals, variants };
}
