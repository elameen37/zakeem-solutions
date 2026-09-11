import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, "/");
          if (normalized.includes("/node_modules/")) {
            if (
              normalized.includes("/node_modules/react/") ||
              normalized.includes("/node_modules/react-dom/") ||
              normalized.includes("/node_modules/react-router/") ||
              normalized.includes("/node_modules/react-router-dom/")
            ) {
              return "vendor-react";
            }
            if (normalized.includes("/node_modules/motion/")) {
              return "vendor-motion";
            }
            if (normalized.includes("/node_modules/lucide-react/")) {
              return "vendor-icons";
            }
          }
        },
      },
    },
  },
});
