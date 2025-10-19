import { checkType, getType } from "./values.js";
import { checkWhole } from "./num.js";
import { isMatch } from "./obj.js";
import { invisible } from "./repr.js";
import { Panic } from "./panic.js";
import { parseData } from "./csv.js";
import { repr } from "./repr.js";
import im from "../immutable/immutable.js";

export class Table {
  static ptlsName = "table";

  constructor(data = im.OrderedMap()) {
    checkType(data, "object");

    data = new Map(data);
    this.width = 0;
    this.size = undefined;

    for (const [column, values] of data) {
      checkType(column, "string");
      this.width++;

      if (getType(values) === "list") {
        this.size ??= values.size;
        this.checkColumnLength(values);
      }
    }

    this.size ??= this.width ? 1 : 0;

    // can't expand data until we know final size
    for (const [column, values] of data) {
      if (getType(values) !== "list") {
        data.set(column, im.Repeat(values, this.size).toList());
      }
    }

    this.data = im.OrderedMap(data);
  }

  static fromCsv(source) {
    return new Table(parseData(source));
  }

  static fromRows(rows, columns) {
    checkType(rows, "list");
    checkType(columns, "list");

    const width = columns.size;
    const data = new Map();

    for (const column of columns) {
      checkType(column, "string");
      data.set(column, []);
    }

    for (const row of rows) {
      if (getType(row) !== "object") {
        throw new Panic("table rows must be objects");
      }

      if (row.size !== width) {
        throw new Panic("mismatched columns");
      }

      for (const column of columns) {
        if (!row.has(column)) {
          throw new Panic("mismatched columns");
        }

        // Table constructor will check that values are primitives
        data.get(column).push(row.get(column));
      }
    }

    for (const column of columns) {
      data.set(column, im.List(data.get(column)));
    }

    return new Table(im.OrderedMap(data));
  }

  equals(other) {
    return im.is(this.data, other.data);
  }

  hashCode() {
    return im.hash(this.data);
  }

  checkColumnLength(values) {
    if (this.size && values.size !== this.size) {
      throw new Panic("mismatched column lengths");
    }

    return values;
  }

  checkColumns(...columns) {
    for (const column of columns) {
      checkType(column, "string");

      if (!this.data.has(column)) {
        throw new Panic("column not found", { column });
      }
    }
  }

  checkColumnsMatch(matcher, exact = true) {
    if (exact && matcher.size !== this.width) {
      throw new Panic("mismatched keys");
    }

    for (const column of matcher.keys()) {
      if (!this.data.has(column)) {
        throw new Panic("mismatched columns");
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
        value = selector.concat(value);

        return index === undefined
          ? this.addRow(value)
          : this.setRow(index, value);
      }
    }
  }

  columns() {
    return this.data.keySeq().toList();
  }

  async map(func) {
    checkType(func, "function");
    const rows = [];

    for (const row of this) {
      rows.push(await func.call(row));
    }

    return Table.fromRows(im.List(rows), this.columns());
  }

  async filter(func, args = []) {
    checkType(func, "function");
    const rows = [];

    for (const row of this) {
      if (await func.callCondition(row, ...args)) {
        rows.push(row);
      }
    }

    return Table.fromRows(im.List(rows), this.columns());
  }

  getRow(index) {
    this.checkIndex(index);
    const map = new Map();

    for (const [column, values] of this.data) {
      map.set(column, values.get(index));
    }

    return im.OrderedMap(map);
  }

  addRow(row) {
    checkType(row, "object");
    this.checkColumnsMatch(row);
    const data = new Map();

    for (const [column, values] of this.data) {
      data.set(column, values.push(row.get(column)));
    }

    return new Table(im.OrderedMap(data));
  }

  setRow(index, row) {
    this.checkIndex(index);
    checkType(row, "object");
    this.checkColumnsMatch(row);
    const data = new Map();

    for (const [column, values] of this.data) {
      data.set(column, values.set(index, row.get(column)));
    }

    return new Table(im.OrderedMap(data));
  }

