import { collectionSidebar, genCollection } from "./build-collection.js";
import { genModule, moduleSidebar } from "./build-module.js";
import { headerId, renderMarkdown } from "../../render/render-markdown.js";
import { h, serialize } from "../../render/escape.js";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import matter from "gray-matter";
import { format } from "prettier";

async function getTree(path, parent = null) {
  const childMap = new Map();

  const node = {
    path,
    content: null,
    parent,
    depth: parent ? parent.depth + 1 : 0,
    files: [],
  };

  const files = await readdir(`site/pages/${path}`, { withFileTypes: true });

  for (const file of files) {
    if (file.name === "index.md") {
      const source = await readFile(`site/pages/${path}/index.md`, "utf8");
      const { data, content } = matter(source);

      node.content = content;

      // title
      // subtitle
      // consts
      // links
      // type
      Object.assign(node, data);

      node.label = data.title?.split(": ").at(-1);
    } else if (file.isDirectory()) {
      const subPath = path ? `${path}/${file.name}` : file.name;
      childMap.set(file.name, await getTree(subPath, node));
    } else {
      node.files.push(file.name);
    }
  }

  node.children = node.links
    ? node.links.map((name) => childMap.get(name))
    : [...childMap.values()];

  for (const [index, child] of node.children.entries()) {
    child.prev = node.children[index - 1];
    child.next = node.children[index + 1];
  }

  return node;
}

function defaultSidebar(node) {
  const links = node.content
    .matchAll(/^##(.*)/gm)
    .map(([, title]) => h`<li><a href="#${headerId(title)}">${title}</a></li>`);

  return h`<ol>$${links}</ol>`;
}

async function makeSidebar(node) {
  switch (node.type) {
    case "module":
      return await moduleSidebar(node);
    case "collection":
      return collectionSidebar(node);
    case undefined:
      return defaultSidebar(node);
  }
}

export async function makeGenerated(node) {
  switch (node.type) {
    case "module":
      return await genModule(node);
    case "collection":
      return genCollection(node);
    case undefined:
      return "";
  }
}

let template;

async function buildIndex(node) {
  const sidebar = await makeSidebar(node);
  const generated = await makeGenerated(node);

  const intro = await renderMarkdown(
    `site/pages/${node.path}/index.md`,
    node.content,
  );

  const main = h`
    $${intro}
    $${generated}
  `;

  const backlink = node.depth >= 2 &&
    `<a id="back" href="..">< Back to ${node.parent.title}</a>`;

  let sequencer;

  if (node.depth >= 2) {
    const prev = node.prev &&
      h`
        <a href="/${node.prev.path}">
          <div>< Previous</div>
          ${node.prev.label}
        </a>
      `;

    const next = node.next &&
      h`
        <a class="next" href="/${node.next.path}">
          <div>Next ></div>
          ${node.next.label}
        </a>
      `;

    sequencer = h`
      <div id="sequencer">
        <hr />
        <div>$${prev} $${next}</div>
      </div>
    `;
  }

  const values = {
    title: node.title,
    subtitle: node.subtitle,
    backlink,
    sidebar,
    main,
    sequencer,
  };

  template ??= await readFile(import.meta.dirname + "/template.html", "utf8");

  const html = template.replaceAll(/\${1,2}{(\w+)}/g, (match, name) => {
    return serialize(values[name], match.startsWith("$$"));
  });

  const result = await format(html, { parser: "html" });
  await writeFile(`site/dist/${node.path}/index.html`, result);
}

async function buildPage(node) {
  await mkdir(`site/dist/${node.path}`, { recursive: true });
  await buildIndex(node);

  for (const child of node.children.values()) {
    await buildPage(child);
  }

  for (const file of node.files) {
    await cp(
      `site/pages/${node.path}/${file}`,
      `site/dist/${node.path}/${file}`,
    );
  }
}

await rm("site/dist", { recursive: true, force: true });
await mkdir("site/dist", { recursive: true });
const tree = await getTree("");
await buildPage(tree);
await cp("site/static", "site/dist", { recursive: true });
