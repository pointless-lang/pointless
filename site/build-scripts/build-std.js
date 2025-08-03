import { getType } from "../../src/values.js";
import { modules, globals, variants } from "../../std/std.js";
import { writePage } from "./write-page.js";
import { renderMarkdown } from "./render-markdown.js";
import { h } from "./escape.js";

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
    return h`<span class="tag" title="Overloaded"></span>`;
  }

  if (globals[name] === value) {
    return h`<span class="tag" title="Global"></span>`;
  }

  if (getType(value) !== "function") {
    return h`<span class="tag" title="Constant"></span>`;
  }

  return h`<span></span>`;
}

async function showDocs(modName, name, value, constDocs) {
  const path = `${modName}.${name}`;

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
          (Accessible as a global through
          <a href="#overloads.${name}">overloads.${name}</a>)
        </p>
      `;

    return h`$$${await renderMarkdown("std", getDocStr(value))} $$${overloader}`;
  }

  return await renderMarkdown(
    "std",
    `${constDocs[name] ?? ""}\n\`\`\`ptls --hide\n${path}\n\`\`\``,
  );
}

async function showDef(modName, name, value, constDocs) {
  const path = `${modName}.${name}`;
  const label = getType(value) === "function" ? value : path;
  const docs = await showDocs(modName, name, value, constDocs);

  return h`
    <section class="std-def" id="${path}">
      <div>
        <h3>
          <a class="def-name" href="#${path}">${label}</a>
        </h3>
        $$${showTags(modName, name, value)}
      </div>

      <div class="contents">$$${docs}</div>
    </section>
  `;
}

function modNav(modName, mod) {
  const links = Object.entries(mod).map(
    ([name, value]) => h`
      <li>
        <a href="/stdlib#${modName}.${name}">${name}</a>
        $$${showTags(modName, name, value)}
      </li>
    `,
  );

  return h`
    <a href="/stdlib#${modName}">${modName}</a>
    <ul>
      $$${links}
    </ul>
  `;
}

async function modDocs(modName, mod) {
  const { _modDocs, _constDocs = {} } = await import(
    `../../std/${modName}/mod.js`
  );

  const modDocs = _modDocs && (await renderMarkdown("std", _modDocs));
  const defs = [];

  for (const [name, value] of Object.entries(mod)) {
    defs.push(await showDef(modName, name, value, _constDocs));
  }

  return h`
    <hr />

    <section id="${modName}">
      <h2 id="${modName}">
        <a class="mod-name" href="#${modName}">${modName}</a>
      </h2>

      $$${modDocs} $$${defs}
    </section>
  `;
}

export async function buildStd() {
  const nav = [];
  const mods = [];

  for (const [modName, mod] of Object.entries(modules)) {
    mods.push(await modDocs(modName, mod));
    nav.push(modNav(modName, mod));
  }

  await writePage(
    "stdlib/index.html",
    "Standard Library",
    "std.css",
    nav,
    h`
      <div class="docs">
        <h1>The Pointless Standard Library</h1>
        <a id="toc" href="/stdlib/toc.html">Table of Contents ☰</a>
        $$${mods}
      </div>
    `,
  );

  await writePage(
    "stdlib/toc.html",
    "Standard Library Table of Contents",
    "toc.css",
    "",
    h`
      <h1>StdLib Table of Contents</h1>
      <nav>$$${nav}</nav>
    `,
  );
}
