import im from "../immutable/immutable.js";
import { argv } from "node:process";

export const { flags, args } = parseArgs();
export const rawArgs = im.List(argv);

function parseArgs() {
  const flags = new Map();
  const args = [];

  for (const arg of argv.slice(3)) {
    if (arg.startsWith("--")) {
      if (!arg.includes("=")) {
        if (arg.startsWith("--no-")) {
          flags.set(arg.slice(5), false);
        } else {
          flags.set(arg.slice(2), true);
        }
      } else {
        const index = arg.indexOf("=");
        const key = arg.slice(2, index);
        const value = arg.slice(index + 1);
        flags.set(key, value);
      }
    } else {
      args.push(arg);
    }
  }

  return { args: im.List(args), flags: im.OrderedMap(flags) };
}
