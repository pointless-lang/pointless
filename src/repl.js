import { parse } from "./parser.js";
import { tokenize } from "./tokenizer.js";
import { std } from "../std/std.js";
import { show } from "./repr.js";
import { getLine } from "./prompt.js";
import { Panic } from "./panic.js";

// This repl doesn't support multi line statements or expressions.
// It should but it's limited by the behavior of node's readline functionality.
// Issue is that when pasting multiple lines readline echos subsequent lines
// immediately which ends up interleaving input code with output text.
//
// Minimal version of the issue:
//
// import readline from "node:readline/promises";
// import { stdin, stdout } from "node:process";
//
// const rl = readline.createInterface({ input: stdin, output: stdout });
//
// stdout.write("> ");
//
// rl.on("line", async (line) => {
//   // await undefined;
//   console.log("echo:", line);
//   stdout.write("> ");
// });
//
// If I paste in
//
// 1
// 2
// 3
// 4
//
// This code will end up displaying
//
// > 1
// 2
// 3
// 4
// echo: 1
// > echo: 2
// > echo: 3
// > echo: 4
// > 
//
// Instead of this result (what you'd get without async)
//
// > 1
// echo: 1
// > 2
// echo: 2
// > 3
// echo: 3
// > 4
// echo: 4
// >
//
// Not sure how to make readline wait to echo next lines until processing
// of previous lines is done.

// To Do: add commands: exit, run, ls, cd

const env = std.spawn();

export async function repl() {
  // very silly default behavior from eslint here imo
  // https://github.com/eslint/eslint/issues/5477
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const input = await getLine(">> ");
      await runInput(input);
    } catch (err) {
      if (err instanceof Panic) {
        if (err.message === "EOF interrupt") {
          return;
        }

        console.log(String(err));
      } else {
        throw err;
      }
    }
  }
}

async function runInput(input) {
  const statements = parse(tokenize("repl", input));

  // mimic Python repl behavior of handling multiple
  // inline statements separately
  for (const statement of statements) {
    const ans = await env.eval(statement);

    if (statement.type !== "def") {
      console.log(show(ans));
      env.defs.set("ans", ans);
    }
  }
}
