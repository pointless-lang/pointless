import { checkType } from "../src/values.js";
import { checkWhole, checkPositive } from "../src/num.js";
import { checkIndex } from "../src/list.js";
import { show } from "../src/repr.js";
import { Panic } from "../src/panic.js";
import im from "immutable";

export function of(value) {
  // Get the string representation of `value`.
  //
  // ```ptls
  // Str.of([100, false, "foo", print])
  // ```

  return show(value);
}

export function len(string) {
  // Get the length of `string` in characters.
  //
  // ```ptls
  // len("Hello World!")
  // len("🧑🏽")
  // ```

  checkType(string, "string");
  return [...string].length;
}

export function isEmpty(string) {
  // Check if `string` is empty (if its length is zero).
  //
  // ```ptls
  // isEmpty("")
  // isEmpty("asdf")
  // ```

  return len(string) == 0;
}

export function chars(string) {
  // Split `string` into a list of single-character strings.
  //
  // ```ptls
  // chars("Hello World!")
  // chars("🧑🏽")
  // ```

  checkType(string, "string");
  // List fumbles the bag if we pass string directly.
  // Need to use spread operator to split unicode chars correctly.
  return im.List([...string]);
}

const newline = /\r?\n/g;

export function lines(string) {
  // Return a list of the lines in `string`, where lines are separeted by the
  // regex `\r?\n`. Separators are not inclued in the returned lines.
  //
  // ```ptls
  // Str.lines("foo\n\nbar\r\nbaz\n")
  // ```

  checkType(string, "string");
  return im.List(string.split(newline));
}

export function get(string, index) {
  // Get the character at position `index` in `string`.
  //
  // ```ptls
  // Str.get("Hello World!", 1)
  // ```

  checkType(string, "string");
  checkWhole(index);

  // Preserve surrogate pairs
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator
  const chars = [...string];

  if (index < -chars.length || index >= chars.length) {
    throw new Panic("string index out of range", {
      index,
      length: chars.length,
    });
  }

  return chars.at(index);
}

export function take(string, count) {
  // Get a string containing the first `count` characters from `string`. If
  // `count >= len(string)` then the entire string is returned.
  //
  // ```ptls
  // take("Hello World!", 5)
  // ```

  checkType(string, "string");
  checkWhole(count);
  // Convert to array to make it work with complex characters
  return [...string].slice(0, count).join("");
}

export function takeLast(string, count) {
  // Get a string containing the last `count` characters from `string`. If
  // `count >= len(string)` then the entire string is returned.
  //
  // ```ptls
  // takeLast("Hello World!", 5)
  // ```

  checkType(string, "string");
  checkWhole(count);
  // Convert to array to make it work with complex characters
  return [...string].slice(-count).join("");
}

export function drop(string, count) {
  // Remove the first `count` characters from `string`. If
  // `count >= len(string)` then `""` is returned.
  //
  // ```ptls
  // drop("Hello World!", 5)
  // ```

  checkType(string, "string");
  checkWhole(count);
  // Convert to array to make it work with complex characters
  return [...string].slice(count).join("");
}

export function dropLast(string, count) {
  // Remove the last `count` characters from `string`. If `count >= len(string)`
  // then `""` is returned.
  //
  // ```ptls
  // dropLast("Hello World!", 5)
  // ```

  checkType(string, "string");
  checkWhole(count);
  // Convert to array to make it work with complex characters
  return [...string].slice(0, -count).join("");
}

export function splice(string, index, count, subString) {
  // Remove `count` characters from `string` starting at `index`, and replace
  // them with the string `subString`.
  //
  // ```ptls
  // Str.splice("abcdef", 3, 2, "xyz")
  // ```

  checkType(string, "string");
  const chars = im.List([...string]);

  checkIndex(chars, index);
  checkWhole(count);
  checkType(subString, "string");

  return chars.splice(index, count, subString).join("");
}

export function split(string, separator) {
  // Split `string` into a list of substrings using `separator` as the
  // delimiter. `separator` is not included in the resulting substrings.
  //
  // ```ptls
  // split("a,b,,c", ",")
  // ```

  checkType(string, "string");
  checkType(separator, "string");
  return im.List(string.split(separator));
}

