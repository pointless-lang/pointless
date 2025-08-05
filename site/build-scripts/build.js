import { buildIcons } from "./build-icons.js";
import { buildStd } from "./build-std.js";
import { buildTutorials } from "./build-tutorials.js";
import { readdir, symlink, cp, rm, mkdir } from "node:fs/promises";

async function init() {
  await rm("site/dist", { recursive: true, force: true });
  await mkdir("site/dist", { recursive: true });
  await cp("site/static", "site/dist", { recursive: true });
}

export async function build() {
  await init();
  await buildIcons();
  await buildStd();
  await buildTutorials();
}
