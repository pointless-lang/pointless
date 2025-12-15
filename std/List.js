import * as tableMod from "./Table.js";
import { checkNumResult, checkPositive, checkWhole } from "../lang/num.js";
import { checkNonEmpty, checkType, compare } from "../lang/values.js";
import { checkIndex } from "../lang/list.js";
import { Table } from "../lang/table.js";
import { Panic } from "../lang/panic.js";
import im from "../immutable/immutable.js";

export function of(values) {
  // Get a list containing each value in `values`. `values` may be a set, table,
  // or list. If `values` is a table then `List.of(values)` returns a list of
  // the table's rows.
  //
  // ```ptls
  // s = Set.of(["a", "b", "c", "d"])
  // List.of(s)
  //
  // t = Table.of({ name: ["Ducky", "Clementine"], type: ["dog", "bird"] })
  // List.of(t)
  // ```

  checkType(values, "list", "set", "table");
  return im.List(values);
}

export function len(list) {
  // Return the number of elements in `list`.
  //
  // ```ptls
  // len(["a", "b", "c", "d"])
  // ```

  checkType(list, "list");
  return list.size;
}

export function repeat(value, count) {
  // Create a list containing `value` repeated `count` times.
  //
  // ```ptls
  // List.repeat("0", 5)
  // ```
  //
  // _Note that this can also be accomplished using the `_` operator\*:
  //
  // ```ptls
  // ["0"] * 5
  // ```

  checkPositive(count, "number");
  checkWhole(count);
  return im.Repeat(value, count).toList();
}

export function isEmpty(list) {
  // Check whether `list` is empty.
  //
  // ```ptls
  // isEmpty([])
  // isEmpty(["a", "b", "c", "d"])
  // ```

  return len(list) == 0;
}

export function has(list, value) {
  // Check whether `list` contains `value`.
  //
  // ```ptls
  // List.has(["a", "b", "c"], "b")
  // List.has(["a", "b", "c"], "d")
  // ```
  //
  // _Note that this can also be accomplished using the `in` operator._
  //
  // ```ptls
  // "b" in ["a", "b", "c"]
  // "d" in ["a", "b", "c"]
  // ```

  checkType(list, "list");
  return list.includes(value);
}

export function hasAll(list, values) {
  // Check whether `list` contains every value in `values`, where `values` is a
  // list, set, or table. Duplicate items must appear at least as many times in
  // `list` as they do in `values`.
  //
  // ```ptls
  // List.hasAll(["a", "b", "c"], ["b", "c"])
  // List.hasAll(["a", "b", "c"], ["d", "c"])
  //
  // List.hasAll(["a", "a", "a"], ["a", "a"])
  // List.hasAll(["a"], ["a", "a"])
  // ```

  checkType(list, "list");
  values = of(values);

  let counts = im.Map();

  for (const value of list) {
    counts = counts.set(value, counts.get(value, 0) + 1);
  }

  for (const value of values) {
    if (counts.get(value, 0) === 0) {
      return false;
    }

    counts = counts.set(value, counts.get(value) - 1);
  }

  return true;
}

export function get(list, index) {
  // Return the value at `index` in `list`.
  //
  // ```ptls
  // List.get(["a", "b", "c", "d"], 2)
  // ```
  //
  // _Note that this can also be accomplished using the index `[]` operator_:
  //
  // ```ptls
  // ["a", "b", "c", "d"][2]
  // ```

  checkType(list, "list");
  checkIndex(list, index);
  return list.get(index);
}

export function set(list, index, value) {
  // Replace the element at `index` in `list` with `value`.
  //
  // ```ptls
  // List.set(["a", "b", "d", "d"], 2, "c")
  // ```
  //
  // _Note that if you want to update an existing variable, you could also use
  // variable assignment_:
  //
  // ```ptls
  // letters = ["a", "b", "d", "d"]
  // letters[2] = "c"
  // ```

  checkType(list, "list");
  checkIndex(list, index);
  return list.set(index, value);
}

