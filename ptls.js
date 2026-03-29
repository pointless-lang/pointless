#!/usr/bin/env node

// This code is human written and reviewed with contributions from AI
// http://pointless.dev/articles/ai-and-pointless/

import { impl } from "./runtime/impl.js";
import { loader } from "./runtime/loader.js";
import { Runtime } from "./runtime/runtime.js";
import { Panic } from "./lang/panic.js";
import { repl } from "./lang/repl.js";
import { format } from "./tooling/formatter.js";
import { Command } from "commander";
import path from "node:path";
import fs from "node:fs";

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

const program = new Command();

program
  .name("ptls")
  .description("Pointless language")
  .argument("[file]", "file to run")
  .argument("[args...]", "arguments passed to the script")
  .passThroughOptions()
  .action(async (file) => {
    const runtime = new Runtime(impl, loader);

    if (file) {
      await runFile(runtime, file, true);
    } else {
      await repl(runtime);
    }
  });

program
  .command("run <file>")
  .description("run a Pointless file")
  .action(async (file) => {
    const runtime = new Runtime(impl, loader);
    await runFile(runtime, file, true);
  });

program
  .command("live <file>")
  .description("run a Pointless file interactively (rerun on save)")
  .action(async (file) => {
    const runtime = new Runtime(impl, loader);

    let timer;

    const runChange = async () => {
      console.clear();
      await runFile(runtime, file, false);
    };

    await runChange();

    fs.watch(file, () => {
      clearTimeout(timer);
      timer = setTimeout(runChange, 100);
    });
  });

function* findPtls(filePath) {
  const stat = fs.statSync(filePath);

  if (stat.isDirectory()) {
    for (const fileName of fs.readdirSync(filePath, { recursive: true })) {
      if (fileName.endsWith(".ptls")) {
        yield path.join(filePath, fileName);
      }
    }
  } else {
    yield filePath;
  }
}

program
  .command("fmt [paths...]")
  .description("format Pointless files")
  .action((paths) => {
    if (!paths.length) {
      paths = ["."];
    }

    for (const path of paths) {
      for (const file of findPtls(path)) {
        const src = fs.readFileSync(file, "utf8");

        try {
          const out = format(src, file);

          if (out !== src) {
            console.log("Formatted:", file);
            fs.writeFileSync(file, out, "utf8");
          }
        } catch (err) {
          if (err instanceof Panic) {
            console.log("Syntax Error:", file);
            console.log(String(err).replace(/^/gm, "  "));
          } else {
            throw err;
          }
        }
      }
    }
  });

program.parseAsync();
