import typescript from "rollup-plugin-typescript2";
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

import pkg from "./package.json" with { type: "json" };

const isWatch = process.env.ROLLUP_WATCH === "true";

// Main bundle configuration
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
    terser({
      compress: {
        passes: 5,
        drop_console: !isWatch,
        drop_debugger: true,
        pure_funcs: isWatch ? [] : ['console.log', 'console.info', 'console.debug', 'console.warn', 'console.error'],
        unused: true,
        dead_code: true,
        collapse_vars: true,
        reduce_vars: true,
        inline: 2,
        sequences: true,
        properties: true,
        evaluate: true,
        booleans: true,
        typeofs: true,
        loops: true,
        conditionals: true,
        join_vars: true,
        negate_iife: true,
        if_return: true,
        arrows: true,
        unsafe: false,
        unsafe_comps: false,
        unsafe_math: false,
        unsafe_methods: false,
        unsafe_proto: false,
        unsafe_regexp: false,
        unsafe_undefined: false,
        keep_infinity: true,
      },
      format: {
        comments: false,
        ascii_only: false,
        ecma: 2017,
      },
      mangle: {
        properties: {
          // Mangle single-underscore private fields (`_foo`), but never
          // dunder protocol keys (`__layout*`, `__layoutId*`). Those names
          // are shared across modules as string values in one place and
          // object keys in another; terser's property mangler rewrites the
          // keys but leaves the string values alone, which silently turns
          // every layout / layoutId FLIP into an empty transform.
          regex: /^_[^_]/
        },
        safari10: true,
        toplevel: false,
      },
    }),
  ],
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
