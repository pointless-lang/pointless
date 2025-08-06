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

  return "<span></span>";
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
          (Accessible as a global through <a href="#overloads.${name}">overloads.${name}</a>)
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
    <h3 class="def-name" id="${path}">
      <a href="#${path}">${label}</a>
    </h3>
    $$${showTags(modName, name, value)}

    <div class="contents">$$${docs}</div>
  `;
}

function modNav(modName, mod) {
  const links = Object.entries(mod).map(
    ([name, value]) => h`
      <li>
        $$${showTags(modName, name, value)}<a href="#${modName}.${name}">${name}</a>
      </li>
    `,
  );

  return h`
    <li class="nav-section">
      <strong>
        <a href="#${modName}">${modName}</a>
      </strong>

      <ul>
        $$${links}
      </ul>
    </li>
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
    <section id="${modName}">
      <h2 id="${modName}"><a href="#${modName}">${modName}</a></h2>
      $$${modDocs} $$${defs}
    </section>
  `;
}

export async function buildStd() {
  const nav = [];
  const mods = [];

  for (const [modName, mod] of Object.entries(modules)) {
    nav.push(modNav(modName, mod));
    mods.push("<hr />");
    mods.push(await modDocs(modName, mod));
  }

  await writePage(
    "stdlib/index.html",
    "Standard Library",
    "std.css",
    nav,
    h`
      <div class="docs">
        <h1>The Pointless Standard Library</h1>
        $$${mods}
      </div>
    `,
  );
}
