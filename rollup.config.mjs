import typescript from "rollup-plugin-typescript2";
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

import pkg from "./package.json" with { type: "json" };

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
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn', 'console.error'],
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
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        keep_infinity: true,
      },
      format: {
        comments: false,
        ascii_only: false,
        ecma: 2017,
      },
      mangle: {
        properties: {
          regex: /^_/,
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
