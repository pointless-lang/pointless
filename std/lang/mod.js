import { spawnStd } from "../std.js";
import { basename, dirname } from "node:path";
import { OrderedMap } from "immutable";

export function srcPath() {
  return OrderedMap({
    name: basename(Env.currentPath),
    path: dirname(Env.currentPath),
  });
}

export async function getPrelude() {
  return OrderedMap((await spawnStd()).parent.defs);
}
