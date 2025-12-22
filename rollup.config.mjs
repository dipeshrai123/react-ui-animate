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
    },
  ],
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
      clean: true,
    }),
    terser({
      compress: {
        passes: 2,
        drop_console: false,
        pure_funcs: [],
      },
      format: {
        comments: false,
      },
    }),
  ],
  external: ["react", "react-dom", "react/jsx-runtime"],
};
