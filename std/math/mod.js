import { checkType, getType } from "../../src/values.js";
import { checkPositive, checkNumResult, checkWhole } from "../../src/num.js";
import { Panic } from "../../src/panic.js";

export const _docs = "Mathematical functions and constants.";

export const _consts = {
  e: "Euler's number.",
  inf: "Floating-point infinity.",
  nan: '"Not a number". [Cursed floating-point nonsense](https://stackoverflow.com/questions/1565164/what-is-the-rationale-for-all-comparisons-returning-false-for-ieee754-nan-values).',
  pi: "The constant π (pi).",
  tau: "`2 * math.pi`. See [The Tau Manifesto](https://www.tauday.com/tau-manifesto).",
};

export const pi = Math.PI;
export const tau = pi * 2;
export const e = Math.E;
export const inf = Infinity;
export const nan = NaN;

export function isInt(n) {
  // Check whether `n` is an integer (whole number).
  //
  // ```ptls
  // math.isInt(42)
  // math.isInt(3.14)
  // ```

  checkType(n, "number");
  return Number.isInteger(n);
}

export function toNum(value) {
  // Convert `value` to a number, where `value` is a string or boolean.
  //
  // ```ptls
  // math.toNum("45.67")
  // math.toNum(true)
  // math.toNum(false)
  // ```

  checkType(value, "boolean", "string");

  if (getType(value) === "boolean") {
    return value ? 1 : 0;
  }

  const result = Number(value);

  if (value === "" || Number.isNaN(result)) {
    throw new Panic("invalid number string", { value });
  }

  return result;
}

export function abs(n) {
  // Return the absolute value of `n`.
  //
  // ```ptls
  // math.abs(-10)
  // ```

  checkType(n, "number");
  return Math.abs(n);
}

export function floor(n) {
  // Round `n` down to the nearest integer.
  //
  // ```ptls
  // math.floor(1.5)
  // ```

  checkType(n, "number");
  return Math.floor(n);
}

export function ceil(n) {
  // Round `n` up to the nearest integer.
  //
  // ```ptls
  // math.ceil(1.5)
  // ```

  checkType(n, "number");
  return Math.ceil(n);
}

export function round(n) {
  // Round `n` to the nearest integer using [banker's rounding](https://en.wikipedia.org/wiki/Rounding#Rounding_half_to_even).
  //
  // ```ptls
  // math.round(3.14)
  // math.round(2.5)
  // math.round(3.5)
  // ```

  checkType(n, "number");

  if (n % 1 === 0.5) {
    const floor = Math.floor(n);
    return floor % 2 === 0 ? floor : floor + 1;
  }

  return Math.round(n);
}

export function roundTo(n, decimals) {
  // Round `n` to `decimals` places using [banker's rounding](https://en.wikipedia.org/wiki/Rounding#Rounding_half_to_even)
  // If `decimals` is negative then rounding is done to the corresponding
  // power of `10`.
  //
  // ```ptls
  // math.roundTo(17.45, 1)
  // math.roundTo(17.45, -1)
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
  // math.min(-17, 7)
  // ```

  checkType(a, "number");
  checkType(b, "number");
  return Math.min(a, b);
}

export function max(a, b) {
  // Return the maximum of `a` and `b`.
  //
  // ```ptls
  // math.max(-17, 7)
  // ```

  checkType(a, "number");
  checkType(b, "number");
  return Math.max(a, b);
}

export function clamp(n, min, max) {
  // Clamp `n` within the range `min` and `max`.
  //
  // ```ptls
  // math.clamp(17, 10, 20)
  // math.clamp(21, 10, 20)
  // math.clamp(9, 10, 20)
  // ```

  checkType(n, "number");
  checkType(min, "number");
  checkType(max, "number");
  return Math.max(min, Math.min(max, n));
}

export function sign(n) {
  // Return the sign of `n`.
  //
  // ```ptls
  // math.sign(7)
  // math.sign(-7)
  // math.sign(0)
  // ```

  checkType(n, "number");
  return Math.sign(n);
}

export function isEven(n) {
  // Check whether an integer `n` is even.
  //
  // ```ptls
  // math.isEven(-6)
  // math.isEven(-7)
  // ```

  checkWhole(n);
  return n % 2 === 0;
}

export function isOdd(n) {
  // Check whether an integer `n` is odd.
  //
  // ```ptls
  // math.isOdd(-6)
  // math.isOdd(-7)
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
  // math.sqrt(2)
  // ```

  checkType(n, "number");
  checkPositive(n);
  return Math.sqrt(n);
}

export function acos(n) {
  // Return the arccosine (inverse cosine) of `n`, in radians.
  //
  // ```ptls
  // math.acos(0)
  // math.acos(1)
  // ```

  checkType(n, "number");
  return checkNumResult(Math.acos(n));
}

export function asin(n) {
  // Return the arcsine (inverse sine) of `n`, in radians.
  //
  // ```ptls
  // math.asin(0)
  // math.asin(1)
  // ```

  checkType(n, "number");
  return checkNumResult(Math.asin(n));
}

export function atan(n) {
  // Return the arctangent (inverse tangent) of `n`, in radians.
  //
  // ```ptls
  // math.atan(0)
  // math.atan(1)
  // ```

  checkType(n, "number");
  return Math.atan(n);
}

export function atan2(y, x) {
  // Return the arctangent (inverse tangent) of `y / x`, using the signs
  // to determine the correct quadrant.
  //
  // ```ptls
  // math.atan2(1, 1)
  // math.atan2(1, -1)
  // ```

  checkType(y, "number");
  checkType(x, "number");
  return Math.atan2(y, x);
}

export function ln(n) {
  // Return the natural logarithm (base e) of `n`.
  //
  // ```ptls
  // math.ln(math.e ** 5)
  // ```

  checkType(n, "number");
  checkPositive(n, "number");
  return Math.log(n);
}

export function log10(n) {
  // Return the base-10 logarithm of `n`.
  //
  // ```ptls
  // math.log10(100)
  // ```

  return ln(n) / Math.LN10;
}

export function log2(n) {
  // Return the base-2 logarithm of `n`.
  //
  // ```ptls
  // math.log2(256)
  // ```

  return ln(n) / Math.LN2;
}

export function logBase(a, b) {
  // Return the logarithm of `a` with base `b`.
  //
  // ```ptls
  // math.logBase(625, 5)
  // ```

  return ln(a) / ln(b);
}

export function cos(n) {
  // Return the cosine of `n` radians.
  //
  // ```ptls
  // math.cos(math.pi / 3)
  // ```

  checkType(n, "number");
  return Math.cos(n);
}

export function sin(n) {
  // Return the cosine of `n` radians.
  //
  // ```ptls
  // math.sin(math.pi / 6)
  // ```

  checkType(n, "number");
  return Math.sin(n);
}

export function tan(n) {
  // Return the tangent of `n` (in radians).
  //
  // ```ptls
  // math.tan(math.pi / 3)
  // ```

  checkType(n, "number");
  return Math.tan(n);
}

export function toDegrees(radians) {
  // Convert `radians` to degrees.
  //
  // ```ptls
  // math.toDegrees(math.pi)
  // ```

  checkType(radians, "number");
  return (radians * 180) / Math.PI;
}

export function toRadians(degrees) {
  // Convert `degrees` to radians.
  //
  // ```ptls
  // math.toRadians(180)
  // ```

  checkType(degrees, "number");
  return (degrees * Math.PI) / 180;
}
