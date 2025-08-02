import { checkType } from "../../src/values.js";
import { Panic } from "../../src/panic.js";

export const _modDocs = `
Miscellaneous useful functions.
`;

export function assert(predicate) {
  // Panic if the boolean `predicate` is `false`.
  //
  // ```ptls
  // inches = 15
  // assert(inches >= 0)
  // ```
  //
  // ```ptls --panics
  // assert(inches < 12)
  // ```

  checkType(predicate, "boolean");

  if (!predicate) {
    throw new Panic("assertion error");
  }

  return null;
}

export async function sleep(ms) {
  // Pause the current execution branch for `ms` milliseconds.
  //
  // ```ptls --no-eval
  // sleep(1000) -- Pause for 1 second
  // ```

  await new Promise((next) => setTimeout(next, ms));
  return null;
}
