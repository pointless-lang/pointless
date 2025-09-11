import { checkType, compareAll, getType } from "../src/values.js";
import { checkWhole } from "../src/num.js";
import * as obj from "./Obj.js";
import * as List from "./List.js";
import { Table } from "../src/table.js";
import { repr } from "../src/repr.js";
import { Panic } from "../src/panic.js";
import im from "immutable";

function flattenCols(table, columns) {
  checkType(columns, "string", "list");

  if (getType(columns) === "string") {
    table.checkColumns(columns);
    return im.List([columns]);
  }

  table.checkColumns(...columns);
  return columns;
}

export function of(value) {
  // Create a table from `value`, where `value` may be an object, list
  // of objects, or table.
  //
  // - If `value` is an object, the keys become column names, and the values
  //   become the data for each column.
  //
  //   - List values are used directly as the table's column data, and must
  //     all be the same length.
  //   - Non-list values are repeated across all rows.
  //
  // - If `value` is a list of objects, these objects become the rows of the
  //   table. The objects must have the same keys, which become the column
  //   names. Note that a table with no columns will always have zero rows.
  //
  // - If `value` is a table, return it.
  //
  // ```ptls
  // Table.of({
  //   name: ["Lamar", "Josh"],
  //   pos: "qb",
  //   yards: [4172, 3731],
  //   tds: [41, 28],
  //   ints: [4, 6],
  // })
  //
  // Table.of([
  //   { name: "Lamar", pos: "qb", yards: 4172, tds: 41, ints: 4 },
  //   { name: "Josh", pos: "qb", yards: 3731, tds: 28, ints: 6 }
  // ])
  // ```

  checkType(value, "object", "list", "table");

  switch (getType(value)) {
    case "table":
      return value;
    case "object":
      return new Table(value);
  }

  if (!value.size) {
    return new Table();
  }

  checkType(value.first(), "object");
  const columns = value.first().keySeq().toList();
  return Table.fromRows(value, columns);
}

export function $new(columns) {
  // Create an empty table with the given `columns`.
  //
  // ```ptls
  // Table.new(["name", "yards", "tds", "ints"])
  // ```

  checkType(columns, "list");
  return Table.fromRows(im.List(), columns);
}

export function len(table) {
  // Get the number of rows in `table`.
  //
  // ```ptls
  // players = Table.of([
  //   { name: "Lamar", yards: 4172 },
  //   { name: "Josh", yards: 3731 },
  // ])
  //
  // len(players)
  // ```

  checkType(table, "table");
  return table.size;
}

export function isEmpty(table) {
  // Check whether `table` is empty (has `0` rows).
  //
  // ```ptls
  // players = Table.of([
  //   { name: "Lamar", yards: 4172 },
  //   { name: "Josh", yards: 3731 },
  // ])
  //
  // isEmpty(players)
  //
  // players = Table.new(["name", "yards"])
  // isEmpty(players)
  // ```

  return len(table) == 0;
}

export function defaultCols(table, columns) {
  // If `table` has zero columns (and therefore by definition zero rows),
  // return an empty table with the given `columns`. If `table` has columns
  // then return `table`.
  //
  // This is useful when you're making a table from a list of rows that may
  // or may not be empty, and you want to make sure your table ends up with
  // the correct columns.
  //
  // ```ptls
  // players = Table.of([
  //   { name: "Lamar", yards: 4172 },
  //   { name: "Josh", yards: 3731 },
  // ])
  //
  // Table.defaultCols(players, ["name", "yards"])
  //
  // players = Table.of([])
  // Table.defaultCols(players, ["name", "yards"])
  // ```

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
  // players = Table.of({
  //   name: ["Lamar", "Josh"],
  //   yards: [4172, 3731],
  //   tds: [41, 28],
  //   ints: [4, 6],
  // })
  //
  // Table.rows(players)
  // ```

  return im.List(table);
}

export function reverse(table) {
  // Reverse the rows in `table`.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  // ])
  //
  // reverse(cities)
  // ```

  checkType(table, "table");
  return of(im.List(table).reverse());
}

