import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = (env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  return {
    plugins: [react(),tsconfigPaths()],
    server: {
      proxy: {
        // Většina FE volá relativně na /api -> pošleme na backend
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
        },
        // Pokud login/hard refresh trefuje i /auth, pokryjeme i to:
        "/auth": {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
