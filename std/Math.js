import { checkType } from "../lang/values.js";
import { checkNumResult, checkPositive, checkWhole } from "../lang/num.js";
import { Panic } from "../lang/panic.js";

export const pi = Math.PI;
export const tau = pi * 2;
export const e = Math.E;
export const inf = Infinity;
export const nan = NaN;

export function isInt(n) {
  // Check whether `n` is an integer (whole number).
  //
  // ```ptls
  // Math.isInt(42)
  // Math.isInt(3.14)
  // ```

  checkType(n, "number");
  return Number.isInteger(n);
}

export function abs(n) {
  // Return the absolute value of `n`.
  //
  // ```ptls
  // Math.abs(-10)
  // ```

  checkType(n, "number");
  return Math.abs(n);
}

export function floor(n) {
  // Round `n` down to the nearest integer.
  //
  // ```ptls
  // Math.floor(1.5)
  // ```

  checkType(n, "number");
  return Math.floor(n);
}

export function ceil(n) {
  // Round `n` up to the nearest integer.
  //
  // ```ptls
  // Math.ceil(1.5)
  // ```

  checkType(n, "number");
  return Math.ceil(n);
}

export function round(n) {
  // Round `n` to the nearest integer using
  // [banker's rounding](https://en.wikipedia.org/wiki/Rounding#Rounding_half_to_even).
  //
  // ```ptls
  // Math.round(3.14)
  // Math.round(2.5)
  // Math.round(3.5)
  // ```

  checkType(n, "number");

  if (n % 1 === 0.5) {
    const floor = Math.floor(n);
    return floor % 2 === 0 ? floor : floor + 1;
  }

  return Math.round(n);
}

export function roundTo(n, decimals) {
  // Round `n` to `decimals` places using
  // [banker's rounding](https://en.wikipedia.org/wiki/Rounding#Rounding_half_to_even).
  // If `decimals` is negative then rounding is done to the corresponding
  // positive power of `10`.
  //
  // ```ptls
  // Math.roundTo(17.45, 1)
  // Math.roundTo(17.45, -1)
  // ```

  checkType(n, "number");
  checkWhole(decimals);

  const factor = 10 ** decimals;
  return round(n * factor) / factor;
}

export function min(a, b) {
  // Return the minimum of `a` and `b`.
  //
  // ```ptls
  // Math.min(-17, 7)
  // ```

  checkType(a, "number");
  checkType(b, "number");
  return Math.min(a, b);
}

export function max(a, b) {
  // Return the maximum of `a` and `b`.
  //
  // ```ptls
  // Math.max(-17, 7)
  // ```

  checkType(a, "number");
  checkType(b, "number");
  return Math.max(a, b);
}

export function clamp(n, min, max) {
  // Clamp `n` within the range `min` and `max`.
  //
  // ```ptls
  // Math.clamp(17, 10, 20)
  // Math.clamp(21, 10, 20)
  // Math.clamp(9, 10, 20)
  // ```

  checkType(n, "number");
  checkType(min, "number");
  checkType(max, "number");
  return Math.max(min, Math.min(max, n));
}

export function wrap(n, start, limit) {
  checkType(n, "number");
  checkType(start, "number");
  checkType(limit, "number");

  if (start >= limit) {
    throw new Panic("start must be less than limit");
  }

  const diff = limit - start;
  const offset = (((n - start) % diff) + diff) % diff;
  return start + offset;
}

export function sign(n) {
  // Return the sign of `n`.
  //
  // ```ptls
  // Math.sign(7)
  // Math.sign(-7)
  // Math.sign(0)
  // ```

  checkType(n, "number");
  return Math.sign(n);
}

export function isEven(n) {
  // Check whether an integer `n` is even.
  //
  // ```ptls
  // Math.isEven(-6)
  // Math.isEven(-7)
  // ```

  checkWhole(n);
  return n % 2 === 0;
}

export function isOdd(n) {
  // Check whether an integer `n` is odd.
  //
  // ```ptls
  // Math.isOdd(-6)
  // Math.isOdd(-7)
  // ```

  checkWhole(n);
  // can't use === 1 since n % 1 will be -1 for negative odd numbers
  // with JS modulo behavior
  return n % 2 !== 0;
}

export function sqrt(n) {
  // Return the square root of a positive number `n`.
  //
  // ```ptls
  // Math.sqrt(2)
  // ```

  checkType(n, "number");
  checkPositive(n);
  return Math.sqrt(n);
}

export function acos(n) {
  // Return the arccosine (inverse cosine) of `n`, in radians.
  //
  // ```ptls
  // Math.acos(0.5) -- Math.pi / 3
  // ```

  checkType(n, "number");
  return checkNumResult(Math.acos(n));
}

export function asin(n) {
  // Return the arcsine (inverse sine) of `n`, in radians.
  //
  // ```ptls
  // Math.asin(0.5) -- Math.pi / 6
  // ```

  checkType(n, "number");
  return checkNumResult(Math.asin(n));
}

export function atan(n) {
  // Return the arctangent (inverse tangent) of `n`, in radians.
  //
  // ```ptls
  // Math.atan(1) -- Math.pi / 4
  // ```

  checkType(n, "number");
  return Math.atan(n);
}

export function atan2(y, x) {
  // Return the arctangent (inverse tangent) of `y / x`, using the signs to
  // determine the correct quadrant.
  //
  // ```ptls
  // Math.atan2(1, -1) -- 3 * Math.pi / 4
  // ```

  checkType(y, "number");
  checkType(x, "number");
  return Math.atan2(y, x);
}

export function ln(n) {
  // Return the natural logarithm (base e) of `n`.
  //
  // ```ptls
  // Math.ln(Math.e ** 5)
  // ```

  checkType(n, "number");
  checkPositive(n, "number");
  return Math.log(n);
}

export function log10(n) {
  // Return the base-10 logarithm of `n`.
  //
  // ```ptls
  // Math.log10(100)
  // ```

  return ln(n) / Math.LN10;
}

export function log2(n) {
  // Return the base-2 logarithm of `n`.
  //
  // ```ptls
  // Math.log2(256)
  // ```

  return ln(n) / Math.LN2;
}

export function logBase(a, b) {
  // Return the logarithm of `a` with base `b`.
  //
  // ```ptls
  // Math.logBase(625, 5)
  // ```

  return ln(a) / ln(b);
}

export function cos(n) {
  // Return the cosine of `n` radians.
  //
  // ```ptls
  // Math.cos(Math.pi / 3)
  // ```

  checkType(n, "number");
  return Math.cos(n);
}

export function sin(n) {
  // Return the cosine of `n` radians.
  //
  // ```ptls
  // Math.sin(Math.pi / 6)
  // ```

  checkType(n, "number");
  return Math.sin(n);
}

export function tan(n) {
  // Return the tangent of `n` (in radians).
  //
  // ```ptls
  // Math.tan(Math.pi / 3)
  // ```

  checkType(n, "number");
  return Math.tan(n);
}

export function toDegrees(radians) {
  // Convert `radians` to degrees.
  //
  // ```ptls
  // Math.toDegrees(Math.pi)
  // ```

  checkType(radians, "number");
  return (radians * 180) / Math.PI;
}

export function toRadians(degrees) {
  // Convert `degrees` to radians.
  //
  // ```ptls
  // Math.toRadians(180)
  // ```

  checkType(degrees, "number");
  return (degrees * Math.PI) / 180;
}
