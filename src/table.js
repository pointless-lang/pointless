import { checkType, getType } from "./values.js";
import { checkWhole } from "./num.js";
import { isMatch } from "./obj.js";
import { invisible } from "./repr.js";
import { Panic } from "./panic.js";
import { parseColumns } from "./csv.js";
import { repr } from "./repr.js";
import { is, OrderedMap, List, Repeat } from "immutable";

export class Table {
  constructor(columns = OrderedMap()) {
    checkType(columns, "object");

    columns = new Map(columns);
    this.width = 0;
    this.size = undefined;

    for (let [key, values] of columns) {
      checkType(key, "string");
      this.width++;

      if (getType(values) === "list") {
        this.size ??= values.size;
        this.checkColumnLength(values);
      }
    }

    this.size ??= this.width ? 1 : 0;

    // can't expand columns until we know final size
    for (const [key, values] of columns) {
      if (getType(values) !== "list") {
        columns.set(key, Repeat(values, this.size).toList());
      }
    }

    this.columns = OrderedMap(columns);
  }

  static fromCsv(source) {
    return new Table(parseColumns(source));
  }

  static fromRows(rows, keys) {
    checkType(rows, "list");
    checkType(keys, "list");

    const width = keys.size;
    const columns = new Map();

    for (const key of keys) {
      checkType(key, "string");
      columns.set(key, []);
    }

    for (const row of rows) {
      if (getType(row) !== "object") {
        throw new Panic("table rows must be objects");
      }

      if (row.size !== width) {
        throw new Panic("mismatched columns");
      }

      for (const key of keys) {
        if (!row.has(key)) {
          throw new Panic("mismatched columns");
        }

        // Table constructor will check that values are primitives
        columns.get(key).push(row.get(key));
      }
    }

    for (const key of keys) {
      columns.set(key, List(columns.get(key)));
    }

    return new Table(OrderedMap(columns));
  }

  equals(other) {
    return is(this.columns, other.columns);
  }

  checkColumnLength(values) {
    if (this.size && values.size !== this.size) {
      throw new Panic("mismatched column lengths");
    }

    return values;
  }

  checkKeys(...keys) {
    for (const key of keys) {
      checkType(key, "string");

      if (!this.columns.has(key)) {
        throw new Panic("key not found", { key });
      }
    }
  }

  checkKeysMatch(matcher, exact = true) {
    if (exact && matcher.size !== this.width) {
      throw new Panic("mismatched keys");
    }

    for (const key of matcher.keys()) {
      if (!this.columns.has(key)) {
        throw new Panic("mismatched keys");
      }
    }
  }

  checkIndex(index) {
    checkWhole(index);

    if (index < -this.size || index >= this.size) {
      throw new Panic("index out of range");
    }

    return index;
  }

  checkNonEmpty() {
    if (this.size === 0) {
      throw new Panic("empty table");
    }

    return this;
  }

  get(selector) {
    checkType(selector, "string", "number", "object");

    switch (getType(selector)) {
      case "string":
        return this.getColumn(selector);
      case "number":
        return this.getRow(selector);
      case "object": {
        const index = this.findMatch(selector);

        if (index === undefined) {
          throw new Panic("no match found", { matcher: selector });
        }

        return this.getRow(index);
      }
    }
  }

  set(selector, value) {
    checkType(selector, "string", "number", "object");

    switch (getType(selector)) {
      case "string":
        return this.setColumn(selector, value);
      case "number":
        return this.setRow(selector, value);
      case "object": {
        const index = this.findMatch(selector);

        return index === undefined
          ? this.addRow(value)
          : this.setRow(index, value);
      }
    }
  }

  keys() {
    return this.columns.keySeq().toList();
  }

  async map(func) {
    checkType(func, "function");
    const rows = [];

    for (const row of this) {
      rows.push(await func.call(row));
    }

    return Table.fromRows(List(rows), this.keys());
  }

  async filter(func) {
    checkType(func, "function");
    const rows = [];

    for (const row of this) {
      if (await func.callCondition(row)) {
        rows.push(row);
      }
    }

    return Table.fromRows(List(rows), this.keys());
  }

  getRow(index) {
    this.checkIndex(index);
    const map = new Map();

    for (const [key, values] of this.columns) {
      map.set(key, values.get(index));
    }

    return OrderedMap(map);
  }

  addRow(row) {
    checkType(row, "object");
    this.checkKeysMatch(row);
    const columns = new Map();

    for (const [key, values] of this.columns) {
      columns.set(key, values.push(row.get(key)));
    }

    return new Table(OrderedMap(columns));
  }

  setRow(index, row) {
    this.checkIndex(index);
    checkType(row, "object");
    this.checkKeysMatch(row);
    const columns = new Map();

    for (const [key, values] of this.columns) {
      columns.set(key, values.set(index, row.get(key)));
    }

    return new Table(OrderedMap(columns));
  }

  getColumn(key) {
    this.checkKeys(key);
    return this.columns.get(key);
  }

  setColumn(key, values) {
    checkType(key, "string");

    if (getType(values) !== "list") {
      values = Repeat(values, this.size).toList();
    }

    this.checkColumnLength(values);
    return new Table(this.columns.set(key, values));
  }