export function join(list, separator) {
  // Join the values in `list` into a single string, inserting `separator`
  // between them. Each value is converted to a string using `Str.of`.
  //
  // ```ptls
  // join([1, 2, 3, 4], " -> ")
  // join(["Hello", " ", "World", "!"], "")
  // ```

  checkType(list, "list");
  checkType(separator, "string");
  return list.map(show).join(separator);
}

export function repeat(string, count) {
  // Repeat `string` `count` times. If `count <= 0`, then `""` is returned.
  //
  // ```ptls
  // Str.repeat("la", 5)
  // ```
  //
  // _Note that this can also be accomplished using the `_` operator\*.
  //
  // ```ptls
  // "la" * 5
  // ```

  checkType(string, "string");
  checkType(count, "number");
  checkWhole(count);
  return string.repeat(Math.max(0, count));
}

export function reverse(string) {
  // Reverse the characters in `string`.
  //
  // ```ptls
  // reverse("Hello World!")
  // ```

  checkType(string, "string");
  return [...string].reverse().join("");
}

export function replace(string, subString, replacement) {
  // Replace all occurrences of `subString` in `string` with `replacement`.
  //
  // ```ptls
  // Str.replace("A catalog of cats", "cat", "dog")
  // ```

  checkType(string, "string");
  checkType(subString, "string");
  checkType(replacement, "string");
  // use anon func to avoid "$" special behavior
  return string.replaceAll(subString, () => replacement);
}

export function replaceFirst(string, subString, replacement) {
  // Replace the first occurrence of `subString` in `string` with `replacement`.
  //
  // ```ptls
  // Str.replaceFirst("A catalog of cats", "cat", "dog")
  // ```

  checkType(string, "string");
  checkType(subString, "string");
  checkType(replacement, "string");
  // use anon func to avoid "$" special behavior
  return string.replace(subString, () => replacement);
}

export function startsWith(string, prefix) {
  // Check whether `string` begins with `prefix`.
  //
  // ```ptls
  // Str.startsWith("apple pie", "app")
  // Str.startsWith("apple pie", "pecan")
  // ```

  checkType(string, "string");
  checkType(prefix, "string");
  return string.startsWith(prefix);
}

export function endsWith(string, prefix) {
  // Check whether `string` ends with `prefix`.
  //
  // ```ptls
  // Str.endsWith("apple pie", "pie")
  // Str.endsWith("apple pie", "cake")
  // ```

  checkType(string, "string");
  checkType(prefix, "string");
  return string.endsWith(prefix);
}

export function has(string, subString) {
  // Check whether `string` contains the substring `subString`.
  //
  // ```ptls
  // Str.has("assume", "sum")
  // Str.has("assume", "you")
  // ```

  checkType(string, "string");
  checkType(subString, "string");
  return string.includes(subString);
}

export function indexOf(string, subString) {
  // Get the index of the first occurrence of `subString` in `string`. Returns
  // `none` if `string` does not contain `subString`.
  //
  // ```ptls
  // Str.indexOf("mississippi", "issi")
  // Str.indexOf("mississippi", "bama")
  // ```

  checkType(string, "string");
  const index = string.indexOf(subString);
  return index >= 0 ? index : null;
}

export function padLeft(value, n) {
  // Convert `value` to a string and pad it on the left with spaces so that the
  // total length is at least `n` characters.
  //
  // ```ptls
  // Str.padLeft("Java", 10)
  // Str.padLeft("JavaScript", 10)
  // ```

  checkType(n, "number");
  checkWhole(n);
  checkPositive(n);
  return show(value).padStart(n);
}

export function padRight(value, n) {
  // Convert `value` to a string and pad it on the right with spaces so that the
  // total length is at least `n` characters.
  //
  // ```ptls
  // Str.padRight("Java", 10)
  // Str.padRight("JavaScript", 10)
  // ```

  checkType(n, "number");
  checkWhole(n);
  checkPositive(n);
  return show(value).padEnd(n);
}