export function unique(table) {
  // Deduplicate rows of `table`, keeping only the first occurrence
  // of each row.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "New York", state: "NY" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "New York", state: "NY" },
  //   { city: "Houston", state: "TX" },
  // ])
  //
  // Table.unique(cities)
  // ```

  checkType(table, "table");
  return of(im.OrderedSet(table).toList());
}

export function get(table, selector) {
  // Get the row or column from `table` that corresponds to `selector`, where
  // `selector` may be a number, string, or object.
  //
  // - If `selector` is a number, return the row at index `selector`.
  //
  // - If `selector` is a string, return the values from the column with name
  //   `selector` as a list.
  //
  // - If `selector` is an object, return the first row that matches (contain
  //   all the entries in) `selector`, with the requirement that at least one
  //   row matches.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  // ])
  //
  // Table.get(cities, 1)
  // Table.get(cities, "city")
  // Table.get(cities, { state: "TX" })
  // ```
  //
  // *Note that these operations can also be performed using the index `[]` and
  // field `.` operators*.
  //
  // ```ptls
  // cities[1]
  // cities.city
  // cities["city"]
  // cities[{ state: "TX" }]
  // ```

  checkType(table, "table");
  return table.get(selector);
}

export function set(table, selector, value) {
  // Update the row or column in `table` that corresponds to `selector` with
  // `value`. `selector` may be a number, string, or object.
  //
  // - If `selector` is a number, replace the row at index `selector` with the
  //   data in `value`, where `value` is an object whose keys match the
  //   columns of `table`.
  //
  // - If `selector` is a string, replace the column named `selector` with
  //   `value`.
  //
  //   - If `value` is a list, it becomes the column data. A list `value`
  //     must have the same length as `table`.
  //   - If `value` is not a list, it is repeated across all rows.
  //
  // - If `selector` is an object, find the first row that matches (contains
  //   all the entries in) `selector`, with the requirement that at least one
  //   row matches. Replace this row with the data in `value`, where `value`
  //   is an object whose keys match the columns of `table`.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  // ])
  //
  // Table.set(cities, 0, { city: "Big Apple", state: "Empire" })
  // Table.set(cities, "state", ["New York", "Cali", "Illinois", "Texas"])
  // Table.set(cities, "state", "TX")
  // Table.set(cities, { state: "TX" },  { city: "Austin" })
  // Table.set(cities, { state: "TX" },  { city: "Phoenix", state: "AZ" })
  // ```
  //
  // *Note that if you want to update an existing variable, you could also
  // use variable assignment*.
  //
  // ```ptls
  // citiesCopy = cities
  // citiesCopy[0] = { city: "Big Apple", state: "Empire" }
  // ```
  //
  // ```ptls
  // citiesCopy = cities
  // citiesCopy.state = ["New York", "Cali", "Illinois", "Texas"]
  // ```
  //
  // ```ptls
  // citiesCopy = cities
  // citiesCopy.state = "TX"
  // ```
  //
  // ```ptls
  // citiesCopy = cities
  // citiesCopy[{ state: "TX" }].city = "Austin"
  // ```
  //
  // ```ptls
  // citiesCopy = cities
  // citiesCopy[{ state: "TX" }] = { city: "Phoenix", state: "AZ" }
  // ```

  checkType(table, "table");
  return table.set(selector, value);
}

export function put(value, table, selector) {
  // Update the row or column in `table` that corresponds to `selector` with
  // `value`. `selector` may be a number, string, or object. See the docs for
  // [Table.set](#set) for details on the update process.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  // ])
  //
  // Table.put({ city: "Big Apple", state: "Empire" }, cities, 0)
  // Table.put(["New York", "Cali", "Illinois", "Texas"], cities, "state")
  // Table.put("TX", cities, "state")
  // Table.put({ city: "Phoenix", state: "AZ" }, cities, { state: "TX" })
  // ```
  //
  // *Note that if you want to update an existing variable, you could also
  // use variable assignment. See the docs for [Table.set](#set) for
  // more details.*

  checkType(table, "table");
  return table.set(selector, value);
}

