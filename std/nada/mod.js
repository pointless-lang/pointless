import { getType } from "../../src/values.js";

export function orElse(value, $default) {
  // Return `default` if `value` is `none`, otherwise return `value`.
  //
  // ```ptls
  // nada.orElse("pdf", "txt")
  // nada.orElse(none, "txt")
  // ```

  return getType(value) === "none" ? $default : value;
}
