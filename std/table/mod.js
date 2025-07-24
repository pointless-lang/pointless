import { checkType, compareAll, getType, varargs } from "../../src/values.js";
import * as obj from "../obj/mod.js";
import * as list from "../list/mod.js";
import { Table } from "../../src/table.js";
import { repr } from "../../src/repr.js";
import { Panic } from "../../src/panic.js";
import { OrderedMap, OrderedSet, List } from "immutable";

export function of(contents) {
  // Create a table from `contents`, where `contents` is an object, list
  // of objects, or table.
  //
  // If `contents` is an object:
  //
  // - The keys become the table's column names.
  // - The values become the data for each column:
  //   - List values are used directly as the table's column data, and must
  //     all be the same length.
  //   - Non-list values are repeated across all rows.
  //
  // ```ptls
  // table.of({
  //   name: ["Lamar", "Josh"],
  //   yards: [4172, 3731],
  //   tds: [41, 28],
  //   ints: [4, 6],
  //   rings: 0,
  // })
  // ```
  //
  // If `contents` is a list:
  //
  // - The list must contain objects, all with the same keys.
  // - These keys become the table's column names.
  // - Each object becomes a row.
  //
  // ```ptls
  // table.of([
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4, rings: 0 },
  //   { name: "Josh", yards: 3731, tds: 28, ints: 6, rings: 0 }
  // ])
  // ```
  //
  // Note that a table with no columns will always have zero rows.
  //
  // ```ptls
  // table.of([{}, {}])
  // ```
  //
  // If `contents` is a table, it is returned as-is.

  checkType(contents, "object", "list", "table");

  switch (getType(contents)) {
    case "table": return contents;
    case "object": return new Table(contents);
  }

  if (!contents.size) {
    return new Table();
  }

  checkType(contents.first(), "object");
  const columns = contents.first().keySeq().toList();
  return Table.fromRows(contents, columns);
}

export function $new(columns) {
  // Create an empty table with the given `columns`.
  //
  // ```ptls
  // table.new(["name", "yards", "tds", "ints", "rings"])
  // ```

  checkType(columns, "list");
  return Table.fromRows(List(), columns);
}

export function len(table) {
  // Get the number of rows in `table`.
  //
  // ```ptls
  // len(table.of([{ name: "Lamar", yards: 4172 }, { name: "Josh", yards: 3731 }]))
  // ```

  checkType(table, "table");
  return table.size;
}

export function isEmpty(table) {
  // Check whether `table` is empty (has `0` rows).
  //
  // ```ptls
  // t1 = table.of([{ name: "Lamar", yards: 4172 }, { name: "Josh", yards: 3731 }])
  // isEmpty(t1)
  //
  // t2 = table.new(["name", "yards", "tds", "ints", "rings"])
  // isEmpty(t2)
  // ```

  return len(table) == 0;
}

export function defaultCols(table, columns) {
  // If `table` has zero columns (and therefore by definition zero rows),
  // return an empty table with the given `columns`: `table.new(columns)`.
  // If `table` has columns then return `table`.
  //
  // ```ptls
  // t1 = table.of([{ name: "Lamar", yards: 4172 }])
  // table.defaultCols(t1, ["name", "yards"])
  //
  // t2 = table.of([])
  // table.defaultCols(t2, ["name", "yards"])
  // ```
  //
  // This is useful when you're making a table from a list of rows that may
  // or may not be empty, and you want to make sure your table ends up with
  // the correct columns.

  checkType(table, "table");
  checkType(columns, "list");

  if (!table.width) {
    return $new(columns);
  }

  table.checkColumns(...columns);
  return table;
}

export function rows(table) {
  // Get a list of the rows in `table`.
  //
  // ```ptls
  // players = table.of({ name: ["Lamar", "Josh"], yards: [4172, 3731], tds: [41, 28] })
  // table.rows(players)
  // ```

  return List(table);
}

export function reverse(table) {
  // Reverse the rows in `table`.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  // ])
  //
  // reverse(cities)
  // ```

  checkType(table, "table");
  return of(List(table).reverse());
}

