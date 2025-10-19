import { checkType } from "../lang/values.js";
import { Panic } from "../lang/panic.js";
import { Err } from "../lang/err.js";
import im from "../immutable/immutable.js";

export function assert(predicate) {
  // Panic if the boolean `predicate` is `false`.
  //
  // ```ptls
  // assert(1 + 1 == 2)
  // ```
  //
  // ```ptls --panics
  // assert(1 + 1 == 11)
  // ```

  checkType(predicate, "boolean");

  if (!predicate) {
    throw new Panic("assertion error");
  }

  return null;
}

export async function runs(func) {
  // Check that `func` runs without panicking or throwing an error.
  //
  // ```ptls
  // fn inverse(n)
  //   assert(n != 0)
  //   1 / n
  // end
  //
  // Test.runs(fn() inverse(10) end)
  // Test.runs(fn() inverse(0) end)
  // ```

  try {
    await func.call();
    return im.OrderedMap({ status: "pass" });
  } catch (err) {
    return im.OrderedMap({ status: "fail", panic: String(err) });
  }
}

export function equals(actual, expected) {
  // Check that `actual` equals `expected`.
  //
  // ```ptls
  // Test.equals(2 + 2, 4)
  // Test.equals(1 + 1, 11)
  // ```

  if (im.is(actual, expected)) {
    return im.OrderedMap({ status: "pass" });
  }

  return im.OrderedMap({ status: "fail", expected, got: actual });
}

export async function returns(func, expected) {
  // Check that `func` returns `expected`.
  //
  // ```ptls
  // Test.returns(fn() 2 + 2 end, 4)
  // Test.returns(fn() 1 + 1 end, 11)
  // Test.returns(fn() 0 / 0 end, 0)
  // ```

  try {
    const actual = await func.call();

    if (im.is(actual, expected)) {
      return im.OrderedMap({ status: "pass" });
    }

    return im.OrderedMap({ status: "fail", expected, got: actual });
  } catch (err) {
    return im.OrderedMap({ status: "fail", panic: String(err) });
  }
}

export async function throws(func, payload) {
  // Check that `func` throws an error containing `payload`.
  //
  // ```ptls
  // fn inverse(n)
  //   if n == 0 then
  //     Err.throw("n must not be zero")
  //   end
  //
  //   1 / n
  // end
  //
  // Test.throws(fn() inverse(0) end, "n must not be zero")
  // Test.throws(fn() inverse(0) end, "wrong!")
  // Test.throws(fn() inverse(10) end, "n must not be zero")
  // Test.throws(fn() inverse("0") end, "n must not be zero")
  // ```

  try {
    const returned = await func.call();
    return im.OrderedMap({ status: "fail", returned });
  } catch (err) {
    if (err instanceof Err) {
      if (im.is(err.payload, payload)) {
        return im.OrderedMap({ status: "pass" });
      }

      return im.OrderedMap({
        status: "fail",
        expected: payload,
        actual: err.payload,
      });
    }

    return im.OrderedMap({ status: "fail", panic: String(err) });
  }
}
