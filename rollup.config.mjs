import typescript from "rollup-plugin-typescript2";
import dts from 'rollup-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';

import pkg from "./package.json" with { type: "json" };

const isAnalyze = process.env.ANALYZE === "true";

// Main bundle configuration
//
// Deliberately NOT minified with terser: this package is consumed by other
// bundlers (webpack/vite/esbuild/Rollup), and terser's statement-fusing
// optimizations (sequences/join_vars/collapse_vars) merge originally-separate
// top-level bindings together. Once fused, a downstream bundler can no longer
// prove any individual piece is side-effect-free, so it keeps the whole fused
// blob instead of tree-shaking unused exports — verified empirically: the
// same `import { clamp } from 'react-ui-animate'` pulled ~46KB minified from
// the old terser output vs ~1KB from this unminified one. Shipping compiled
// but unminified ESM lets the consumer's own build tree-shake first and
// minify the (much smaller) result — the standard pattern for libraries
// meant to be bundled into an app (e.g. Redux, Preact).
const mainConfig = {
  input: "src/index.ts",
  output: [
    {
      file: pkg.module || pkg.main.replace('.js', '.mjs'),
      format: "es",
      exports: "named",
      sourcemap: false,
      strict: false,
      compact: true,
    },
  ],
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
      clean: true,
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationDir: ".dts-temp",
          declarationMap: false,
        },
      },
    }),
    isAnalyze &&
      visualizer({
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  external: ["react", "react-dom", "react/jsx-runtime"],
};

// Bundle all TypeScript declarations into a single file
const dtsConfig = {
  input: ".dts-temp/index.d.ts",
  output: {
    file: "dist/index.d.ts",
    format: "es",
  },
  plugins: [dts()],
};

export default [mainConfig, dtsConfig];
