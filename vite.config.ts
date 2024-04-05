import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { createRequire } from "module";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import markdownRawPlugin from "vite-raw-plugin";

const require = createRequire(import.meta.url);
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
    // build: {
    //   lib: {
    //     entry: resolve(__dirname, 'src/lib.js'),
    //     formats: ['es'],
    //   },
    //   rollupOptions: {
    //     external: [ 'react', 'react-dom' ]
    //   }
    // }
  };
});