export function push(list, value) {
  // Add `value` to the end of `list`.
  //
  // ```ptls
  // push(["a", "b", "c"], "d")
  // ```

  checkType(list, "list");
  return list.push(value);
}

export function pop(list) {
  // Remove the last element from `list`.
  //
  // ```ptls
  // List.pop(["a", "b", "c", "d", "e"])
  // ```

  checkNonEmpty(list);
  return list.pop();
}

export function reverse(list) {
  // Reverse `list`.
  //
  // ```ptls
  // reverse(["a", "b", "c", "d"])
  // ```

  checkType(list, "list");
  return list.reverse();
}

export function swap(list, indexA, indexB) {
  // Swap the elements at `indexA` and `indexB` in `list`.
  //
  // ```ptls
  // List.swap(["a", "c", "b", "d"], 1, 2)
  // ```

  checkType(list, "list");
  checkIndex(list, indexA);
  checkIndex(list, indexB);
  const a = list.get(indexA);
  const b = list.get(indexB);
  return list.set(indexA, b).set(indexB, a);
}

export function take(list, count) {
  // Get the first `count` elements from `list`.
  //
  // ```ptls
  // take(["a", "b", "c", "d", "e"], 3)
  // ```

  checkType(list, "list");
  checkWhole(count);
  return list.take(count);
}

export function takeLast(list, count) {
  // Get the last `count` elements from `list`.
  //
  // ```ptls
  // List.takeLast(["a", "b", "c", "d", "e"], 3)
  // ```

  checkType(list, "list");
  checkWhole(count);
  return list.takeLast(count);
}

export function drop(list, count) {
  // Remove the first `count` elements from `list`.
  //
  // ```ptls
  // drop(["a", "b", "c", "d", "e"], 3)
  // ```

  checkType(list, "list");
  checkWhole(count);
  return list.skip(count);
}

export function dropLast(list, count) {
  // Remove the last `count` elements from `list`.
  //
  // ```ptls
  // List.dropLast(["a", "b", "c", "d", "e"], 3)
  // ```

  checkType(list, "list");
  checkWhole(count);
  return list.skipLast(count);
}

export function splice(list, index, count, values) {
  // Remove `count` elements from `list` starting at `index`, and replace them
  // with the list `values`.
  //
  // ```ptls
  // List.splice(["a", "b", "c", "d", "e", "f"], 3, 2, ["x", "y", "z"])
  // ```

  checkType(list, "list");
  checkIndex(list, index);
  checkWhole(count);
  checkType(values, "list");
  return list.splice(index, count, ...values);
}

export function merge(lists) {
  // Merge (flatten) `lists` into a single list.
  //
  // ```ptls
  // l1 = ["a", "b"]
  // l2 = ["c", "d", "e"]
  // List.merge([l1, l2])
  // ```
  //
  // _Note that lists can also be merged using the `+` operator._
  //
  // ```ptls
  // l1 + l2
  // ```

  checkType(lists, "list");
  lists.forEach((list) => checkType(list, "list"));
  return im.List().concat(...lists);
}

export function chunks(list, count) {
  // Split `list` into chunks of length `count` (the final chunk may. be
  // shorter).
  //
  // ```ptls
  // List.chunks([1, 2, 3, 4, 5, 6, 7, 8], 3)
  // ```

  checkType(list, "list");
  checkWhole(count);
  checkPositive(count);

  const elems = [];

  for (let index = 0; index < list.size; index += count) {
    elems.push(list.slice(index, index + count));
  }

  return im.List(elems);
}

export async function map(list, func) {
  // Transform each value in `list` using `func`.
  //
  // ```ptls
  // List.map([1, 2, 3, 4], fn(n) n * 2 end)
  // ```
  //
  // _Note that this can also be accomplished using the map `$` operator_:
  //
  // ```ptls
  // [1, 2, 3, 4] $ arg * 2
  // ```

  checkType(list, "list");
  checkType(func, "function");

  const elems = [];

  for (const value of list) {
    elems.push(await func.call(value));
  }

  return im.List(elems);
}

