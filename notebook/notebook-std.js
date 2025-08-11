import { getType } from "../src/values.js";
import { Func } from "../src/func.js";
import { std } from "../std/std.js";
import { Panic } from "../src/panic.js";
import { Env } from "../src/env.js";
import { OrderedMap } from "immutable";

function handleUnavailable() {
  throw new Panic("not available in notebook mode");
}

const unavailable = ["console", "fs"].map((s) => s + ".");

function convert(value, shims) {
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

export function makeStd() {
  const printed = [];

  const shims = {
    "console.print": (value) => {
      printed.push(value);
      return value;
    },
  };

  const defs = {};

  for (const [name, value] of std.defs) {
    defs[name] = convert(value, shims);
  }

  const env = new Env(null, new Map(Object.entries(defs))).spawn();
  return { env, printed };
}