export function unique(table) {
  // Remove duplicate rows from `table`, keeping only the first occurrence
  // of each row.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "New York", state: "NY" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "New York", state: "NY" },
  //   { city: "Houston", state: "TX" },
  // ])
  //
  // table.unique(cities)
  // ```

  checkType(table, "table");
  return of(OrderedSet(table).toList());
}

export function get(table, selector) {
  // Get the row or column from `table` that corresponds to `selector`, where
  // `selector` may be a number, string, or object.
  //
  // - If `selector` is a number, return the row at index `selector`.
  // 
  // - If `selector` is a string, return the values from the matching column
  //   as a list.
  //
  // - If `selector` is an object, return the first row that matches (contain
  //   all the entries in) `selector`, with the requirement that at least one
  //   row matches.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  // ])
  //
  // table.get(cities, 1)
  // table.get(cities, "city")
  // table.get(cities, { state: "TX" })
  // ```
  //
  // *Note that index and column-name access can also be done using the `[]`
  // and `.` operators*:
  //
  // ```ptls
  // cities[1]
  // cities["city"]
  // cities.city
  // ```

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
  // Check whether `table` contains a column or row that matches `selector`,
  // which may be either a string or an object.
  //
  // - If `selector` is a string, check whether `table` has a matching column.
  //
  // - If `selector` is an object, check whether `table` has a row which
  //   matches (contain all the entries in) `selector`.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  // ])
  //
  // has(cities, "city")
  // has(cities, "county")
  //
  // has(cities, { state: "NY" })
  // has(cities, { state: "VT" })
  // ```

  checkType(table, "table");
  checkType(selector, "object", "string");

  if (getType(selector) === "string") {
    return table.data.has(selector);
  }

  return table.has(selector);
}

export function columns(table) {
  // Get the columns of `table` as a object where they keys are the table's
  // column names and the values are the list of column values.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  // ])
  //
  // table.columns(cities)
  // ```

  checkType(table, "table");
  return table.columns();
}

export function indexOf(table, matcher) {
  // Get the index of the first row in `table` that matches (contains all
  // the entries in) the object `matcher`, or `none` if no row matches.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  //   { city: "Philadelphia", state: "PA" },
  //   { city: "San Antonio", state: "TX" },
  // ])
  //
  // table.indexOf(cities, { state: "TX" })
  // table.indexOf(cities, { state: "FL" })
  // ```

  checkType(table, "table");
  return table.findMatch(matcher) ?? null;
}

export function match(table, matcher) {
  // Filter `table` to contain only the rows which match (contain all the
  // entries in) the object `matcher`.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  //   { city: "Philadelphia", state: "PA" },
  //   { city: "San Antonio", state: "TX" },
  // ])
  //
  // table.match(cities, { state: "TX" })
  // ```

  checkType(table, "table");
  return table.match(matcher);
}

export function remove(table, selector) {
  // Remove columns or rows matching `selector` from `table`, where selector
  // may be a string, list of strings, or object.
  //
  // - If `selector` is a string, remove the single column with that name.
  //
  // - If `selector` is a list of strings, remove all columns listed in
  //   `selector`.
  //
  // - If `selector` is an object, remove all rows which match (contain all
  //   the entries in) `selector`.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "Houston", state: "TX", population: 2390125 },
  //   { city: "Phoenix", state: "AZ", population: 1673164 },
  //   { city: "Philadelphia", state: "PA", population: 1573916 },
  //   { city: "San Antonio", state: "TX", population: 1526656 },
  //   { city: "San Diego", state: "CA", population: 1404452 },
  //   { city: "Dallas", state: "TX", population: 1326087 },
  // ])
  //
  // remove(cities, "population")
  // remove(cities, ["city", "population"])
  // remove(cities, { state: "TX" })
  // ```

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
  // Add `row` to the end of `table`. The keys in `row` must match the columns
  // in `table`.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  //   { city: "Philadelphia", state: "PA" },
  // ])
  //
  // push(cities, { city: "San Antonio", state: "TX" })
  // ```

  return table.addRow(row);
}