export function has(table, selector) {
  // Check whether `table` contains a column or row that matches `selector`,
  // which may be either a string or an object.
  //
  // - If `selector` is a string, check whether `table` has a column named
  //   `selector`.
  //
  // - If `selector` is an object, check whether `table` has a row which
  //   matches (contain all the entries in) `selector`.
  //
  // ```ptls
  // cities = Table.of([
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
  // Get the column names in `table` as a list.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  // ])
  //
  // Table.columns(cities)
  // ```

  checkType(table, "table");
  return table.columns();
}

export function indexOf(table, matcher) {
  // Get the index of the first row in `table` that matches (contains all
  // the entries in) the object `matcher`, or `none` if no row matches.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  //   { city: "Philadelphia", state: "PA" },
  //   { city: "San Antonio", state: "TX" },
  // ])
  //
  // Table.indexOf(cities, { state: "TX" })
  // Table.indexOf(cities, { state: "FL" })
  // ```

  checkType(table, "table");
  return table.findMatch(matcher) ?? null;
}

export function match(table, matcher) {
  // Filter `table` to contain only the rows which match (contain all the
  // entries in) the object `matcher`.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  //   { city: "Philadelphia", state: "PA" },
  //   { city: "San Antonio", state: "TX" },
  // ])
  //
  // Table.match(cities, { state: "TX" })
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
  // cities = Table.of([
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

  selector = flattenCols(table, selector);
  return new Table(obj.removeAll(table.data, selector));
}

export function push(table, row) {
  // Add `row` to the end of `table`. The keys in `row` must match the columns
  // in `table`.
  //
  // ```ptls
  // cities = Table.of([
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
  // cities = Table.of([
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  //   { city: "Philadelphia", state: "PA" },
  //   { city: "San Antonio", state: "TX" },
  // ])
  //
  // Table.pop(cities)
  // ```

  checkType(table, "table");

  if (table.size === 0) {
    throw new Panic("empty table");
  }

  return dropLast(table, 1);
}

export function splice(table, index, count, rows) {
  // Remove `count` rows from `table` starting at `index`, and
  // replace them with those in the table `rows`.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  //   { city: "Philadelphia", state: "PA" },
  //   { city: "San Antonio", state: "TX" },
  // ])
  //
  // newRows = Table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  // ])
  //
  // Table.splice(cities, 1, 2, newRows)
  // ```

  checkType(table, "table");
  table.checkIndex(index);
  checkWhole(count);
  checkType(rows, "table");

  const newRows = im.List(table).splice(index, count, ...rows)
  return Table.fromRows(newRows, table.columns());
}

export function merge(tables) {
  // Merge (flatten) a list of `tables` into a single table.
  //
  // ```ptls
  // t1 = Table.of([
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  // ])
  //
  // t2 = Table.of([
  //   { city: "Philadelphia", state: "PA" },
  //   { city: "San Antonio", state: "TX" },
  // ])
  //
  // Table.merge([t1, t2])
  // ```

  return Table.merge(tables);
}

export function take(table, count) {
  // Get the first `count` rows from `table`.
  //
  // ```ptls
  // cities = Table.of([
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
    data.set(column, List.take(values, count));
  }

  return new Table(im.OrderedMap(data));
}

export function takeLast(table, count) {
  // Get the last `count` rows from `table`.
  //
  // ```ptls
  // cities = Table.of([
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
    data.set(column, List.takeLast(values, count));
  }

  return new Table(im.OrderedMap(data));
}

export function drop(table, count) {
  // Remove the first `count` rows from `table`.
  //
  // ```ptls
  // cities = Table.of([
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
    data.set(column, List.drop(values, count));
  }

  return new Table(im.OrderedMap(data));
}

export function dropLast(table, count) {
  // Remove the last `count` rows from `table`.
  //
  // ```ptls
  // cities = Table.of([
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
    data.set(column, List.dropLast(values, count));
  }

  return new Table(im.OrderedMap(data));
}

