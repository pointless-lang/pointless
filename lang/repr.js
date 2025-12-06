import { getType } from "./values.js";
import { ident } from "./tokenizer.js";

const invisible = /(?! )[\p{C}\p{Z}]/gu;

function escapeInvisible(char) {
  // Use unicode escapes for weird chars like '\v' instead of JS hex escapes
  return `\\u{${char.codePointAt(0).toString(16)}}`;
}

// Modes: compact, normal, pretty

export function repr(value, mode = "normal", raw = false) {
  if (getType(value) === "string") {
    if (raw) {
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

    return `"${escaped}"`;
  }

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
      return formatElems(
        "[",
        "]",
        value.map((v) => repr(v, mode)),
        mode,
      );

    case "set":
      return formatElems(
        "#[",
        "]",
        value.map((v) => repr(v, mode)),
        mode,
      );

    case "object": {
      const entryStrs = [];

      const isRecord = value
        .keySeq()
        .every((key) => getType(key) === "string" && ident.test(key));

      for (const [key, val] of value) {
        let valStr = repr(val, mode);

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
              entryStrs.push(`(${repr(key, mode)}):${valStr}`);
              break;
            default:
              entryStrs.push(`${repr(key, mode)}:${valStr}`);
          }
        }
      }

      return formatElems("{ ", " }", entryStrs, mode);
    }

    default:
      return value.repr?.(mode) ?? String(value);
  }
}

export function indent(string) {
  return string
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

function calcLength(strings) {
  // Rough estimate, doesn't factor in spacing or grouping symbols
  return strings.map((s) => s.length).reduce((a, b) => a + b, 0);
}

function formatElems(start, end, strings, mode) {
  if (strings.length === 0) {
    return start.trim() + end.trim();
  }

  if (mode === "compact" || calcLength(strings) < 70) {
    return `${start}${strings.join(", ")}${end}`;
  }

  const elems = strings.map((line) => `${indent(line)},`).join("\n");

  // trim to get rid of padding for "{ " and " }"
  return `${start.trim()}\n${elems}\n${end.trim()}`;
}
