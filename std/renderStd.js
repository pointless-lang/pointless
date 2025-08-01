import { getType } from "../src/values.js";
import { render } from "../docs/render.js";
import { format } from "prettier";
import { modules, globals, variants } from "./std.js";
import { writeFile } from "fs/promises";

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
    return "<span class='tag' title='Overloaded'></span>";
  }

  if (globals[name] === value) {
    return "<span class='tag' title='Global'></span>";
  }

  if (getType(value) !== "function") {
    return "<span class='tag' title='Constant'></span>";
  }

  return "<span></span>";
}

async function showDef(modName, name, value, constDocs) {
  const path = `${modName}.${name}`;
  const label = getType(value) === "function" ? String(value) : path;

  let docs;

  if (modName === "overloads") {
    const items = variants[name]
      .map((child) => `<li><a href="#${child.name}">${child}</a></li>`)
      .join("\n");

    docs = `
      <p>Overload of:</p>
      <ul class='overloads'>
        ${items}
      </ul>
    `;
  } else {
    if (getType(value) === "function") {
      docs = await render("std", getDocStr(value));
    } else {
      const constDoc = constDocs[name] ?? "";
      docs = await render(
        "std",
        `${constDoc}\n\`\`\`ptls --hide\n${path}\n\`\`\``,
      );
    }

    if (variants[name]) {
      docs += `
        <p class="overloads">
          (Accessible as a global through <a href="#overloads.${name}">overloads.${name}</a>)
        </p>
      `;
    }
  }

  return `
    <section class="std-def" id="${path}">
      <div>
        <h3>
          <a class="def-name" href="#${path}">${label}</a>
        </h3>
        ${showTags(modName, name, value)}
      </div>

      <div class="contents">
        ${docs}
      </div>
    </section>
  `;
}

export async function makeDocs() {
  let nav = "";
  let docs = "";

  for (const [modName, mod] of Object.entries(modules)) {
    const { _modDocs, _constDocs = {} } = await import(
      `../std/${modName}/mod.js`
    );

    docs += `
      <hr/>
      <section id="${modName}">
        <h2 id="${modName}">
          <a class="mod-name" href="#${modName}">${modName}</a>
        </h2>
    `;

    nav += `
      <a href="stdlib.html#${modName}">${modName}</a>
      <ul>
    `;

    if (_modDocs) {
      docs += await render("std", _modDocs);
    }

    for (const [name, value] of Object.entries(mod)) {
      nav += `
        <li>
          <a href="stdlib.html#${modName}.${name}">${name}</a>
          ${showTags(modName, name, value)}
        </li>
      `;
      docs += await showDef(modName, name, value, _constDocs);
    }

    nav += "</ul>";
    docs += "</section>";
  }

  await writePage(
    "std/stdlib.html",
    "Standard Library",
    "../docs/std.css",
    `
      <nav>
        ${nav}
      </nav>

      <div class="docs">
        <div>
          <h1>The Pointless Standard Library</h1>
          <a id="toc" href="toc.html">Table of Contents ☰</a>
          ${docs}
        </div>
      </div>
    `,
  );

  await writePage(
    "std/toc.html",
    "Standard Library Table of Contents",
    "../docs/toc.css",
    `
      <h1>StdLib Table of Contents</h1>
      <nav>
        ${nav}
      </nav>
    `,
  );
}

export async function writePage(path, title, style, main) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="${style}">
        <title>${title}</title>
      </head>

      <body>
        <main>
          ${main}
        </main>
      </body>
    </html>
  `;

  await writeFile(path, await format(html, { parser: "html" }));
}

await makeDocs();