export async function map(table, func) {
  // Transform each row in `table` using `func`.
  //
  // ```ptls
  // players = Table.of([
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4 },
  //   { name: "Josh", yards: 3731, tds: 28, ints: 6 }
  // ])
  //
  // fn addTD(player)
  //   player.tds += 1
  //   player
  // end
  //
  // Table.map(players, addTD)
  // ```
  //
  // *Note that this can also be accomplished using the map `$` operator
  // along with `Table.of`*.
  //
  // ```ptls
  // players $ addTD | Table.of
  // ```

  checkType(table, "table");
  return await table.map(func);
}

export async function filter(table, condition) {
  // Keep the rows in `table` that satisfy `condition`.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  //   { city: "Philadelphia", state: "PA" },
  //   { city: "San Antonio", state: "TX" },
  //   { city: "San Diego", state: "CA" },
  //   { city: "Dallas", state: "TX" },
  // ])
  //
  // Table.filter(cities, fn(city) city.state == "TX" end)
  // ```
  //
  // *Note that this can also be accomplished using the filter `?` operator*.
  //
  // ```ptls
  // cities ? arg.state == "TX"
  // ```

  checkType(table, "table");
  return await table.filter(condition);
}

export function select(table, columns) {
  // Create a table containing the specified `columns` from `table`, in the
  // given order. `columns` may be a single string (for one column) or a list
  // of strings (for multiple columns).
  //
  // ```ptls
  // players = Table.of([
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4 },
  //   { name: "Josh", yards: 3731, tds: 28, ints: 6 }
  // ])
  //
  // select(players, ["yards", "name"])
  // select(players, "name")
  // ```

  checkType(table, "table");
  columns = flattenCols(table, columns);
  return new Table(obj.select(table.data, columns));
}

export function focus(table, columns) {
  // Reorder the columns in `table` so that the given `columns` appear first,
  // in the given order. `columns` may be a single string (for one column) or
  // a list of strings (for multiple columns).
  //
  // ```ptls
  // players = Table.of([
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4 },
  //   { name: "Josh", yards: 3731, tds: 28, ints: 6 }
  // ])
  //
  // Table.focus(players, ["yards", "name"])
  // Table.focus(players, "ints")
  // ```

  checkType(table, "table");
  columns = flattenCols(table, columns);
  return new Table(obj.focus(table.data, columns));
}

// export function removeColumns(table, columns) {
//   checkType(table, "table");
//   columns = flattenCols(table, columns);
//   return new Table(obj.removeAll(table.data, columns));
// }

export function rename(table, old, $new) {
  // Rename the column with name `old` to name `new` in `table`.
  //
  // ```ptls
  // players = Table.of([
  //   { name: "Lamar", yards: 4172, tds: 41, ints: 4 },
  //   { name: "Josh", yards: 3731, tds: 28, ints: 6 }
  // ])
  //
  // Table.rename(players, "tds", "touchdowns")
  // ```

  checkType(table, "table");
  return new Table(obj.rename(table.data, old, $new));
}

function selectValues(object, columns) {
  return columns.map((column) => obj.get(object, column));
}

function doSortBy(table, columns, desc) {
  // List drops the ball if we pass table directly
  const rows = im.List([...table]).sortBy(
    (row) => selectValues(row, columns),
    (a, b) => compareAll(a, b, desc),
  );

  return of(rows);
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
  // Values in the sort columns must be numbers, strings, booleans, or `none`,
  // and all non-`none` values within a column must share the same type. Rows
  // with `none` values in their sort columns will be placed at the end of the
  // resulting table, whether sorting in ascending or descending order.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "Houston", state: "TX", population: 2390125 },
  //   { city: "Phoenix", state: "AZ", population: 1673164 },
  //   { city: "Philadelphia", state: "PA", population: 1573916 },
  //   { city: "San Antonio", state: "TX", population: 1526656 },
  //   { city: "San Diego", state: "CA", population: 1404452 },
  //   { city: "Dallas", state: "TX", population: 1326087 },
  //   { city: "DC", state: none, population: 702250 },
  // ])
  //
  // sortBy(cities, "population")
  // sortBy(cities, ["state", "city"])
  // ```

  checkType(table, "table");
  columns = flattenCols(table, columns);
  return doSortBy(table, columns, false);
}

