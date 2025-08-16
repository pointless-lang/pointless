import { getType } from "../../src/values.js";
import { Func } from "../../src/func.js";
import { spawnStd } from "../../src/std.js";
import { Panic } from "../../src/panic.js";
import { Env } from "../../src/env.js";

function handleUnavailable() {
  throw new Panic("not available in notebook mode");
}

const unavailable = ["console", "fs", "async"].map((s) => s + ".");

const shims = {};

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

let webStd;

export async function spawnWebStd() {
  if (!webStd) {
    const std = await spawnStd();
    const defs = {};

    for (const [name, value] of std.parent.defs) {
      defs[name] = convert(value);
    }

    webStd = new Env(null, new Map(Object.entries(defs)));
  }

  return webStd.spawn();
}
