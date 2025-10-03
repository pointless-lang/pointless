import { getImport } from "./src/import.js";
import { Panic } from "./src/panic.js";
import { repl } from "./repl/repl.js";
import { serve } from "./notebook/serve.js";
import commandLineArgs from "command-line-args";

async function run(config) {
  try {
    if (config.notebook) {
      await serve(config.file);
      return;
    }

    if (config.file) {
      await getImport(config.file, "./");
      return;
    }

    await repl();
  } catch (err) {
    if (err instanceof Panic) {
      console.log(String(err));
    }

    throw err;
  }
}

const options = [
  { name: "file", defaultOption: true },
  { name: "notebook", type: Boolean },
];

run(commandLineArgs(options));
