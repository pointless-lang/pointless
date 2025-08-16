import { getImport } from "./src/import.js";
import { Panic } from "./src/panic.js";
import { repl } from "./repl/repl.js";
import { serve } from "./notebook/serve.js";
import { argv } from "node:process";

async function run() {
  try {
    if (argv.length > 3) {
      await serve(argv[3]);
    } else if (argv.length > 2) {
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