export function sortDescBy(table, columns) {
  // Sort the rows of `table` in descending order by one or more columns.
  // See the docs for [Table.sortBy](#sortBy) for details on the
  // sorting process.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "Houston", state: "TX", population: 2390125 },
  //   { city: "Phoenix", state: "AZ", population: 1673164 },
  //   { city: "Philadelphia", state: "PA", population: 1573916 },
  //   { city: "San Antonio", state: "TX", population: 1526656 },
  //   { city: "San Diego", state: "CA", population: 1404452 },
  //   { city: "Dallas", state: "TX", population: 1326087 },
  //   { city: "DC", state: none, population: 702250 },
  // ])
  //
  // sortDescBy(cities, "population")
  // sortDescBy(cities, ["state", "city"])
  // ```

  checkType(table, "table");
  columns = flattenCols(table, columns);
  return doSortBy(table, columns, true);
}

export function top(table, columns, count) {
  // Sort `table` in descending order by `columns` and take the first
  // `count` rows of the sorted table.
  //
  // Equivalent to `take(sortDescBy(table, columns), count)`.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "New York", state: "NY", population: 8478072 },
  //   { city: "Los Angeles", state: "CA", population: 3878704 },
  //   { city: "Chicago", state: "IL", population: 2721308 },
  //   { city: "Houston", state: "TX", population: 2390125 },
  //   { city: "Phoenix", state: "AZ", population: 1673164 },
  //   { city: "Philadelphia", state: "PA", population: 1573916 },
  // ])
  //
  // Table.top(cities, "population", 4)
  // ```

  return take(sortDescBy(table, columns), count);
}

export function bottom(table, columns, count) {
  // Sort `table` in ascending order by `columns` and take the first
  // `count` rows of the sorted table.
  // Equivalent to `take(sortBy(table, columns), count)`.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "New York", state: "NY", population: 8478072 },
  //   { city: "Los Angeles", state: "CA", population: 3878704 },
  //   { city: "Chicago", state: "IL", population: 2721308 },
  //   { city: "Houston", state: "TX", population: 2390125 },
  //   { city: "Phoenix", state: "AZ", population: 1673164 },
  //   { city: "Philadelphia", state: "PA", population: 1573916 },
  // ])
  //
  // Table.bottom(cities, "population", 4)
  // ```

  return take(sortBy(table, columns), count);
}

function listExtremum(table, columns, desc) {
  checkType(table, "table");
  table.checkNonEmpty();
  columns = flattenCols(table, columns);

  return im.List([...table]).maxBy(
    (row) => selectValues(row, columns),
    (a, b) => compareAll(a, b, desc),
  );
}

export function max(table, columns) {
  // Get the row with the largest values in `columns` where `columns` may be
  // a string (single column) or a list of strings (multiple columns). In
  // other words, get the row that would come first if `table` were sorted by
  // `columns` in descending order.
  //
  // See the docs for [Table.sortBy](#sortBy) for details on the
  // sorting process.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "Houston", state: "TX", population: 2390125 },
  //   { city: "Phoenix", state: "AZ", population: 1673164 },
  //   { city: "Philadelphia", state: "PA", population: 1573916 },
  //   { city: "San Antonio", state: "TX", population: 1526656 },
  //   { city: "San Diego", state: "CA", population: 1404452 },
  //   { city: "Dallas", state: "TX", population: 1326087 },
  // ])
  //
  // Table.max(cities, "population")
  // Table.max(cities, ["state", "city"])

  return listExtremum(table, columns, false);
}

