// src/utils/makeEmptyPlan.ts
import { DayKey, PlanByDay, SectionKey } from "../types/plan";

export const DAYS: DayKey[] = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
];

export function makeEmptyPlan(sectionKeys: SectionKey[], doneField: string): PlanByDay {
  const out: PlanByDay = {};
  for (const day of DAYS) {
    out[day] = {};
    for (const s of sectionKeys) {
      out[day]![s] = { description: "", [doneField]: false };
    }
  }
  return out;
}
