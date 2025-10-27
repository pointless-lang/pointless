import { repr } from "../lang/repr.js";
import { checkType } from "../lang/values.js";
import { Panic } from "../lang/panic.js";
import { getLine } from "../lang/prompt.js";
import { emitKeypressEvents } from "node:readline";
import { stdin, stdout } from "node:process";
import im from "../immutable/immutable.js";

export function print(value) {
  // Print the string representation of `value` to stdout, followed by a
  // newline, and return `value`. Does not include quotes if `value` is a
  // string. Useful for general-purpose printing.
  //
  // ```ptls
  // print("Hello")
  // print("world")
  // ```

  console.log(repr(value, { rawStr: true }));
  return value;
}

export function debug(value) {
  // Print the string representation of `value` to stdout, followed by a
  // newline, and return `value`. Include quotes if `value` is a string. Useful
  // for debugging and logging.
  //
  // ```ptls
  // Console.debug("Hello")
  // Console.debug("world")
  // ```

  console.log(repr(value));
  return value;
}

export function write(string) {
  // Print `string` to stdout without adding a trailing newline.
  //
  // ```ptls
  // Console.write("Hello")
  // Console.write("world")
  // ```

  checkType(string, "string");
  stdout.write(string);
  return string;
}

export function error(value) {
  // Identical to `debug`, except that the result is sent to stderr rather than
  // stdout.
  //
  // ```ptls
  // Console.error("Hello")
  // Console.error("world")
  // ```

  console.error(repr(value, { rawStr: true }));
  return value;
}

export function clear() {
  // Clear the console.
  //
  // ```ptls --no-eval
  // clear() -- Clear the console
  // ```

  console.clear();
  return null;
}

export async function prompt(message) {
  // Prompt the user for input, displaying the string `message` beforehand. User
  // input is returned as a string.
  //
  // ```ptls --input avery 28
  // prompt("Enter name: ")
  // Str.parse(prompt("Enter age: "))
  // ```

  checkType(message, "string");
  return await getLine(message);
}

export function rawKey() {
  // Read a single keypress from the terminal in raw mode. Return an object with
  // the following keypress event details:
  //
  // - `str`: the character, if printable, or `none`.
  // - `name`: name of the key.
  // - `ctrl`: is <kbd>Ctrl</kbd> pressed.
  // - `meta`: is <kbd>Meta</kbd> pressed.
  // - `shift`: is <kbd>Shift</kbd> pressed.
  // - `sequence`: the raw input sequence.
  //
  // Panics on <kbd>Ctrl</kbd> + <kbd>C</kbd> or <kbd>Ctrl</kbd> + <kbd>D</kbd>.
  //
  // ```ptls --no-eval
  // Console.rawKey() -- Read the next keypress
  // ```
  //
  // Sample outputs:
  //
  // - For <kbd>Ctrl</kbd> + <kbd>A</kbd>:
  //
  //   ```
  //   {
  //     str: "\u0001",
  //     name: "a",
  //     ctrl: true,
  //     meta: false,
  //     shift: false,
  //     sequence: "\u0001",
  //   }
  //   ```
  //
  // - For <kbd>Space</kbd>:
  //
  //   ```
  //   {
  //     str: " ",
  //     name: "space",
  //     ctrl: false,
  //     meta: false,
  //     shift: false,
  //     sequence: " ",
  //   }
  //   ```
  //
  // - For <kbd>Left Arrow</kbd>:
  //
  //   ```
  //   {
  //     str: none,
  //     name: "left",
  //     ctrl: false,
  //     meta: false,
  //     shift: false,
  //     sequence: "\u001b[D",
  //   }
  //   ```

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
        .set("name", key.name)
        .set("ctrl", key.ctrl)
        .set("meta", key.meta)
        .set("shift", key.shift)
        .set("sequence", key.sequence);

      resolve(im.OrderedMap(map));
    });
  });
}

export function pauseStdin() {
  // Temporary workaround for lack of JS promise cancellation.

  stdin.pause();
  return null;
}
