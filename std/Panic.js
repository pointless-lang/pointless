import { checkType } from "../lang/values.js";
import { Panic } from "../lang/panic.js";

export function raise(message) {
  // Raise a panic with the given `message` string.
  //
  // ```ptls --panics
  // score = -10
  //
  // if score < 0 then
  //   Panic.raise("score should never be negative")
  // end
  // ```

  checkType(message, "string");
  throw new Panic(message);
}

export function unreachable() {
  // Raise a panic indicating an unexpected program state.
  //
  // ```ptls --panics
  // score = -10
  //
  // if score >= 0 then
  //   score /= 2
  // else
  //   Panic.unreachable()
  // end
  // ```

  throw new Panic("encountered unreachable code");
}

export function unimplemented() {
  // Raise a panic indicating an unfinished implementation.
  //
  // ```ptls --panics
  // score = 101
  //
  // if score > 100 then
  //   Panic.unimplemented()
  // end
  // ```

  throw new Panic("not implemented");
}
