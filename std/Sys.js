import im from "../immutable/immutable.js";
import { argv } from "node:process";

export const { flags, args } = parseArgs();
export const rawArgs = im.List(argv);

function parseArgs() {
  // Can't use js Map and convert to OrderedMap cause OrderedMap
  // drops null valued entries (wtf?!)
  let flags = im.OrderedMap();
  let args = im.List();
  let raw = false;

  for (const arg of argv.slice(3)) {
    if (raw) {
      args = args.push(arg);
    } else if (arg === "--") {
      raw = true;
    } else if (arg.startsWith("--")) {
      if (!arg.includes("=")) {
        flags = flags.set(arg.slice(2), null);
      } else {
        const index = arg.indexOf("=");
        const key = arg.slice(2, index);
        const value = arg.slice(index + 1);
        flags = flags.set(key, value);
      }
    } else {
      args = args.push(arg);
    }
  }

  return { args, flags };
}
