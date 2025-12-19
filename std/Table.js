import { checkType, compareAll, getType } from "../lang/values.js";
import { checkWhole } from "../lang/num.js";
import * as Obj from "./Obj.js";
import * as List from "./List.js";
import { roundTo as roundToNum } from "./Math.js";
import { Table } from "../lang/table.js";
import { Panic } from "../lang/panic.js";
import im from "../immutable/immutable.js";

function flattenCols(columns, ...tables) {
  checkType(columns, "string", "list");

  if (getType(columns) === "string") {
    columns = im.List([columns]);
  }

  for (const table of tables) {
    table.checkColumns(...columns);
  }

  return columns;
}

export function of(value) {
  // Create a table from `value`, where `value` may be an object, a list or set
  // of objects, a string in [CSV](/language/misc#csv) format, or a table.
  //
  // - If `value` is an object, the keys become column names, and the values
  //   become the data for each column.
  //   - List values are used directly as the table's column data, and must all
  //     be the same length.
  //   - Non-list values are repeated across all rows.
  //
  // - If `value` is a list or set of objects, these objects become the rows of
  //   the table. The objects must have the same keys, which become the column
  //   names. Note that a table with no columns will always have zero rows.
  //
  // - If `value` is a [CSV](/language/misc#csv) string, parse the strings and
  //   return the resulting table.
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

  // Table.of("
  // name  , pos , yards , tds , ints
  // Lamar , qb  ,  4172 ,  41 ,    4
  // Josh  , qb  ,  3731 ,  28 ,    6
  // ")

  checkType(value, "object", "list", "set", "table");
  // checkType(value, "object", "list", "set", "table", "string");

  switch (getType(value)) {
    case "table":
      return value;
    case "object":
      return new Table(value);
      // case "string":
      //   return Table.fromCsv(value);
  }

  if (!value.size) {
    return new Table();
  }

  value = im.List(value);
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
  // players = #{
  //   name    , yards
  //   "Lamar" ,  4172
  //   "Josh"  ,  3731
  // }
  //
  // len(players)
  // ```

  checkType(table, "table");
  return table.size;
}

export function isEmpty(table) {
  // Check whether `table` is empty (has `0` rows). Note that an empty table may
  // still have one or more columns.
  //
  // ```ptls
  // isEmpty(#{
  //   name    , yards
  //   "Lamar" ,  4172
  //   "Josh"  ,  3731
  // })
  //
  // isEmpty(#{
  //   name , yards
  // })
  // ```

  return len(table) == 0;
}

export function defaultCols(table, columns) {
  // If `table` has zero columns (and therefore by definition zero rows), return
  // an empty table with the given `columns`. If `table` has columns then return
  // `table`.
  //
  // This is useful when you're making a table from a list of rows that may or
  // may not be empty, and you want to make sure your table ends up with the
  // correct columns.
  //
  // ```ptls
  // players = #{
  //   name    , yards
  //   "Lamar" ,  4172
  //   "Josh"  ,  3731
  // }
  //
  // Table.defaultCols(players, ["name", "yards"])
  //
  // players = #{}
  //
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
  // players = #{
  //   name    , yards , tds, ints
  //   "Lamar" ,  4172 ,  41,    4
  //   "Josh"  ,  3731 ,  28,    6
  // }
  //
  // Table.rows(players)
  // ```

  return im.List(table);
}

export function reverse(table) {
  // Reverse the rows in `table`.
  //
  // ```ptls
  // cities = #{
  //   city          , state
  //   "New York"    , "NY"
  //   "Los Angeles" , "CA"
  //   "Chicago"     , "IL"
  //   "Houston"     , "TX"
  // }
  //
  // reverse(cities)
  // ```

  checkType(table, "table");
  return of(im.List(table).reverse());
}