export function min(table, columns) {
  // Get the row with the smallest values in `columns` where `columns` may be
  // a string (single column) or a list of strings (multiple columns). In
  // other words, get the row that would come first if `table` were sorted by
  // `columns` in ascending order.
  //
  // See the docs for [Table.sortBy](#sortBy) for details on the
  // sorting process.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "Houston", state: "TX", population: 2390125 },
  //   { city: "Phoenix", state: "AZ", population: 1673164 },
  //   { city: "Philadelphia", state: "PA", population: 1573916 },
  //   { city: "San Antonio", state: "TX", population: 1526656 },
  //   { city: "San Diego", state: "CA", population: 1404452 },
  //   { city: "Dallas", state: "TX", population: 1326087 },
  // ])
  //
  // Table.min(cities, "population")
  // Table.min(cities, ["state", "city"])
  // ```

  return listExtremum(table, columns, true);
}

export function group(table, columns) {
  // Partition `table` into groups based on the values in `columns`, which
  // may be a string (single column) or a list of strings (multiple columns).
  //
  // Rows with the same values in the given columns are grouped together. The
  // result is a list of tables, each containing the rows for one group.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  //   { city: "Houston", state: "TX" },
  //   { city: "Phoenix", state: "AZ" },
  //   { city: "Philadelphia", state: "PA" },
  //   { city: "San Antonio", state: "TX" },
  //   { city: "San Diego", state: "CA" },
  //   { city: "Dallas", state: "TX" },
  // ])
  //
  // Table.group(cities, "state")
  // ```

  checkType(table, "table");
  columns = flattenCols(table, columns);

  let groups = im.OrderedMap();

  for (const row of table) {
    const group = selectValues(row, columns);

    if (!groups.has(group)) {
      groups = groups.set(group, []);
    }

    groups.get(group).push(row);
  }

  return groups
    .valueSeq()
    .map((group) => of(im.List(group)))
    .toList();
}

export async function summarize(table, columns, reducer) {
  // Group the rows in `table` by one or more `columns` and summarize each
  // group using the function `reducer`. `columns` may be a string (single
  // column) or a list of strings (multiple columns).
  //
  // Rows are grouped based on the values in the given `columns` (see the
  // docs for [Table.group](#group) for details on the grouping
  // process.) `reducer` is called for each group and returns an object
  // containing summary information. These objects are merged with each
  // group's column values to form the final summary row for that group.
  //
  // ```ptls
  // cities = Table.of([
  //   { city: "Los Angeles", state: "CA", population: 3878704 },
  //   { city: "Chicago", state: "IL", population: 2721308 },
  //   { city: "Houston", state: "TX", population: 2390125 },
  //   { city: "Phoenix", state: "AZ", population: 1673164 },
  //   { city: "Philadelphia", state: "PA", population: 1573916 },
  //   { city: "San Antonio", state: "TX", population: 1526656 },
  //   { city: "San Diego", state: "CA", population: 1404452 },
  //   { city: "Dallas", state: "TX", population: 1326087 },
  // ])
  //
  // fn calcStateStats(group)
  //   totalPop = sum(group.population)
  //   biggestCity = Table.max(group, "population").city
  //   numCities = len(group)
  //   { totalPop, biggestCity, numCities }
  // end
  //
  // Table.summarize(cities, "state", calcStateStats)
  // ```

  const groups = group(table, columns);
  columns = flattenCols(table, columns);
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
    rows.push(im.OrderedMap(row).concat(summary));
  }

  return of(im.List(rows));
}

export function counts(table) {
  // Return a table containing deduplicated rows of `table`. Each row will
  // have two additional entries `count` and `share`, which will contain the
  // number of copies of each row in the original table, and the fraction
  // of the total rows that this count represents. The original table may
  // not contain columns named `count` or `share`.
  //
  // ```ptls
  // locations = Table.of([
  //   { city: "New York", state: "NY" },
  //   { city: "New York", state: "NY" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "New York", state: "NY" },
  //   { city: "Houston", state: "TX" },
  //   { city: "Houston", state: "TX" },
  //   { city: "Los Angeles", state: "CA" },
  //   { city: "Chicago", state: "IL" },
  // ])
  //
  // Table.counts(locations)
  // ```

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

  const rows = im
    .List(counts.values())
    .map(({ row, count }) =>
      row.set("count", count).set("share", count / table.size),
    );

  const result = of(rows);
  return sortDescBy(result, "count");
}
