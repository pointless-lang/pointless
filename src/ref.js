import { repr } from "./repr.js";

export class Ref {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return `Ref.of(${repr(this.value)})`;
  }
}
