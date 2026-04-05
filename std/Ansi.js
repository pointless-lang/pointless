import chalk from "chalk";
import { checkType, getType } from "../lang/values.js";
import { Panic } from "../lang/panic.js";
import { hexToRgb } from "./Color.js";
import { get } from "./Obj.js";

function extractRgb(rgb) {
  const [r, g, b] = "rgb".split("").map((c) => {
    const v = get(rgb, c);
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v > 255) {
      throw new Panic("channel value must be an integer between 0 and 255", {
        channel: c,
        value: v,
      });
    }
    return v;
  });
  return { kind: "rgb", r, g, b };
}

function parseColor(color) {
  const type = getType(color);

  if (type === "string") {
    return extractRgb(hexToRgb(color));
  }

  if (type === "number") {
    if (!Number.isInteger(color) || color < 0 || color > 255) {
      throw new Panic("8-bit color code must be an integer between 0 and 255", {
        color,
      });
    }
    return { kind: "index", n: color };
  }

  if (type === "object") {
    return extractRgb(color);
  }

  throw new Panic("color must be a hex string, rgb object, or 8-bit number", {
    $got: type,
  });
}

export function bold(string) {
  // Wrap `string` in bold text. When `bold` is nested inside other `Ansi`
  // functions, the outer style is correctly restored after `string`. Returns
  // `string` unchanged in non-TTY environments.
  //
  // ```ptls --no-eval
  // Ansi = import "std:Ansi"
  // Ansi.bold("Hello")
  // Ansi.fg("#ff8800", Ansi.bold("Hello"))
  // ```

  checkType(string, "string");
  return chalk.bold(string);
}

export function fg(string, color) {
  // Wrap `string` with the given foreground `color`. When `fg` is nested inside
  // other `Ansi` functions (including another `fg`), the outer style is
  // correctly restored after `string`.
  //
  // `color` may be a hex string, an `{ r, g, b }` object, or a numeric 8-bit
  // color code (0-255). 24-bit colors are automatically downcast in
  // environments that don't support truecolor.
  //
  // Returns `string` unchanged in environments that don't support color.
  //
  // ```ptls --no-eval
  // Ansi = import "std:Ansi"
  // Ansi.fg("Hello", "#ff8800")
  // Ansi.fg("Hello", { r: 255, g: 136, b: 0 })
  // Ansi.fg("Hello", 214)
  // Ansi.fg("green " + Ansi.fg("red", "#ff0000") + " green", "#00aa00")
  // ```

  checkType(string, "string");
  const parsed = parseColor(color);

  return parsed.kind === "index"
    ? chalk.ansi256(parsed.n)(string)
    : chalk.rgb(parsed.r, parsed.g, parsed.b)(string);
}

export function bg(string, color) {
  // Wrap `string` with the given background `color`. When `bg` is nested inside
  // other `Ansi` functions (including another `bg`), the outer style is
  // correctly restored after `string`.
  //
  // `color` may be a hex string, an `{ r, g, b }` object, or a numeric 8-bit
  // color code (0-255). 24-bit colors are automatically downcast in
  // environments that don't support truecolor.
  //
  // Returns `string` unchanged in environments that don't support color.
  //
  // ```ptls --no-eval
  // Ansi = import "std:Ansi"
  // Ansi.bg("Hello", "#ff8800")
  // Ansi.bg("Hello", { r: 255, g: 136, b: 0 })
  // Ansi.bg("Hello", 214)
  // Ansi.fg(Ansi.bg("Hello", "#ff8800"), "#ffffff")
  // ```

  checkType(string, "string");
  const parsed = parseColor(color);

  return parsed.kind === "index"
    ? chalk.bgAnsi256(parsed.n)(string)
    : chalk.bgRgb(parsed.r, parsed.g, parsed.b)(string);
}
