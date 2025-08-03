import { readFile, readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export async function buildIcons() {
  await mkdir(`site/dist/icons`, { recursive: true });

  for (const file of await readdir("site/icons")) {
    const name = path.basename(file, ".svg");

    await sharp(await readFile(`site/icons/${name}.svg`))
      .png()
      .toFile(`site/dist/icons/${name}.png`);
  }
}
