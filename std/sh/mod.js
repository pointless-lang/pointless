import { resolve } from "node:path";
import { readdir } from "node:fs/promises";
import { List, OrderedMap } from "immutable";
import { Table } from "../../src/table.js";
import { Panic } from "../../src/panic.js";

export async function ls(path) {
  const fullPath = resolve(path);

  try {
    const entries = await readdir(fullPath, { withFileTypes: true });
    const rows = [];

    for (const entry of entries) {
      const slash = entry.isDirectory() ? "/" : "";
      const name = entry.name + slash;
      rows.push(OrderedMap({ name }));
    }

    return Table.fromRows(List(rows), List(["name"]));
  } catch (err) {
    throw new Panic("cannot access", { path: fullPath });
  }
}
