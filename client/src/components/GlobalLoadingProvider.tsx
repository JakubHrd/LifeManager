import { createContext, useContext, useMemo, useRef, useState } from "react";

type Ctx = {
  isLoading: boolean;
  setLoading: (on: boolean) => void;
  withLoading: <T>(p: Promise<T>) => Promise<T>;
};

const GlobalLoadingCtx = createContext<Ctx | null>(null);

export function useGlobalLoading() {
  const ctx = useContext(GlobalLoadingCtx);
  if (!ctx) throw new Error("useGlobalLoading must be used within GlobalLoadingProvider");
  return ctx;
}

export default function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const counter = useRef(0);
  const [isLoading, _set] = useState(false);

  const setLoading = (on: boolean) => {
    counter.current += on ? 1 : -1;
    if (counter.current < 0) counter.current = 0;
    _set(counter.current > 0);
  };

  const withLoading = async <T,>(p: Promise<T>) => {
    setLoading(true);
    try { return await p; }
    finally { setLoading(false); }
  };

  const value = useMemo(() => ({ isLoading, setLoading, withLoading }), [isLoading]);
  return <GlobalLoadingCtx.Provider value={value}>{children}</GlobalLoadingCtx.Provider>;
}
