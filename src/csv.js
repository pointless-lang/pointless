import { parse as csvParse } from "csv-parse/sync";
import { OrderedMap, List } from "immutable";

export function parseData(source) {
  // sketchy, doesn't parse quoted strings
  // lots of improvements to make

  const rows = csvParse(source);
  const columns = new Map();

  for (const key of rows[0]) {
    columns.set(key, []);
  }

  for (const row of rows.slice(1)) {
    let index = 0;
    for (const column of columns.values()) {
      column.push(convert(row[index]));
      index++;
    }
  }

  return OrderedMap(columns).map(List);
}

const number = /^\d*\.?\d+([eE][+-]?\d+)?$/;

function convert(string) {
  string = string.trim();

  switch (string) {
    case "true":
      return true;
    case "false":
      return false;
    case "none":
      return null;
  }

  if (number.test(string)) {
    return JSON.parse(string);
  }

  return string;
}
