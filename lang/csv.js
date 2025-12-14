import Papa from "papaparse";
import im from "../immutable/immutable.js";

export function parseCSV(source) {
  // Could be improved to align more with Ptls token syntax

  const { data } = Papa.parse(source);
  const columns = new Map();

  for (const key of data[0]) {
    columns.set(key, []);
  }

  for (const row of data.slice(1)) {
    let index = 0;
    for (const column of columns.values()) {
      column.push(convert(row[index]));
      index++;
    }
  }

  return im.OrderedMap(columns).map(im.List);
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
    return Number.parseFloat(string);
  }

  return string;
}
