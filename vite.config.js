// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  assetsInclude: ["**/*.mp3", "**/*.mp4", "**/*.webm"],
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    minify: "esbuild",
    modulePreload: { polyfill: false },
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("aos")) return "aos";
          if (id.includes("react-router-dom") || id.includes("react-router")) return "router";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("/react/") || id.includes("react-dom")) return "react-vendor";
        },
      },
    },
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  server: {
    proxy: { "/api": { target: "http://localhost:5174", changeOrigin: true } },
  },
}));
