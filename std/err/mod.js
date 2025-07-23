import { checkType } from "../../src/values.js";
import { Panic } from "../../src/panic.js";

class Err extends Panic {
  constructor(payload) {
    super("unhandled error", { payload });
    this.payload = payload;
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

export function $throw(payload) {
  // Throw an error with `payload`.
  //
  // ```ptls --panics
  // fn inverse(n)
  //   if n == 0 then
  //     err.throw("n must not be zero")
  //   end
  //
  //   1 / n
  // end
  //
  // inverse(0)
  // ```

  throw new Err(payload);
}

export async function $catch(func, handler) {
  // Call the zero-argument function `func`. If `func` returns a value
  // without throwing an error, return it; otherwise, call `handler` with
  // the error payload and return `handler(payload)`.
  //
  // ```ptls
  // fn inverse(n)
  //   if n == 0 then
  //     err.throw("n must not be zero")
  //   end
  //
  //   1 / n
  // end
  //
  // fn showErr(msg)
  //   "an error occured: $msg"
  // end
  //
  // err.catch(fn() inverse(5) end, showErr)
  // err.catch(fn() inverse(0) end, showErr)
  // ```

  checkType(func, "function");
  checkType(handler, "function");

  try {
    return await func.call();
  } catch (err) {
    if (err instanceof Err) {
      return await handler.call(err.payload);
    }

    throw err;
  }
}

export async function orElse(func, $default) {
  // Call the zero-argument function `func`. If `func` returns a value
  // without throwing an error, return it; otherwise return `default`.
  //
  // ```ptls
  // fn inverse(n)
  //   if n == 0 then
  //     err.throw("n must not be zero")
  //   end
  //
  //   1 / n
  // end
  //
  // err.orElse(fn() inverse(5) end, none)
  // err.orElse(fn() inverse(0) end, none)
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
