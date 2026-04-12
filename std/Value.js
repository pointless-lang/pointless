import { checkType, getType } from "../lang/values.js";
import { tokenize } from "../lang/tokenizer.js";
import { parse as parseTokens } from "../lang/parser.js";
import { Table } from "../lang/table.js";
import { repr } from "../lang/repr.js";
import { Panic } from "../lang/panic.js";
import im from "../immutable/immutable.js";
import { readFile, writeFile } from "node:fs/promises";

function checkDumpable(value) {
  const type = getType(value);

  switch (type) {
    case "none":
    case "boolean":
    case "string":
      break;

    case "number":
      if (Number.isNaN(value)) {
        throw new Panic("cannot serialize 'math.nan'");
      }

      if (!Number.isFinite(value)) {
        throw new Panic("cannot serialize infinite number");
      }

      break;

    case "list":
    case "set":
      value.forEach(checkDumpable);
      break;

    case "object":
      for (const [key, val] of value) {
        checkDumpable(key);
        checkDumpable(val);
      }

      break;

    case "table":
      for (const values of value.data.valueSeq()) {
        values.forEach(checkDumpable);
      }

      break;

    default:
      throw new Panic("cannot serialize value", { $type: type, value });
  }
}

function evalLiteralNode(node) {
  switch (node.type) {
    case "none":
    case "bool":
    case "string":
      return node.value;

    case "number":
      return node.value;

    case "list":
      return im.List(node.value.map(evalLiteralNode));

    case "set":
      return im.OrderedSet(node.value.map(evalLiteralNode));

    case "object": {
      const map = new Map();

      for (const { key, value } of node.value) {
        map.set(evalLiteralNode(key), evalLiteralNode(value));
      }

      return im.OrderedMap(map);
    }

    case "table": {
      const { headers, rows } = node.value;
      const columns = [];

      for (const header of headers) {
        const name = evalLiteralNode(header);
        checkType(name, "string");
        columns.push({ name, values: [] });
      }

      for (const row of rows) {
        for (const [index, cell] of row.entries()) {
          columns[index].values.push(evalLiteralNode(cell));
        }
      }

      const entries = columns.map((
        { name, values },
      ) => [name, im.List(values)]);

      return new Table(im.OrderedMap(entries));
    }

    case "unaryOp": {
      if (node.value.op !== "-" || node.value.rhs.type !== "number") {
        throw new Panic(
          "unexpected syntax in textual data (.ptd) literal",
          { $type: node.type },
          node.loc,
        );
      }

      return -evalLiteralNode(node.value.rhs);
    }

    default:
      throw new Panic(
        "unexpected syntax in textual data (.ptd) literal",
        { $type: node.type },
        node.loc,
      );
  }
}

function evalLiteral(source, path = "<literal>") {
  const tokens = tokenize(path, source);
  const statements = parseTokens(tokens);

  if (!statements.length) {
    throw new Panic("empty textual data (.ptd) literal");
  }

  if (statements.length > 1) {
    throw new Panic(
      "expected a single textual data (.ptd) literal",
      {},
      statements[1].loc,
    );
  }

  return evalLiteralNode(statements[0]);
}

export function typeOf(value) {
  return getType(value);
}

export function dump(value) {
  // Convert `value` to a string containing a ptls literal. Panics if `value`
  // contains non-literal types like functions. The resulting string can be
  // parsed back with `parse`.
  //
  // ```ptls
  // Value = import "std:Value"
  // Value.dump([1, 2, 3])
  // Value.dump({name: "Alice", age: 30})
  // ```

  checkDumpable(value);
  return repr(value, "compact");
}

export function parse(string) {
  // Parse `string` as a ptls literal value. Supports all literal types:
  // numbers, strings, booleans, `none`, lists, sets, objects, and tables.
  // Panics if `string` contains non-literal syntax like variables, function
  // calls, or operators.
  //
  // ```ptls
  // parse("[1, 2, 3]")
  // parse(`#{ name, age; "Alice", 30 }`)
  // parse("42")
  // ```

  checkType(string, "string");
  return evalLiteral(string);
}

export async function read(path) {
  // Read the `.ptd` file at `path` and parse its contents as a ptls literal.
  //
  // ```ptls --no-eval
  // Value = import "std:Value"
  // Value.read("data.ptd")
  // ```

  checkType(path, "string");

  let source;

  try {
    source = await readFile(path, { encoding: "utf8" });
  } catch (err) {
    throw new Panic("file read error", { path, err: String(err) });
  }

  return evalLiteral(source, path);
}

export async function write(value, path) {
  // Dump `value` as a ptls literal and write it to the file at `path`. Return
  // the dumped string.
  //
  // ```ptls --no-eval
  // Value = import "std:Value"
  // Value.write({name: "Alice", age: 30}, "user.ptd")
  // ```

  checkType(path, "string");
  checkDumpable(value);
  const string = repr(value, "compact");

  try {
    await writeFile(path, string);
  } catch (err) {
    throw new Panic("file write error", { path, err: String(err) });
  }

  return string;
}
