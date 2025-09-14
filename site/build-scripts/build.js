import { collectionSidebar, genCollection } from "./build-collection.js";
import { moduleSidebar, genModule } from "./build-module.js";
import { headerId, renderMarkdown } from "./render-markdown.js";
import { h, serialize } from "./escape.js";
import { readdir, readFile, cp, rm, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import matter from "gray-matter";
import { format } from "prettier";

function defaultSidebar(content) {
  const links = content
    .matchAll(/^##(.*)/gm)
    .map(([, title]) => h`<li><a href="#${headerId(title)}">${title}</a></li>`);

  return h`<ol>$${links}</ol>`;
}

async function makeSidebar(path, type, data, content) {
  switch (type) {
    case "module":
      return await moduleSidebar(path);
    case "collection":
      return await collectionSidebar(path, data);
    case undefined:
      return defaultSidebar(content);
  }
}

export async function makeGenerated(path, type, data) {
  switch (type) {
    case "module":
      return await genModule(path, data);
    case "collection":
      return await genCollection(path, data);
    case undefined:
      return "";
  }
}

let template;
const backlinks = {};

async function buildPage(path, depth) {
  const filePath = `site/pages/${path}/index.md`;
  const source = await readFile(filePath, "utf8");
  const { data, content } = matter(source);
  const { title, type, subtitle } = data;

  const sidebar = await makeSidebar(path, type, data, content);
  const intro = await renderMarkdown(filePath, content);
  const generated = await makeGenerated(path, type, data);

  const main = h`
    $${intro}
    $${generated}
  `;

  const parentPath = resolve(`site/pages/${path}/..`);

  backlinks[parentPath] ??=
    depth > 1
      ? matter(await readFile(parentPath + "/index.md", "utf8")).data.title
      : "";

  const values = {
    title,
    subtitle,
    backlink: backlinks[parentPath],
    sidebar,
    main,
  };

  template ??= await readFile(import.meta.dirname + "/template.html", "utf8");

  const html = template.replaceAll(/\${1,2}{(\w+)}/g, (match, name) => {
    return serialize(values[name], match.startsWith("$$"));
  });

  const result = await format(html, { parser: "html" });
  await writeFile(`site/dist/${path}/index.html`, result);
}

async function buildDir(path, depth = 0) {
  const files = await readdir(`site/pages/${path}`, { withFileTypes: true });
  await mkdir(`site/dist/${path}`, { recursive: true });

  for (const file of files) {
    if (file.name === "index.md") {
      await buildPage(path, depth);
    } else if (file.isDirectory()) {
      const subPath = path ? `${path}/${file.name}` : file.name;
      await buildDir(subPath, depth + 1);
    } else {
      await cp(
        `site/pages/${path}/${file.name}`,
        `site/dist/${path}/${file.name}`,
      );
    }
  }
}

await rm("site/dist", { recursive: true, force: true });
await mkdir("site/dist", { recursive: true });
await buildDir("");
await cp("site/static", "site/dist", { recursive: true });
