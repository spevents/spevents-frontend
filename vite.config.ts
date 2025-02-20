// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig(({}) => {
  const isHost = process.env.APP_TYPE === 'host';
  
  return {
    plugins: [react(), mkcert()],
    server: {
      host: "0.0.0.0",
      port: isHost ? 5174 : 5173,
      https: {},
      cors: true,
      hmr: {
        host: "localhost",
        protocol: "wss",
      },
    },
  };
});