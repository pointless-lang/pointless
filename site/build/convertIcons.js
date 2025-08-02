import { readFile, readdir } from "fs/promises";
import sharp from "sharp";
import path from "path";

export async function convertIcons() {
  for (const file of await readdir("site/icons")) {
    const name = path.basename(file, ".svg");

    await sharp(await readFile(`site/icons/${name}.svg`))
      .png()
      .toFile(`site/public/icons/${name}.png`);
  }
}
