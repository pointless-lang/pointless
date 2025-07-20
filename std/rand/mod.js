import { checkType, getType } from "../../src/values.js";
import { checkWhole } from "../../src/num.js";
import { checkNonEmpty } from "../../src/list.js";
import { Table } from "../../src/table.js";
import { List } from "immutable";

export function random() {
  // Get a random fractional number between `0` and `1`.
  //
  // ```ptls --no-echo
  // rand.random()
  // ```

  return Math.random();
}

export function sample(values) {
  // Return a random element from `values`, where `values` is
  // a list, table, or set.
  //
  // ```ptls --no-echo
  // rand.sample(["hearts", "diamonds", "clubs", "spades"])
  // ```

  checkType(values, "list", "table", "set");
  const index = Math.floor(Math.random() * values.size);

  if (getType(values) === "set") {
    values = List(values);
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
  // ```ptls --no-echo
  // rand.span(1, 10)
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
  // ```ptls --no-echo
  // rand.range(10)
  // ```

  checkWhole(limit);
  return span(0, limit - 1);
}

// https://stackoverflow.com/a/12646864/6680182
export function shuffle(values) {
  // Shuffles `values`, where values is a list or table.
  //
  // ```ptls --no-echo
  // rand.shuffle([1, 2, 3, 4])
  // ```

  checkType(values, "list", "table");
  const items = [...values];

  for (let i = items.length - 1; i > 0; i--) {
    let j = span(0, i);
    let tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }

  return getType(values) === "list"
    ? List(items)
    : Table.fromRows(List(items), values.keys());
}
