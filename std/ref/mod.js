import { Ref } from "../../src/ref.js";
import { checkType } from "../../src/values.js";

export function of(value) {
  return new Ref(value);
}

export function get(ref) {
  checkType(ref, "ref");
  return ref.value;
}

export async function set(ref, value) {
  checkType(ref, "ref");
  ref.value = value;
  return ref;
}

export async function put(value, ref) {
  checkType(ref, "ref");
  ref.value = value;
  return value;
}
