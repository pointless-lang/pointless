import { getType } from "../../src/values.js";
import { modules, globals, variants } from "../../std/std.js";
import { writePage } from "./write-page.js";
import { renderMarkdown } from "./render-markdown.js";
import { h } from "./escape.js";
import { mkdir } from "node:fs/promises";

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
  if (modName !== "overloads" && variants[name]) {
    return `<span class="tag" title="Overloaded"></span>`;
  }

  if (globals[name] === value) {
    return `<span class="tag" title="Global"></span>`;
  }

  if (getType(value) !== "function") {
    return `<span class="tag" title="Constant"></span>`;
  }

  return "";
}

async function showDocs(modName, name, value, consts) {
  if (modName === "overloads") {
    const items = variants[name].map(
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
      variants[name] &&
      h`
        <p class="overloads">
          (Accessible as a global through <a href="./overloads#${name}">overloads.${name}</a>)
        </p>
      `;

    return h`$$${await renderMarkdown("std", getDocStr(value))} $$${overloader}`;
  }

  return await renderMarkdown(
    "std",
    `${consts[name] ?? ""}\n\`\`\`ptls --hide\n${modName}.${name}\n\`\`\``,
  );
}

async function showDef(modName, name, value, consts) {
  const label = getType(value) === "function" ? value : `${modName}.${name}`;
  const docs = await showDocs(modName, name, value, consts);

  return h`
    <hr />

    <h3 class="def-name" id="${name}">
      <code><a href="#${name}">${label}</a></code>
      $$${showTags(modName, name, value)}
    </h3>

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

  return h`
    <ul>
      $$${links}
    </ul>
  `;
}

async function showMod(modName, mod, docs, consts) {
  const defs = [];

  for (const [name, value] of Object.entries(mod)) {
    defs.push(await showDef(modName, name, value, consts));
  }

  return h`
    $$${await renderMarkdown("std", docs)}

    <a href="."><strong>↩ Back to Standard Library Contents</strong></a>

    $$${defs}
  `;
}

export async function buildStd() {
  await mkdir(`site/dist/stdlib`, { recursive: true });

  const links = [];
  const main = [];

  for (const [modName, mod] of Object.entries(modules)) {
    const { _docs = "", _consts = {} } = await import(
      `../../std/${modName}/mod.js`
    );

    links.push(h`
      <li>
        <code><a href="${modName}.html">${modName}</a></code>
      </li>
    `);

    const summary = _docs.trim().split("\n")[0];

    main.push(h`
      <li class="mod-link">
        <a href="${modName}.html">
          <strong>${modName}</strong>
        </a>
      
        <div>$$${summary}</div>
      </li>
    `);

    await writePage(
      `stdlib/${modName}.html`,
      `Standard Library: ${modName}`,
      "std.css",
      makeSidebar(modName, mod),
      h`
        <h2 id="std.${modName}">
          <code><a href="#std.${modName}">std.${modName}</a></code>
        </h2>

        $$${await showMod(modName, mod, _docs, _consts)}
      `,
    );
  }

  await writePage(
    `stdlib/index.html`,
    `Standard Library`,
    "std.css",
    h`
      <ul>
        $$${links}
      </ul>
    `,
    h`
      <ul>
        $$${main}
      </ul>
    `,
  );
}