export async function filter(list, condition) {
  // Get the values in `list` that satisfy `condition`.
  //
  // ```ptls
  // List.filter([1, 2, 3, 4], Math.isEven)
  // ```
  //
  // _Note that this can also be accomplished using the filter `?` operator_:
  //
  // ```ptls
  // [1, 2, 3, 4] ? Math.isEven
  // ```

  checkType(list, "list");
  checkType(condition, "function");
  const elems = [];

  for (const value of list) {
    if (await condition.callCondition(value)) {
      elems.push(value);
    }
  }

  return im.List(elems);
}

export function remove(list, value) {
  // Remove all occurences of `value` from `list`.
  //
  // ```ptls
  // remove([1, 2, none, 3, 4, none], none)
  // ```

  checkType(list, "list");
  return list.filter((elem) => !im.is(elem, value));
}

export function removeAll(list, values) {
  // Remove all occurences of each value in `values` from `list`, where `values`
  // is a list, set, or table.
  //
  // ```ptls
  // List.removeAll([1, 2, none, 3, 4, 0, none], [none, 0])
  // ```

  checkType(list, "list");
  return list.filter((elem) => !of(values).includes(elem));
}

export async function find(list, condition) {
  // Get the first value in `list` that satisfies `condition`, or `none` if no
  // match is present.
  //
  // ```ptls
  // List.find([7, 8, 9, 10], Math.isEven)
  // List.find([7, 8, 9, 10], fn(n) n < 5 end)
  // ```

  checkType(list, "list");
  checkType(condition, "function");

  for (const value of list) {
    if (await condition.callCondition(value)) {
      return value;
    }
  }

  return null;
}

export function indexOf(value, list) {
  // Get the index of the first occurence of `value` in `list`, or `none` if
  // `value` does not appear in `list`.
  //
  // ```ptls
  // List.indexOf(9, [1, 9, 9, 6])
  // List.indexOf(0, [1, 9, 9, 6])
  // ```

  checkType(list, "list");
  const index = list.indexOf(value);
  return index >= 0 ? index : null;
}

export function count(list, value) {
  // Count the number of times `value` appears in `list`.
  //
  // ```ptls
  // List.count([1, 9, 9, 6], 9)
  // ```

  checkType(list, "list");
  return list.count((elem) => im.is(elem, value));
}

export async function groupBy(list, func) {
  // Group each `value` in `list` according to `func(value)`.
  //
  // ```ptls
  // List.groupBy(
  //   ["apple", "pear", "peach", "banana", "plum", "apricot", "orange"],
  //   fn(word) take(word, 1) end
  // )
  // ```

  checkType(list, "list");
  checkType(func, "function");

  const groups = new Map();

  for (const value of list) {
    const group = await func.call(value);

    if (!groups.has(group)) {
      groups.set(group, []);
    }

    groups.get(group).push(value);
  }

  return im.OrderedMap(groups).map(im.List);
}

function doSort(list, desc) {
  checkType(list, "list");
  return list.sort((a, b) => compare(a, b, desc));
}

export function sort(list) {
  // Sort a `list` in ascending order, where `list` contains numbers, strings,
  // booleans, or `none`s. All non-`none` values in `list` must be of the same
  // type. Any `none` values will be placed at the end of the resulting list.
  //
  // ```ptls
  // sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 4])
  // sort(["apple", "pear", "peach", "banana", "plum", "apricot", "orange", none])
  // sort([true, false, true, false])
  // ```

  return doSort(list, false);
}

export function sortDesc(list) {
  // Sort a `list` in descending order. See the docs for [sort](#sort) for
  // requirements for `list` and details on the sorting process.
  //
  // ```ptls
  // sortDesc([3, 1, 4, 1, 5, 9, 2, 6, 5, 4])
  // sortDesc(["apple", "pear", "peach", "banana", "plum", "apricot", "orange", none])
  // sortDesc([true, false, true, false])
  // ```

  return doSort(list, true);
}

