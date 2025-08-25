import { renderMarkdown } from "./render-markdown.js";
import { h } from "./escape.js";
import { readdir, readFile } from "node:fs/promises";
import matter from "gray-matter";

const cache = [];

async function getData(path, fileName) {
  const filePath = `site/pages/${path}/${fileName}/index.md`;
  cache[filePath] ??= matter(await readFile(filePath, "utf8")).data;
  return cache[filePath];
}

export async function collectionSidebar(path) {
  const links = [];
  const files = await readdir(`site/pages/${path}`, {
    withFileTypes: true,
  });

  for (const file of files) {
    if (file.isDirectory()) {
      const data = await getData(path, file.name);
      links.push(
        h`<li><a href="${file.name}/">${data.link ?? data.title}</a></li>`,
      );
    }
  }

  return h`<ul>$${links}</ul>`;
}

export async function genCollection(path) {
  const main = [];
  const files = await readdir(`site/pages/${path}`, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      const data = await getData(path, file.name);

      const summary = await renderMarkdown(
        `site/pages/${path}/${file.name}/index.md`,
        data.summary ?? "",
      );

      main.push(h`
        <li>
          <a href="${file.name}/"><strong>${data.link ?? data.title}</strong></a>
          $${summary}
        </li>
      `);
    }
  }

  return h`
    <hr />
    <ul class="page-links">$${main}</ul>
  `;
}
