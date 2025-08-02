import { base } from "./templates.js";
import renderToString from "preact-render-to-string";
import { format } from "prettier";
import { writeFile } from "fs/promises";

export async function writePage(path, title, style, main) {
  const source = base(title, style, main);
  const result = await format(renderToString(source), { parser: "html" });
  await writeFile(path, `<!DOCTYPE html>\n${result}`);
}
