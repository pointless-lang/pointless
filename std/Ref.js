import { checkType } from "../lang/values.js";
import { repr } from "./repr.js";

class Ref {
  static ptlsName = "reference";

  constructor(value) {
    this.value = value;
  }

  repr(mode) {
    return `Ref.of(${repr(this.value, mode)})`;
  }
}

export function of(value) {
  // Create a mutable reference containing `value`.
  //
  // ```ptls
  // Ref = import "std:Ref"
  // Ref.of(0)
  // ```

  return new Ref(value);
}

export function get(ref) {
  // Get the value stored in `ref`.
  //
  // ```ptls
  // Ref = import "std:Ref"
  // score = Ref.of(0)
  // Ref.get(score)
  // ```

  checkType(ref, "reference");
  return ref.value;
}

export function set(ref, value) {
  // Update `ref` to store `value`. Return `ref`.
  //
  // ```ptls
  // Ref = import "std:Ref"
  // score = Ref.of(0)
  // Ref.set(score, 1)
  // score
  // ```

  checkType(ref, "reference");
  ref.value = value;
  return ref;
}

export function put(value, ref) {
  // Update `ref` to store `value`. Return `value`.
  //
  // ```ptls
  // Ref = import "std:Ref"
  // score = Ref.of(0)
  // Ref.put(1, score)
  // score
  // ```

  checkType(ref, "reference");
  ref.value = value;
  return value;
}