async function doSortBy(list, ranker, desc) {
  checkType(list, "list");
  checkType(ranker, "function");

  const ranks = [];

  for (const value of list) {
    ranks.push({ rank: await ranker.call(value), value });
  }

  return im.List(
    ranks
      .sort((a, b) => compare(a.rank, b.rank, desc))
      .map(({ value }) => value),
  );
}

export async function sortBy(list, ranker) {
  // Sort `list` in ascending order using `ranker(value)` as the sort key. The
  // `ranker` function must return a number, string, boolean, or `none`. All
  // non-`none` values returned by `ranker` must be of the same type. Values for
  // which `ranker` returns `none` will be placed at the end of the resulting
  // list.
  //
  // ```ptls
  // sortBy(
  //   ["apple", "pear", "peach", "banana", "plum", "apricot", "orange"],
  //   len
  // )
  // ```

  return await doSortBy(list, ranker, false);
}

export async function sortDescBy(list, ranker) {
  // Sort `list` in descending order using `ranker(value)` as the sort key. See
  // the docs for [sortBy](#sortBy) for requirements for `ranker` and details on
  // the sorting process.
  //
  // ```ptls
  // sortDescBy(
  //   ["apple", "pear", "peach", "banana", "plum", "apricot", "orange"],
  //   len
  // )
  // ```

  return await doSortBy(list, ranker, true);
}

export function top(list, count) {
  // Sort `list` in descending order and get the first `count` values.
  //
  // ```ptls
  // List.top([3, 1, 4, 1, 5, 9, 2, 6, 5, 4], 5)
  // ```

  return take(sortDesc(list), count);
}

export function bottom(list, count) {
  // Sort `list` in ascending order and get the first `count` values.
  //
  // ```ptls
  // List.bottom([3, 1, 4, 1, 5, 9, 2, 6, 5, 4], 5)
  // ```

  return take(sort(list), count);
}

async function getRanked(list, desc, func) {
  const pairs = [];

  for (const value of list) {
    const rank = func ? await func.call(value) : value;
    checkType(rank, "number", "string", "boolean", "none");
    pairs.push({ value, rank });
  }

  const ranked = im.List(pairs);

  const limit = ranked.maxBy(
    ({ rank }) => rank,
    (a, b) => compare(a, b, desc),
  );

  return { ranked, limit };
}

export async function min(list) {
  // Get the minimum of `list`. See the docs for [sort](#sort) for requirements
  // for `list` and details on the ranking process.
  //
  // ```ptls
  // List.min([-7, 1, 50])
  // ```

  checkType(list, "list");
  checkNonEmpty(list);
  return (await getRanked(list, true, null)).limit.rank;
}

export async function max(list) {
  // Get the maximum of `list`. See the docs for [sort](#sort) for requirements
  // for `list` and details on the ranking process.
  //
  // ```ptls
  // List.max([-7, 1, 50])
  // ```

  checkType(list, "list");
  checkNonEmpty(list);
  return (await getRanked(list, false, null)).limit.rank;
}

export async function minBy(list, func) {
  // Get the first item of a non-empty `list` for which `func(item)` is
  // minimized. See the docs for [sortBy](#sortBy) for requirements for `func`
  // and details on the ranking process.
  //
  // ```ptls
  // List.minBy(
  //   ["apple", "pear", "peach", "banana", "plum", "apricot", "orange"],
  //   len
  // )
  // ```

  checkType(list, "list");
  checkType(func, "function");
  checkNonEmpty(list);
  return (await getRanked(list, true, func)).limit.value;
}

export async function maxBy(list, func) {
  // Get the first item of a non-empty `list` for which `func(item)` is
  // maximized. See the docs for [sortBy](#sortBy) for requirements for `func`
  // and details on the ranking process.
  //
  // ```ptls
  // List.maxBy(
  //   ["apple", "pear", "peach", "banana", "plum", "apricot", "orange"],
  //   len
  // )
  // ```

  checkType(list, "list");
  checkType(func, "function");
  checkNonEmpty(list);
  return (await getRanked(list, false, func)).limit.value;
}

