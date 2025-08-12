import { highlight } from "./highlight.js";
import { h } from "./escape.js";
import { webStd } from "./web-std.js";
import { tokenize } from "../../src/tokenizer.js";
import { parse } from "../../src/parser.js";
import { repr, show } from "../../src/repr.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import commandLineArgs from "command-line-args";

async function renderCode(code, config, filePath, env) {
  let tokens;

  try {
    tokens = tokenize(`${filePath}:embedded`, code);
  } catch (err) {
    console.error(String(err));
    tokens = [];
    panic = h`<pre class="result panic"><code>${err}</code></pre>`;
  }

  const source =
    !config["hide"] &&
    h`<pre><code class="ptls">$$${highlight(tokens)}</code></pre>`;

  let resultLines = "";
  let finalDef = "";
  let panic = "";

  if (!config["no-eval"]) {
    const display = config["raw"]
      ? (value) => show(value)
      : (value) => repr(value, config["compact"]);

    const echo = !config["no-echo"];

    const maxHeight =
      config["max-height"] && `max-height: ${config["max-height"]}px;`;

    const style = h`style="${maxHeight}"`;
    const wrap = config["wrap"] && "wrap";
    const results = [];

    let statements;

    try {
      statements = parse(tokens);
    } catch (err) {
      console.error(err);
      statements = [];
      panic = h`<pre class="result panic"><code>${err}</code></pre>`;
    }

    for (const statement of statements) {
      try {
        const result = await env.eval(statement);
        finalDef = "";

        if (statement.type !== "def") {
          results.push(display(result));
        } else if (echo && statement.value.rhs.type !== "fn") {
          const name = statement.value.name;
          const value = env.lookup(name);

          finalDef = h`
            <pre class="result ${wrap}" $$${style}><code><div class="var-name">${name}</div>${display(value)}</code></pre>
          `;
        }
      } catch (err) {
        if (!config["panics"]) {
          console.error(String(err));
        }

        panic = h`<pre class="result panic"><code>${err}</code></pre>`;
        finalDef = "";
        break;
      }
    }

    resultLines =
      echo &&
      results.length &&
      h`<pre class="result ${wrap}" $$${style}><code>${results.join("\n")}</code></pre>`;
  }

  return h`
    <div class="snippet">
      $$${source}
      $$${resultLines}
      $$${finalDef}
      $$${panic}
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
      $$${hr}
      
      <h${depth} id="${anchor}">
        <a href="#${anchor}">${text}</a>
      </h${depth}>
    `;
  },

  code({ text }) {
    // Don't re-wrap code block that's already been rendered
    // It's messy but it works
    if (!text.trim().startsWith('<div class="snippet">')) {
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

  const env = webStd.spawn();
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
  marked.use(highlighter).use({ renderer });
  return await marked.parse(source);
}
