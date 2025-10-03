import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { builtinModules } from "node:module";

const builtins = new Set(builtinModules);

function resolveNode(source) {
  // Prefix node imports so bundle works with Deno
  if (builtins.has(source) && !source.startsWith("node:")) {
    return { id: "node:" + source, external: true };
  }

  return null;
}

export default {
  input: "ptls.js",
  output: {
    file: "dist/ptls.js",
    format: "esm",
  },
  inlineDynamicImports: true,
  plugins: [
    { name: "prefix-node-builtins", resolveId: resolveNode },
    resolve(),
    commonjs(),
    terser({ mangle: false, format: { comments: false } }),
  ],
  external: [],

  onwarn(warning, warn) {
    if (warning.code !== "CIRCULAR_DEPENDENCY") {
      warn(warning);
    }
  },
};
