// config/env.ts
export const isProd = process.env.NODE_ENV === "production" || !!process.env.RENDER;
export const PORT = Number(process.env.PORT || 5000);

// URL frontendu pro odkazy a CORS (lze přepsat ENV proměnnými)
export const FRONTEND_URL = isProd
  ? (process.env.FRONTEND_URL_PROD || "https://hrdnk.cz/projekty/lifeManager/")
  : (process.env.FRONTEND_URL_DEV || "http://localhost:5173");

// Povolené originy pro CORS (čárkou oddělený seznam). Když není, použij FRONTEND_URL.
export const CORS_ORIGINS = (process.env.CORS_ORIGINS || FRONTEND_URL)
  .split(",").map(s => s.trim()).filter(Boolean);

// Cookies vlajky (kdybys v budoucnu používal cookie-auth)
export const DB_URL = process.env.DATABASE_URL!;
export const DB_SSL = String(process.env.DATABASE_SSL || (isProd ? "true" : "false")) === "true";
export const JWT_SECRET = process.env.JWT_SECRET!;

export function logEnvSummary() {
  console.log("[env] NODE_ENV:", process.env.NODE_ENV);
  console.log("[env] RENDER:", process.env.RENDER);
  console.log("[env] isProd:", isProd);
  console.log("[env] PORT:", PORT);
  console.log("[env] FRONTEND_URL:", FRONTEND_URL);
  console.log("[env] CORS_ORIGINS:", CORS_ORIGINS);
}
