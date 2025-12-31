import { checkType, getType } from "./values.js";
import { checkWhole } from "./num.js";
import { isMatch } from "./obj.js";
import { Panic } from "./panic.js";
import { parseCSV } from "./csv.js";
import { indent, repr } from "./repr.js";
import { ident } from "./tokenizer.js";
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

    // Set size to 1 if there were entries but all were non-lists
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
    return new Table(parseCSV(source));
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
      throw new Panic("table index out of range");
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

    if (!this.size) {
      return new Table();
    }

    const rows = [];

    for (const row of this) {
      rows.push(await func.call(row));
    }

    checkType(rows[0], "object");
    const columns = rows[0].keySeq().toList();
    return Table.fromRows(im.List(rows), columns);
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

  count(matcher) {
    checkType(matcher, "object");
    this.checkColumnsMatch(matcher, false);
    let count = 0;

    for (const row of this) {
      if (isMatch(row, matcher)) {
        count += 1;
      }
    }

    return count;
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

  repr(mode) {
    if (mode === "compact") {
      if (!this.width) {
        return "#{}";
      }

      const header = this.columns().map((name) =>
        ident.test(name) ? name : `"${name}"`
      ).join(", ");

      const rows = [...this].map((row) =>
        row.valueSeq().map((cell) => repr(cell, "compact")).join(", ")
      );

      const inner = [header, ...rows].join("; ");
      return `#{ ${inner} }`;
    }

    const tableInfo = this.data.map(
      (values, column) => new ColInfo(column, values, mode),
    );

    const lines = [];

    function addLine(start, end, sep, contents) {
      const inner = contents.join(sep);
      lines.push(`${start}${inner}${end}`);
    }

    const dividers = tableInfo.map(({ length }) => "─".repeat(length));
    const headers = tableInfo.map(({ name }) => name);

    if (mode === "normal") {
      if (!this.width) {
        return "#{}";
      }

      addLine("", "", " , ", headers);

      for (let index = 0; index < this.size; index++) {
        const contents = tableInfo.map(({ cells }) => cells[index].toString());
        addLine("", "", " , ", contents);
      }

      return `#{\n${indent(lines.join("\n"))}\n}`;
    }

    addLine("┌─", "─┐", "─┬─", dividers);
    addLine("│ ", ` │ x ${this.size}`, " │ ", headers);

    if (this.size > 0) {
      addLine("├─", "─┤", "─┼─", dividers);
    }

    for (let index = 0; index < this.size; index++) {
      const contents = tableInfo.map(({ cells }) => cells[index].toString());
      addLine("│ ", " │", " │ ", contents);
    }

    addLine("└─", "─┘", "─┴─", dividers);
    return lines.join("\n");
  }
}

const numeric = /^-?\.?[0-9]/;
const padded = /^\s|\s$/;

function prettyCell(value) {
  if (value === null) {
    return "";
  }

  if (getType(value) === "string") {
    switch (value) {
      case "none":
      case "false":
      case "true":
        return `"${value}"`;
    }

    if (!value || numeric.test(value) || padded.test(value)) {
      return `"${value}"`;
    }

    const escaped = repr(value, "compact");
    return escaped.includes("\\") ? escaped : value;
  }

  return repr(value, "compact");
}

class Cell {
  constructor(value, colInfo, mode) {
    this.type = getType(value);
    this.colInfo = colInfo;

    this.baseStr = mode === "pretty"
      ? prettyCell(value)
      : repr(value, "compact");

    this.decimals = this.type === "number" && this.baseStr.includes(".")
      ? this.baseStr.length - this.baseStr.indexOf(".")
      : 0;
  }

  getLength() {
    if (this.type === "number") {
      return this.baseStr.length + this.colInfo.decimals - this.decimals;
    }

    return this.baseStr.length;
  }

  toString() {
    if (!this.string) {
      if (this.type === "number") {
        let result = this.baseStr;

        if (this.colInfo.decimals) {
          result += result.includes(".")
            ? "0".repeat(this.colInfo.decimals - this.decimals)
            : ".0".padEnd(this.colInfo.decimals, "0");
        }

        this.string = result.padStart(this.colInfo.length);
      } else {
        this.string = this.baseStr.padEnd(this.colInfo.length);
      }
    }

    return this.string;
  }
}

class ColInfo {
  constructor(name, values, mode) {
    this.cells = values.map((v) => new Cell(v, this, mode)).toArray();
    this.decimals = Math.max(...this.cells.map((cell) => cell.decimals));

    this.length = Math.max(
      name.length,
      ...this.cells.map((cell) => cell.getLength()),
    );

    this.name = name.padEnd(this.length);
  }
}
