import { renderMarkdown } from "./render-markdown.js";
import { writePage } from "./write-page.js";
import { resolve } from "node:path";
import { readdir, readFile, mkdir, cp } from "node:fs/promises";
import matter from "gray-matter";

async function buildTutorial(dir) {
  const filePath = resolve(`site/tutorials/${dir}/tutorial.md`);
  const source = await readFile(filePath, "utf8");
  const { data, content } = matter(source);
  const main = await renderMarkdown(filePath, content);

  await writePage(
    `tutorials/${dir}/index.html`,
    data.title,
    "base.css",
    "",
    main,
  );
}

export async function buildTutorials() {
  const baseDir = "site/tutorials/";

  for (const dir of await readdir(baseDir)) {
    await mkdir(`site/dist/tutorials/${dir}`, { recursive: true });
    await buildTutorial(dir);

    const assets = new Set(await readdir(baseDir + dir));
    assets.delete("tutorial.md");

    for (const file of assets) {
      const filePath = baseDir + dir + "/" + file;
      const distPath = `site/dist/tutorials/${dir}/${file}`;
      await cp(filePath, distPath);
    }
  }
}
