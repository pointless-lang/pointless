import { writePage } from "./write-page.js";
import { headerId, renderMarkdown } from "./render-markdown.js";
import { h } from "./escape.js";
import { resolve } from "node:path";
import { readdir, readFile, mkdir, cp } from "node:fs/promises";
import matter from "gray-matter";

function makeSidebar(content) {
  const matches = [...content.matchAll(/^##(.*)/gm)];
  const links = matches.map(
    ([, title]) => h`
      <li>
        <a href="#${headerId(title)}">${title}</a>
      </li>
    `,
  );

  return h`
    <ol>
      $$${links}
    </ol>
  `;
}

async function buildPage(path) {
  const filePath = resolve(`site/pages/${path}/index.md`);
  const source = await readFile(filePath, "utf8");
  const { data, content } = matter(source);

  await writePage(
    `${path}/index.html`,
    data.title,
    "base.css",
    makeSidebar(content),
    await renderMarkdown(filePath, content),
  );
}

async function buildDir(path) {
  const files = await readdir(`site/pages/${path}`, { withFileTypes: true });
  await mkdir(`site/dist/${path}`, { recursive: true });

  for (const file of files) {
    if (file.isDirectory()) {
      await buildDir(`${path}/${file.name}`);
    } else if (file.name === "index.md") {
      await buildPage(path);
    } else {
      await cp(
        `site/pages/${path}/${file.name}`,
        `site/dist/${path}/${file.name}`,
      );
    }
  }
}

export async function buildPages() {
  await buildDir("");
}
