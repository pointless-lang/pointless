import { Ref } from "../src/ref.js";
import { checkType } from "../src/values.js";

export const _docs = `
Work with mutable state.

The core data structure in Pointless are immutable. References serve as
mutable wrappers around these values, allowing programs to be designed
using mutability.
`;

export function of(value) {
  // Create a mutable reference cell containing `value`.
  //
  // ```ptls
  // ref.of(0)
  // ```
  //
  // *Note that references must not reference themselves (aka circular
  // references) as this could cause memory leaks and infinite recursion.*

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
