export type HabitPlan = {
  readonly week: number;
  readonly year: number;
  readonly habits: Record<string, Record<string, boolean>>;
};

/**
 * Výchozí prázdná struktura návyků pro nový týden.
 */
export const defaultHabits: HabitPlan["habits"] = {};
