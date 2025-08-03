import { buildIcons } from "./build-scripts/build-icons.js";
import { buildStd } from "./build-scripts/build-std.js";
import { buildTutorials } from "./build-scripts/build-tutorials.js";
import { readdir, symlink, cp, rm, mkdir } from "node:fs/promises";
import args from "command-line-args";

const options = args([{ name: "prod", type: Boolean, defaultValue: false }]);

async function init() {
  await rm("site/dist", { recursive: true, force: true });
  await mkdir("site/dist", { recursive: true });

  if (options.prod) {
    await cp("site/static", "site/dist", { recursive: true });
  } else {
    for (const name of await readdir("site/static")) {
      await symlink(`../static/${name}`, `site/dist/${name}`);
    }
  }
}

await init();
await buildIcons();
await buildStd();
await buildTutorials();
