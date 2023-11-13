import { relative, resolve as resolveDir } from "node:path";
import { defineConfig } from "tsup";

export default defineConfig({
  globalName: "ThothInteractions",
  clean: true,
  dts: true,
  entry: ["src/commands/*/*.ts", "src/index.ts"],
  format: ["esm", "cjs"],
  shims: true,
  cjsInterop: true,
  terserOptions: {
    mangle: false,
    keep_classnames: true,
    keep_fnames: true,
  },
  splitting: false,
  minify: false,
  skipNodeModulesBundle: true,
  sourcemap: true,
  target: "es2020",
  tsconfig: relative(__dirname, resolveDir("tsconfig.json")),
  keepNames: true,
  treeshake: false,
});
