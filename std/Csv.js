import { checkType } from "../lang/values.js";
import { Panic } from "../lang/panic.js";
import { Table } from "../lang/table.js";
import { readFile } from "node:fs/promises";

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
    return Table.fromCsv(source);
  } catch (err) {
    if (err instanceof Panic) throw err;
    throw new Panic("file read error", { path, err: String(err) });
  }
}
