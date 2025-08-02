import { base } from "./templates.js";
import { format } from "prettier";
import { writeFile } from "fs/promises";

export async function writePage(path, title, style, main) {
  const source = base(title, style, main);
  const result = await format(source, { parser: "html" });
  await writeFile(path, result);
}
