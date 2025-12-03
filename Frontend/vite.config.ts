import { defineConfig } from "vite";
import path from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL || `http://localhost:${process.env.VITE_BACKEND_PORT || 3000}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    electron({
      main: {   
        entry: 'electron/main.ts',
        onstart(args) {
          args.startup()
        }
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              output: {
                format: 'cjs', // Force CommonJS for preload
              },
            },
          },
        },
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
    include: ["stream-browserify", "process", "util"],
  },

  build: {
    rollupOptions: {
      external: [ ],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  }
});
