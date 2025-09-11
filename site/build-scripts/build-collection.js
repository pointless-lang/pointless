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

function splitTitle(fullTitle) {
  return fullTitle?.split(": ").at(-1);
}

async function getChildren(path, data) {
  return (
    data.links ??
    (await readdir(`site/pages/${path}`, { withFileTypes: true }))
      .filter((file) => file.isDirectory())
      .map(({ name }) => name)
  );
}

export async function collectionSidebar(path, data) {
  const links = [];

  for (const file of await getChildren(path, data)) {
    const data = await getData(path, file);
    links.push(h`<li><a href="${file}/">${splitTitle(data.title)}</a></li>`);
  }

  return h`<ul>$${links}</ul>`;
}

export async function genCollection(path, data) {
  const main = [];

  for (const file of await getChildren(path, data)) {
    const data = await getData(path, file);

    const subtitle = await renderMarkdown(
      `site/pages/${path}/${file}/index.md`,
      data.subtitle ?? "",
    );

    main.push(h`
        <li>
          <a href="${file}/"><strong>${splitTitle(data.title)}</strong></a>
          $${subtitle}
        </li>
      `);
  }

  return h`
    <hr />
    <ul class="page-links">$${main}</ul>
  `;
}