  select(keys) {
    checkType(keys, "list");
    const columns = new Map();

    for (const key of keys) {
      this.checkKeys(key);
      columns.set(key, this.columns.get(key));
    }

    return new Table(OrderedMap(columns));
  }

  *[Symbol.iterator]() {
    for (let index = 0; index < this.size; index++) {
      yield this.getRow(index);
    }
  }

  *entries() {
    for (let index = 0; index < this.size; index++) {
      yield [index, this.getRow(index)];
    }
  }

  has(matcher) {
    return this.findMatch(matcher) !== undefined;
  }

  match(matcher) {
    checkType(matcher, "object");
    this.checkKeysMatch(matcher, false);

    const rows = [];

    for (const row of this) {
      if (isMatch(row, matcher)) {
        rows.push(row);
      }
    }

    return Table.fromRows(List(rows), this.keys());
  }

  remove(matcher) {
    checkType(matcher, "object");
    this.checkKeysMatch(matcher, false);

    const rows = [];

    for (const row of this) {
      if (!isMatch(row, matcher)) {
        rows.push(row);
      }
    }

    return Table.fromRows(List(rows), this.keys());
  }

  findMatch(matcher) {
    checkType(matcher, "object");
    this.checkKeysMatch(matcher, false);
    let index = 0;

    for (const row of this) {
      if (isMatch(row, matcher)) {
        return index;
      }

      index++;
    }

    return undefined;
  }

  concat(other) {
    checkType(other, "table");
    this.checkKeysMatch(other.columns);

    const columns = new Map(this.columns);

    for (const [key, values] of columns) {
      const otherValues = other.columns.get(key);
      columns.set(key, values.concat(otherValues));
    }

    return new Table(OrderedMap(columns));
  }

  static merge(tables) {
    checkType(tables, "list");

    if (tables.isEmpty()) {
      return new Table();
    }

    let columns = new Map();
    const first = tables.first();

    checkType(first, "table");
    for (const key of first.columns.keys()) {
      columns.set(key, []);
    }

    columns = OrderedMap(columns);

    for (const table of tables) {
      checkType(table, "table");
      table.checkKeysMatch(columns);

      for (const [key, values] of table.columns) {
        columns.get(key).push(...values);
      }
    }

    return new Table(columns.map(List));
  }

  toString() {
    const fmts = new Map();

    for (const [key, values] of this.columns) {
      fmts.set(key, getFmt(key, values));
    }

    const lines = [];

    function addLine(start, end, sep, pad, handler) {
      const inner = [...fmts]
        .map(([key, fmt]) => handler(key, fmt))
        .join(pad + sep + pad);

      lines.push([start, inner, end].join(pad));
    }

    addLine("┌", "┐", "┬", "─", (_, { length }) => "─".repeat(length));
    addLine("│", `│ x ${this.size}`, "│", " ", (key, fmt) => format(key, fmt));

    if (this.size > 0) {
      addLine("├", "┤", "┼", "─", (_, { length }) => "─".repeat(length));
    }

    for (let i = 0; i < this.size; i++) {
      addLine("│", "│", "│", " ", (key, fmt) =>
        format(this.columns.get(key).get(i), fmt),
      );
    }

    addLine("└", "┘", "┴", "─", (_, { length }) => "─".repeat(length));
    return lines.join("\n");
  }
}

const numeric = /^-?\.?[0-9]/;
const padded = /^\s|\s$/;
const escaped = /[\\"\n\r\t]/;

function showValue(value) {
  if (
    getType(value) !== "string" ||
    value === "none" ||
    value === "true" ||
    value === "false" ||
    numeric.test(value) ||
    padded.test(value) ||
    escaped.test(value) ||
    invisible.test(value)
  ) {
    return repr(value);
  }

  return value;
}

function formatInner(value, length, decimals) {
  if (getType(value) === "number") {
    let numStr = String(value);

    if (decimals) {
      numStr +=
        numStr % 1
          ? "0".repeat(decimals - decLength(numStr))
          : ".0".padEnd(decimals, "0");
    }

    return numStr.padStart(length);
  }

  if (value === null) {
    return "";
  }

  return showValue(value);
}

function format(value, fmt = {}) {
  const { length = 0 } = fmt;
  const { decimals = 0 } = fmt;
  return formatInner(value, length, decimals).padEnd(length);
}

function decLength(numStr) {
  return numStr.includes(".") ? numStr.length - numStr.indexOf(".") : 0;
}

function getFmt(key, values) {
  let decimals = 0;

  for (const value of values) {
    if (getType(value) === "number" && value % 1) {
      decimals = Math.max(decimals, decLength(String(value)));
    }
  }

  let length = format(key).length;

  for (const value of values) {
    switch (getType(value)) {
      case "number": {
        const numStr = String(value);
        length = Math.max(length, numStr.length + decimals - decLength(numStr));
        break;
      }
      case "none":
        break;
      default:
        length = Math.max(length, showValue(value).length);
    }
  }

  return { length, decimals };
}
