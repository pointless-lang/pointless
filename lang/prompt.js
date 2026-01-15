import { Panic } from "../lang/panic.js";
import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";
import { readFile, writeFile } from "node:fs/promises";

const historyLimit = 50;
const historyPath = `${import.meta.dirname}/../.repl-history`;

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

export async function getLine(message) {
  const history = await loadHistory();

  return new Promise((resolve, reject) => {
    let open = true;

    const rl = createInterface({
      input: stdin,
      output: stdout,
      prompt: message,
      history,
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
      line = line.trim();

      if (history.length > historyLimit) {
        history.pop();
      }

      const serialized = history
        .map((entry) => JSON.stringify(entry).slice(1, -1))
        .join("\n");

      await writeFile(historyPath, serialized);

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
