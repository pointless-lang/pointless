import { getType } from "../lang/values.js";

export function of(value) {
  return getType(value);
}
