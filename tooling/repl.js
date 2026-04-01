import { AsyncRepl } from "./repl-lib.js";
import { tokenize } from "../lang/tokenizer.js";
import { parse } from "../lang/parser.js";
import { repr } from "../lang/repr.js";
import { Incomplete, Panic } from "../lang/panic.js";
import { Highlighter } from "../utils/highlight.js";
import { installRepl } from "../std/Console.js";

const solarizedTheme = {
  call: "38;139;210", // blue
  std: "38;139;210", // blue
  string: "133;153;0", // green
  quotes: "133;153;0", // green
  unmatchedQuote: "133;153;0", // green
  comment: "88;110;117", // gray
  keyword: "211;54;130", // magenta
  interpolated: "211;54;130", // magenta
  escape: "42;161;152", // cyan
  function: "42;161;152", // cyan
  argument: "181;137;0", // yellow
  number: "181;137;0", // yellow
  operator: "203;75;22", // orange
  constant: "220;50;47", // red
};

function addColor(string, className) {
  return className
    ? `\x1b[38;2;${solarizedTheme[className]}m${string}\x1b[0m`
    : string;
}

function getAnsi(source) {
  const { annotated } = new Highlighter(tokenize("repl", source));

  return annotated
    .map(({ value, className }) => addColor(value, className))
    .join("");
}

function isComplete(input) {
  try {
    parse(tokenize("repl", input));
    return true;
  } catch (err) {
    if (err instanceof Incomplete) {
      return false;
    }

    if (err instanceof Panic) {
      return true;
    }

    throw err;
  }
}

async function runInput(input, env, signal) {
  env.runtime.addSignal(signal);

  try {
    const statements = parse(tokenize("repl", input));

    // Mimic Python repl behavior of handling multiple
    // inline statements separately
    for (const statement of statements) {
      const ans = await env.eval(statement);

      if (statement.type !== "def") {
        console.log(repr(ans, "pretty"));
        env.defs.set("ans", ans);
      }
    }
  } catch (err) {
    if (err instanceof Panic) {
      if (!signal?.aborted) {
        console.log(addColor(String(err), "constant"));
      }
    } else {
      throw err;
    }
  } finally {
    env.runtime.addSignal(null);
  }
}

export async function runRepl(runtime) {
  const env = runtime.spawnEnv();

  const prompt = addColor(">> ", "comment");
  const continuationPrompt = addColor(".. ", "comment");
  const handler = (input, signal) => runInput(input, env, signal);
  const historyPath = `${import.meta.dirname}/../.repl-history.json`;

  const repl = new AsyncRepl({
    prompt,
    continuationPrompt,
    isComplete,
    handler,
    highlight: getAnsi,
    historyPath,
  });

  installRepl(repl);
  await repl.start();
}
