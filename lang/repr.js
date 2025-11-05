import { getType } from "./values.js";

const plainKey = /^[a-zA-Z][a-zA-Z0-9]*$/;
const numeric = /^-?\.?[0-9]/;
const padded = /^\s|\s$/;
const invisible = /(?! )[\p{C}\p{Z}]/gu;

function escapeInvisible(char) {
  // Use unicode escapes for weird chars like '\v' instead of JS hex escapes
  return `\\u{${char.codePointAt(0).toString(16)}}`;
}

export async function reprEach(values, options = {}) {
  const result = [];

  for (const value of values) {
    result.push(await repr(value, options));
  }

  return result;
}

export async function repr(value, options = {}) {
  const { rawStr = false, compact = false, show = true, soft = false } =
    options;

  if (getType(value) === "string") {
    if (rawStr) {
      // leave out quotes and escapes
      return value;
    }

    const escaped = value
      .replaceAll("\\", "\\\\")
      .replaceAll('"', '\\"')
      .replaceAll("\n", "\\n")
      .replaceAll("\r", "\\r")
      .replaceAll("\t", "\\t")
      .replaceAll(invisible, escapeInvisible);

    if (
      !soft ||
      escaped !== value ||
      escaped === "none" ||
      escaped === "true" ||
      escaped === "false" ||
      escaped.includes("\\") ||
      numeric.test(escaped) ||
      padded.test(escaped) ||
      invisible.test(escaped)
    ) {
      return `"${escaped}"`;
    }

    return value;
  }

  options = { ...options, rawStr: false, soft: false };

  switch (getType(value)) {
    case "boolean":
    case "number":
      if (Number.isNaN(value)) {
        return "Math.nan";
      }

      switch (value) {
        case Infinity:
          return "Math.inf";
        case -Infinity:
          return "-Math.inf";
      }

      return value.toString();

    case "none":
      return "none";

    case "list":
      return formatElems("[", "]", await reprEach(value, options), compact);

    case "set":
      return formatElems(
        "Set.of([",
        "])",
        await reprEach(value, options),
        compact,
      );

    case "object": {
      if (show && value.has("@show")) {
        const func = value.get("@show");
        return await func.call(value);
      }

      const entryStrs = [];
      const isRecord = value
        .keySeq()
        .every((key) => getType(key) === "string" && plainKey.test(key));

      for (const [key, val] of value) {
        let valStr = await repr(val, options);

        if (valStr.includes("\n")) {
          switch (getType(val)) {
            case "list":
            case "object":
              valStr = " " + valStr;
              break;
            default:
              valStr = indent("\n" + valStr);
          }
        } else {
          valStr = " " + valStr;
        }

        if (isRecord) {
          entryStrs.push(`${key}:${valStr}`);
        } else {
          switch (getType(key)) {
            case "none":
            case "boolean":
              entryStrs.push(`(${await repr(key, options)}):${valStr}`);
              break;
            default:
              entryStrs.push(`${await repr(key, options)}:${valStr}`);
          }
        }
      }

      return formatElems("{ ", " }", entryStrs, compact);
    }

    default:
      return value?.repr ? await value.repr(options) : String(value);
  }
}

function indent(string) {
  return string
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

function calcLength(strings) {
  // Rough estimate, dosen't factor in spacing or grouping symbols
  return strings.map((s) => s.length).reduce((a, b) => a + b, 0);
}

function formatElems(start, end, strings, compact) {
  if (strings.length === 0) {
    return start.trim() + end.trim();
  }

  if (compact || calcLength(strings) < 70) {
    return `${start}${strings.join(", ")}${end}`;
  }

  const elems = strings.map((line) => `${indent(line)},`).join("\n");

  // trim to get rid of padding for "{ " and " }"
  return `${start.trim()}\n${elems}\n${end.trim()}`;
}
