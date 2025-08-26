import { renderMarkdown } from "./render-markdown.js";
import { h } from "./escape.js";
import { getType } from "../../src/values.js";
import { loadMeta } from "../../src/std.js";

const meta = await loadMeta();

export function showTags(modName, name, value) {
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

export function moduleSidebar(path) {
  const modName = path.split("/").at(-1);
  const links = Object.entries(meta.modules[modName]).map(
    ([name, value]) => h`
      <li>
        <a href="#${name}">${name}</a>
        $${showTags(modName, name, value)}
      </li>
    `,
  );

  return h`<ul class="std">$${links}</ul>`;
}

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

async function showDocs(modName, name, value, consts) {
  if (modName === "Overloads") {
    const items = meta.variants[name].map((child) => {
      const other = child.name.split(".")[0];
      return h`<li><a href="../${other}/#${name}">${child}</a></li>`;
    });

    return h`
      <p>Overload of:</p>
      <ul class="overloads">
        $${items}
      </ul>
    `;
  }

  if (getType(value) === "function") {
    const overloader =
      meta.variants[name] &&
      h`
        <p class="overloads">
          (Accessible as a global through <a href="../Overloads/#${name}">Overloads.${name}</a>)
        </p>
      `;

    return h`$${await renderMarkdown(modName, getDocStr(value))} $${overloader}`;
  }

  return await renderMarkdown(
    modName,
    `${consts[name] ?? ""}\n\`\`\`ptls --hide\n${modName}.${name}\n\`\`\``,
  );
}

export async function genModule(path, data) {
  const modName = path.split("/").at(-1);
  const defs = [];

  for (const [name, value] of Object.entries(meta.modules[modName])) {
    const label = getType(value) === "function" ? value : `${modName}.${name}`;
    const docs = await showDocs(modName, name, value, data.consts);

    defs.push(h`
      <hr />

      <h2 class="def-name" id="${name}">
        <code><a href="#${name}">${label}</a></code>
        $${showTags(modName, name, value)}
      </h2>

      <div class="contents">$${docs}</div>
    `);
  }

  return defs;
}
