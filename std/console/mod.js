import { repr, show } from "../../src/repr.js";
import { checkType } from "../../src/values.js";
import { emitKeypressEvents } from "node:readline";
import { stdin, stdout } from "node:process";
import { Panic } from "../../src/panic.js";
import { getLine } from "../../src/prompt.js";
import { OrderedMap } from "immutable";

export function print(value) {
  console.log(show(value));
  return value;
}

export function debug(value) {
  console.log(repr(value));
  return value;
}

export function write(string) {
  checkType(string, "string");
  stdout.write(string);
  return string;
}

export function warn(value) {
  console.error(show(value));
  return value;
}

export function clear() {
  console.clear();
  return null;
}

export async function prompt(message) {
  checkType(message, "string");
  return await getLine(message);
}

export async function rawKey() {
  return new Promise((resolve, reject) => {
    emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();

    stdin.once("keypress", (str, key) => {
      stdin.setRawMode(false);
      stdin.pause();

      if (key.ctrl && key.name === "c") {
        console.log();
        reject(new Panic("keyboard interrupt"));
        return;
      }

      if (key.ctrl && key.name === "d") {
        console.log();
        reject(new Panic("EOF interrupt"));
        return;
      }

      const map = new Map()
        .set("str", str ?? null)
        .set("name", key.name ?? null)
        .set("ctrl", key.ctrl)
        .set("meta", key.meta)
        .set("shift", key.shift)
        .set("sequence", key.sequence);

      resolve(OrderedMap(map));
    });
  });
}

export function pauseStdin() {
  stdin.pause();
}
