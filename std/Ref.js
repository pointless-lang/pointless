import { Ref } from "../lang/ref.js";
import { checkType } from "../lang/values.js";

export function of(value) {
  // Create a mutable reference containing `value`.
  //
  // ```ptls
  // Ref.of(0)
  // ```

  return new Ref(value);
}

export function get(ref) {
  // Get the value stored in `ref`.
  //
  // ```ptls
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
  // score = Ref.of(0)
  // Ref.put(1, score)
  // score
  // ```

  checkType(ref, "reference");
  ref.value = value;
  return value;
}
