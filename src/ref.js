import { repr } from "./repr.js";

export class Ref {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return `ref.of(${repr(this.value)})`;
  }
}
