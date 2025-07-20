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
      // use Panic.toString for Panics and Errs
      console.log(Panic.prototype.toString.call(err));
    }

    throw err;
  }
}

run();
