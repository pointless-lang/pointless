import { checkType, getType } from "../../src/values.js";
import { Func } from "../../src/func.js";
import { spawnStd } from "../../src/std.js";
import { Panic } from "../../src/panic.js";
import { Env } from "../../src/env.js";
import { repr, show } from "../../src/repr.js";

function handleUnavailable() {
  throw new Panic("not available in notebook mode");
}

const unavailable = ["console", "fs", "async"].map((s) => s + ".");

export const shimConsole = {
  output: [],
  inputs: [],

  print(string, end = "\n") {
    this.output.push(string + end);
  },

  getOutput() {
    const result = this.output.join("");
    this.output = [];
    return result;
  },
};

const shims = {
  ["Console.write"](value) {
    checkType(value, "string");
    shimConsole.print(value, "");
    return value;
  },

  ["Console.error"](value) {
    shimConsole.print(show(value));
    return value;
  },

  ["Console.print"](value) {
    shimConsole.print(show(value));
    return value;
  },

  ["Console.debug"](value) {
    shimConsole.print(repr(value));
    return value;
  },

  ["Console.prompt"](message) {
    checkType(message, "string");
    const input = shimConsole.inputs.shift() ?? "";
    shimConsole.output.push(`${message}${input}\n`);
    return input;
  },
};

function convert(value) {
  if (getType(value) === "object") {
    return value.map(convert);
  }

  if (getType(value) === "function") {
    if (shims[value.name]) {
      return new Func(shims[value.name], value.name, value.params);
    }

    for (const prefix of unavailable) {
      if (value.name.startsWith(prefix)) {
        return new Func(handleUnavailable, value.name, value.params);
      }
    }
  }

  return value;
}

let docStd;

export async function spawnDocStd() {
  if (!docStd) {
    const std = await spawnStd();
    const defs = {};

    for (const [name, value] of std.parent.defs) {
      defs[name] = convert(value);
    }

    docStd = new Env(null, new Map(Object.entries(defs)));
  }

  return docStd.spawn();
}
