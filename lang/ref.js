import { repr } from "./repr.js";

export class Ref {
  static ptlsName = "reference";

  constructor(value) {
    this.value = value;
  }

  repr(mode) {
    return `Ref.of(${repr(this.value, mode)})`;
  }
}
