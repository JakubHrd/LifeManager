// src/types/plan.ts
export type DayKey = "Monday"|"Tuesday"|"Wednesday"|"Thursday"|"Friday"|"Saturday"|"Sunday";
export type SectionKey = string;

export type CalendarMode = "meals" | "training";

export interface MapDict<T = string> {
  [k: string]: T;
}

export interface CalendarConfig {
  mode: CalendarMode;
  title: string;
  sectionKeys: SectionKey[];        // např. ["breakfast","snack","lunch","snack2","dinner"]
  doneField: string;                // "eaten" | "done"
  // Mapování pro applySuggestion (CZ->EN). Pokud klíč není nalezen, použije se původní.
  dayMapCzToEn: MapDict;
  sectionMapCzToEn: MapDict;
}

export type PlanCell = {
  description: string;
  // libovolný název pole pro "done" (např. eaten/done)
  [key: string]: any;
};

export type PlanByDay = {
  [day in DayKey]?: {
    [section in SectionKey]?: PlanCell;
  };
};