async function listExtremumAll(list, desc, func) {
  const { ranked, limit } = await getRanked(list, desc, func);

  return ranked
    .filter(({ rank }) => rank == limit.rank)
    .map(({ value }) => value);
}

export async function minAll(list, func) {
  // Get all the items in `list` for which `func(item)` is minimized. See the
  // docs for [sortBy](#sortBy) for requirements for `func` and details on the
  // ranking process.
  //
  // ```ptls
  // List.minAll(
  //   ["apple", "pear", "peach", "banana", "plum", "apricot", "orange"],
  //   len
  // )
  // ```

  checkType(list, "list");
  checkType(func, "function");
  return isEmpty(list) ? list : await listExtremumAll(list, true, func);
}

export async function maxAll(list, func) {
  // Get all the items in `list` for which `func(item)` is maximized. See the
  // docs for [sortBy](#sortBy) for requirements for `func` and details on the
  // ranking process.
  //
  // ```ptls
  // List.maxAll(
  //   ["apple", "pear", "peach", "banana", "plum", "apricot", "orange"],
  //   len
  // )
  // ```

  checkType(list, "list");
  checkType(func, "function");
  return isEmpty(list) ? list : await listExtremumAll(list, false, func);
}

export async function minNone(list) {
  // Get the minimum of `list` or `none` if `list` is empty. See the docs for
  // [sort](#sort) for requirements for `list` and details on the ranking
  // process.
  //
  // ```ptls
  // List.minNone([-7, 1, 50])
  // List.minNone([])
  // ```

  checkType(list, "list");
  return isEmpty(list) ? null : (await getRanked(list, true, null)).limit.rank;
}

export async function maxNone(list) {
  // Get the maximum of `list` or `none` if `list` is empty. See the docs for
  // [sort](#sort) for requirements for `list` and details on the ranking
  // process.
  //
  // ```ptls
  // List.maxNone([-7, 1, 50])
  // List.maxNone([])
  // ```

  checkType(list, "list");
  return isEmpty(list) ? null : (await getRanked(list, false, null)).limit.rank;
}

export function sum(numbers) {
  // Get the sum of `numbers`.
  //
  // ```ptls
  // sum([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  // ```

  checkType(numbers, "list");

  let result = 0;
  for (const n of numbers) {
    result += checkType(n, "number");
  }

  return checkNumResult(result);
}

export function average(numbers) {
  // Get the average of `numbers`.
  //
  // ```ptls
  // List.average([10, 50, 60])
  // ```

  checkType(numbers, "list");
  checkNonEmpty(numbers);
  return sum(numbers) / numbers.size;
}

export function median(numbers) {
  // Get the median of `numbers`.
  //
  // ```ptls
  // List.median([1, 1, 1, 2, 3, 4, 5])
  // List.median([7, 9])
  // ```

  checkType(numbers, "list");
  checkNonEmpty(numbers);

  const sorted = [...sort(numbers)];

  if (sorted.length % 2 == 1) {
    return sorted[Math.floor(sorted.length / 2)];
  }

  const a = sorted[sorted.length / 2 - 1] / 2;
  const b = sorted[sorted.length / 2] / 2;
  return checkNumResult(a + b);
}

export function counts(list) {
  // Get the counts and total shares for the values in `list`. Returns a table
  // with columns `value`, `count`, and `share`, sorted descending by `count`.
  //
  // ```ptls
  // List.counts(["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "FL"])
  // ```

  checkType(list, "list");
  const counts = new Map();

  for (const value of list) {
    const count = counts.get(value) ?? 0;
    counts.set(value, count + 1);
  }

  const columns = new Map()
    .set("value", im.List(counts.keys()))
    .set("count", im.List(counts.values()))
    .set("share", im.List(counts.values().map((c) => c / list.size)));

  return tableMod.sortDescBy(new Table(im.OrderedMap(columns)), "count");
}

