import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import markdownRawPlugin from "vite-raw-plugin";
import { resolve } from "path";
import dts from "vite-plugin-dts";

const process = {
  env: {},
  versions: {
    node: "14.15.1", // replace with your Node.js version
  },
};

export default defineConfig(({ mode }) => {
  // process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
  return {
    // depending on your application, base can also be "/"
    base: "./",
    // @ts-ignore
    plugins: [
      react(),
      dts(),
      viteTsconfigPaths(),
      nodePolyfills(),
      markdownRawPlugin({
        fileRegex: /\.md$/,
      }),
    ],
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      // this sets a default port to 3000
      port: 3000,
    },
    define: {
      global: "globalThis",
      "process.env": process.env,
      NODE_ENV: '"development"',
      "process.versions.node": JSON.stringify(process.versions.node),
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: "globalThis",
        },
      },
    },
    resolve: {
      alias: {
        react: resolve("./node_modules/react"),
        "react-dom": resolve("./node_modules/react-dom"),
      },
    },
    build: {
      lib: {
        entry: resolve(__dirname, "src/lib.tsx"),
        formats: ["es"],
      },
      external: ["react", "react-dom", "styled-components"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "styled-components": "styled",
        },
      },
    },
  };
});
