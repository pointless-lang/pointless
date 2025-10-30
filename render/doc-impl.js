import { checkType, getType } from "../lang/values.js";
import { Func } from "../lang/func.js";
import { Panic } from "../lang/panic.js";
import { repr } from "../lang/repr.js";
import { impl as baseImpl } from "../runtime/impl.js";

function handleUnavailable() {
  throw new Panic("not available in docs mode");
}

function exclude(mod) {
  for (const [name, value] of Object.entries(mod)) {
    if (getType(value) === "function") {
      mod[name] = new Func(handleUnavailable, value.name, value.params);
    }
  }
}

export const impl = {};

for (const [modName, mod] of Object.entries(baseImpl)) {
  // Copy to avoid mutating original impl object
  impl[modName] = { ...mod };
}

exclude(impl.Async);
exclude(impl.Console);
exclude(impl.Fs);

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

impl.Console.write = (value) => {
  checkType(value, "string");
  shimConsole.print(value, "");
  return value;
};

impl.Console.error = async (value) => {
  shimConsole.print(await repr(value, { rawStr: true }));
  return value;
};

impl.Console.print = async (value) => {
  shimConsole.print(await repr(value, { rawStr: true }));
  return value;
};

impl.Console.debug = async (value) => {
  shimConsole.print(await repr(value));
  return value;
};

impl.Console.prompt = (message) => {
  checkType(message, "string");
  const input = shimConsole.inputs.shift() ?? "";
  shimConsole.output.push(`${message}${input}\n`);
  return input;
};
