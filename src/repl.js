import { parse } from "./parser.js";
import { tokenize } from "./tokenizer.js";
import { std } from "../std/std.js";
import { show } from "./repr.js";
import { getLine } from "./prompt.js";
import { Panic } from "./panic.js";

// commands: exit, run, ls, cd

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
