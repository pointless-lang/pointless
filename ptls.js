#!/usr/bin/env node

import { impl } from "./runtime/impl.js";
import { loader } from "./runtime/loader.js";
import { Runtime } from "./runtime/runtime.js";
import { Panic } from "./lang/panic.js";
import { repl } from "./lang/repl.js";
import commandLineArgs from "command-line-args";
import { fileSync } from "tmp";
import { readFileSync, watch } from "node:fs";
import { spawn } from "node:child_process";
import { platform } from "node:process";

function openFile(file) {
  const opts = { detached: true, stdio: "ignore" };

  switch (platform) {
    case "win32":
      spawn("cmd", ["/c", "start", "", file], opts);
      break;
    case "darwin":
      spawn("open", [file], opts);
      break;
    default:
      spawn("xdg-open", [file], opts);
  }
}

async function runFile(runtime, file, throwPanic) {
  try {
    await runtime.importer.get("./", file, false);
  } catch (err) {
    if (err instanceof Panic) {
      console.log(String(err));
    }

    if (throwPanic || !(err instanceof Panic)) {
      throw err;
    }
  }
}

async function run(config) {
  const runtime = new Runtime(impl, loader);

  if (config.live) {
    const file = config.file ?? fileSync({ postfix: ".ptls" }).name;
    openFile(file);

    let timer;

    async function runChange() {
      console.clear();
      await runFile(runtime, file, false);
    }

    await runChange();

    watch(file, () => {
      clearTimeout(timer);
      timer = setTimeout(runChange, 100);
    });

    return;
  }

  if (config.file) {
    await runFile(runtime, config.file, true);
    return;
  }

  await repl(runtime);
}

const options = [
  { name: "file", defaultOption: true },
  { name: "live", type: Boolean, defaultValue: false },
  { name: "port", type: Number, defaultValue: 4000 },
];

run(commandLineArgs(options));
