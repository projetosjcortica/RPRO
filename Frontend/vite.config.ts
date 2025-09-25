import { defineConfig } from "vite";
import path from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import commonjsPlugin from "@rollup/plugin-commonjs";
import rollupNodePolyfills from "rollup-plugin-node-polyfills";

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    // removed vite-plugin-commonjs: use Rollup's commonjs plugin in build.rollupOptions
    electron({
      main: {
        entry: "electron/main.ts",
      },
      preload: {
        input: path.join(__dirname, "electron/preload.ts"),
      },

      renderer: process.env.NODE_ENV === "test" ? undefined : {},
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      events: path.resolve(__dirname, "src/shims/events-shim.ts"),
      stream: "stream-browserify",
      process: "process/browser",
      util: "util/",
    },
  },

 optimizeDeps: {
 include: ['stream-browserify', 'process', 'util'],
},

  build: {
    rollupOptions: {
  // ensure node polyfills are applied before converting CommonJS modules
  plugins: [rollupNodePolyfills(), commonjsPlugin({ transformMixedEsModules: true })],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/], // <- garanta que todos os CJS sejam convertidos
    },
  },
});
