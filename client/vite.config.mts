import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const API = (env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  const BASE = env.VITE_BASE || "/"; // v prod: "/projekty/lifeManager/"

  return {
    plugins: [react(), tsconfigPaths()],
    // důležité pro build na subcestě
    base: mode === "production" ? BASE : "/",
    server: {
      // proxy funguje jen v DEV
      proxy: {
        "/api": { target: API, changeOrigin: true, secure: false },
        "/auth": { target: API, changeOrigin: true, secure: false },
      },
    },
  };
});
