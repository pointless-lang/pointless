import { checkType } from "../../src/values.js";
import { Panic } from "../../src/panic.js";
import { Err } from "../../src/err.js";
import { is, OrderedMap } from "immutable";

export const _docs =
  "Functions for writing tests and verifying program behavior.";

export function assert(predicate) {
  // Panic if the boolean `predicate` is `false`.
  //
  // ```ptls
  // inches = 15
  // assert(inches >= 0)
  // ```
  //
  // ```ptls --panics
  // assert(inches < 12)
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
  // test.runs(fn() inverse(10) end)
  // test.runs(fn() inverse(0) end)
  // ```

  try {
    await func.call();
    return OrderedMap({ status: "pass" });
  } catch (err) {
    return OrderedMap({ status: "fail", panic: String(err) });
  }
}

export async function equals(actual, expected) {
  // Check that `actual` equals `expected`.
  //
  // ```ptls
  // test.equals(2 + 2, 4)
  // test.equals(1 + 1, 11)
  // ```

  if (is(actual, expected)) {
    return OrderedMap({ status: "pass" });
  }

  return OrderedMap({ status: "fail", expected, got: actual });
}

export async function returns(func, expected) {
  // Check that `func` returns `expected`.
  //
  // ```ptls
  // test.returns(fn() 2 + 2 end, 4)
  // test.returns(fn() 1 + 1 end, 11)
  // test.returns(fn() 0 / 0 end, 0)
  // ```

  try {
    const actual = await func.call();

    if (is(actual, expected)) {
      return OrderedMap({ status: "pass" });
    }

    return OrderedMap({ status: "fail", expected, got: actual });
  } catch (err) {
    return OrderedMap({ status: "fail", panic: String(err) });
  }
}

export async function throws(func, payload) {
  // Check that `func` throws an error containing `payload`.
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
  // test.throws(fn() inverse(0) end, "n must not be zero")
  // test.throws(fn() inverse(0) end, "wrong!")
  // test.throws(fn() inverse(10) end, "n must not be zero")
  // test.throws(fn() inverse("0") end, "n must not be zero")
  // ```

  try {
    const returned = await func.call();
    return OrderedMap({ status: "fail", returned });
  } catch (err) {
    if (err instanceof Err) {
      if (is(err.payload, payload)) {
        return OrderedMap({ status: "pass" });
      }

      return OrderedMap({
        status: "fail",
        expected: payload,
        actual: err.payload,
      });
    }

    return OrderedMap({ status: "fail", panic: String(err) });
  }
}
