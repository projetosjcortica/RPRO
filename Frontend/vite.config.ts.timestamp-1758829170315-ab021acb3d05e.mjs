// vite.config.ts
import { defineConfig } from "file:///C:/Users/cmp00/OneDrive/Documentos/GitHub/RPRO/Frontend/node_modules/vite/dist/node/index.js";
import path from "node:path";
import electron from "file:///C:/Users/cmp00/OneDrive/Documentos/GitHub/RPRO/Frontend/node_modules/vite-plugin-electron/dist/simple.mjs";
import react from "file:///C:/Users/cmp00/OneDrive/Documentos/GitHub/RPRO/Frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/cmp00/OneDrive/Documentos/GitHub/RPRO/Frontend/node_modules/@tailwindcss/vite/dist/index.mjs";
import commonjsPlugin from "file:///C:/Users/cmp00/OneDrive/Documentos/GitHub/RPRO/Frontend/node_modules/@rollup/plugin-commonjs/dist/es/index.js";
import rollupNodePolyfills from "file:///C:/Users/cmp00/OneDrive/Documentos/GitHub/RPRO/Frontend/node_modules/rollup-plugin-node-polyfills/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\cmp00\\OneDrive\\Documentos\\GitHub\\RPRO\\Frontend";
var vite_config_default = defineConfig({
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    tailwindcss(),
    react(),
    // removed vite-plugin-commonjs: use Rollup's commonjs plugin in build.rollupOptions
    electron({
      main: {
        entry: "electron/main.ts"
      },
      preload: {
        input: path.join(__vite_injected_original_dirname, "electron/preload.ts")
      },
      renderer: process.env.NODE_ENV === "test" ? void 0 : {}
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src"),
      events: path.resolve(__vite_injected_original_dirname, "src/shims/events-shim.ts"),
      stream: "stream-browserify",
      process: "process/browser",
      util: "util/"
    }
  },
  optimizeDeps: {
    include: ["stream-browserify", "process", "util"]
  },
  build: {
    rollupOptions: {
      // ensure node polyfills are applied before converting CommonJS modules
      plugins: [rollupNodePolyfills(), commonjsPlugin({ transformMixedEsModules: true })]
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
      // <- garanta que todos os CJS sejam convertidos
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxjbXAwMFxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudG9zXFxcXEdpdEh1YlxcXFxSUFJPXFxcXEZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxjbXAwMFxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudG9zXFxcXEdpdEh1YlxcXFxSUFJPXFxcXEZyb250ZW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9jbXAwMC9PbmVEcml2ZS9Eb2N1bWVudG9zL0dpdEh1Yi9SUFJPL0Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xyXG5pbXBvcnQgZWxlY3Ryb24gZnJvbSBcInZpdGUtcGx1Z2luLWVsZWN0cm9uL3NpbXBsZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwiQHRhaWx3aW5kY3NzL3ZpdGVcIjtcclxuaW1wb3J0IGNvbW1vbmpzUGx1Z2luIGZyb20gXCJAcm9sbHVwL3BsdWdpbi1jb21tb25qc1wiO1xyXG5pbXBvcnQgcm9sbHVwTm9kZVBvbHlmaWxscyBmcm9tIFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxsc1wiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDUxNzMsXHJcbiAgICBwcm94eToge1xyXG4gICAgICBcIi9hcGlcIjoge1xyXG4gICAgICAgIHRhcmdldDogXCJodHRwOi8vbG9jYWxob3N0OjMwMDBcIixcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICB0YWlsd2luZGNzcygpLFxyXG4gICAgcmVhY3QoKSxcclxuICAgIC8vIHJlbW92ZWQgdml0ZS1wbHVnaW4tY29tbW9uanM6IHVzZSBSb2xsdXAncyBjb21tb25qcyBwbHVnaW4gaW4gYnVpbGQucm9sbHVwT3B0aW9uc1xyXG4gICAgZWxlY3Ryb24oe1xyXG4gICAgICBtYWluOiB7XHJcbiAgICAgICAgZW50cnk6IFwiZWxlY3Ryb24vbWFpbi50c1wiLFxyXG4gICAgICB9LFxyXG4gICAgICBwcmVsb2FkOiB7XHJcbiAgICAgICAgaW5wdXQ6IHBhdGguam9pbihfX2Rpcm5hbWUsIFwiZWxlY3Ryb24vcHJlbG9hZC50c1wiKSxcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHJlbmRlcmVyOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJ0ZXN0XCIgPyB1bmRlZmluZWQgOiB7fSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjXCIpLFxyXG4gICAgICBldmVudHM6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL3NoaW1zL2V2ZW50cy1zaGltLnRzXCIpLFxyXG4gICAgICBzdHJlYW06IFwic3RyZWFtLWJyb3dzZXJpZnlcIixcclxuICAgICAgcHJvY2VzczogXCJwcm9jZXNzL2Jyb3dzZXJcIixcclxuICAgICAgdXRpbDogXCJ1dGlsL1wiLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuIG9wdGltaXplRGVwczoge1xyXG4gaW5jbHVkZTogWydzdHJlYW0tYnJvd3NlcmlmeScsICdwcm9jZXNzJywgJ3V0aWwnXSxcclxufSxcclxuXHJcbiAgYnVpbGQ6IHtcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAvLyBlbnN1cmUgbm9kZSBwb2x5ZmlsbHMgYXJlIGFwcGxpZWQgYmVmb3JlIGNvbnZlcnRpbmcgQ29tbW9uSlMgbW9kdWxlc1xyXG4gIHBsdWdpbnM6IFtyb2xsdXBOb2RlUG9seWZpbGxzKCksIGNvbW1vbmpzUGx1Z2luKHsgdHJhbnNmb3JtTWl4ZWRFc01vZHVsZXM6IHRydWUgfSldLFxyXG4gICAgfSxcclxuICAgIGNvbW1vbmpzT3B0aW9uczoge1xyXG4gICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcclxuICAgICAgaW5jbHVkZTogWy9ub2RlX21vZHVsZXMvXSwgLy8gPC0gZ2FyYW50YSBxdWUgdG9kb3Mgb3MgQ0pTIHNlamFtIGNvbnZlcnRpZG9zXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVXLFNBQVMsb0JBQW9CO0FBQ3BZLE9BQU8sVUFBVTtBQUNqQixPQUFPLGNBQWM7QUFDckIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sb0JBQW9CO0FBQzNCLE9BQU8seUJBQXlCO0FBTmhDLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFlBQVk7QUFBQSxJQUNaLE1BQU07QUFBQTtBQUFBLElBRU4sU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLFFBQ0osT0FBTztBQUFBLE1BQ1Q7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQLE9BQU8sS0FBSyxLQUFLLGtDQUFXLHFCQUFxQjtBQUFBLE1BQ25EO0FBQUEsTUFFQSxVQUFVLFFBQVEsSUFBSSxhQUFhLFNBQVMsU0FBWSxDQUFDO0FBQUEsSUFDM0QsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxNQUNsQyxRQUFRLEtBQUssUUFBUSxrQ0FBVywwQkFBMEI7QUFBQSxNQUMxRCxRQUFRO0FBQUEsTUFDUixTQUFTO0FBQUEsTUFDVCxNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFBQSxFQUVELGNBQWM7QUFBQSxJQUNkLFNBQVMsQ0FBQyxxQkFBcUIsV0FBVyxNQUFNO0FBQUEsRUFDakQ7QUFBQSxFQUVFLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQTtBQUFBLE1BRWpCLFNBQVMsQ0FBQyxvQkFBb0IsR0FBRyxlQUFlLEVBQUUseUJBQXlCLEtBQUssQ0FBQyxDQUFDO0FBQUEsSUFDaEY7QUFBQSxJQUNBLGlCQUFpQjtBQUFBLE1BQ2YseUJBQXlCO0FBQUEsTUFDekIsU0FBUyxDQUFDLGNBQWM7QUFBQTtBQUFBLElBQzFCO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
