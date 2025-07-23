import { getType } from "../src/values.js";
import { render } from "../docs/utils.js";
import { format } from "prettier";
import { modules, globals, overloadParents, overloadChildren } from "./std.js";

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

function buildDoc(path, valStr, tags, docs, overloadLink) {
  return `
    <section class="std-def">
      <div>
        <h3><a class="def-name" name="${path}" href="#${path}">${valStr}</a></h3>
        ${tags}
      </div>

      <div class="contents">
        ${docs}

        ${overloadLink}
      </div>
    </section>
  `;
}

async function showDef(modName, name, value) {
  const path = `${modName}.${name}`;
  let tags = "";
  let overloadLink = "";

  if (overloadParents.has(value)) {
    const overloader = overloadParents.get(value);

    tags = `
      <span class='tag' title='Global'></span>
      <span class='tag' title='Overloaded'></span>
    `;

    overloadLink = `
      <p class="overload-link">
        Accessible as global through <a href="#${overloader.name}">${overloader.name}</a>.
      </p>
    `;
  } else if (globals[name] === value) {
    tags = "<span class='tag' title='Global'></span>";
  }

  let docs;
  let valStr;

  if (getType(value) === "function") {
    docs = await render("std", getDocStr(value));
    valStr = String(value);
  } else {
    docs = await render("std", `\`\`\`ptls --hide\n${path}\n\`\`\``);
    valStr = path;
    tags += "<span class='tag' title='Constant'></span>";
  }

  return buildDoc(path, valStr, tags, docs, overloadLink);
}

function showOverloads(name, value) {
  const path = `overloads.${name}`;
  let tags = "<span class='tag' title='Global'></span>";
  let docs = "<p>Overload of:</p><ul class='overloads'>";

  docs += overloadChildren
    .get(value)
    .toSorted()
    .map((child) => `<li><a href="#${child.name}">${child}</a></li>`)
    .join("\n");

  docs += `</ul>`;

  return buildDoc(path, String(value), tags, docs, "");
}

export async function makeDocs() {
  let html = "";

  for (const modName of Object.keys(modules).toSorted()) {
    html += `
      <h2>
        <a name="${modName}" href="#${modName}">${modName}</a>
      </h2>
    `;

    // Need to sort to account for removed `$` prefixes
    for (const name of modules[modName].keySeq().sort()) {
      const value = modules[modName].get(name);

      if (modName === "overloads") {
        html += showOverloads(name, value);
      } else {
        html += await showDef(modName, name, value);
      }
    }
  }

  return await format(html, { parser: "html" });
}

export async function makePage(inner) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="../docs/style.css">
        <title>Standard Library</title>
      </head>

      <body>
        <main>${inner}</main>
      </body>
    </html>
  `;

  return await format(html, { parser: "html" });
}

const inner = await makeDocs();
console.log(await makePage(inner));