export function trim(string) {
  // Remove the leading and trailing whitespace from `string`.
  //
  // ```ptls
  // Str.trim("  hello\n")
  // ```

  checkType(string, "string");
  return string.trim();
}

export function trimLeft(string) {
  // Remove the leading whitespace from `string`.
  //
  // ```ptls
  // Str.trimLeft("  hello\n")
  // ```

  checkType(string, "string");
  return string.trimStart();
}

export function trimRight(string) {
  // Remove the trailing whitespace from `string`.
  //
  // ```ptls
  // Str.trimRight("  hello\n")
  // ```

  checkType(string, "string");
  return string.trimEnd();
}

export function toUpper(string) {
  // Convert `string` to uppercase.
  //
  // ```ptls
  // Str.toUpper("Hello World!")
  // ```

  checkType(string, "string");
  return string.toUpperCase();
}

export function toLower(string) {
  // Convert `string` to lowercase.
  //
  // ```ptls
  // Str.toLower("Hello World!")
  // ```

  checkType(string, "string");
  return string.toLowerCase();
}

export function isUpper(string) {
  // Check whether `Str.toUpper(string) == string`.
  //
  // ```ptls
  // Str.isUpper("HELLO WORLD!")
  // Str.isUpper("Hello World!")
  // ```

  return toUpper(string) === string;
}

export function isLower(string) {
  // Check whether `Str.toLower(string) == string`.
  //
  // ```ptls
  // Str.isLower("hello world!")
  // Str.isLower("Hello World!")
  // ```

  return toLower(string) === string;
}

export function isAlpha(string) {
  // Check if `string` contains only Unicode letters.
  //
  // ```ptls
  // Str.isAlpha("hello")
  // Str.isAlpha("你好")
  // Str.isAlpha("hi!")
  // ```

  checkType(string, "string");
  return /^\p{L}*$/u.test(string);
}

export function isAlphaNum(string) {
  // Check if `string` contains only Unicode letters or digits.
  //
  // ```ptls
  // Str.isAlphaNum("hello456")
  // Str.isAlphaNum("你好٤٥٦")
  // Str.isAlphaNum("hi!")
  // ```

  checkType(string, "string");
  return /^(\p{L}|\p{N})*$/u.test(string);
}

export function isDigit(string) {
  // Check if `string` contains only Unicode digits.
  //
  // ```ptls
  // Str.isDigit("456")
  // Str.isDigit("٤٥٦")
  // Str.isDigit("hello")
  // ```

  checkType(string, "string");
  return /^\p{N}*$/u.test(string);
}

export function isAsciiAlpha(string) {
  // Check if `string` contains only ASCII letters.
  //
  // ```ptls
  // Str.isAsciiAlpha("hello")
  // Str.isAsciiAlpha("你好")
  // Str.isAsciiAlpha("hi!")
  // ```

  checkType(string, "string");
  return /^[a-zA-Z]*$/.test(string);
}

export function isAsciiAlphaNum(string) {
  // Check if `string` contains only ASCII letters or digits.
  //
  // ```ptls
  // Str.isAsciiAlphaNum("hello456")
  // Str.isAsciiAlphaNum("你好٤٥٦")
  // Str.isAsciiAlphaNum("hi!")
  // ```

  checkType(string, "string");
  return /^[a-zA-Z0-9]*$/.test(string);
}

export function isAsciiDigit(string) {
  // Check if `string` contains only ASCII digits.
  //
  // ```ptls
  // Str.isAsciiDigit("456")
  // Str.isAsciiDigit("٤٥٦")
  // Str.isAsciiDigit("hello")
  // ```

  checkType(string, "string");
  return /^[0-9]*$/.test(string);
}

export function parse(string) {
  // Convert `string` to a number, boolean, or `none`.
  //
  // ```ptls
  // parse("45.67")
  // parse("false")
  // parse("none")
  // ```

  checkType(string, "string");

  switch (string) {
    case "true":
      return true;
    case "false":
      return false;
    case "none":
      return null;
  }

  const result = Number(string);

  if (string !== "" && !Number.isNaN(result)) {
    return result;
  }

  throw new Panic("cannot parse string", { string });
}
