import { renderMarkdown } from "../render/render-markdown.js";
import { watch } from "node:fs";
import { readFile } from "node:fs/promises";
import http from "node:http";
import { WebSocketServer } from "ws";

let template;

async function makePage(filePath) {
  const source = "----\n" + (await readFile(filePath, "utf-8"));
  const blocks = source.split(/^-{4,}/gm);
  const embeds = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    const args = lines[0].trim();
    const code = lines.slice(1).join("\n").trim();

    if (code) {
      embeds.push(`\`\`\`ptls ${args}\n${code}\n\`\`\``);
    }
  }

  const inner = await renderMarkdown(filePath, embeds.join("\n\n"));

  // Relative path works for bundled code in dist
  template ??= template = await readFile(
    import.meta.dirname + "/../notebook/template.html",
    "utf8",
  );

  return template.replace("$$filePath", filePath).replace("$$inner", inner);
}

let css;

async function respond(req, res, filePath) {
  // Relative path works for bundled code in dist
  css ??= await readFile(
    import.meta.dirname + "/../notebook/style.css",
    "utf8",
  );

  if (req.url === "/style.css") {
    res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
    res.end(css);
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(await makePage(filePath));
}

async function forwardChange(wss, eventType, filePath) {
  if (eventType === "change") {
    const page = await makePage(filePath);

    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(page);
      }
    }
  }
}

export function serve(filePath, port) {
  const server = http.createServer((req, res) => respond(req, res, filePath));
  const wss = new WebSocketServer({ server });
  watch(filePath, (eventType) => forwardChange(wss, eventType, filePath));
  server.listen(port);
  console.log(`Notebook running at http://localhost:${port}`);
}
