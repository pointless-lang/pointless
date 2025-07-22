import { checkType } from "../../src/values.js";
import { Panic } from "../../src/panic.js";

class Err extends Panic {
  constructor(value) {
    super("unhandled error", { value });
    this.value = value;
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
  // return `handler(value)` where `value` is the error value. If
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
  // fn showErr(msg)
  //   "an error occured: $msg"
  // end
  //
  // err.catch(fn() getFirst([0, 1]) end, showErr)
  //
  // err.catch(fn() getFirst([]) end, showErr)
  // ```

  checkType(func, "function");
  checkType(handler, "function");

  try {
    return await func.call();
  } catch (err) {
    if (err instanceof Err) {
      return await handler.call(err.value);
    }

    throw err;
  }
}

export async function orElse(func, $default) {
  // Call the zero-argument function `func`. If `func` throws an error,
  // return `default`, otherwise return the value returned from `func`.
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
  // err.orElse(fn() getFirst([0, 1]) end, none)
  //
  // err.orElse(fn() getFirst([]) end, none)
  // ```

  checkType(func, "function");

  try {
    return await func.call();
  } catch (err) {
    if (err instanceof Err) {
      return $default;
    }

    throw err;
  }
}