export function pop(table) {
  // Remove the last row from `table`.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  //   { city: "Philadelphia", state: "PA" },
  //   { city: "San Antonio", state: "TX" },
  // ])
  //
  // table.pop(cities)
  // ```

  checkType(table, "table");

  if (table.size === 0) {
    throw new Panic("empty table");
  }

  return dropLast(table, 1);
}

export function merge(tables) {
  // Merge (flatten) a list of `tables` into a single table.
  //
  // ```ptls
  // t1 = table.of([
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  // ])
  // 
  // t2 = table.of([
  //   { city: "Philadelphia", state: "PA" },
  //   { city: "San Antonio", state: "TX" },
  // ])
  //
  // table.merge([t1, t2])
  // ```

  return Table.merge(tables);
}

export function take(table, count) {
  // Get a table containing the first `count` rows from `table`.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  // ])
  //
  // take(cities, 3)
  // ```

  checkType(table, "table");

  const data = new Map();

  for (const [column, values] of table.data) {
    data.set(column, list.take(values, count));
  }

  return new Table(OrderedMap(data));
}

export function takeLast(table, count) {
  // Get a table containing the last `count` rows from `table`.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  // ])
  //
  // takeLast(cities, 3)
  // ```

  checkType(table, "table");

  const data = new Map();

  for (const [column, values] of table.data) {
    data.set(column, list.takeLast(values, count));
  }

  return new Table(OrderedMap(data));
}

export function drop(table, count) {
  // Remove the first `count` rows from `table`.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  // ])
  //
  // drop(cities, 3)
  // ```

  checkType(table, "table");

  const data = new Map();

  for (const [column, values] of table.data) {
    data.set(column, list.drop(values, count));
  }

  return new Table(OrderedMap(data));
}

export function dropLast(table, count) {
  // Remove the last `count` rows from `table`.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  // ])
  //
  // dropLast(cities, 3)
  // ```

  checkType(table, "table");

  const data = new Map();

  for (const [column, values] of table.data) {
    data.set(column, list.dropLast(values, count));
  }

  return new Table(OrderedMap(data));
}

export function top(table, columns, count) {
  // Sort `table` in descending order by `columns` and take the first
  // `count` rows of the sorted table. Equivalent to
  // `take(sortDescBy(table, columns), count)`.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "New York", state: "NY", population: 8478072 },
  //   { city: "Los Angeles", state: "CA", population: 3878704 },
  //   { city: "Chicago", state: "IL", population: 2721308 },
  //   { city: "Houston", state: "TX", population: 2390125 },
  //   { city: "Phoenix", state: "AZ", population: 1673164 },
  //   { city: "Philadelphia", state: "PA", population: 1573916 },
  // ])
  //
  // table.top(cities, "population", 4)
  // ```

  return take(sortDescBy(table, columns), count);
}

export function bottom(table, columns, count) {
  // Sort `table` in ascending order by `columns` and take the first
  // `count` rows of the sorted table. Equivalent to
  // `take(sortBy(table, columns), count)`.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "New York", state: "NY", population: 8478072 },
  //   { city: "Los Angeles", state: "CA", population: 3878704 },
  //   { city: "Chicago", state: "IL", population: 2721308 },
  //   { city: "Houston", state: "TX", population: 2390125 },
  //   { city: "Phoenix", state: "AZ", population: 1673164 },
  //   { city: "Philadelphia", state: "PA", population: 1573916 },
  // ])
  //
  // table.bottom(cities, "population", 4)
  // ```

  return take(sortBy(table, columns), count);
}

export async function map(table, func) {
  // Transform each row in `table` using `func`.
  //
  // ```ptls
  // players = table.of([
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4 },
  //   { name: "Josh", yards: 3731, tds: 28, ints: 6 }
  // ])
  //
  // fn addTD(player)
  //   player.tds += 1
  //   player
  // end
  //
  // table.map(players, addTD)
  // ```
  //
  // *Note that this can also be accomplished using the `$` operator along
  // with `table.of`*:
  //
  // ```ptls
  // players $ addTD | table.of
  // ```

  checkType(table, "table");
  return await table.map(func);
}

