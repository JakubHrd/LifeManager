import { ActivityMatrixConfig, Matrix } from "../types";
import serverUrl from "../../../config";

export type HabitCell = { done: boolean };

const dayCols = [
  { key: "monday", label: "Pondělí" },
  { key: "tuesday", label: "Úterý" },
  { key: "wednesday", label: "Středa" },
  { key: "thursday", label: "Čtvrtek" },
  { key: "friday", label: "Pátek" },
  { key: "saturday", label: "Sobota" },
  { key: "sunday", label: "Neděle" },
];

const habitsConfig: ActivityMatrixConfig<HabitCell> = {
  domain: "habits",
  title: "Návyky",
  api: {
    basePath: `${serverUrl}/api/habits`,
    transformIn: (raw: any) => {
      // raw.habits: { [habitName: string]: { monday: boolean, ... } }
      const src = (raw?.habits ?? {}) as Record<string, Record<string, boolean>>;
      const rows = Object.keys(src).sort();
      const matrix: Matrix<HabitCell> = {};
      for (const habit of rows) {
        const d = src[habit] ?? {};
        matrix[habit] = Object.fromEntries(
          dayCols.map((c) => [c.key, { done: !!d[c.key] }])
        ) as any;
      }
      return { matrix, meta: { rows, cols: dayCols } };
    },
    transformOut: (m: Matrix<HabitCell>, meta?: any) => {
      const rows: string[] = (meta?.rows as string[]) ?? Object.keys(m);
      const habits: any = {};
      for (const habit of rows) {
        const row = m[habit] ?? {};
        const entry: Record<string, boolean> = {};
        for (const c of dayCols) entry[c.key] = !!row?.[c.key]?.done;
        habits[habit] = entry;
      }
      return { habits };
    },
  },
  ui: {
    // Pozn.: runtime přepíše meta.rows / meta.cols
    rows: [],
    cols: dayCols,
    cell: {
      booleanKey: "done",
      empty: () => ({ done: false }),
    },
    labels: { rowHeader: "Habit" },
    dynamicRows: {
  placeholder: "Nový návyk…",
  validate: (name: string, existing: string[]) => {
    const n = String(name ?? "").replace(/\s+/g, " ").trim();
    if (!n) return "Zadej název";
    if (n.length > 60) return "Max 60 znaků";
    if (existing.includes(n)) return "Název už existuje";
    return true;
  },
  normalize: (s: any) => String(s ?? "").replace(/\s+/g, " ").trim(), // ✅ vždy string
  deletable: true,
  rowLabel: (rk: string) => rk,
},
  },
};

export default habitsConfig;
