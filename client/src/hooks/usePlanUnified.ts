// src/hooks/usePlanUnified.ts
import { useEffect, useState, useRef } from "react";
import { CalendarConfig, PlanByDay } from "../../_legacy/oldNotUsed/types/plan";
import { fetchPlan, savePlan } from "../services/planApi";

export function usePlanUnified(week: number, year: number, config: CalendarConfig) {
  const [data, setData] = useState<PlanByDay>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const latest = useRef<PlanByDay | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const plan = await fetchPlan(config.mode, week, year, ac.signal);
        setData(plan || {});
        latest.current = plan || {};
      } catch (e:any) {
        if (e?.name !== "AbortError") setError(e?.message ?? "Neznámá chyba");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [week, year, config.mode]);

  const persist = async (next: PlanByDay) => {
    setData(next);
    latest.current = next;
    await savePlan(config.mode, week, year, next);
  };

  return { data, setData, persist, loading, error };
}
