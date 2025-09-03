import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { buildTheme } from "../theme";

type Mode = "light" | "dark";
type Ctx = { mode: Mode; toggle: () => void; set: (m: Mode) => void };
const ColorModeCtx = createContext<Ctx | null>(null);

export function useColorMode() {
  const ctx = useContext(ColorModeCtx);
  if (!ctx) throw new Error("useColorMode must be used within ColorSchemeProvider");
  return ctx;
}

type Props = { children: React.ReactNode };

export default function ColorSchemeProvider({ children }: Props) {
  const getInitial = (): Mode => {
    const saved = (localStorage.getItem("lm-color-mode") as Mode | null);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const [mode, setMode] = useState<Mode>(getInitial);
  useEffect(() => { localStorage.setItem("lm-color-mode", mode); }, [mode]);

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const value = useMemo<Ctx>(() => ({ mode, toggle: () => setMode(m => (m === "light" ? "dark" : "light")), set: setMode }), [mode]);

  return (
    <ColorModeCtx.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeCtx.Provider>
  );
}
