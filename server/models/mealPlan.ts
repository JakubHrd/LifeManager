/**
 * Default meal plan structure for each day of the week.
 * Each day has the following meals: breakfast, snack, launch/lunch, snack2, dinner.
 * Sunday has lunch instead of launch.
 */
export const defaultMeals = {
  Monday: generateEmptyDay(),
  Tuesday: generateEmptyDay(),
  Wednesday: generateEmptyDay(),
  Thursday: generateEmptyDay(),
  Friday: generateEmptyDay(),
  Saturday: generateEmptyDay(),
  Sunday: generateEmptyDay(true),
};

/**
 * Generates an empty meal plan for a day.
 * @param {boolean} [isSunday=false] Optional flag to adjust meal structure for Sunday.
 * @returns {DayMeals} An object representing meals for a day.
 */
function generateEmptyDay(isSunday: boolean = false): DayMeals {
  return {
    breakfast: { description: "", eaten: false },
    snack: { description: "", eaten: false },
    ...(isSunday ? { lunch: { description: "", eaten: false } } : { launch: { description: "", eaten: false } }),
    snack2: { description: "", eaten: false },
    dinner: { description: "", eaten: false },
  };
}

/**
 * Represents a single meal with description and status.
 */
export type Meal = {
  /** Description of the meal */
  description: string;
  /** Flag indicating if the meal was eaten */
  eaten: boolean;
};

/**
 * Represents meals for a single day.
 */
export type DayMeals = {
  /** Breakfast meal */
  breakfast: Meal;
  /** Snack meal */
  snack: Meal;
  /** Launch meal (for most days) or Lunch meal (for Sunday) */
  launch?: Meal;
  lunch?: Meal;
  /** Snack 2 meal */
  snack2: Meal;
  /** Dinner meal */
  dinner: Meal;
};

/**
 * Represents a meal plan for a specific week and year.
 */
export type MealPlan = {
  /** Week number (1-52) */
  week: number;
  /** Year number (e.g. 2022) */
  year: number;
  /** Meals for each day of the week */
  meals: {
    [day: string]: DayMeals;
  };
};

