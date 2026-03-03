import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const API_PREFIXES = [
  "/auth",
  "/matters",
  "/ai-threads",
  "/ai-runs",
  "/ai-validation-metrics",
  "/ai-cost-summary",
  "/ai-quality-trends",
  "/ai-throughput",
  "/ai-amendment-acceptance",
  "/artifacts",
  "/jobs",
  "/worker",
  "/health",
];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: Object.fromEntries(
      API_PREFIXES.map((prefix) => [
        prefix,
        {
          target: "http://127.0.0.1:8080",
          changeOrigin: true,
        },
      ])
    ),
  },
});
