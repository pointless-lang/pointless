import { getType } from "../src/values.js";

export function orElse(value, $default) {
  // Return `default` if `value` is `none`, otherwise return `value`.
  //
  // ```ptls
  // None.orElse(none, "txt")
  // None.orElse("png", "txt")
  // ```

  return getType(value) === "none" ? $default : value;
}
