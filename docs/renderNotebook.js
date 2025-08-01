import { render } from "./render.js";
import { parse } from "node:path";
import { argv } from "node:process";
import { readFile } from "node:fs/promises";
import { format } from "prettier";

export async function makePage(title, inner) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="../../docs/notebook.css">
        <title>${title}</title>
      </head>

      <body>
        <main>
          <div class="docs">
            <div>
              ${inner}
            </div>
          </div>
        </main>
      </body>
    </html>
  `;

  return await format(html, { parser: "html" });
}

async function renderDoc(filePath) {
  const title = parse(filePath).name;
  const source = await readFile(filePath, "utf8");
  const inner = await render(filePath, source);
  return await makePage(title, inner);
}

console.log(await renderDoc(argv[2]));
