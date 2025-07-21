import { checkType } from "../../src/values.js";
import { Panic } from "../../src/panic.js";
import { repr } from "../../src/repr.js";

class Err extends Panic {
  constructor(value) {
    super("unhandled error", { value });
  }
}

export function assert(predicate) {
  // Panic if `predicate` is `false`.
  //
  // ```ptls --panics
  // age = -17
  // assert(age >= 0)
  // ```

  checkType(predicate, "boolean");

  if (!predicate) {
    throw new Panic("assertion error");
  }

  return null;
}

export function $throw(value) {
  // Throw an error with payload `value`.
  //
  // ```ptls --panics
  // fn getFirst(values)
  //   if isEmpty(values) then
  //     err.throw("values may not be empty")
  //   end
  //    
  //   values[0]
  // end
  // 
  // getFirst([])
  // ```

  throw new Err(value);
}

export async function $catch(func, handler) {
  // Call the zero-argument function `func`. If `func` throws an error,
  // return `handler(payload)` where `payload` is the error payload. If
  // no error is thrown then return the value returned from `func`.
  //
  // ```ptls
  // fn getFirst(values)
  //   if isEmpty(values) then
  //     err.throw("values may not be empty")
  //   end
  //    
  //   values[0]
  // end
  // 
  // err.catch(
  //   fn() getFirst([]) end,
  //   fn(payload) none end
  // )
  // ```

  checkType(func, "function");
  checkType(handler, "function");

  try {
    await func.call();
  } catch (err) {
    if (err instanceof Err) {
      return await handler.call(err);
    }

    throw err;
  }
}
