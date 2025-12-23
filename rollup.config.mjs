import typescript from "rollup-plugin-typescript2";
import terser from '@rollup/plugin-terser';

import pkg from "./package.json" with { type: "json" };

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
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
        passes: 3,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        unused: true,
        dead_code: true,
        collapse_vars: true,
        reduce_vars: true,
        inline: true,
        sequences: true,
        properties: true,
        evaluate: true,
        booleans: true,
        typeofs: true,
        loops: true,
        conditionals: true,
        join_vars: true,
      },
      format: {
        comments: false,
        ascii_only: false,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
    }),
  ],
  external: ["react", "react-dom", "react/jsx-runtime"],
};
