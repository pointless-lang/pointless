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
  const keys = contents.first().keySeq().toList();
  return Table.fromRows(contents, keys);
}

export function $new(keys) {
  checkType(keys, "list");
  return Table.fromRows(List(), keys);
}

export function len(table) {
  checkType(table, "table");
  return table.size;
}

export function isEmpty(table) {
  return len(table) == 0;
}

export function defaultCols(table, keys) {
  checkType(table, "table");
  checkType(keys, "list");

  if (!table.width) {
    return $new(keys);
  }

  table.checkKeys(...keys);
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
    return table.columns.has(selector);
  }

  return table.has(selector);
}

export function keys(table) {
  checkType(table, "table");
  return table.keys();
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
  table.checkKeys(...selector);
  return new Table(obj.removeAll(table.columns, selector));
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

  const columns = new Map();

  for (const [key, values] of table.columns) {
    columns.set(key, list.take(values, count));
  }

  return new Table(OrderedMap(columns));
}

export function takeLast(table, count) {
  checkType(table, "table");

  const columns = new Map();

  for (const [key, values] of table.columns) {
    columns.set(key, list.takeLast(values, count));
  }

  return new Table(OrderedMap(columns));
}

export function drop(table, count) {
  checkType(table, "table");

  const columns = new Map();

  for (const [key, values] of table.columns) {
    columns.set(key, list.drop(values, count));
  }

  return new Table(OrderedMap(columns));
}

export function dropLast(table, count) {
  checkType(table, "table");

  const columns = new Map();

  for (const [key, values] of table.columns) {
    columns.set(key, list.dropLast(values, count));
  }

  return new Table(OrderedMap(columns));
}

export function top(table, keys, count) {
  return take(sortDescBy(table, keys), count);
}

export function bottom(table, keys, count) {
  return take(sortBy(table, keys), count);
}

export async function map(table, func) {
  checkType(table, "table");
  return await table.map(func);
}

export async function filter(table, condition) {
  checkType(table, "table");
  return await table.filter(condition);
}

export function select(table, keys) {
  checkType(table, "table");
  keys = varargs(keys);
  return new Table(obj.select(table.columns, keys));
}

export function focus(table, keys) {
  checkType(table, "table");
  keys = varargs(keys);
  return new Table(obj.focus(table.columns, keys));
}

export function removeKeys(table, keys) {
  checkType(table, "table");
  keys = varargs(keys);
  return new Table(obj.removeAll(table.columns, keys));
}

export function rename(table, old, $new) {
  checkType(table, "table");
  return new Table(obj.rename(table.columns, old, $new));
}

function selectValues(object, keys) {
  return keys.map((key) => obj.get(object, key));
}

function doSortBy(table, keys, desc) {
  const rows = [...table]
    .map((row) => ({ rank: selectValues(row, keys), row }))
    .sort((a, b) => compareAll(a.rank, b.rank, desc))
    .map(({ row }) => row);

  return of(List(rows));
}

export function sortBy(table, keys) {
  checkType(table, "table");
  keys = varargs(keys);
  table.checkKeys(...keys);
  return doSortBy(table, keys, false);
}

export function sortDescBy(table, keys) {
  checkType(table, "table");
  keys = varargs(keys);
  table.checkKeys(...keys);
  return doSortBy(table, keys, true);
}

export function groupBy(table, keys) {
  checkType(table, "table");
  keys = varargs(keys);
  table.checkKeys(...keys);

  let groups = OrderedMap();

  for (const row of table) {
    const group = selectValues(row, keys);

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

export async function summarize(table, keys, reducer) {
  const groups = groupBy(table, keys);
  keys = varargs(keys);
  checkType(reducer, "function");

  const rows = [];

  for (const group of groups) {
    const row = new Map();

    for (const key of keys) {
      const values = group.columns.get(key);
      row.set(key, values.first());
    }

    const summary = await reducer.call(group);
    checkType(summary, "object");
    rows.push(OrderedMap(row).concat(summary));
  }

  return of(List(rows));
}

export function counts(table) {
  checkType(table, "table");

  if (table.columns.has("count")) {
    throw new Panic("table already contains column 'count'");
  }

  if (table.columns.has("share")) {
    throw new Panic("table already contains column 'share'");
  }

  const counts = new Map();

  for (const row of table) {
    const key = repr(row);

    if (counts.has(key)) {
      counts.get(key).count += 1;
    } else {
      counts.set(key, { row, count: 1 });
    }
  }

  const rows = List(counts.values()).map(({ row, count }) =>
    row.set("count", count).set("share", count / table.size),
  );

  const result = of(rows);
  return sortDescBy(result, "count");
}
