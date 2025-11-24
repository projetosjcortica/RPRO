// vite.config.ts
import { defineConfig } from "file:///C:/Users/cmp00/OneDrive/Documentos/GitHub/RPRO/Frontend/node_modules/vite/dist/node/index.js";
import path from "node:path";
import electron from "file:///C:/Users/cmp00/OneDrive/Documentos/GitHub/RPRO/Frontend/node_modules/vite-plugin-electron/dist/simple.mjs";
import react from "file:///C:/Users/cmp00/OneDrive/Documentos/GitHub/RPRO/Frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/cmp00/OneDrive/Documentos/GitHub/RPRO/Frontend/node_modules/@tailwindcss/vite/dist/index.mjs";
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
    electron({
      main: {
        entry: "electron/main.ts",
        onstart(args) {
          args.startup();
        }
      },
      preload: {
        input: path.join(__vite_injected_original_dirname, "electron/preload.ts"),
        vite: {
          build: {
            outDir: "dist-electron",
            rollupOptions: {
              output: {
                format: "cjs"
                // Force CommonJS for preload
              }
            }
          }
        }
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
      external: []
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxjbXAwMFxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudG9zXFxcXEdpdEh1YlxcXFxSUFJPXFxcXEZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxjbXAwMFxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudG9zXFxcXEdpdEh1YlxcXFxSUFJPXFxcXEZyb250ZW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9jbXAwMC9PbmVEcml2ZS9Eb2N1bWVudG9zL0dpdEh1Yi9SUFJPL0Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xyXG5pbXBvcnQgZWxlY3Ryb24gZnJvbSBcInZpdGUtcGx1Z2luLWVsZWN0cm9uL3NpbXBsZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwiQHRhaWx3aW5kY3NzL3ZpdGVcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiA1MTczLFxyXG4gICAgcHJveHk6IHtcclxuICAgICAgXCIvYXBpXCI6IHtcclxuICAgICAgICB0YXJnZXQ6IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwXCIsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgIH0sICBcclxuICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICB0YWlsd2luZGNzcygpLFxyXG4gICAgcmVhY3QoKSxcclxuICAgIGVsZWN0cm9uKHtcclxuICAgICAgbWFpbjogeyAgIFxyXG4gICAgICAgIGVudHJ5OiAnZWxlY3Ryb24vbWFpbi50cycsXHJcbiAgICAgICAgb25zdGFydChhcmdzKSB7XHJcbiAgICAgICAgICBhcmdzLnN0YXJ0dXAoKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgcHJlbG9hZDoge1xyXG4gICAgICAgIGlucHV0OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZWxlY3Ryb24vcHJlbG9hZC50cycpLFxyXG4gICAgICAgIHZpdGU6IHtcclxuICAgICAgICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgICAgIG91dERpcjogJ2Rpc3QtZWxlY3Ryb24nLFxyXG4gICAgICAgICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICAgICAgICBmb3JtYXQ6ICdjanMnLCAvLyBGb3JjZSBDb21tb25KUyBmb3IgcHJlbG9hZFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHJlbmRlcmVyOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJ0ZXN0XCIgPyB1bmRlZmluZWQgOiB7fSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjXCIpLFxyXG4gICAgICBldmVudHM6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL3NoaW1zL2V2ZW50cy1zaGltLnRzXCIpLFxyXG4gICAgICBzdHJlYW06IFwic3RyZWFtLWJyb3dzZXJpZnlcIixcclxuICAgICAgcHJvY2VzczogXCJwcm9jZXNzL2Jyb3dzZXJcIixcclxuICAgICAgdXRpbDogXCJ1dGlsL1wiLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGluY2x1ZGU6IFtcInN0cmVhbS1icm93c2VyaWZ5XCIsIFwicHJvY2Vzc1wiLCBcInV0aWxcIl0sXHJcbiAgfSxcclxuXHJcbiAgYnVpbGQ6IHtcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgZXh0ZXJuYWw6IFsgXSxcclxuICAgIH0sXHJcbiAgICBjb21tb25qc09wdGlvbnM6IHtcclxuICAgICAgdHJhbnNmb3JtTWl4ZWRFc01vZHVsZXM6IHRydWUsXHJcbiAgICB9LFxyXG4gIH1cclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVcsU0FBUyxvQkFBb0I7QUFDcFksT0FBTyxVQUFVO0FBQ2pCLE9BQU8sY0FBYztBQUNyQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFKeEIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsWUFBWTtBQUFBLElBQ1osTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsUUFBUSxNQUFNO0FBQ1osZUFBSyxRQUFRO0FBQUEsUUFDZjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQLE9BQU8sS0FBSyxLQUFLLGtDQUFXLHFCQUFxQjtBQUFBLFFBQ2pELE1BQU07QUFBQSxVQUNKLE9BQU87QUFBQSxZQUNMLFFBQVE7QUFBQSxZQUNSLGVBQWU7QUFBQSxjQUNiLFFBQVE7QUFBQSxnQkFDTixRQUFRO0FBQUE7QUFBQSxjQUNWO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsVUFBVSxRQUFRLElBQUksYUFBYSxTQUFTLFNBQVksQ0FBQztBQUFBLElBQzNELENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsTUFDbEMsUUFBUSxLQUFLLFFBQVEsa0NBQVcsMEJBQTBCO0FBQUEsTUFDMUQsUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLE1BQ1QsTUFBTTtBQUFBLElBQ1I7QUFBQSxFQUNGO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMscUJBQXFCLFdBQVcsTUFBTTtBQUFBLEVBQ2xEO0FBQUEsRUFFQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUU7QUFBQSxJQUNkO0FBQUEsSUFDQSxpQkFBaUI7QUFBQSxNQUNmLHlCQUF5QjtBQUFBLElBQzNCO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
