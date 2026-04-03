import { get } from "./Obj.js";
import { checkType } from "../lang/values.js";
import { Panic } from "../lang/panic.js";
import im from "../immutable/immutable.js";

function expand(hex, expectedDigits) {
  checkType(hex, "string");
  let expanded = hex;

  if (hex.startsWith("#")) {
    expanded = expanded.slice(1);
  }

  if (expanded.length === expectedDigits / 2) {
    expanded = expanded.split("").map((c) => c + c).join("");
  }

  if (expanded.length !== expectedDigits) {
    throw new Panic("invalid hex string length", { hex });
  }

  if (!/^[0-9a-fA-F]+$/.test(expanded)) {
    throw new Panic("invalid hex digits", { hex });
  }

  return expanded;
}

export function hexToRgb(hex) {
  // Convert a hex color string to an object `{ r, g, b }` with values (0-255).
  // The `#` prefix is optional. Accepts 3-digit shorthand or 6-digit full form.
  //
  // ```ptls
  // Color = import "std:Color"
  // Color.hexToRgb("#ead9ff")
  // Color.hexToRgb("edf")
  // ```

  const str = expand(hex, 6);

  return im.OrderedMap({
    r: parseInt(str.slice(0, 2), 16),
    g: parseInt(str.slice(2, 4), 16),
    b: parseInt(str.slice(4), 16),
  });
}

export function hexToRgba(hex) {
  // Convert a hex color string to an object with `{ r, g, b, a }` with values
  // (0-255). The `#` prefix is optional. Accepts 4-digit shorthand or 8-digit
  // full form.
  //
  // ```ptls
  // Color = import "std:Color"
  // Color.hexToRgba("#ead9ff80")
  // Color.hexToRgba("edf7")
  // ```

  const str = expand(hex, 8);

  return im.OrderedMap({
    r: parseInt(str.slice(0, 2), 16),
    g: parseInt(str.slice(2, 4), 16),
    b: parseInt(str.slice(4, 6), 16),
    a: parseInt(str.slice(6), 16),
  });
}

function getChannel(rgb, channel) {
  const value = get(rgb, channel);
  checkType(value, "number");

  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new Panic(`channel value must be an integer between 0 and 255`, {
      channel,
      value,
    });
  }

  return value.toString(16).padStart(2, "0");
}

export function rgbToHex(rgb) {
  // Convert an object `{ r, g, b }` with values (0-255) to a 6-digit hex
  // string.
  //
  // ```ptls
  // Color = import "std:Color"
  // Color.rgbToHex({ r: 255, g: 136, b: 0 })
  // ```

  checkType(rgb, "object");
  return "#" + "rgb".split("").map((c) => getChannel(rgb, c)).join("");
}

export function rgbaToHex(rgb) {
  // Convert an object `{ r, g, b, a }` with values (0-255) to an 8-digit hex
  // string.
  //
  // ```ptls
  // Color = import "std:Color"
  // Color.rgbaToHex({ r: 255, g: 136, b: 0, a: 128 })
  // ```

  checkType(rgb, "object");
  return "#" + "rgba".split("").map((c) => getChannel(rgb, c)).join("");
}
