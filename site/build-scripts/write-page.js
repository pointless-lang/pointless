import { h } from "./escape.js";
import { format } from "prettier";
import { dirname } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

export function base(title, style, sidebar, main) {
  return h`
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/icons/icon.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/icons/icon-light.png" media="(prefers-color-scheme: dark)" />
        <link rel="stylesheet" type="text/css" href="/css/${style}" />
        <title>${title}</title>
      </head>

      <body>
        <header>
          <a id="logo" href="/">
            <img src="/icons/icon.svg" />
            <strong>Pointless</strong>
          </a>

          <nav>
            <ul>
              <li><a href="/">Learn</a></li>
              <li><a href="/">Philosophy</a></li>
              <li><a href="/">Blog</a></li>
              <li><a href="/">Docs</a></li>
              <li><a href="/">Install</a></li>
              <li><a href="/">Source</a></li>
            </ul>
          </nav>
        </header>

        <article>
          <h1>${title}</h1>

          <div id="sidebar">
            $$${sidebar}
          </div>

          <main>
            $$${main}
          </main>
        </article>
      </body>
    </html>
  `;
}

export async function writePage(path, title, style, sidebar, main) {
  path = `site/dist/${path}`;
  const html = base(title, style, sidebar, main);
  const result = await format(html, { parser: "html" });
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, result);
}
