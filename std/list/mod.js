import { checkWhole, checkPositive, checkNumResult } from "../../src/num.js";
import { checkIndex, checkNonEmpty } from "../../src/list.js";
import { checkType, compare } from "../../src/values.js";
import { Table } from "../../src/table.js";
import * as table from "../table/mod.js";
import { is, OrderedMap, List, Repeat } from "immutable";
import { Panic } from "../../src/panic.js";

export function of(values) {
  // Get a list containing each value in `values`. `values` may be
  // a set, table, or list. If `values` is a table then `list.of(values)`
  // returns a list of the table's rows.
  //
  // ```ptls
  // s = set.of(["a", "b", "c", "d"])
  // list.of(s)
  // t = table.of({ name: ["Ducky", "Clementine"], type: ["dog", "bird"] })
  // list.of(t)
  // ```

  checkType(values, "list", "set", "table");
  return List(values);
}

export function len(list) {
  // Return the length of a list.
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
  // list.repeat("0", 5)
  // ```
  //
  // *Note that this can also be accomplished using the `*` operator*:
  //
  // ```ptls
  // ["0"] * 5
  // ```

  checkPositive(count, "number");
  checkWhole(count);
  return Repeat(value, count).toList();
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
  // Return whether `list` contains `value`.
  //
  // ```ptls
  // has(["a", "b", "c"], "b")
  // has(["a", "b", "c"], "d")
  // ```

  checkType(list, "list");
  return list.includes(value);
}

export function hasAll(list, values) {
  // Return whether `list` contains every value in `values`,
  // where `values` is a list or set.
  //
  // ```ptls
  // list.hasAll(["a", "b", "c"], ["b", "c"])
  // list.hasAll(["a", "b", "c"], ["d", "c"])
  // ```

  checkType(list, "list");
  return list.toSet().isSuperset(of(values));
}

export function get(list, index) {
  // Return the value at `index` in `list`.
  //
  // ```ptls
  // list.get(["a", "b", "c", "d"], 2)
  // ```
  //
  // *Note that this can also be accomplished using the index `[]` operator*:
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
  // list.set(["a", "b", "d", "d"], 2, "c")
  // ```
  //
  // *Note that if you want to update an existing variable, you could also
  // use variable assignment*:
  //
  // ```ptls
  // letters = ["a", "b", "d", "d"]
  // letters[2] = "c"
  // ```

  checkType(list, "list");
  checkIndex(list, index);
  return list.set(index, value);
}

export function put(value, list, index) {
  // Replace the element at `index` in `list` with `value`.
  //
  // ```ptls
  // list.put("c", ["a", "b", "d", "d"], 2)
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
  // list.pop(["a", "b", "c", "d", "e"])
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
  // list.swap(["a", "c", "b", "d"], 1, 2)
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
  // takeLast(["a", "b", "c", "d", "e"], 3)
  // ```

  checkType(list, "list");
  checkWhole(count);
  return list.takeLast(count);
}

export function drop(list, count) {
  // Get the first `count` elements from `list`.
  //
  // ```ptls
  // drop(["a", "b", "c", "d", "e"], 3)
  // ```

  checkType(list, "list");
  checkWhole(count);
  return list.skip(count);
}

export function dropLast(list, count) {
  // Get the first `count` elements from `list`.
  //
  // ```ptls
  // dropLast(["a", "b", "c", "d", "e"], 3)
  // ```

  checkType(list, "list");
  checkWhole(count);
  return list.skipLast(count);
}

export function merge(lists) {
  // Merge (flatten) `lists` into a single list.
  //
  // ```ptls
  // list.merge([["a", "b"], ["c"], ["d", "e"]])
  // ```

  checkType(lists, "list");
  lists.forEach((list) => checkType(list, "list"));
  return List().concat(...lists);
}

export function chunks(list, count) {
  // Split `list` into chunks of length `count` (the final chunk may.
  // be shorter).
  //
  // ```ptls
  // list.chunks([1, 2, 3, 4, 5, 6, 7, 8], 3)
  // ```

  checkType(list, "list");
  checkWhole(count);
  checkPositive(count);

  const elems = [];

  for (let index = 0; index < list.size; index += count) {
    elems.push(list.slice(index, index + count));
  }

  return List(elems);
}

