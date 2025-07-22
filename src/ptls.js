import { argv } from "node:process";
import { getImport } from "./import.js";
import { Panic } from "./panic.js";
import { repl } from "./repl.js";

async function run() {
  try {
    if (argv.length > 2) {
      await getImport(argv[2], "./");
    } else {
      await repl();
    }
  } catch (err) {
    if (err instanceof Panic) {
      console.log(String(err));
    }

    throw err;
  }
}

run();
