import { renderMarkdown } from "./render-markdown.js";
import { writePage } from "./write-page.js";
import { resolve, parse } from "node:path";
import { readdir, readFile, mkdir, copyFile } from "node:fs/promises";

async function buildTutorial(dir, name) {
  const filePath = resolve(`site/tutorials/${dir}/${name}.md`);
  const source = await readFile(filePath, "utf8");
  const main = await renderMarkdown(filePath, source);
  await writePage(`tutorials/${dir}/${name}.html`, name, "base.css", "", main);
}

export async function buildTutorials() {
  const baseDir = "site/tutorials/";

  for (const dir of await readdir(baseDir)) {
    await mkdir(`site/dist/tutorials/${dir}`, { recursive: true });

    const tutorialDir = baseDir + dir;
    for (const file of await readdir(tutorialDir)) {
      const filePath = tutorialDir + "/" + file;

      if (file.endsWith(".md")) {
        await buildTutorial(dir, parse(file).name);
      } else {
        const targetPath = `site/dist/tutorials/${dir}/${file}`;
        await copyFile(filePath, targetPath);
      }
    }
  }
}
