import { buildStd } from "./build-std.js";
import { writePage } from "./write-page.js";
import { headerId, renderMarkdown } from "./render-markdown.js";
import { h } from "./escape.js";
import { readdir, readFile, cp, rm, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import matter from "gray-matter";

function makeSidebar(content) {
  const links = content
    .matchAll(/^##(.*)/gm)
    .map(([, title]) => h`<li><a href="#${headerId(title)}">${title}</a></li>`);

  return h`<ol>$$${links}</ol>`;
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
    if (file.name === "index.md") {
      await buildPage(path);
      continue;
    }

    if (file.name.endsWith(".md")) {
      continue;
    }

    if (file.isDirectory()) {
      await buildDir(`${path}/${file.name}`);
      continue;
    }

    await cp(
      `site/pages/${path}/${file.name}`,
      `site/dist/${path}/${file.name}`,
    );
  }
}

await rm("site/dist", { recursive: true, force: true });
await mkdir("site/dist", { recursive: true });
await buildDir("");
await buildStd();
await cp("site/static", "site/dist", { recursive: true });