export async function map(list, func) {
  // Transform each value in `list` using `func`.
  //
  // ```ptls
  // list.map([1, 2, 3, 4], fn(n) n * 2 end)
  // ```
  //
  // *Note that this can also be accomplished using the `$` operator*:
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

  return List(elems);
}

export async function filter(list, condition) {
  // Get the values in `list` that satisfy `condition`.
  //
  // ```ptls
  // list.filter([1, 2, 3, 4], math.isEven)
  // ```
  //
  // *Note that this can also be accomplished using the `?` operator*:
  //
  // ```ptls
  // [1, 2, 3, 4] ? math.isEven
  // ```

  checkType(list, "list");
  checkType(condition, "function");
  const elems = [];

  for (const value of list) {
    if (await condition.callCondition(value)) {
      elems.push(value);
    }
  }

  return List(elems);
}

export async function remove(list, value) {
  // Remove all occurences of `value` from `list`.
  //
  // ```ptls
  // remove([1, 2, none, 3, 4, none], none)
  // ```

  checkType(list, "list");
  return list.filter((elem) => !is(elem, value));
}

export async function removeAll(list, values) {
  // Remove all occurences of each value in `values` from `list`,
  // where `values` is a list or set.
  //
  // ```ptls
  // list.removeAll([1, 2, none, 3, 4, 0, none], [none, 0])
  // ```

  checkType(list, "list");
  return list.filter((elem) => !of(values).includes(elem));
}

