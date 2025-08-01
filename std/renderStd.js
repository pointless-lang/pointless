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
  let main = "";

  for (const [modName, mod] of Object.entries(modules)) {
    const { _modDocs, _constDocs = {} } = await import(
      `../std/${modName}/mod.js`
    );

    main += `
      <hr/>
      <section id="${modName}">
        <h2 id="${modName}">
          <a class="mod-name" href="#${modName}">${modName}</a>
        </h2>
    `;

    nav += `
      <h2>
        <a href="#${modName}">${modName}</a>
      </h2>
      <ul>
    `;

    if (_modDocs) {
      main += await render("std", _modDocs);
    }

    for (const [name, value] of Object.entries(mod)) {
      nav += `
        <li>
          <a href="#${modName}.${name}">${name}</a>
          ${showTags(modName, name, value)}
        </li>
      `;
      main += await showDef(modName, name, value, _constDocs);
    }

    nav += "</ul>";
    main += "</section>";
  }

  return { nav, main };
}

export async function makePage(title, style, body) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="${style}.css">
        <title>${title}</title>
      </head>

      <body>
        <main class="std-docs">
          ${body}
        </main>

        <div id="jumps">
          <a href="#top">Top</a>
          <a href="#toc">Contents</a>
        </div>
      </body>
    </html>
  `;

  return format(html, { parser: "html" });
}

async function build() {
  const { nav, main } = await makeDocs();

  const stdlib = await makePage(
    "Standard Library",
    "../docs/std",
    `
    <nav>
      <h1 id="toc"><a href="#toc">Contents</a></h1>
      ${nav}
    </nav>
    <div class="docs">
      <div>
        <h1>The Pointless Standard Library</h1>
        ${main}
      </div>
    </div>
  `,
  );

  await writeFile("std/stdlib.html", stdlib);
}

await build();
