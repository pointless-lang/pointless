import { buildStd } from "./build-std.js";
import { buildTutorials } from "./build-tutorials.js";
import { cp, rm, mkdir } from "node:fs/promises";

async function init() {
  await rm("site/dist", { recursive: true, force: true });
  await mkdir("site/dist", { recursive: true });
  await cp("site/static", "site/dist", { recursive: true });
}

await init();
await buildStd();
await buildTutorials();