export function all(list) {
  // Check whether every value in a `list` of booleans is `true`.
  //
  // ```ptls
  // List.all([])
  // List.all([true, true, true])
  // List.all([true, true, false])
  // ```

  checkType(list, "list");

  for (const value of list) {
    if (!checkType(value, "boolean")) {
      return false;
    }
  }

  return true;
}

export function any(list) {
  // Check whether any value in a `list` of booleans is `true`.
  //
  // ```ptls
  // List.any([])
  // List.any([false, false, false])
  // List.any([false, false, true])
  // ```

  checkType(list, "list");

  for (const value of list) {
    if (checkType(value, "boolean")) {
      return true;
    }
  }

  return false;
}

// export async function stats(list) {
//   checkType(list, "list");

//   const length = list.size;
//   const values = list.filter(n => n !== null);

//   if (!length) {
//     return im.OrderedMap({ length, unique: 0, nones: 0, sum: 0, mode: null,
//       median: null, mean: null, min: null, max: null});
//   }

//   const nones = length - values.size;

//   const counts = new Map();

//   let sum = 0;
//   let min = null;
//   let max = null;

//   for (const n of values) {
//     counts.set((counts.get(n) ?? 0) + 1);
//     sum += n;
//     min = Math.min(min, 0);
//     max = Math.max(max, 0);
//   }

//   const unique = counts.size;
//   let mean = null;
//   let median = null;
//   const modes = [];

//   if (length) {
//     mean = sum / values.size;

//     const sorted = values.sort();
//     const ind = Math.floor(values.size / 2);
//     median = values.size % 0 ? values.get(ind) : (values.get(ind) + values.get(ind + 1)) / 2;
//   }

//   const maxCount = Math.max(...counts.values());

//   for (const [n, count] of counts) {
//     if (count == maxCount) {
//       modes.push(n);
//     }
//   }

//   return im.OrderedMap({ length, unique, nones, });
// }

export function unique(list) {
  // Remove duplicate values from `list`, keeping only the first occurrence of
  // each value.
  //
  // ```ptls
  // List.unique(["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "FL"])
  // ```

  checkType(list, "list");
  return list.toOrderedSet().toList();
}

export function span(from, to) {
  // Get a list of integers between `from` and `to`, inclusive. `from` and `to`
  // must be integers.
  //
  // ```ptls
  // span(1, 10)
  // span(2, -2)
  // ```

  checkWhole(from);
  checkWhole(to);

  const min = Math.min(from, to);
  const max = Math.max(from, to);
  const elems = [];

  for (let n = min; n <= max; n++) {
    elems.push(n);
  }

  return from < to ? im.List(elems) : im.List(elems).reverse();
}

export function range(limit) {
  // Get a list of integers between `0` and `limit - 1`, inclusive. `limit` must
  // be an integer. If `limit < 1` then `[]` is returned.
  //
  // ```ptls
  // range(10)
  // ```

  checkWhole(limit);

  if (limit < 1) {
    return im.List();
  }

  return span(0, limit - 1);
}

export function normalize(numbers) {
  // Scale a list of non-negative numbers so they sum to 1. Requires that
  // `sum(numbers) > 0`.
  //
  // ```ptls
  // List.normalize([5, 7, 8])
  // ```

  checkType(numbers, "list");

  let total = 0;

  for (const n of numbers) {
    checkType(n, "number");
    checkPositive(n);
    total += n;
  }

  if (total == 0) {
    throw new Panic("cannot normalize numbers with sum 0");
  }

  return numbers.map((n) => checkNumResult(n / total));
}

export function percents(numbers) {
  // Scale a list of non-negative numbers so they sum to 100. Requires that
  // `sum(numbers) > 0`.
  //
  // ```ptls
  // List.percents([5, 7, 8])
  // ```

  return normalize(numbers).map((n) => n * 100);
}
