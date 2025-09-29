import { Panic } from "../src/panic.js";
import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";
import { readFile, writeFile } from "node:fs/promises";

const historyPath = "/tmp/repl-history";

async function loadHistory() {
  try {
    const text = await readFile(historyPath, "utf8");
    return text.split("\n").map((line) => JSON.parse(`"${line}"`));
  } catch (err) {
    if (err.code === "ENOENT") {
      await writeFile(historyPath, "");
      return [];
    } else {
      throw err;
    }
  }
}

let history;

export async function getLine(message) {
  history ??= await loadHistory();

  return new Promise((resolve, reject) => {
    let open = true;

    const rl = createInterface({
      input: stdin,
      output: stdout,
      // readline will modify history array
      // clone so we can keep track history ourselves
      history: [...history],
      prompt: message,
    });

    rl.prompt();

    function cleanup() {
      // don't use rl.removeAllListeners("close")
      // since it will disrupt rl.close()
      open = false;
      rl.close();
    }

    rl.on("line", async (line) => {
      cleanup();
      await addHistory(history, line);
      resolve(line);
    });

    rl.on("SIGINT", () => {
      cleanup();
      console.log();
      reject(new Panic("keyboard interrupt"));
    });

    rl.on("close", () => {
      if (open) {
        cleanup();
        console.log();
        reject(new Panic("EOF interrupt"));
      }
    });
  });
}

const limit = 50;

async function addHistory(history, line) {
  line = line.trim();

  if (line !== history[0]) {
    // rl requires reversed history
    history.unshift(line);

    if (history.length > limit) {
      history.pop();
    }

    const serialized = history
      .map((entry) => JSON.stringify(entry).slice(1, -1))
      .join("\n");

    await writeFile(historyPath, serialized);
  }
}
