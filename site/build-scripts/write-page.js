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
            <a href="/">Install</a>
            <a href="/tutorials">Tutorials</a>
            <a href="/">Language Docs</a>
            <a href="/">Standard Library</a>
            <a href="/">Blog</a>
            <a href="/">Source</a>
          </nav>
        </header>
        <div id="container">
          <nav id="sidebar">
            <ul>
              $$${sidebar}
            </ul>
          </nav>
        </header>

        <nav id="sidebar">
          <ul>
            $$${sidebar}
          </ul>
        </nav>

        <main>
          <article>$$${main}</article>
        </main>
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
