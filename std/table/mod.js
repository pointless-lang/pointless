import { checkType, compareAll, getType, varargs } from "../../src/values.js";
import * as obj from "../obj/mod.js";
import * as list from "../list/mod.js";
import { Table } from "../../src/table.js";
import { repr } from "../../src/repr.js";
import { Panic } from "../../src/panic.js";
import { OrderedMap, OrderedSet, List } from "immutable";

export function of(contents) {
  checkType(contents, "object", "list");

  if (getType(contents) === "object") {
    return new Table(contents);
  }

  if (!contents.size) {
    return new Table();
  }

  checkType(contents.first(), "object");
  const columns = contents.first().keySeq().toList();
  return Table.fromRows(contents, columns);
}

export function $new(columns) {
  checkType(columns, "list");
  return Table.fromRows(List(), columns);
}

export function len(table) {
  checkType(table, "table");
  return table.size;
}

export function isEmpty(table) {
  return len(table) == 0;
}

export function defaultCols(table, columns) {
  checkType(table, "table");
  checkType(columns, "list");

  if (!table.width) {
    return $new(columns);
  }

  table.checkColumns(...columns);
  return table;
}

export function rows(table) {
  return List(table);
}

export function reverse(table) {
  checkType(table, "table");
  return of(List(table).reverse());
}

export function unique(table) {
  checkType(table, "table");
  return of(OrderedSet(table).toList());
}

export function get(table, selector) {
  checkType(table, "table");
  return table.get(selector);
}

export function set(table, selector, value) {
  checkType(table, "table");
  return table.set(selector, value);
}

export function put(value, table, selector) {
  checkType(table, "table");
  return table.set(selector, value);
}

export function has(table, selector) {
  checkType(table, "table");
  checkType(selector, "object", "string");

  if (getType(selector) === "string") {
    return table.data.has(selector);
  }

  return table.has(selector);
}

export function columns(table) {
  checkType(table, "table");
  return table.columns();
}

export function indexOf(table, matcher) {
  checkType(table, "table");
  return table.findMatch(matcher) ?? null;
}

export function find(table, matcher) {
  checkType(table, "table");
  const ind = indexOf(table, matcher);
  return ind === null ? null : table.getRow(ind);
}

export function match(table, matcher) {
  checkType(table, "table");
  return table.getMatches(matcher);
}

export function remove(table, selector) {
  checkType(table, "table");
  checkType(selector, "object", "string", "list");

  if (getType(selector) === "object") {
    return table.remove(selector);
  }

  selector = varargs(selector);
  table.checkColumns(...selector);
  return new Table(obj.removeAll(table.data, selector));
}

export function push(table, row) {
  return table.addRow(row);
}

export function pop(table) {
  checkType(table, "table");

  if (table.size === 0) {
    throw new Panic("empty table");
  }

  return dropLast(table, 1);
}

export function merge(tables) {
  return Table.merge(tables);
}

export function first(table) {
  return get(table, 0);
}

export function last(table) {
  return get(table, -1);
}

export function take(table, count) {
  checkType(table, "table");

  const data = new Map();

  for (const [column, values] of table.data) {
    data.set(column, list.take(values, count));
  }

  return new Table(OrderedMap(data));
}

export function takeLast(table, count) {
  checkType(table, "table");

  const data = new Map();

  for (const [column, values] of table.data) {
    data.set(column, list.takeLast(values, count));
  }

  return new Table(OrderedMap(data));
}

export function drop(table, count) {
  checkType(table, "table");

  const data = new Map();

  for (const [column, values] of table.data) {
    data.set(column, list.drop(values, count));
  }

  return new Table(OrderedMap(data));
}

export function dropLast(table, count) {
  checkType(table, "table");

  const data = new Map();

  for (const [column, values] of table.data) {
    data.set(column, list.dropLast(values, count));
  }

  return new Table(OrderedMap(data));
}

export function top(table, columns, count) {
  return take(sortDescBy(table, columns), count);
}

export function bottom(table, columns, count) {
  return take(sortBy(table, columns), count);
}

export async function map(table, func) {
  checkType(table, "table");
  return await table.map(func);
}

export async function filter(table, condition) {
  checkType(table, "table");
  return await table.filter(condition);
}

export function select(table, columns) {
  checkType(table, "table");
  columns = varargs(columns);
  return new Table(obj.select(table.data, columns));
}

export function focus(table, columns) {
  checkType(table, "table");
  columns = varargs(columns);
  return new Table(obj.focus(table.data, columns));
}

export function removecolumns(table, columns) {
  checkType(table, "table");
  columns = varargs(columns);
  return new Table(obj.removeAll(table.data, columns));
}

export function rename(table, old, $new) {
  checkType(table, "table");
  return new Table(obj.rename(table.data, old, $new));
}

function selectValues(object, columns) {
  return columns.map((column) => obj.get(object, column));
}

function doSortBy(table, columns, desc) {
  const rows = [...table]
    .map((row) => ({ rank: selectValues(row, columns), row }))
    .sort((a, b) => compareAll(a.rank, b.rank, desc))
    .map(({ row }) => row);

  return of(List(rows));
}

export function sortBy(table, columns) {
  checkType(table, "table");
  columns = varargs(columns);
  table.checkColumns(...columns);
  return doSortBy(table, columns, false);
}

export function sortDescBy(table, columns) {
  checkType(table, "table");
  columns = varargs(columns);
  table.checkColumns(...columns);
  return doSortBy(table, columns, true);
}

export function groupBy(table, columns) {
  checkType(table, "table");
  columns = varargs(columns);
  table.checkColumns(...columns);

  let groups = OrderedMap();

  for (const row of table) {
    const group = selectValues(row, columns);

    if (!groups.has(group)) {
      groups = groups.set(group, []);
    }

    groups.get(group).push(row);
  }

  return groups
    .valueSeq()
    .map((group) => of(List(group)))
    .toList();
}

export async function summarize(table, columns, reducer) {
  const groups = groupBy(table, columns);
  columns = varargs(columns);
  checkType(reducer, "function");

  const rows = [];

  for (const group of groups) {
    const row = new Map();

    for (const column of columns) {
      const values = group.data.get(column);
      row.set(column, values.first());
    }

    const summary = await reducer.call(group);
    checkType(summary, "object");
    rows.push(OrderedMap(row).concat(summary));
  }

  return of(List(rows));
}

export function counts(table) {
  checkType(table, "table");

  if (table.data.has("count")) {
    throw new Panic("table already contains column 'count'");
  }

  if (table.data.has("share")) {
    throw new Panic("table already contains column 'share'");
  }

  const counts = new Map();

  for (const row of table) {
    const column = repr(row);

    if (counts.has(column)) {
      counts.get(column).count += 1;
    } else {
      counts.set(column, { row, count: 1 });
    }
  }

  const rows = List(counts.values()).map(({ row, count }) =>
    row.set("count", count).set("share", count / table.size),
  );

  const result = of(rows);
  return sortDescBy(result, "count");
}
