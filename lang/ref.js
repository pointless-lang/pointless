import { repr } from "./repr.js";

export class Ref {
  static ptlsName = "reference";

  constructor(value) {
    this.value = value;
  }

  toString() {
    return `Ref.of(${repr(this.value)})`;
  }
}