export function unique(table) {
  // Deduplicate rows of `table`, keeping only the first occurrence of each row.
  //
  // ```ptls
  // cities = #{
  //   city          , state
  //   "New York"    , "NY"
  //   "New York"    , "NY"
  //   "Los Angeles" , "CA"
  //   "Chicago"     , "IL"
  //   "New York"    , "NY"
  //   "Houston"     , "TX"
  //   "Houston"     , "TX"
  // }
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
  // - If `selector` is an object, return the first row that
  //   [matches](/language/objects#object-matching) `selector`, with the
  //   requirement that at least one row matches.
  //
  // - If `selector` is a string, return the values from the column with name
  //   `selector` as a list.
  //
  // ```ptls
  // cities = #{
  //   city          , state
  //   "New York"    , "NY"
  //   "Los Angeles" , "CA"
  //   "Chicago"     , "IL"
  //   "Houston"     , "TX"
  // }
  //
  // Table.get(cities, 1)
  // Table.get(cities, { state: "TX" })
  // Table.get(cities, "city")
  // ```
  //
  // _Note that these operations can also be performed using the index `[]` and
  // field `.` operators_.
  //
  // ```ptls
  // cities[1]
  // cities[{ state: "TX" }]
  // cities.city
  // cities["city"]
  // ```

  checkType(table, "table");
  return table.get(selector);
}