export async function find(list, condition) {
  // Get the first value in `list` that satisfies `condition`, or `none`
  // if no match is present.
  //
  // ```ptls
  // list.find([7, 8, 9, 10], math.isEven)
  // list.find([7, 8, 9, 10], fn(n) n < 5 end)
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

export async function indexOf(list, value) {
  // Get the index of the first occurence of `value` in `list`, or `none`
  // if `value` does not appear in `list`.
  //
  // ```ptls
  // list.indexOf([1, 9, 9, 6], 9)
  // list.indexOf([1, 9, 9, 6], 0)
  // ```

  checkType(list, "list");
  const index = list.indexOf(value);
  return index >= 0 ? index : null;
}

export async function count(list, value) {
  // Count the number of times `value` appears in `list`.
  //
  // ```ptls
  // list.count([1, 9, 9, 6], 9)
  // ```

  checkType(list, "list");
  return list.count((elem) => is(elem, value));
}

export async function groupBy(list, func) {
  // Group each `value` in `list` according to `func(value)`.
  //
  // ```ptls
  // list.groupBy(
  //   ["apple", "pear", "peach", "banana", "plum", "apricot", "orange"],
  //   fn(word) chars(word)[0] end
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

  return OrderedMap(groups).map(List);
}

function doSort(list, desc) {
  checkType(list, "list");
  return list.sort((a, b) => compare(a, b, desc));
}

export function sort(list) {
  // Sort a `list` of numbers, strings, or booleans in ascending order.
  // All values in `list` must have the same type.
  //
  // ```ptls
  // sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 4])
  // sort(["apple", "pear", "peach", "banana", "plum", "apricot", "orange"])
  // sort([true, false, true, false])
  // ```

  return doSort(list, false);
}

export function sortDesc(list) {
  // Sort a `list` of numbers, strings, or booleans in descending order.
  // All values in `list` must have the same type.
  //
  // ```ptls
  // sortDesc([3, 1, 4, 1, 5, 9, 2, 6, 5, 4])
  // sortDesc(["apple", "pear", "peach", "banana", "plum", "apricot", "orange"])
  // sortDesc([true, false, true, false])
  // ```

  return doSort(list, true);
}

// async function doSortBy(list, ranker, desc) {
//   checkType(list, "list");
//   checkType(ranker, "function");

//   const ranks = [];

//   for (const value of list) {
//     ranks.push({ rank: await ranker.call(value), value });
//   }

//   return List(
//     ranks
//       .sort((a, b) => compare(a.rank, b.rank, desc))
//       .map(({ value }) => value),
//   );
// }

// export async function sortBy(list, ranker) {
//   // Sort `list` in ascending order using `ranker(value)` as the sort key.
//   // The `ranker` function must return a number, string, or boolean, and
//   // all values returned must be of the same type.
//   //
//   // ```ptls
//   // sortBy(
//   //   ["apple", "pear", "peach", "banana", "plum", "apricot", "orange"],
//   //   len
//   // )
//   // ```

//   return await doSortBy(list, ranker, false);
// }

// export async function sortDescBy(list, ranker) {
//   // Sort `list` in descending order using `ranker(value)` as the sort key.
//   // The `ranker` function must return a number, string, or boolean, and
//   // all values returned must be of the same type.
//   //
//   // ```ptls
//   // sortDescBy(
//   //   ["apple", "pear", "peach", "banana", "plum", "apricot", "orange"],
//   //   len
//   // )
//   // ```

//   return await doSortBy(list, ranker, true);
// }

export function top(list, count) {
  // Return the `count` highest-ranking values of `list` in descending order.
  //
  // ```ptls
  // list.top([3, 1, 4, 1, 5, 9, 2, 6, 5, 4], 5)
  // ```

  return take(sortDesc(list), count);
}

export function bottom(list, count) {
  // Return the `count` lowest-ranking values of `list` in ascending order.
  //
  // ```ptls
  // list.bottom([3, 1, 4, 1, 5, 9, 2, 6, 5, 4], 5)
  // ```

  return take(sort(list), count);
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
  // list.average([10, 50, 60])
  // ```

  checkType(numbers, "list");
  checkNonEmpty(numbers);
  return sum(numbers) / numbers.size;
}

export function median(numbers) {
  // Get the median of `numbers`.
  //
  // ```ptls
  // list.median([1, 1, 1, 2, 3, 4, 5])
  // list.median([7, 9])
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

function listExtremum(numbers, handler) {
  checkType(numbers, "list");
  checkNonEmpty(numbers);

  let result = numbers.first();

  for (const n of numbers) {
    checkType(n, "number");
    result = handler(result, n);
  }

  return result;
}

export function min(numbers) {
  // Get the minimum of `numbers`.
  //
  // ```ptls
  // list.min([1, -7, 50])
  // ```

  return listExtremum(numbers, Math.min);
}

export function max(numbers) {
  // Get the maximum of `numbers`.
  //
  // ```ptls
  // list.max([1, -7, 50])
  // ```

  return listExtremum(numbers, Math.max);
}

export function counts(list) {
  // Get the counts and total shares for the values in `list`.
  // Returns a table with columns `value`, `count`, and `share`,
  // sorted descending by `count`.
  //
  // ```ptls
  // list.counts(["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "FL"])
  // ```

  checkType(list, "list");
  const counts = new Map();

  for (const value of list) {
    const count = counts.get(value) ?? 0;
    counts.set(value, count + 1);
  }

  const columns = new Map()
    .set("value", List(counts.keys()))
    .set("count", List(counts.values()))
    .set("share", List(counts.values().map((c) => c / list.size)));

  return table.sortDescBy(new Table(OrderedMap(columns)), "count");
}

export function all(list) {
  // Check whether every value in a `list` of booleans is `true`.
  //
  // ```ptls
  // list.all([])
  // list.all([true, true, true])
  // list.all([true, true, false])
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
  // list.any([])
  // list.any([false, false, false])
  // list.any([false, false, true])
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
//     return OrderedMap({ length, unique: 0, nones: 0, sum: 0, mode: null,
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

//   return OrderedMap({ length, unique, nones, });
// }

export function unique(list) {
  // Remove duplicate values from `list`, keeping only the first occurrence
  // of each value.
  //
  // ```ptls
  // list.unique(["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "FL"])
  // ```

  checkType(list, "list");
  return list.toOrderedSet().toList();
}

export function span(from, to) {
  // Get a list of integers between `from` and `to`, inclusive.
  // `from` and `to` must be integers.
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

  return from < to ? List(elems) : List(elems).reverse();
}

export function range(limit) {
  // Get a list of integers between `0` and `limit - 1`, inclusive.
  // `limit` must be an integer. If `limit < 1` then `[]` is returned.
  //
  // ```ptls
  // range(10)
  // ```

  checkWhole(limit);

  if (limit < 1) {
    return List();
  }

  return span(0, limit - 1);
}

export function normalize(numbers) {
  // Scale a list of non-negative numbers so they sum to 1. Requires that
  // `sum(numbers) > 0`.
  //
  // ```ptls
  // list.normalize([5, 7, 8])
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
  // list.percents([5, 7, 8])
  // ```

  return normalize(numbers).map((n) => n * 100);
}
