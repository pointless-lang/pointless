import { checkWhole, checkPositive, checkNumResult } from "../../src/num.js";
import { checkIndex, checkNonEmpty } from "../../src/list.js";
import { checkType, getType, compare } from "../../src/values.js";
import { Table } from "../../src/table.js";
import * as table from "../table/mod.js";
import { is, OrderedMap, List, Repeat } from "immutable";

export function of(values) {
  checkType(values, "list", "set");

  switch (getType(values)) {
    case "list":
      return values;
    case "set":
      return List(values);
  }
}

export function len(list) {
  checkType(list, "list");
  return list.size;
}

export function repeat(value, count) {
  checkPositive(count, "number");
  checkWhole(count);
  return Repeat(value, count).toList();
}

export function isEmpty(list) {
  return len(list) == 0;
}

export function has(list, value) {
  checkType(list, "list");
  return list.includes(value);
}

export function hasAll(list, values) {
  checkType(list, "list");
  return list.toSet().isSuperset(of(values));
}

export function get(list, index) {
  checkType(list, "list");
  checkIndex(list, index);
  return list.get(index);
}

export function set(list, index, value) {
  checkType(list, "list");
  checkIndex(list, index);
  return list.set(index, value);
}

export function put(value, list, index) {
  checkType(list, "list");
  checkIndex(list, index);
  return list.set(index, value);
}

export function push(list, value) {
  checkType(list, "list");
  return list.push(value);
}

export function pop(list) {
  checkNonEmpty(list);
  return list.pop();
}

export function reverse(list) {
  checkType(list, "list");
  return list.reverse();
}

export function swap(list, indexA, indexB) {
  checkType(list, "list");
  checkIndex(list, indexA);
  checkIndex(list, indexB);
  const a = list.get(indexA);
  const b = list.get(indexB);
  return list.set(indexA, b).set(indexB, a);
}

export function first(list) {
  return get(list, 0);
}

export function last(list) {
  return get(list, -1);
}

export function take(list, count) {
  checkType(list, "list");
  checkWhole(count);
  return list.take(count);
}

export function takeLast(list, count) {
  checkType(list, "list");
  checkWhole(count);
  return list.takeLast(count);
}

export function drop(list, count) {
  checkType(list, "list");
  checkWhole(count);
  return list.skip(count);
}

export function dropLast(list, count) {
  checkType(list, "list");
  checkWhole(count);
  return list.skipLast(count);
}

export function merge(lists) {
  checkType(lists, "list");
  lists.forEach((list) => checkType(list, "list"));
  return List().concat(...lists);
}

export function chunks(list, count) {
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
  checkType(list, "list");
  checkType(func, "function");

  const elems = [];

  for (const value of list) {
    elems.push(await func.call(value));
  }

  return List(elems);
}

export async function filter(list, condition) {
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
  checkType(list, "list");
  return list.filter((elem) => !is(elem, value));
}

export async function removeAll(list, values) {
  checkType(list, "list");
  checkType(values, "list");
  return list.filter((elem) => !values.includes(elem));
}

export async function find(list, condition) {
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
  checkType(list, "list");
  const index = list.indexOf(value);
  return index >= 0 ? index : null;
}

export async function count(list, value) {
  checkType(list, "list");
  return list.count((elem) => is(elem, value));
}

export async function groupBy(list, func) {
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
  return doSort(list, false);
}

export function sortDesc(list) {
  return doSort(list, true);
}

async function doSortBy(list, ranker, desc) {
  checkType(list, "list");
  checkType(ranker, "function");

  const ranks = [];

  for (const value of list) {
    ranks.push({ rank: await ranker.call(value), value });
  }

  return list
    .sort((a, b) => compare(a.rank, b.rank, desc))
    .map(({ value }) => value)
    .toList();
}

export async function sortBy(list, ranker) {
  return await doSortBy(list, ranker, false);
}

export async function sortDescBy(list, ranker) {
  return await doSortBy(list, ranker, true);
}

export function top(list, count) {
  return take(sortDesc(list), count);
}

export function bottom(list, count) {
  return take(sort(list), count);
}

export function sum(numbers) {
  checkType(numbers, "list");

  let result = 0;
  for (const n of numbers) {
    result += checkType(n, "number");
  }

  return checkNumResult(result);
}

export function average(numbers) {
  checkType(numbers, "list");
  checkNonEmpty(numbers);
  return sum(numbers) / numbers.size;
}

export function median(numbers) {
  checkType(numbers, "list");
  checkNonEmpty(numbers);

  const sorted = [...sort(numbers)];

  if (sorted.length % 2 == 1) {
    return sorted[Math.floor(sorted.length / 2)];
  }

  const a = sorted[sorted.length / 2 - 1] / 2;
  const b = sorted[sorted.length / 2];

  return checkNumResult((a + b) / 2);
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
  return listExtremum(numbers, Math.min);
}

export function max(numbers) {
  return listExtremum(numbers, Math.max);
}

export function counts(list) {
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
  checkType(list, "list");

  for (const value of list) {
    if (!checkType(value, "boolean")) {
      return false;
    }
  }

  return true;
}

export function any(list) {
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
  checkType(list, "list");
  return list.toOrderedSet().toList();
}

export function span(from, to) {
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
  checkWhole(limit);

  if (limit < 1) {
    return List();
  }

  return span(0, limit - 1);
}

export function normalize(numbers) {
  checkType(numbers, "list");

  let total = 0;

  for (const n of numbers) {
    checkType(n, "number");
    checkPositive(n);
    total += n;
  }

  checkNumResult(total);

  return numbers.map((n) => n / total);
}

export function percents(numbers) {
  return normalize(numbers).map((n) => n * 100);
}
