import { buildIcons } from "./build-scripts/build-icons.js";
import { buildStd } from "./build-scripts/build-std.js";
import { buildTutorials } from "./build-scripts/build-tutorials.js";
import { cp, rm, mkdir } from "node:fs/promises";

async function init() {
  await rm("site/dist", { recursive: true, force: true });
  await mkdir("site/dist", { recursive: true });
  await cp("site/static", "site/dist", { recursive: true });
}

await init();
await buildIcons();
await buildStd();
await buildTutorials();
