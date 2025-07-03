// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [react(), mkcert()],
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
});
