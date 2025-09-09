import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

type Ctx = {
  mode: ThemeMode;
  /** skutečný režim po zohlednění „system“ */
  effective: "light" | "dark";
  setMode: (m: ThemeMode) => void;
  toggle: () => void; // light ⇄ dark
  cycle: () => void;  // light → dark → system → light
};

const ColorModeCtx = createContext<Ctx | null>(null);

export function useColorMode() {
  const ctx = useContext(ColorModeCtx);
  if (!ctx) throw new Error("useColorMode must be used within ColorSchemeProvider");
  return ctx;
}

function applyModeAttr(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
  localStorage.setItem("lm-theme", mode);
}

function getInitialMode(): ThemeMode {
  const saved = (localStorage.getItem("lm-theme") as ThemeMode | null);
  return saved ?? "system";
}

export default function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  // aplikuj na <html> při mountu i při změně
  useEffect(() => { applyModeAttr(mode); }, [mode]);

  // když je „system“, reaguj na změny systému (aby se přepočetl effective)
  useEffect(() => {
    if (mode !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setMode((m) => m); // vyvolá re-render bez změny hodnoty
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [mode]);

  const effective: "light" | "dark" =
    mode === "system"
      ? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;

  const value = useMemo<Ctx>(() => ({
    mode,
    effective,
    setMode,
    toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
    cycle:  () => setMode((m) => (m === "light" ? "dark" : m === "dark" ? "system" : "light")),
  }), [mode, effective]);

  // DŮLEŽITÉ: už žádný ThemeProvider tady – venku ho dodává index.tsx
  return <ColorModeCtx.Provider value={value}>{children}</ColorModeCtx.Provider>;
}
