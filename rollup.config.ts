import {defineConfig} from "rollup";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default defineConfig({
    input: "src/index.ts",
    output: [
        { format: "esm", file: "dist/index.esm.js", sourcemap: true },
        { format: "cjs", file: "dist/index.js", sourcemap: true },
    ],
    plugins: [
        typescript(),
        terser(),
    ],
});
