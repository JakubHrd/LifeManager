// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // v dev běží na /, v produkci na /projekty/lifeManager/
  base: mode === 'production' ? '/projekty/lifeManager/' : '/',
  server: {
    port: 5173,
    open: true,
    proxy: {
      // FE požadavky na /api pošle Vite na backend (localhost:5000)
      '/api': { target: 'http://localhost:5000', changeOrigin: true }
    }
  },
  preview: { port: 5173 }
}));