export async function filter(table, condition) {
  // Keep the rows in `table` that satisfy `condition`.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  //   { city: "Philadelphia", state: "PA" },
  //   { city: "San Antonio", state: "TX" },
  //   { city: "San Diego", state: "CA" },
  //   { city: "Dallas", state: "TX" },
  // ])
  //
  // table.filter(cities, fn(city) city.state == "TX" end)
  // ```
  //
  // *Note that this can also be accomplished using the `?`*:
  //
  // ```ptls
  // cities ? arg.state == "TX"
  // ```

  checkType(table, "table");
  return await table.filter(condition);
}

export function select(table, columns) {
  // Get a new table containing only specified `columns` from `table`, in the
  // given order. `columns` may be a single string (for one column) or a list
  // of strings (for multiple columns).
  //
  // ```ptls
  // players = table.of([
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4 },
  //   { name: "Josh", yards: 3731, tds: 28, ints: 6 }
  // ])
  //
  // select(players, ["yards", "name"])
  // select(players, "name")
  // ```

  checkType(table, "table");
  columns = varargs(columns);
  return new Table(obj.select(table.data, columns));
}

export function focus(table, columns) {
  // Reorder the columns in `table` so that the given `columns` appear first,
  // in the given order. `columns` may be a single string (for one column) or
  // a list of strings (for multiple columns).
  //
  // ```ptls
  // players = table.of([
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4 },
  //   { name: "Josh", yards: 3731, tds: 28, ints: 6 }
  // ])
  //
  // table.focus(players, ["yards", "name"])
  // table.focus(players, "ints")
  // ```

  checkType(table, "table");
  columns = varargs(columns);
  return new Table(obj.focus(table.data, columns));
}

// export function removeColumns(table, columns) {
//   checkType(table, "table");
//   columns = varargs(columns);
//   return new Table(obj.removeAll(table.data, columns));
// }

export function rename(table, old, $new) {
  // Rename the column with name `old` to name `new` in `table`.
  //
  // ```ptls
  // players = table.of([
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4 },
  //   { name: "Josh", yards: 3731, tds: 28, ints: 6 }
  // ])
  //
  // table.rename(players, "tds", "touchdowns")
  // ```

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
  // Sort the rows of `table` in ascending order by one or more columns.
  // `columns` may be a single string (for one column) or a list of strings
  // (for multiple columns).
  // 
  // If multiple columns are given, rows are first sorted by the first column;
  // if two rows have the same value in that column, the second column is used
  // to break ties, and so on for any additional columns.
  //
  // Values in the sort columns must be numbers, strings, or booleans, and all
  // values within a column must share the same type.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "Houston", state: "TX", population: 2390125 },
  //   { city: "Phoenix", state: "AZ", population: 1673164 },
  //   { city: "Philadelphia", state: "PA", population: 1573916 },
  //   { city: "San Antonio", state: "TX", population: 1526656 },
  //   { city: "San Diego", state: "CA", population: 1404452 },
  //   { city: "Dallas", state: "TX", population: 1326087 },
  // ])
  //
  // sortBy(cities, "population")
  // sortBy(cities, ["state", "city"])
  // ```

  checkType(table, "table");
  columns = varargs(columns);
  table.checkColumns(...columns);
  return doSortBy(table, columns, false);
}

export function sortDescBy(table, columns) {
  // Sort the rows of `table` in descending order by one or more columns.
  // See the documentation for [table.sortBy](#table.sortBy) for details
  // on the sorting process.
  //
  // ```ptls
  // cities = table.of([
  //   { city: "Houston", state: "TX", population: 2390125 },
  //   { city: "Phoenix", state: "AZ", population: 1673164 },
  //   { city: "Philadelphia", state: "PA", population: 1573916 },
  //   { city: "San Antonio", state: "TX", population: 1526656 },
  //   { city: "San Diego", state: "CA", population: 1404452 },
  //   { city: "Dallas", state: "TX", population: 1326087 },
  // ])
  //
  // sortDescBy(cities, "population")
  // sortDescBy(cities, ["state", "city"])
  // ```

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
