import { spawnStd } from "../std.js";
import { OrderedMap } from "immutable";

export async function getPrelude() {
  return OrderedMap((await spawnStd()).parent.defs);
}
