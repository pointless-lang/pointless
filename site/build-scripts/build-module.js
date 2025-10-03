import { renderMarkdown } from "../../render/render-markdown.js";
import { h } from "../../render/escape.js";
import { getType } from "../../src/values.js";
import { loadMeta } from "../../src/std.js";

const meta = loadMeta();

export function showTags(name, value) {
  if (meta.globals[name] === value || meta.variants[name]) {
    return `<span class="tag" title="Global"></span>`;
  }

  if (getType(value) !== "function") {
    return `<span class="tag" title="Constant"></span>`;
  }

  return "";
}

export function moduleSidebar(node) {
  const modName = node.path.split("/").at(-1);

  const links = Object.entries(meta.modules[modName]).map(
    ([name, value]) =>
      h`
      <li>
        <a href="#${name}">${name}</a>
        $${showTags(name, value)}
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
    const overloader = meta.variants[name] &&
      h`
        <p class="overloads">
          (Accessible as a global through <a href="../Overloads/#${name}">Overloads.${name}</a>)
        </p>
      `;

    return h`$${await renderMarkdown(
      modName,
      getDocStr(value),
    )} $${overloader}`;
  }

  return await renderMarkdown(
    modName,
    `${consts?.[name] ?? ""}\n\`\`\`ptls --hide\n${modName}.${name}\n\`\`\``,
  );
}

export async function genModule(node) {
  const modName = node.path.split("/").at(-1);
  const defs = [];

  for (const [name, value] of Object.entries(meta.modules[modName])) {
    const label = getType(value) === "function" ? value : `${modName}.${name}`;
    const docs = await showDocs(modName, name, value, node.consts);

    defs.push(h`
      <hr />

      <h2 class="def-name" id="${name}">
        <code><a href="#${name}">${label}</a></code>
        $${showTags(name, value)}
      </h2>

      <div class="contents">$${docs}</div>
    `);
  }

  const object = await renderMarkdown(
    modName,
    `\`\`\`ptls --max-height 200\n${modName}\n\`\`\``,
  );

  return h`
    $${object}
    $${defs}
  `;
}