export function set(table, selector, value) {
  // Update the row or column in `table` that corresponds to `selector` with
  // `value`. `selector` may be a number, string, or object.
  //
  // - If `selector` is a number, replace the row at index `selector` with the
  //   data in `value`, where `value` is an object whose keys match the columns
  //   of `table`.
  //
  // - If `selector` is a string, replace the column named `selector` with
  //   `value`.
  //   - If `value` is a list, it becomes the column data. A list `value` must
  //     have the same length as `table`.
  //   - If `value` is not a list, it is repeated across all rows.
  //
  // - If `selector` is an object, find the first row that matches
  //   [matches](/language/objects#object-matching) `selector`, with the
  //   requirement that at least one row matches. Replace this row with the data
  //   in `value`, where `value` is an object whose keys match the columns of
  //   `table`.
  //
  // ```ptls
  // cities = #{
  //   city          , state
  //   "New York"    , "NY"
  //   "Los Angeles" , "CA"
  //   "Chicago"     , "IL"
  //   "Houston"     , "TX"
  // }
  //
  // Table.set(cities, 0, { city: "Big Apple", state: "Empire" })
  // Table.set(cities, "state", ["New York", "Cali", "Illinois", "Texas"])
  // Table.set(cities, "state", "TX")
  // Table.set(cities, { state: "TX" },  { city: "Austin" })
  // Table.set(cities, { state: "TX" },  { city: "Phoenix", state: "AZ" })
  // ```
  //
  // _Note that if you want to update an existing variable, you could also use
  // variable assignment_.
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

export function has(table, selector) {
  // Check whether `table` contains a column or row that matches `selector`,
  // which may be either a string or an object.
  //
  // - If `selector` is a string, check whether `table` has a column named
  //   `selector`.
  // - If `selector` is an object, check whether `table` has a row which
  //   [matches](/language/objects#object-matching) `selector`.
  //
  // ```ptls
  // cities = #{
  //   city          , state
  //   "New York"    , "NY"
  //   "Los Angeles" , "CA"
  //   "Chicago"     , "IL"
  //   "Houston"     , "TX"
  // }
  //
  // Table.has(cities, "city")
  // Table.has(cities, "county")
  //
  // Table.has(cities, { state: "NY" })
  // Table.has(cities, { state: "VT" })
  // ```
  //
  // _Note that this can also be accomplished using the `in` operator._
  //
  // ```ptls
  // "city" in cities
  // "county" in cities
  //
  // { state: "NY" } in cities
  // { state: "VT" } in cities
  // ```

  checkType(table, "table");
  return table.has(selector);
}

export function columns(table) {
  // Get the column names in `table` as a list.
  //
  // ```ptls
  // cities = #{
  //   city          , state
  //   "New York"    , "NY"
  //   "Los Angeles" , "CA"
  //   "Chicago"     , "IL"
  //   "Houston"     , "TX"
  // }
  //
  // Table.columns(cities)
  // ```

  checkType(table, "table");
  return table.columns();
}

export function indexOf(table, matcher) {
  // Get the index of the first row in `table` that
  // [matches](/language/objects#object-matching) the object `matcher`, or
  // `none` if no row matches.
  //
  // ```ptls
  // cities = #{
  //   city           , state
  //   "Houston"      , "TX"
  //   "Phoenix"      , "AZ"
  //   "Philadelphia" , "PA"
  //   "San Antonio"  , "TX"
  // }
  //
  // Table.indexOf(cities, { state: "TX" })
  // Table.indexOf(cities, { state: "FL" })
  // ```

  checkType(table, "table");
  return table.findMatch(matcher) ?? null;
}

export function match(table, matcher) {
  // Filter `table` to contain only the rows which
  // [match](/language/objects#object-matching) the object `matcher`.
  //
  // ```ptls
  // cities = #{
  //   city           , state
  //   "Houston"      , "TX"
  //   "Phoenix"      , "AZ"
  //   "Philadelphia" , "PA"
  //   "San Antonio"  , "TX"
  // }
  //
  // Table.match(cities, { state: "TX" })
  // ```

  checkType(table, "table");
  return table.match(matcher);
}

export function remove(table, selector) {
  // Remove columns or rows matching `selector` from `table`, where selector may
  // be a string, list of strings, or object.
  //
  // - If `selector` is a string, remove the single column with that name.
  //
  // - If `selector` is a list of strings, remove all columns listed in
  //   `selector`.
  //
  // - If `selector` is an object, remove all rows which
  //   [match](/language/objects#object-matching) `selector`.
  //
  // ```ptls
  // cities = #{
  //   city           , state , population
  //   "Houston"      , "TX"  ,    2390125
  //   "Phoenix"      , "AZ"  ,    1673164
  //   "Philadelphia" , "PA"  ,    1573916
  //   "San Antonio"  , "TX"  ,    1526656
  //   "San Diego"    , "CA"  ,    1404452
  //   "Dallas"       , "TX"  ,    1326087
  // }
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

  selector = flattenCols(selector, table);
  return new Table(Obj.removeAll(table.data, selector));
}

export function push(table, row) {
  // Add `row` to the end of `table`. The keys in `row` must match the columns
  // in `table`.
  //
  // ```ptls
  // cities = #{
  //   city           , state , population
  //   "Houston"      , "TX"  ,    2390125
  //   "Phoenix"      , "AZ"  ,    1673164
  //   "Philadelphia" , "PA"  ,    1573916
  // }
  //
  // push(cities, { city: "San Antonio", state: "TX", population: 1526656 })
  // ```

  return table.addRow(row);
}

export function pop(table) {
  // Remove the last row from `table`.
  //
  // ```ptls
  // cities = #{
  //   city           , state , population
  //   "Houston"      , "TX"  ,    2390125
  //   "Phoenix"      , "AZ"  ,    1673164
  //   "Philadelphia" , "PA"  ,    1573916
  //   "San Antonio"  , "TX"  ,    1526656
  // }
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
  // Remove `count` rows from `table` starting at `index`, and replace them with
  // those in the table `rows`.
  //
  // ```ptls
  // cities = #{
  //   city           , state
  //   "New York"     , "NY"
  //   "Philadelphia" , "PA"
  //   "San Antonio"  , "TX"
  //   "Houston"      , "TX"
  //   "Phoenix"      , "AZ"
  // }
  //
  // newRows = #{
  //   city          , state
  //   "Los Angeles" , "CA"
  //   "Chicago"     , "IL"
  // }
  //
  // Table.splice(cities, 1, 2, newRows)
  // ```

  checkType(table, "table");
  table.checkIndex(index);
  checkWhole(count);
  checkType(rows, "table");

  const newRows = im.List(table).splice(index, count, ...rows);
  return Table.fromRows(newRows, table.columns());
}

export function merge(tables) {
  // Merge (flatten) a list of `tables` into a single table.
  //
  // ```ptls
  // t1 = #{
  //   city      , state
  //   "Houston" , "TX"
  //   "Phoenix" , "AZ"
  // }
  //
  // t2 = #{
  //   city           , state
  //   "Philadelphia" , "PA"
  //   "San Antonio"  , "TX"
  // }
  //
  // Table.merge([t1, t2])
  // ```
  //
  // _Note that tables can also be merged using the `+` operator._
  //
  // ```ptls
  // t1 + t2
  // ```

  return Table.merge(tables);
}

export function take(table, count) {
  // Get the first `count` rows from `table`.
  //
  // ```ptls
  // cities = #{
  //   city          , state
  //   "New York"    , "NY"
  //   "Los Angeles" , "CA"
  //   "Chicago"     , "IL"
  //   "Houston"     , "TX"
  //   "Phoenix"     , "AZ"
  // }
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
  // cities = #{
  //   city          , state
  //   "New York"    , "NY"
  //   "Los Angeles" , "CA"
  //   "Chicago"     , "IL"
  //   "Houston"     , "TX"
  //   "Phoenix"     , "AZ"
  // }
  //
  // Table.takeLast(cities, 3)
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
  // cities = #{
  //   city          , state
  //   "New York"    , "NY"
  //   "Los Angeles" , "CA"
  //   "Chicago"     , "IL"
  //   "Houston"     , "TX"
  //   "Phoenix"     , "AZ"
  // }
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
  // cities = #{
  //   city          , state
  //   "New York"    , "NY"
  //   "Los Angeles" , "CA"
  //   "Chicago"     , "IL"
  //   "Houston"     , "TX"
  //   "Phoenix"     , "AZ"
  // }
  //
  // Table.dropLast(cities, 3)
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
  // players = #{
  //   name    , yards , tds, ints
  //   "Lamar" ,  4172 ,  41,    4
  //   "Josh"  ,  3731 ,  28,    6
  // }
  //
  // fn addTD(player)
  //   player.tds += 1
  //   player
  // end
  //
  // Table.map(players, addTD)
  // ```
  //
  // _Note that this can also be accomplished using the map `$` operator along
  // with `Table.of`_.
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
  // cities = #{
  //   city           , state
  //   "Houston"      , "TX"
  //   "Phoenix"      , "AZ"
  //   "Philadelphia" , "PA"
  //   "San Antonio"  , "TX"
  //   "San Diego"    , "CA"
  //   "Dallas"       , "TX"
  // }
  //
  // Table.filter(cities, fn(city) city.state == "TX" end)
  // ```
  //
  // _Note that this can also be accomplished using the filter `?` operator_.
  //
  // ```ptls
  // cities ? arg.state == "TX"
  // ```

  checkType(table, "table");
  return await table.filter(condition);
}

export function select(table, columns) {
  // Create a table containing the specified `columns` from `table`, in the
  // given order. `columns` may be a single string (for one column) or a list of
  // strings (for multiple columns).
  //
  // ```ptls
  // players = #{
  //   name    , yards , tds, ints
  //   "Lamar" ,  4172 ,  41,    4
  //   "Josh"  ,  3731 ,  28,    6
  // }
  //
  // select(players, ["yards", "name"])
  // select(players, "name")
  // ```

  checkType(table, "table");
  columns = flattenCols(columns, table);
  return new Table(Obj.select(table.data, columns));
}

export function focus(table, columns) {
  // Reorder the columns in `table` so that the given `columns` appear first, in
  // the given order. `columns` may be a single string (for one column) or a
  // list of strings (for multiple columns).
  //
  // ```ptls
  // players = #{
  //   name    , yards , tds, ints
  //   "Lamar" ,  4172 ,  41,    4
  //   "Josh"  ,  3731 ,  28,    6
  // }
  //
  // Table.focus(players, ["yards", "name"])
  // Table.focus(players, "ints")
  // ```

  checkType(table, "table");
  columns = flattenCols(columns, table);
  return new Table(Obj.focus(table.data, columns));
}

// export function removeColumns(table, columns) {
//   checkType(table, "table");
//   columns = flattenCols(columns, table);
//   return new Table(Obj.removeAll(table.data, columns));
// }

export function rename(table, oldToNew) {
  // For every `old: new` entry in the object `oldToNew`, rename the column in
  // `table` with the name `old` to have the name `new`.
  //
  // ```ptls
  // players = #{
  //   name    , yards , tds, ints
  //   "Lamar" ,  4172 ,  41,    4
  //   "Josh"  ,  3731 ,  28,    6
  // }
  //
  // Table.rename(players, { tds: "touchdowns", ints: "interceptions" })
  // ```

  checkType(table, "table");
  return new Table(Obj.rename(table.data, oldToNew));
}

function selectValues(object, columns) {
  return columns.map((column) => Obj.get(object, column));
}

function doSortBy(table, columns, desc) {
  // List drops the ball if we pass table directly
  const rows = im.List([...table]).sortBy(
    (row) => selectValues(row, columns),
    (a, b) => compareAll(a, b, desc),
  );

  return Table.fromRows(rows, table.columns());
}

export function sortBy(table, columns) {
  // Sort the rows of `table` in ascending order by one or more columns.
  // `columns` may be a single string (for one column) or a list of strings (for
  // multiple columns).
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
  // cities = #{
  //   city           , state , population
  //   "Houston"      , "TX"  ,    2390125
  //   "Phoenix"      , "AZ"  ,    1673164
  //   "Philadelphia" , "PA"  ,    1573916
  //   "San Antonio"  , "TX"  ,    1526656
  //   "San Diego"    , "CA"  ,    1404452
  //   "Dallas"       , "TX"  ,    1326087
  //   "DC"           , none  ,     702250
  // }
  //
  // sortBy(cities, "population")
  // sortBy(cities, ["state", "city"])
  // ```

  checkType(table, "table");
  columns = flattenCols(columns, table);
  return doSortBy(table, columns, false);
}

export function sortDescBy(table, columns) {
  // Sort the rows of `table` in descending order by one or more columns. See
  // the docs for [Table.sortBy](#sortBy) for details on the sorting process.
  //
  // ```ptls
  // cities = #{
  //   city           , state , population
  //   "Houston"      , "TX"  ,    2390125
  //   "Phoenix"      , "AZ"  ,    1673164
  //   "Philadelphia" , "PA"  ,    1573916
  //   "San Antonio"  , "TX"  ,    1526656
  //   "San Diego"    , "CA"  ,    1404452
  //   "Dallas"       , "TX"  ,    1326087
  //   "DC"           , none  ,     702250
  // }
  //
  // sortDescBy(cities, "population")
  // sortDescBy(cities, ["state", "city"])
  // ```

  checkType(table, "table");
  columns = flattenCols(columns, table);
  return doSortBy(table, columns, true);
}

export function top(table, columns, count) {
  // Sort `table` in descending order by `columns` and take the first `count`
  // rows of the sorted table.
  //
  // Equivalent to `take(sortDescBy(table, columns), count)`.
  //
  // ```ptls
  // cities = #{
  //   city           , state , population
  //   "Houston"      , "TX"  ,    2390125
  //   "Phoenix"      , "AZ"  ,    1673164
  //   "Philadelphia" , "PA"  ,    1573916
  //   "San Antonio"  , "TX"  ,    1526656
  //   "San Diego"    , "CA"  ,    1404452
  //   "Dallas"       , "TX"  ,    1326087
  // }
  //
  // Table.top(cities, "population", 4)
  // ```

  return take(sortDescBy(table, columns), count);
}

export function bottom(table, columns, count) {
  // Sort `table` in ascending order by `columns` and take the first `count`
  // rows of the sorted table. Equivalent to
  // `take(sortBy(table, columns), count)`.
  //
  // ```ptls
  // cities = #{
  //   city           , state , population
  //   "Houston"      , "TX"  ,    2390125
  //   "Phoenix"      , "AZ"  ,    1673164
  //   "Philadelphia" , "PA"  ,    1573916
  //   "San Antonio"  , "TX"  ,    1526656
  //   "San Diego"    , "CA"  ,    1404452
  //   "Dallas"       , "TX"  ,    1326087
  // }
  //
  // Table.bottom(cities, "population", 4)
  // ```

  return take(sortBy(table, columns), count);
}

function listExtremum(table, columns, desc) {
  return im.List([...table]).maxBy(
    (row) => selectValues(row, columns),
    (a, b) => compareAll(a, b, desc),
  );
}

export function minBy(table, columns) {
  // Get the row with the smallest values in `columns` where `columns` may be a
  // string (single column) or a list of strings (multiple columns). In other
  // words, get the row that would come first if `table` were sorted by
  // `columns` in ascending order.
  //
  // See the docs for [Table.sortBy](#sortBy) for details on the sorting
  // process.
  //
  // ```ptls
  // cities = #{
  //   city           , state , population
  //   "New York"     , "NY"  ,    8478072
  //   "Los Angeles"  , "CA"  ,    3878704
  //   "Chicago"      , "IL"  ,    2721308
  //   "Houston"      , "TX"  ,    2390125
  //   "Phoenix"      , "AZ"  ,    1673164
  //   "Philadelphia" , "PA"  ,    1573916
  // }
  //
  // Table.minBy(cities, "population")
  // Table.minBy(cities, ["state", "city"])
  // ```

  checkType(table, "table");
  table.checkNonEmpty();
  return listExtremum(table, flattenCols(columns, table), true);
}

export function maxBy(table, columns) {
  // Get the row with the largest values in `columns` where `columns` may be a
  // string (single column) or a list of strings (multiple columns). In other
  // words, get the row that would come first if `table` were sorted by
  // `columns` in descending order.
  //
  // See the docs for [Table.sortBy](#sortBy) for details on the sorting
  // process.
  //
  // ```ptls
  // cities = #{
  //   city           , state , population
  //   "New York"     , "NY"  ,    8478072
  //   "Los Angeles"  , "CA"  ,    3878704
  //   "Chicago"      , "IL"  ,    2721308
  //   "Houston"      , "TX"  ,    2390125
  //   "Phoenix"      , "AZ"  ,    1673164
  //   "Philadelphia" , "PA"  ,    1573916
  // }
  //
  // Table.maxBy(cities, "population")
  // Table.maxBy(cities, ["state", "city"])
  // ```

  checkType(table, "table");
  table.checkNonEmpty();
  return listExtremum(table, flattenCols(columns, table), false);
}

function listExtremumAll(table, columns, desc) {
  columns = flattenCols(columns, table);

  const pairs = [];

  for (const row of table) {
    const rank = selectValues(row, columns);
    pairs.push({ row, rank });
  }

  const ranked = im.List(pairs);

  const limitRank = ranked
    .map(({ rank }) => rank)
    .max((a, b) => compareAll(a, b, desc));

  return Table.fromRows(
    ranked.filter(({ rank }) => im.is(rank, limitRank)).map(({ row }) => row),
    table.columns(),
  );
}

export function minAll(table, columns) {
  // Get a table containing all the rows in `table` for which
  // `select(table, columns)` is minimized. See the docs for
  // [Table.sortBy](#sortBy) for details on the ranking process.
  //
  // ```ptls
  // cities = #{
  //   city           , state , population
  //   "Houston"      , "TX"  ,    2390125
  //   "Phoenix"      , "AZ"  ,    1673164
  //   "Philadelphia" , "PA"  ,    1573916
  //   "San Antonio"  , "TX"  ,    1526656
  //   "San Diego"    , "CA"  ,    1404452
  //   "Dallas"       , "TX"  ,    1326087
  // }
  //
  // Table.minAll(cities, "state")
  // ```

  checkType(table, "table");
  return listExtremumAll(table, columns, true);
}

export function maxAll(table, columns) {
  // Get a table containing all the rows in `table` for which
  // `select(table, columns)` is maximized. See the docs for
  // [Table.sortBy](#sortBy) for details on the ranking process.
  //
  // ```ptls
  // cities = #{
  //   city           , state , population
  //   "Houston"      , "TX"  ,    2390125
  //   "Phoenix"      , "AZ"  ,    1673164
  //   "Philadelphia" , "PA"  ,    1573916
  //   "San Antonio"  , "TX"  ,    1526656
  //   "San Diego"    , "CA"  ,    1404452
  //   "Dallas"       , "TX"  ,    1326087
  // }
  //
  // Table.maxAll(cities, "state")
  // ```

  checkType(table, "table");
  return listExtremumAll(table, columns, false);
}

function groupsMap(table, columns) {
  let groups = im.OrderedMap();

  for (const row of table) {
    const group = selectValues(row, columns);

    if (!groups.has(group)) {
      groups = groups.set(group, []);
    }

    groups.get(group).push(row);
  }

  return groups.map((rows) => of(im.List(rows)));
}

export function group(table, columns) {
  // Partition `table` into groups based on the values in `columns`, which may
  // be a string (single column) or a list of strings (multiple columns).
  //
  // Rows with the same values in the given columns are grouped together. The
  // result is a list of tables, each containing the rows for one group.
  //
  // ```ptls
  // cities = #{
  //   city           , state
  //   "New York"     , "NY"
  //   "Los Angeles"  , "CA"
  //   "Chicago"      , "IL"
  //   "Houston"      , "TX"
  //   "Phoenix"      , "AZ"
  //   "Philadelphia" , "PA"
  //   "San Antonio"  , "TX"
  //   "San Diego"    , "CA"
  //   "Dallas"       , "TX"
  // }
  //
  // Table.group(cities, "state")
  // ```

  checkType(table, "table");
  columns = flattenCols(columns, table);

  return groupsMap(table, columns)
    .valueSeq()
    .toList();
}

export async function summarize(table, columns, reducer) {
  // Group the rows in `table` by one or more `columns` and summarize each group
  // using the function `reducer`. `columns` may be a string (single column) or
  // a list of strings (multiple columns).
  //
  // Rows are grouped based on the values in the given `columns` (see the docs
  // for [Table.group](#group) for details on the grouping process.) `reducer`
  // is called for each group and returns an object containing summary
  // information. These objects are merged with each group's column values to
  // form the final summary row for that group.
  //
  // ```ptls
  // cities = #{
  //   city           , state , population
  //   "New York"     , "NY"  ,    8478072
  //   "Los Angeles"  , "CA"  ,    3878704
  //   "Chicago"      , "IL"  ,    2721308
  //   "Houston"      , "TX"  ,    2390125
  //   "Phoenix"      , "AZ"  ,    1673164
  //   "Philadelphia" , "PA"  ,    1573916
  //   "San Antonio"  , "TX"  ,    1526656
  //   "San Diego"    , "CA"  ,    1404452
  //   "Dallas"       , "TX"  ,    1326087
  // }
  //
  // fn calcStateStats(group)
  //   totalPop = sum(group.population)
  //   biggestCity = Table.maxBy(group, "population").city
  //   numCities = len(group)
  //   { totalPop, biggestCity, numCities }
  // end
  //
  // Table.summarize(cities, "state", calcStateStats)
  // ```

  if (isEmpty(table)) {
    return table;
  }

  const groups = group(table, columns);
  columns = flattenCols(columns, table);
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
  // Return a table containing deduplicated rows of `table`. Each row will have
  // two additional entries, `count` and `share`, which will contain the number
  // of copies of each row in the original table, and the fraction of the total
  // rows that this count represents. The original table may not contain columns
  // named `count` or `share`.
  //
  // ```ptls
  // locations = #{
  //   city          , state
  //   "New York"    , "NY"
  //   "New York"    , "NY"
  //   "Los Angeles" , "CA"
  //   "New York"    , "NY"
  //   "Houston"     , "TX"
  //   "Houston"     , "TX"
  //   "Los Angeles" , "CA"
  //   "Chicago"     , "IL"
  // }
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

  let counts = im.Map();

  for (const row of table) {
    if (counts.has(row)) {
      counts = counts.set(row, counts.get(row) + 1);
    } else {
      counts = counts.set(row, 1);
    }
  }

  const rows = counts
    .entrySeq()
    .map(([row, count]) =>
      row.set("count", count).set("share", count / table.size)
    );

  return sortDescBy(of(rows.toList()), "count");
}

export function product(tables) {
  // Get the cartesian product of a list of `tables`. The result of
  // `product([tableA, tableB, tableC, ...])` will be a table containing a row
  // `rowA + rowB + rowC + ...` for each combination of rows from the tables.
  // The input tables should all have different keys.
  //
  // ```ptls
  // ranks = #{
  //   rank
  //   "A"
  //   "2"
  //   "3"
  // }
  //
  // suits = #{
  //   name       , symbol
  //   "Clubs"    , "♣"
  //   "Diamonds" , "♦"
  //   "Hearts"   , "♥"
  //   "Spades"   , "♠"
  // }
  //
  // Table.product([ranks, suits])
  // ```

  checkType(tables, "list");
  const columns = [];

  let rows = [im.OrderedMap()];

  for (const table of tables) {
    checkType(table, "table");

    for (const column of table.columns()) {
      if (columns.includes(column)) {
        throw new Panic("duplicate column name", { column });
      }

      columns.push(column);
    }

    const newRows = [];

    for (const row of rows) {
      for (const newRow of table) {
        newRows.push(row.concat(newRow));
      }
    }

    rows = newRows;
  }

  return Table.fromRows(im.List(rows), im.List(columns));
}

function columnUnion(tableA, tableB) {
  return im.List(new Set([...tableA.columns(), ...tableB.columns()]));
}

export function join(tableA, tableB, columns) {
  // Perform an inner join of `tableA` and `tableB` using `columns`. `columns`
  // may be a single string (for one column) or a list of strings (for multiple
  // columns).
  //
  // Find all the pairs of rows (one row from each table) with matching values
  // in `columns`. Merge each of these rows and create a new table of the
  // resulting rows.
  //
  // ```ptls
  // donors = #{
  //   donor      , type
  //   "Luna"     , "O"
  //   "Marty"    , "B"
  //   "Mercedes" , "A"
  // }
  //
  // recipients = #{
  //   recipient  , type
  //   "Judy"     , "O"
  //   "DeVondre" , "O"
  //   "Sammy"    , "B"
  // }
  //
  // Table.join(donors, recipients, "type")
  // ```

  checkType(tableA, "table");
  checkType(tableB, "table");
  columns = flattenCols(columns, tableA, tableB);

  const groupsB = groupsMap(tableB, columns);
  const newColumns = columnUnion(tableA, tableB);
  const rows = [];

  for (const rowA of tableA) {
    const key = selectValues(rowA, columns);

    for (const rowB of groupsB.get(key, [])) {
      rows.push(rowA.merge(rowB));
    }
  }

  return Table.fromRows(im.List(rows), newColumns);
}

export function joinLeft(tableA, tableB, columns) {
  // ```ptls
  // cities = #{
  //   city          , state
  //   "Philadephia" , "PA"
  //   "Austin"      , "TX"
  //   "Boston"      , "MA"
  //   "Cleveland"   , "OH"
  // }
  //
  // regions = #{
  //   state , region
  //   "MA"  , "New England"
  //   "MA"  , "North East"
  //   "PA"  , "Mid Atlantic"
  //   "TX"  , "Southwest"
  // }
  //
  // Table.joinLeft(cities, regions, "state")
  // ```

  checkType(tableA, "table");
  checkType(tableB, "table");
  columns = flattenCols(columns, tableA, tableB);

  const groupsB = groupsMap(tableB, columns);
  const rows = [];

  const nonesB = im.OrderedMap(
    tableB.columns().map((column) => [column, null]),
  );

  for (const rowA of tableA) {
    const key = selectValues(rowA, columns);

    if (!groupsB.has(key)) {
      rows.push(rowA.merge(nonesB));
    } else {
      for (const rowB of groupsB.get(key)) {
        rows.push(rowA.merge(rowB));
      }
    }
  }

  return rows.length ? of(im.List(rows)) : $new(tableA.columns());
}

export async function joinGroup(tableA, tableB, columns, reducer) {
  // ```ptls
  // cities = #{
  //   city          , state
  //   "Philadephia" , "PA"
  //   "Austin"      , "TX"
  //   "Boston"      , "MA"
  //   "Cleveland"   , "OH"
  // }
  //
  // stats = #{
  //   city          , points
  //   "Philadephia" ,      1
  //   "Philadephia" ,      2
  //   "Austin"      ,      3
  //   "Boston"      ,      4
  // }
  //
  // fn totalPoints(city, stats)
  //   city.points = sum(stats.points)
  //   city
  // end
  //
  // Table.joinGroup(cities, stats, "city", totalPoints)
  // ```

  checkType(tableA, "table");
  checkType(tableB, "table");
  columns = flattenCols(columns, tableA, tableB);

  const groupsB = groupsMap(tableB, columns);
  const rows = [];
  const emptyB = $new(tableB.columns());

  for (const rowA of tableA) {
    const key = selectValues(rowA, columns);
    const rowsB = groupsB.get(key, emptyB);
    const summary = await reducer.call(rowA, of(rowsB));
    checkType(summary, "object");
    rows.push(rowA.concat(summary));
  }

  return of(im.List(rows));
}

export function roundTo(table, decimals) {
  checkType(table, "table");
  checkType(decimals, "number", "object");

  const data = table.data.map((values, key) => {
    function doRound(value) {
      if (getType(value) !== "number") {
        return value;
      }

      if (getType(decimals) === "object") {
        return decimals.has(key)
          ? roundToNum(value, Obj.get(decimals, key))
          : value;
      }

      return roundToNum(value, decimals);
    }

    return values.map(doRound);
  });

  return new Table(data);
}
