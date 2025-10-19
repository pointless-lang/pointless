import { Panic } from "../lang/panic.js";
import { readFile, realpath } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export const loader = {
  resolve(root, path) {
    return resolve(dirname(root), path);
  },

  async realPath(path) {
    try {
      return await realpath(path);
    } catch {
      throw new Panic("cannot read file", { path });
    }
  },

  async readRaw(path) {
    return await readFile(path);
  },

  async readTxt(path) {
    return await readFile(path, "utf8");
  },
};
