import { repr } from "./repr.js";

export class Ref {
  static ptlsName = "reference";

  constructor(value) {
    this.value = value;
  }

  async repr(options = {}) {
    return `Ref.of(${await repr(this.value, options)})`;
  }
}
