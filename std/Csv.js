import { checkType } from "../lang/values.js";
import { Panic } from "../lang/panic.js";
import { Table } from "../lang/table.js";
import Papa from "papaparse";
import im from "../immutable/immutable.js";
import { readFile } from "node:fs/promises";

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

function parseCSV(source) {
  // Could be improved to align more with Ptls token syntax

  const { data } = Papa.parse(source, { skipEmptyLines: true });
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

export async function read(path) {
  // Read the CSV file at `path` and return the data as a table. Column headers
  // are taken from the first row.
  //
  // ```ptls
  // Csv = import "std:Csv"
  // Csv.read("scores.csv")
  // ```

  checkType(path, "string");

  try {
    const source = await readFile(path, "utf8");
    return new Table(parseCSV(source));
  } catch (err) {
    if (err instanceof Panic) throw err;
    throw new Panic("file read error", { path, err: String(err) });
  }
}
