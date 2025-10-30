#!/usr/bin/env node

import { impl } from "./runtime/impl.js";
import { loader } from "./runtime/loader.js";
import { Runtime } from "./runtime/runtime.js";
import { Panic } from "./lang/panic.js";
import { repl } from "./lang/repl.js";
import { serve } from "./notebook/serve.js";
import commandLineArgs from "command-line-args";

async function run(config) {
  const runtime = new Runtime(impl, loader);

  try {
    if (config.notebook) {
      serve(config.file, config.port);
      return;
    }

    if (config.file) {
      await runtime.importer.get("./", config.file);
      return;
    }

    await repl(runtime);
  } catch (err) {
    if (err instanceof Panic) {
      console.log(await err.repr());
    }

    throw err;
  }
}

const options = [
  { name: "file", defaultOption: true },
  { name: "notebook", type: Boolean },
  { name: "port", type: Number, defaultValue: 4000 },
];

run(commandLineArgs(options));
