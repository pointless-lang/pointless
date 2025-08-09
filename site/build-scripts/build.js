import { buildStd } from "./build-std.js";
import { buildPages } from "./build-pages.js";
import { cp, rm, mkdir } from "node:fs/promises";

async function init() {
  await rm("site/dist", { recursive: true, force: true });
  await mkdir("site/dist", { recursive: true });
}

async function copyStatic() {
  await cp("site/static", "site/dist", { recursive: true });
}

await init();
await buildPages();
await buildStd();
await copyStatic();
