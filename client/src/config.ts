// DEV: serverUrl nech prázdný => fetch("/api/...") půjde přes Vite proxy
// PROD: serverUrl = VITE_API_URL (plná URL backendu)
const serverUrl = import.meta.env.PROD ? (import.meta.env.VITE_API_URL ?? "") : "";

export const USE_COOKIE_AUTH = import.meta.env.VITE_USE_COOKIE_AUTH === "true";

// BASE_URL dává Vite podle config.base — hodí se pro Router basename
export const APP_BASE = import.meta.env.BASE_URL; // např. "/projekty/lifeManager/"

export default serverUrl;
