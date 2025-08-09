import { renderMarkdown } from "../build-scripts/render-markdown.js";
import { h } from "../build-scripts/escape.js";
import fs from "node:fs";
import { readFile } from "node:fs/promises";
import { argv } from "node:process";

const filePath = argv[2];
const source = "----\n" + await readFile(filePath, "utf-8");
const blocks = source.split(/^-{4,}/gm);
const embeds = [];

for (const block of blocks) {
  const lines = block.split("\n");
  const args = lines[0].trim();
  const code = lines.slice(1).join("\n").trim();

  if (code) {
    embeds.push(`\`\`\`ptls ${args}\n${code}\n\`\`\``);
  }
}

const inner = await renderMarkdown(filePath, embeds.join("\n\n"));

const page = h`
  <!DOCTYPE html>
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${filePath}</title>

      <style>
        article {
          margin-inline: auto;
          max-width: 800px;
          font-size: 14px;
        }

        pre {
          padding: 14px;
          overflow: auto;
          background-color: #f1f1f1;
          border: 2px solid #e1e1e1;
          margin-block: 30px;
          color: #444;
        }

        pre:has(code.ptls) {
          background-color: #fef5ea;
          border-color: #f7e3ca;
        }

        .snippet {
          margin-block: 30px;
        }

        .snippet pre {
          margin-block: 0;
        }

        .snippet .result {
          margin-top: 8px;
        }

        .ptls .call,
        .ptls .std {
          color: #256bd7;
        }

        .ptls .string {
          color: #387a13;
        }

        .ptls .comment {
          color: #707070;
        }

        .ptls .keyword,
        .ptls .interpolated,
        .ptls .escape {
          color: #a34baf;
        }

        .ptls .function {
          color: #027e7e;
        }

        .ptls .argument,
        .ptls .number {
          color: #a95f00;
        }

        .ptls .operator,
        .ptls .constant {
          color: #c14a1c;
        }
      </style>
    </head>

    <body>
      <article>
        $$${inner}
      </article>
    </body>
  </html>
`;

console.log(page);
