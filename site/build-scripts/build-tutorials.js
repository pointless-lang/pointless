import { headerId, renderMarkdown } from "./render-markdown.js";
import { writePage } from "./write-page.js";
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
