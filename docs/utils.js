import { highlight } from "./highlight.js";
import { tokenize } from "../src/tokenizer.js";
import { parse } from "../src/parser.js";
import { repr, show } from "../src/repr.js";
import { std } from "../std/std.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import commandLineArgs from "command-line-args";

async function processSource(code, config, filePath, env) {
  const tokens = tokenize(`${filePath}:embedded`, code);

  let html = `<div class="snippet">`;

  if (!config["hide"]) {
    html += `<pre><code class="ptls">${highlight(tokens)}</code></pre>`;
  }

  if (!config["no-eval"]) {
    const display = config["raw"]
      ? show
      : (value) => repr(value, config["compact"]);

    const echo = !config["no-echo"];

    const maxHeight = config["max-height"]
      ? `max-height: ${config["max-height"]}px;`
      : "";

    const results = [];
    let lastDef;
    let panic = "";

    for (const statement of parse(tokens)) {
      try {
        const result = await env.eval(statement);
        lastDef = undefined;

        if (statement.type !== "def") {
          results.push(display(result));
        } else if (echo && statement.value.rhs.type !== "fn") {
          const name = statement.value.name;
          const value = env.lookup(name);
          const result = display(value);

          lastDef = `
            <pre class="result" style="${maxHeight}"><code><div class="var-name">${name}</div>${result}</code></pre>
          `;
        }
      } catch (err) {
        if (!config["panics"]) {
          console.error(String(err));
        }

        results.push(String(err));
        panic = " panic";
        break;
      }
    }

    if (echo) {
      if (results.length) {
        html += `<pre class="result${panic}" style="${maxHeight}"><code>${results.join("\n")}</code></pre>`;
      }

      if (lastDef && !panic) {
        html += lastDef;
      }
    }
  }

  html += "</div>";

  return html;
}

const options = [
  { name: "no-echo", type: Boolean },
  { name: "no-eval", type: Boolean },
  { name: "compact", type: Boolean },
  { name: "raw", type: Boolean },
  { name: "hide", type: Boolean },
  { name: "panics", type: Boolean },
  { name: "max-height", type: Number },
];

const renderer = {
  heading({ text, depth, raw }) {
    const anchor = raw.toLowerCase().replace(/[^\w]+/g, "-");

    return `
      <h${depth}>
        <a name="${anchor}" href="#${anchor}">${text}</a>
      </h${depth}>
    `;
  },

  code({ text }) {
    if (!text.startsWith('<div class="snippet">')) {
      return `<pre><code>${text}</code></pre>`;
    }

    return text;
  },
};

export async function render(filePath, source) {
  let queue = Promise.resolve();

  function serialize(func) {
    queue = queue.then(func);
    return queue;
  }

  const env = std.spawn();
  const marked = new Marked();

  const highlighter = markedHighlight({
    langPrefix: "",
    async: true,
    async highlight(code, lang, info) {
      const config = commandLineArgs(options, {
        argv: info.split(" ").slice(1),
      });

      if (lang === "ptls") {
        return await serialize(() =>
          processSource(code, config, filePath, env),
        );
      }

      return code;
    },
  });

  // must use highlighter before renderer
  marked.use(highlighter).use({ renderer });
  return await marked.parse(source);
}
