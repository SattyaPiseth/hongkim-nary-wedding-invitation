// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const assetVersion =
    env.VITE_ASSET_VERSION ||
    new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
  process.env.VITE_ASSET_VERSION = assetVersion;

  return {
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
    define: {
      __BUILD_ASSET_VERSION__: JSON.stringify(assetVersion),
    },
  };
});