  getColumn(column) {
    this.checkColumns(column);
    return this.data.get(column);
  }

  setColumn(column, values) {
    checkType(column, "string");

    if (getType(values) !== "list") {
      values = im.Repeat(values, this.size).toList();
    }

    this.checkColumnLength(values);
    return new Table(this.data.set(column, values));
  }

  select(columns) {
    checkType(columns, "list");
    const data = new Map();

    for (const column of columns) {
      this.checkColumns(column);
      data.set(column, this.data.get(column));
    }

    return new Table(im.OrderedMap(data));
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

  has(selector) {
    checkType(selector, "object", "string");

    if (getType(selector) === "string") {
      return this.data.has(selector);
    }

    return this.findMatch(selector) !== undefined;
  }

  match(matcher) {
    checkType(matcher, "object");
    this.checkColumnsMatch(matcher, false);

    const rows = [];

    for (const row of this) {
      if (isMatch(row, matcher)) {
        rows.push(row);
      }
    }

    return Table.fromRows(im.List(rows), this.columns());
  }

  remove(matcher) {
    checkType(matcher, "object");
    this.checkColumnsMatch(matcher, false);

    const rows = [];

    for (const row of this) {
      if (!isMatch(row, matcher)) {
        rows.push(row);
      }
    }

    return Table.fromRows(im.List(rows), this.columns());
  }

  findMatch(matcher) {
    checkType(matcher, "object");
    this.checkColumnsMatch(matcher, false);
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
    this.checkColumnsMatch(other.data);

    const data = new Map(this.data);

    for (const [column, values] of data) {
      const otherValues = other.data.get(column);
      data.set(column, values.concat(otherValues));
    }

    return new Table(im.OrderedMap(data));
  }

  static merge(tables) {
    checkType(tables, "list");

    if (tables.isEmpty()) {
      return new Table();
    }

    let data = new Map();
    const first = tables.first();

    checkType(first, "table");
    for (const column of first.data.keys()) {
      data.set(column, []);
    }

    data = im.OrderedMap(data);

    for (const table of tables) {
      checkType(table, "table");
      table.checkColumnsMatch(data);

      for (const [column, values] of table.data) {
        data.get(column).push(...values);
      }
    }

    return new Table(data.map(im.List));
  }

  repr(compact) {
    if (compact) {
      const inner = this.rows().map((row) => repr(row, true)).join(", ");
      return `Table.of([${inner}])`;
    }

    return this.toString();
  }

  toString() {
    const fmts = new Map();

    for (const [column, values] of this.data) {
      fmts.set(column, getFmt(column, values));
    }

    const lines = [];

    function addLine(start, end, sep, pad, handler) {
      const inner = [...fmts]
        .map(([column, fmt]) => handler(column, fmt))
        .join(pad + sep + pad);

      lines.push([start, inner, end].join(pad));
    }

    addLine("┌", "┐", "┬", "─", (_, { length }) => "─".repeat(length));
    addLine(
      "│",
      `│ x ${this.size}`,
      "│",
      " ",
      (column, fmt) => format(column, fmt),
    );

    if (this.size > 0) {
      addLine("├", "┤", "┼", "─", (_, { length }) => "─".repeat(length));
    }

    for (let i = 0; i < this.size; i++) {
      addLine(
        "│",
        "│",
        "│",
        " ",
        (column, fmt) => format(this.data.get(column).get(i), fmt),
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
    return repr(value, true);
  }

  return value;
}

function formatInner(value, length, decimals) {
  if (getType(value) === "number") {
    let numStr = String(value);

    if (decimals) {
      numStr += numStr % 1
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

function getFmt(column, values) {
  let decimals = 0;

  for (const value of values) {
    if (getType(value) === "number" && value % 1) {
      decimals = Math.max(decimals, decLength(String(value)));
    }
  }

  let length = format(column).length;

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
