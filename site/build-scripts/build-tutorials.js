import { headerId, renderMarkdown } from "./render-markdown.js";
import { writePage } from "./write-page.js";
import { h } from "./escape.js";
import { resolve } from "node:path";
import { readdir, readFile, mkdir, cp } from "node:fs/promises";
import matter from "gray-matter";

function makeSidebar(content) {
  const groups = [];

  for (const header of content.matchAll(/^(#{2,})(.*)/gm)) {
    const level = header[1].length;
    const title = header[2];

    if (level === 2) {
      groups.push([]);
    }

    groups.at(-1).push(title);
  }

  const sidebar = [];

  for (const group of groups) {
    const links = group
      .slice(1)
      .map((title) => h`<li><a href="#${headerId(title)}">${title}</a></li>`);

    const inner = links.length ? h`<ol>$$${links}</ol>` : "";

    sidebar.push(h`
      <li>
        <strong>
          <a href="#${headerId(group[0])}">${group[0]}</a>
        </strong>

        $$${inner}
      </li>
    `);
  }

  return sidebar;
}

async function buildTutorial(dir) {
  const filePath = resolve(`site/tutorials/${dir}/tutorial.md`);
  const source = await readFile(filePath, "utf8");
  const { data, content } = matter(source);

  await writePage(
    `tutorials/${dir}/index.html`,
    `${data.title} Tutorial`,
    "base.css",
    makeSidebar(content),
    await renderMarkdown(filePath, content),
  );
}

export async function buildTutorials() {
  const baseDir = "site/tutorials/";

  for (const dir of await readdir(baseDir)) {
    await mkdir(`site/dist/tutorials/${dir}`, { recursive: true });
    await buildTutorial(dir);

    const assets = new Set(await readdir(baseDir + dir));
    assets.delete("tutorial.md");

    for (const file of assets) {
      const filePath = baseDir + dir + "/" + file;
      const distPath = `site/dist/tutorials/${dir}/${file}`;
      await cp(filePath, distPath);
    }
  }
}
