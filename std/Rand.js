import { checkType, getType } from "../src/values.js";
import { checkWhole } from "../src/num.js";
import { checkNonEmpty } from "../src/list.js";
import { Table } from "../src/table.js";
import im from "../immutable/immutable.js";

export function random() {
  // Get a random fractional number between `0` and `1`.
  //
  // ```ptls --spoof "0.3742091256146767"
  // Rand.random()
  // ```

  return Math.random();
}

export function bool() {
  // Get `true` or `false`, chosen at random.
  //
  // ```ptls --spoof "true"
  // Rand.bool()
  // ```

  return Math.random() > 0.5;
}

export function sample(values) {
  // Return a random element from `values`, where `values` is a list, table, or
  // set.
  //
  // ```ptls --spoof "spades"
  // Rand.sample(["hearts", "diamonds", "clubs", "spades"])
  // ```

  checkType(values, "list", "table", "set");
  const index = Math.floor(Math.random() * values.size);

  if (getType(values) === "set") {
    values = im.List(values);
  }

  if (getType(values) === "list") {
    checkNonEmpty(values);
    return values.get(index);
  }

  values.checkNonEmpty();
  return values.getRow(index);
}

export function span(from, to) {
  // Return a random integer between `from` and `to`, inclusive.
  //
  // ```ptls --spoof "5"
  // Rand.span(1, 10)
  // ```

  checkWhole(from);
  checkWhole(to);

  const min = Math.min(from, to);
  const max = Math.max(from, to);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function range(limit) {
  // Return a random integer between `0` and `limit - 1`, inclusive.
  //
  // ```ptls --spoof "8"
  // Rand.range(10)
  // ```

  checkWhole(limit);
  return span(0, limit - 1);
}

// https://stackoverflow.com/a/12646864/6680182
export function shuffle(values) {
  // Shuffles `values`, where values is a list or table.
  //
  // ```ptls --spoof "[3, 2, 4, 1]"
  // Rand.shuffle([1, 2, 3, 4])
  // ```

  checkType(values, "list", "table");
  const items = [...values];

  for (let i = items.length - 1; i > 0; i--) {
    const j = span(0, i);
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }

  return getType(values) === "list"
    ? im.List(items)
    : Table.fromRows(im.List(items), values.keys());
}
