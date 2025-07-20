import { checkType } from "../../src/values.js";
import { Panic } from "../../src/panic.js";
import { repr } from "../../src/repr.js";

class Err extends Panic {
  constructor(value) {
    super("err", { value });
  }

  toString() {
    return `err(${repr(this.details.value)})`;
  }
}

export function assert(predicate) {
  checkType(predicate, "boolean");

  if (!predicate) {
    throw new Panic("assertion error");
  }

  return null;
}

export function $throw(value) {
  throw new Err(value);
}

export async function $catch(func, handler) {
  checkType(func, "function");
  checkType(handler, "function");

  try {
    await func();
  } catch (err) {
    if (err instanceof Err) {
      return await handler(err);
    }

    throw err;
  }
}
