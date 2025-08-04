import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export async function buildIcons() {
  for (const file of await readdir("site/dist/icons")) {
    const name = path.basename(file, ".svg");

    await sharp(await readFile(`site/dist/icons/${name}.svg`))
      .png()
      .toFile(`site/dist/${name}.png`);
  }
}
