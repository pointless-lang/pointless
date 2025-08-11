import { renderMarkdown } from "./render-markdown.js";
import { watch } from "node:fs";
import { readFile } from "node:fs/promises";
import http from "node:http";
import { WebSocketServer } from "ws";

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

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="style.css">
        <title>Ptls notebook: ${filePath}</title>
      </head>

      <body>
        <article>
          ${inner}
        </article>

        <script>
          const ws = new WebSocket("ws://" + location.host);

          ws.onmessage = (msg) => {
            document.documentElement.innerHTML = msg.data;
          };
        </script>
      </body>
    </html>
  `;
}

async function respond(req, res, filePath) {
  if (req.url === "/style.css") {
    const css = await readFile(import.meta.dirname + "/style.css");
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

export function serve(filePath) {
  const server = http.createServer((req, res) => respond(req, res, filePath));
  const wss = new WebSocketServer({ server });
  watch(filePath, (eventType) => forwardChange(wss, eventType, filePath));
  server.listen(4000);
}
