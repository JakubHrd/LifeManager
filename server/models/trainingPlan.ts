/**
 * Represents a training activity with a description and completion status.
 * @property {string} description - Description of the training activity
 * @property {boolean} done - Completion status of the training
 */
export type Training = {
  description: string;
  done: boolean;
};

/**
 * Represents the training activities for a single day, divided into morning, main, and evening sessions.
 * @property {Training} morning - Morning training activity
 * @property {Training} main - Main training activity
 * @property {Training} evening - Evening training activity
 */
export type DayTrainings = {
  morning: Training;
  main: Training;
  evening: Training;
};

/**
 * Represents a training plan for a specific week and year, containing daily trainings.
 * @property {number} week - Week number of the training plan
 * @property {number} year - Year of the training plan
 * @property {Record<Day, DayTrainings>} trainings - Trainings for each day of the week
 */
export type TrainingPlan = {
  week: number;
  year: number;
  trainings: Record<Day, DayTrainings>;
};

/**
 * Enum for the days of the week.
 */
export enum Day {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}

/**
 * Creates an empty DayTrainings object with empty descriptions and incomplete status for each session.
 * @returns {DayTrainings} An empty DayTrainings object
 */
function createEmptyDayTrainings(): DayTrainings {
  return {
    morning: { description: "", done: false },
    main: { description: "", done: false },
    evening: { description: "", done: false },
  };
}

/**
 * Default training plan with empty descriptions and incomplete status for each session of the week.
 */
export const defaultTrainings: Record<Day, DayTrainings> = {
  [Day.Monday]: createEmptyDayTrainings(),
  [Day.Tuesday]: createEmptyDayTrainings(),
  [Day.Wednesday]: createEmptyDayTrainings(),
  [Day.Thursday]: createEmptyDayTrainings(),
  [Day.Friday]: createEmptyDayTrainings(),
  [Day.Saturday]: createEmptyDayTrainings(),
  [Day.Sunday]: createEmptyDayTrainings(),
};

