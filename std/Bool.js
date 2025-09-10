import { checkType } from "../src/values.js";

export function toNum(boolean) {
  // Convert `true` to `1` and `false` to `0`.
  //
  // ```ptls
  // Bool.toNum(false)
  // Bool.toNum(true)
  // ```

  checkType(boolean, "boolean");
  return boolean ? 1 : 0;
}
