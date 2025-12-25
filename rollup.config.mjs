import typescript from "rollup-plugin-typescript2";
import terser from '@rollup/plugin-terser';

import pkg from "./package.json" with { type: "json" };

export default {
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
      useTsconfigDeclarationDir: false,
      // Only generate declarations for exported files
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
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
