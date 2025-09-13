import { highlight } from "./highlight.js";
import { h } from "./escape.js";
import { spawnDocStd, shimConsole } from "./doc-std.js";
import { tokenize } from "../../src/tokenizer.js";
import { parse } from "../../src/parser.js";
import { repr, show } from "../../src/repr.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import commandLineArgs from "command-line-args";

function logErr(err, config) {
  if (!config["panics"]) {
    console.error(String(err), err);
  }
}

function isConsole(node) {
  if (node.type !== "call") {
    return false;
  }

  const { func } = node.value;

  if (func.type === "access") {
    const { lhs } = func.value;
    return lhs.type === "name" && lhs.value === "Console";
  }

  return func.type === "name" && func.value === "print";
}

async function renderCode(code, config, filePath, env) {
  let tokens;

  try {
    tokens = tokenize(`${filePath}:embedded`, code);
  } catch (err) {
    logErr(err, config);
    tokens = [];
    panic = h`<pre class="result panic"><code>${err}</code></pre>`;
  }

  const source =
    !config["hide"] &&
    h`<pre><code class="ptls">$${highlight(tokens)}</code></pre>`;

  let resultLines = "";
  let finalDef = "";
  let panic = "";

  shimConsole.inputs = config.input ?? [];

  if (!config["no-eval"]) {
    const display = config["raw"]
      ? (value) => show(value, config["compact"])
      : (value) => repr(value, config["compact"]);

    const echo = !config["no-echo"];

    const maxHeight =
      config["max-height"] && `max-height: ${config["max-height"]}px;`;

    const wrap = config["wrap"] ? "wrap" : "";
    const attrs = h`class="result ${wrap}" style="${maxHeight}"`;
    const results = [];

    let statements;

    try {
      statements = parse(tokens);
    } catch (err) {
      logErr(err, config);
      statements = [];
      panic = h`<pre class="result panic"><code>${err}</code></pre>`;
    }

    for (const statement of statements) {
      try {
        const result = await env.eval(statement);
        finalDef = "";

        if (shimConsole.output.length) {
          results.push(shimConsole.getOutput());
        }

        switch (statement.type) {
          case "for":
          case "tandemFor":
          case "anonFor":
          case "while":
            break;

          case "def":
            if (echo && statement.value.rhs.type !== "fn") {
              const name = statement.value.name;
              const value = env.lookup(name);

              finalDef = h`
                <pre $${attrs}><code><div class="var-name">${name}</div>${display(value)}</code></pre>
              `;
            }

            break;

          default:
            if (!isConsole(statement)) {
              results.push(display(result) + "\n");
            }
        }
      } catch (err) {
        logErr(err, config);
        panic = h`<pre class="result panic"><code>${err}</code></pre>`;
        finalDef = "";
        break;
      }
    }

    if (echo && results.length) {
      resultLines = h`<pre $${attrs}><code>${results.join("")}</code></pre>`;
    }
  }

  return h`
    <div class="snippet ${config.class}">
      $${source}
      $${resultLines}
      $${finalDef}
      $${panic}
    </div>`;
}

const options = [
  { name: "no-echo", type: Boolean },
  { name: "no-eval", type: Boolean },
  { name: "compact", type: Boolean },
  { name: "wrap", type: Boolean },
  { name: "raw", type: Boolean },
  { name: "hide", type: Boolean },
  { name: "panics", type: Boolean },
  { name: "class", type: String },
  { name: "input", type: String, multiple: true },
  { name: "max-height", type: Number },
];

export function headerId(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]+/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const renderer = {
  heading({ text, depth, raw }) {
    const anchor = headerId(raw);
    const hr = depth === 2 ? "<hr />" : "";

    return h`
      $${hr}
      
      <h${depth} id="${anchor}">
        <a href="#${anchor}">${text}</a>
      </h${depth}>
    `;
  },

  code({ text }) {
    // Don't re-wrap code block that's already been rendered
    // It's messy but it works
    if (!text.trim().startsWith('<div class="snippet')) {
      return h`<pre><code>${text}</code></pre>`;
    }

    return text;
  },
};

export async function renderMarkdown(filePath, source) {
  let queue = Promise.resolve();

  function serialize(func) {
    queue = queue.then(func);
    return queue;
  }

  const env = await spawnDocStd();
  const marked = new Marked();

  const highlighter = markedHighlight({
    langPrefix: "",
    async: true,
    async highlight(code, lang, info) {
      const config = commandLineArgs(options, {
        argv: info.split(" ").slice(1),
      });

      if (lang === "ptls") {
        return await serialize(() => renderCode(code, config, filePath, env));
      }

      return code;
    },
  });

  // must use highlighter before renderer
  marked.use(highlighter, { renderer });
  return await marked.parse(source);
}
