// vite.config.ts
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [react(), mkcert(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    https: {},
    cors: true,
    hmr: {
      host: "localhost",
      protocol: "wss",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
