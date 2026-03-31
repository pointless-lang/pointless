#!/usr/bin/env node

import { AsyncRepl } from "./repl.js";
import { tokenize } from "../lang/tokenizer.js";
import { Highlighter } from "../utils/highlight.js";

const solarizedTheme = {
  call: "38;139;210", // blue
  std: "38;139;210", // blue
  string: "133;153;0", // green
  quotes: "133;153;0", // green
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

function termHighlight(source) {
  try {
    const { annotated } = new Highlighter(tokenize("repl", source));

    return annotated
      .map(({ className, value }) => {
        const rgb = solarizedTheme[className];
        return rgb ? `\x1b[38;2;${rgb}m${value}\x1b[0m` : value;
      })
      .join("");
  } catch {
    return null; // tokenizer failed on incomplete input — show plain
  }
}

// Simulates async eval — supports a few demo commands to exercise the REPL
async function handler(input) {
  const trimmed = input.trim();

  // Simulate a slow async operation
  if (trimmed === "slow") {
    await new Promise((r) => setTimeout(r, 2000));
    return "done (took 2s)";
  }

  // Test nested prompt via getLine
  if (trimmed === "ask") {
    const name = await repl.getLine("What is your name? ");
    const color = await repl.getLine("Favorite color? ");
    return `Hello ${name}, you like ${color}!`;
  }

  // Test deeply nested prompts
  if (trimmed === "deep") {
    const answers = [];
    for (let i = 1; i <= 3; i++) {
      answers.push(await repl.getLine(`Question ${i}: `));
    }
    return `You said: ${answers.join(", ")}`;
  }

  // Test error handling
  if (trimmed === "err") {
    throw new Error("something went wrong");
  }

  // Strip continuation slashes before eval
  const cleaned = input.replace(/\\\n/g, "\n");

  // Simulate async eval for any JS expression
  await Promise.resolve();
  try {
    console.log(String(eval(cleaned)));
  } catch {
    console.log(`unknown command: ${cleaned.trim()}`);
  }
}

// Simple multi-line: incomplete if line ends with "\"
function isComplete(buffer) {
  const lines = buffer.split("\n");
  return !lines[lines.length - 1].endsWith("\\");
}

const historyPath = `${import.meta.dirname}/../.repl-history.json`;

const repl = new AsyncRepl({
  prompt: "\x1b[38;2;88;110;117m>> \x1b[0m",
  continuationPrompt: "\x1b[38;2;88;110;117m.. \x1b[0m",
  historyPath,
  isComplete,
  handler,
  highlight: termHighlight,
});

console.log("AsyncRepl demo — try these commands:");
console.log("  ask       nested prompts (name + color)");
console.log("  deep      three nested prompts in a loop");
console.log("  slow      async eval (2s delay, try Ctrl+C to cancel)");
console.log("  err       throw an error");
console.log("  1 + 2     eval JS expressions");
console.log("  line\\     multi-line (end a line with \\ to continue)");
console.log();

repl.start();
