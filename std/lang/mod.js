import { spawnStd } from "../std.js";

export async function getPrelude() {
  return OrderedMap((await spawnStd()).parent.defs);
}
