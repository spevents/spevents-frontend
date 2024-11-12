import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(),
    basicSsl()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      // This enables HTTPS with a self-signed certificate
      cert: undefined,
      key: undefined,
    },
    proxy: {
      // Add any proxy configuration if needed
    },
    cors: true
  }
});