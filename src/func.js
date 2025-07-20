import { getType } from "./values.js";
import { Panic } from "./panic.js";

export class Func {
  constructor(handler, name, params) {
    this.params = params;
    this.name = name;
    this.handler = handler;
  }

  async call(...args) {
    if (args.length !== this.params.length) {
      throw new Panic("wrong number of arguments", {
        numArgs: args.length,
        func: this,
      });
    }

    return await this.handler(...args);
  }

  async callCondition(...args) {
    const result = await this.call(...args);
    const $got = getType(result);

    if ($got !== "boolean") {
      throw new Panic("condition function must return boolean", { $got });
    }

    return result;
  }

  toString() {
    return `${this.name}(${this.params.join(", ")})`;
  }
}
