import { writePage } from "./writePage.js";
import { getType } from "../../src/values.js";
import { renderMarkdown } from "./renderMarkdown.js";
import { modules, globals, variants } from "../../std/std.js";
import { h } from "preact";
import htm from "htm";

const html = htm.bind(h);

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
    return html`<span class="tag" title="Overloaded"></span>`;
  }

  if (globals[name] === value) {
    return html`<span class="tag" title="Global"></span>`;
  }

  if (getType(value) !== "function") {
    return html`<span class="tag" title="Constant"></span>`;
  }

  return html`<span></span>`;
}

async function showDocs(modName, name, value, constDocs) {
  const path = `${modName}.${name}`;

  if (modName === "overloads") {
    const items = variants[name].map(
      (child) =>
        html`<li><a href="#${child.name}">${child.toString()}</a></li>`,
    );

    return html`
      <p>Overload of:</p>
      <ul class="overloads">
        ${items}
      </ul>
    `;
  }

  if (getType(value) === "function") {
    const overloader = variants[name]
      ? html`
          <p class="overloads">
            (Accessible as a global through${" "}
            <a href="#overloads.${name}">overloads.${name}</a>)
          </p>
        `
      : "";

    return html`
      ${await renderMarkdown("std", getDocStr(value))} ${overloader}
    `;
  }

  return await renderMarkdown(
    "std",
    `
      ${constDocs[name] ?? ""}
      \`\`\`ptls --hide
      ${path}
      \`\`\`
    `,
  );
}

async function showDef(modName, name, value, constDocs) {
  const path = `${modName}.${name}`;
  const label = getType(value) === "function" ? String(value) : path;
  const docs = await showDocs(modName, name, value, constDocs);

  return html`
    <section class="std-def" id="${path}">
      <div>
        <h3>
          <a class="def-name" href="#${path}">${label}</a>
        </h3>
        ${showTags(modName, name, value)}
      </div>

      <div class="contents">${docs}</div>
    </section>
  `;
}

function modNav(modName, mod) {
  const links = Object.entries(mod).map(
    ([name, value]) => html`
      <li>
        <a href="stdlib.html#${modName}.${name}">${name}</a>
        ${showTags(modName, name, value)}
      </li>
    `,
  );

  return html`
    <a href="stdlib.html#${modName}">${modName}</a>
    <ul>
      ${links}
    </ul>
  `;
}

async function modDocs(modName, mod) {
  const { _modDocs, _constDocs = {} } = await import(
    `../../std/${modName}/mod.js`
  );

  const modDocs = _modDocs ? await renderMarkdown("std", _modDocs) : "";
  const defs = [];

  for (const [name, value] of Object.entries(mod)) {
    defs.push(await showDef(modName, name, value, _constDocs));
  }

  return html`
    <hr />

    <section id="${modName}">
      <h2 id="${modName}">
        <a class="mod-name" href="#${modName}">${modName}</a>
      </h2>

      ${modDocs} ${defs}
    </section>
  `;
}

export async function writeStd() {
  const nav = [];
  const mods = [];

  for (const [modName, mod] of Object.entries(modules)) {
    mods.push(await modDocs(modName, mod));
    nav.push(modNav(modName, mod));
  }

  await writePage(
    "site/public/stdlib/index.html",
    "Standard Library",
    "std.css",
    html`
      <nav>${nav}</nav>

      <div class="docs">
        <div>
          <h1>The Pointless Standard Library</h1>
          <a id="toc" href="toc.html">Table of Contents ☰</a>
          ${mods}
        </div>
      </div>
    `,
  );

  await writePage(
    "site/public/stdlib/toc.html",
    "Standard Library Table of Contents",
    "../docs/toc.css",
    html`
      <h1>StdLib Table of Contents</h1>
      <nav>${nav}</nav>
    `,
  );
}
