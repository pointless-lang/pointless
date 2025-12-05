import { Panic } from "./panic.js";
import { checkType } from "./values.js";

export function checkPositive(n) {
  checkType(n, "number");

  if (Number.isNaN(n) || n < 0) {
    throw new Panic("expected a positive number");
  }

  return n;
}

export function checkWhole(n) {
  checkType(n, "number");

  // NaN doesn't count as whole
  if (!Number.isInteger(n)) {
    throw new Panic("expected a whole number");
  }

  return n;
}

export function checkNumResult(result, ...args) {
  // Result can only be NaN or infinite if one of the operands was
  // NaN is not finite
  if (args.some((arg) => !Number.isFinite(arg))) {
    return result;
  }

  switch (result) {
    case Infinity:
    case -Infinity:
      throw new Panic("result out of range");
  }

  if (Number.isNaN(result)) {
    throw new Panic("invalid numeric result");
  }

  return result;
}
