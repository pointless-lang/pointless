import { Panic } from "./panic.js";

export class Err extends Panic {
  constructor(payload) {
    super("unhandled error", { payload });
    this.payload = payload;
  }
}
