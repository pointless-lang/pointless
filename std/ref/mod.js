import { Ref } from "../../src/ref.js";
import { checkType } from "../../src/values.js";

export function of(value) {
  // Create a mutable reference cell containing `value`.
  //
  // Note that references they must not contain themselves (aka circular
  // references) as this could cause memory leaks and infinite recursion.
  //
  // ```ptls
  // ref.of(0)
  // ```

  return new Ref(value);
}

export function get(reference) {
  // Get the value stored in `reference`.
  //
  // ```ptls
  // score = ref.of(0)
  // ref.get(score)
  // ```

  checkType(reference, "reference");
  return reference.value;
}

export async function set(reference, value) {
  // Update `reference` to store `value`. Return `reference`.
  //
  // ```ptls
  // score = ref.of(0)
  // ref.set(score, 1)
  // score
  // ```

  checkType(reference, "reference");
  reference.value = value;
  return reference;
}

export async function put(value, reference) {
  // Update `reference` to store `value`. Return `value`.
  //
  // ```ptls
  // score = ref.of(0)
  // ref.put(1, score)
  // ```

  checkType(reference, "reference");
  reference.value = value;
  return value;
}
