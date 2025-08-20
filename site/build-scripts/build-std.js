import { writePage } from "./write-page.js";
import { renderMarkdown } from "./render-markdown.js";
import { h } from "./escape.js";
import { getType } from "../../src/values.js";
import { loadMeta } from "../../src/std.js";
import { mkdir, readFile } from "node:fs/promises";

const intro = await readFile("site/pages/stdlib/intro.md", "utf8");

function getDocStr(func) {
  const comment = func.handler
    .toString()
    .match(/^.*\n((?:[ \t]*\/\/.*\n?)*)/)
    .at(1)
    .trim();

  return comment
    .split("\n")
    .map((line) => line.replace(/\s*\/\/ ?/, ""))
    .join("\n");
}

function showTags(modName, name, value) {
  if (modName !== "Overloads" && meta.variants[name]) {
    return `<span class="tag" title="Overloaded"></span>`;
  }

  if (meta.globals[name] === value) {
    return `<span class="tag" title="Global"></span>`;
  }

  if (getType(value) !== "function") {
    return `<span class="tag" title="Constant"></span>`;
  }

  return "";
}

async function showDocs(modName, name, value, consts) {
  if (modName === "Overloads") {
    const items = meta.variants[name].map(
      (child) => h`<li><a href="#${child.name}">${child}</a></li>`,
    );

    return h`
      <p>Overload of:</p>
      <ul class="overloads">
        $$${items}
      </ul>
    `;
  }

  if (getType(value) === "function") {
    const overloader =
      meta.variants[name] &&
      h`
        <p class="overloads">
          (Accessible as a global through <a href="./Overloads#${name}">Overloads.${name}</a>)
        </p>
      `;

    return h`$$${await renderMarkdown(modName, getDocStr(value))} $$${overloader}`;
  }

  return await renderMarkdown(
    modName,
    `${consts[name] ?? ""}\n\`\`\`ptls --hide\n${modName}.${name}\n\`\`\``,
  );
}

async function showDef(modName, name, value, consts) {
  const label = getType(value) === "function" ? value : `${modName}.${name}`;
  const docs = await showDocs(modName, name, value, consts);

  return h`
    <hr />

    <h2 class="def-name" id="${name}">
      <code><a href="#${name}">${label}</a></code>
      $$${showTags(modName, name, value)}
    </h2>

    <div class="contents">$$${docs}</div>
  `;
}

function makeSidebar(modName, mod) {
  const links = Object.entries(mod).map(
    ([name, value]) => h`
      <li>
        <code><a href="#${name}">${name}</a></code>$$${showTags(modName, name, value)}
      </li>
    `,
  );

  return h`<ul>$$${links}</ul>`;
}

async function showMod(modName, mod, docs, consts) {
  const defs = [];

  for (const [name, value] of Object.entries(mod)) {
    defs.push(await showDef(modName, name, value, consts));
  }

  return h`
    $$${await renderMarkdown(modName, docs)}
    <a href="."><strong>↩ Back to Standard Library Contents</strong></a>
    $$${defs}
  `;
}

let meta;

export async function buildStd() {
  meta = await loadMeta();

  await mkdir(`site/dist/stdlib`, { recursive: true });

  const links = [];
  const main = [];

  for (const [modName, mod] of Object.entries(meta.modules)) {
    const { _docs = "", _consts = {} } = await import(
      `../../std/${modName}.js`
    );

    links.push(
      h`<li><code><a href="${modName}.html">${modName}</a></code></li>`,
    );

    const firstLine = _docs.trim().split("\n")[0];
    const summary = await renderMarkdown("std", firstLine);

    main.push(h`
      <li>
        <a href="${modName}.html"><strong>${modName}</strong></a>
      
        $$${summary}
      </li>
    `);

    await writePage(
      `stdlib/${modName}.html`,
      `Standard Library: ${modName}`,
      "std.css",
      makeSidebar(modName, mod),
      await showMod(modName, mod, _docs, _consts),
    );
  }

  await writePage(
    `stdlib/index.html`,
    `Standard Library`,
    "std.css",
    h`<ul>$$${links}</ul>`,
    h`
      $$${await renderMarkdown("std", intro)}

      <hr />

      <ul class="page-links">$$${main}</ul>
    `,
  );
}
