import { tokenize } from "./tokenizer.js";
import { parse } from "./parser.js";
import { Table } from "./table.js";
import { Panic } from "./panic.js";
import im from "../immutable/immutable.js";

export function getType(value) {
  if (value === null) {
    // only accept null, not undefined
    return "none";
  }

  switch (value?.constructor) {
    case Boolean:
      return "boolean";
    case Number:
      return "number";
    case String:
      return "string";
  }

  if (value?.constructor?.ptlsName) {
    return value.constructor.ptlsName;
  }

  if (im.isOrderedMap(value)) {
    return "object";
  }

  if (im.isOrderedSet(value)) {
    return "set";
  }

  if (im.isList(value)) {
    return "list";
  }

  return `<native ${value?.constructor?.name}>`;
}

export function checkType(value, ...types) {
  const $got = getType(value);

  if (!$got) {
    throw new Panic("invalid native value", { value });
  }

  if (types.length && !types.includes($got)) {
    throw new Panic("type error", { $expected: types.join(" or "), $got });
  }

  return value;
}

export function checkNonEmpty(value) {
  checkType(value, "list", "string");

  const length = value.size ?? value.length;

  if (length === 0) {
    throw new Panic(`empty ${getType(value)}`);
  }

  return value;
}

export function compareAll(a, b, desc) {
  for (let index = 0; index < a.size; index++) {
    const result = compare(a.get(index), b.get(index), desc);

    if (result != 0) {
      return result;
    }
  }

  return 0;
}

export function compare(a, b, desc) {
  checkType(a, "number", "string", "boolean", "none");
  checkType(b, "number", "string", "boolean", "none");

  const typeA = getType(a);
  const typeB = getType(b);

  if (typeA === "none") {
    return 1;
  }

  if (typeB === "none") {
    return -1;
  }

  if (typeA !== typeB) {
    throw new Panic("cannot compare values of different types", {
      typeA,
      typeB,
    });
  }

  if (a < b) {
    return desc ? 1 : -1;
  }

  if (a > b) {
    return desc ? -1 : 1;
  }

  return 0;
}

export function checkDumpable(value) {
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

export function evalLiteral(source, path = "<literal>") {
  const tokens = tokenize(path, source);
  const statements = parse(tokens);

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
