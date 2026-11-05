import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// =============================================================
// ASAR (Athar / أثر) — Dedicated Dynamic Storefront Renderer App
// Assigned to Port 3004
// =============================================================

export default defineConfig({
  plugins: [react(), tsconfigPaths({ projects: ["./tsconfig.app.json"] })],
  server: {
    port: 3004,
    host: "0.0.0.0",
  },
});
