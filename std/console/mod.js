import { repr, show } from "../../src/repr.js";
import { checkType } from "../../src/values.js";
import { emitKeypressEvents } from "node:readline";
import { stdin, stdout } from "node:process";
import { Panic } from "../../src/panic.js";
import { getLine } from "../../src/prompt.js";
import { OrderedMap } from "immutable";

export function print(value) {
  // Print `value`, and return `value`.
  //
  // ```ptls --no-eval
  // print("Hello") -- Prints Hello
  // ```

  console.log(show(value));
  return value;
}

export function debug(value) {
  // Print `value`, including quotes if `value` is a string, and return
  // `value`. Useful for debugging and logging.
  //
  // ```ptls --no-eval
  // debug("Hello") -- Prints "Hello"
  // ```

  console.log(repr(value));
  return value;
}

export function write(string) {
  // Print `string` without adding a trailing newline.
  //
  // ```ptls --no-eval
  // write("Hello") -- Prints Hello without a trailing newline
  // ```

  checkType(string, "string");
  stdout.write(string);
  return string;
}

export function error(value) {
  // Print `value` to stderr, and return `value`.
  //
  // ```ptls --no-eval
  // error("Hello") -- Prints Hello to stderr
  // ```

  console.error(show(value));
  return value;
}

export function clear() {
  // Clear the console.
  //
  // ```ptls --no-eval
  // clear() -- Clears the console
  // ```

  console.clear();
  return null;
}

export async function prompt(message) {
  // Prompt the user for input, displaying `message` beforehand. User
  // input is returned as a string.
  //
  // ```ptls --no-eval
  // prompt("Enter your name: ") -- Prompts user for their name
  // ```

  checkType(message, "string");
  return await getLine(message);
}

export async function rawKey() {
  return new Promise((resolve, reject) => {
    emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();

    // Node makes docs for keypress event as difficult a possible to find.
    // https://stackoverflow.com/a/55182456/6680182

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

// export function pauseStdin() {
//   stdin.pause();
// }
