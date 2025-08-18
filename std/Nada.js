import { getType } from "../src/values.js";

export const _docs = "Functions for working with `none`.";

export function orElse(value, $default) {
  // Return `default` if `value` is `none`, otherwise return `value`.
  //
  // ```ptls
  // Nada.orElse(none, "txt")
  // Nada.orElse("png", "txt")
  // ```

  return getType(value) === "none" ? $default : value;
}
