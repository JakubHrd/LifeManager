import { Request, Response } from "express";
import {pool} from "../db";
import { defaultHabits, HabitPlan } from "../models/habitPlan";
import { getCurrentWeekAndYear } from "../utils/dateUtils";

/**
 * Extracts the week and year from the request query parameters.
 * If the parameters are not provided, it defaults to the current week and year.
 *
 * @param req - The request object containing query parameters for week and year.
 * @returns An object with properties 'week' and 'year'.
 */
const getWeekYearFromRequest = (req: Request) => {
  const week = parseInt(req.query.week as string) || getCurrentWeekAndYear().week;
  const year = parseInt(req.query.year as string) || getCurrentWeekAndYear().year;
  return { week, year };
};

/**
 * Retrieves the habit plan for the current user for a specific week and year.
 * If no habit plan exists, a default one is created.
 *
 * @param req - The request object containing user ID and query parameters for week and year.
 * @param res - The response object used to send the JSON response.
 */
export const getHabitPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { week, year } = getWeekYearFromRequest(req);

    const result = await pool.query<{ habits: HabitPlan["habits"] }>(
      "SELECT habits FROM habit_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, week, year]
    );

    if (result.rows.length === 0) {
      await pool.query(
        "INSERT INTO habit_plans (user_id, week, year, habits) VALUES ($1, $2, $3, $4)",
        [userId, week, year, JSON.stringify(defaultHabits)]
      );
      res.json({ habits: defaultHabits });
      return;
    }

    res.json({ habits: result.rows[0].habits });
  } catch (error) {
    console.error("Error retrieving habits:", error);
    res.status(500).json({ message: "Error while retrieving habits." });
  }
};

/**
 * Saves or updates the habit plan for a user for a specific week and year.
 *
 * @param req - The request object containing user ID, habits data, and query parameters for week and year.
 * @param res - The response object used to send the JSON response.
 */

export const saveHabitPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { habits } = req.body;
    const { week, year } = getWeekYearFromRequest(req);

    const result = await pool.query("SELECT id FROM habit_plans WHERE user_id = $1 AND week = $2 AND year = $3", [userId, week, year]);
    const serializedHabits = JSON.stringify(habits);

    if (result.rows.length > 0) {
      await pool.query(
        "UPDATE habit_plans SET habits = $1 WHERE user_id = $2 AND week = $3 AND year = $4",
        [serializedHabits, userId, week, year]
      );
    } else {
      await pool.query(
        "INSERT INTO habit_plans (user_id, week, year, habits) VALUES ($1, $2, $3, $4)",
        [userId, week, year, serializedHabits]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving habits:", error);
    res.status(500).json({ message: "Error while saving habits." });
  }
};

/**
 * Copies the habit plan from the current week to the next week for a user.
 * If a habit plan already exists for the next week, it can optionally overwrite
 * based on the force overwrite flag.
 *
 * @param req - The request object containing user ID, query parameters for the current week and year, and an optional force overwrite flag.
 * @param res - The response object used to send the JSON response indicating success or an error message.
 */

export const copyHabitPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const currentWeek = parseInt(req.query.week as string);
    const currentYear = parseInt(req.query.year as string);
    const forceOverwrite = req.query.force === "true";

    if (!currentWeek || !currentYear) {
      res.status(400).json({ message: "Missing parameter 'week' or 'year'." });
      return;
    }

    const nextWeek = currentWeek + 1;

    const current = await pool.query<{ habits: HabitPlan["habits"] }>(
      "SELECT habits FROM habit_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, currentWeek, currentYear]
    );

    if (current.rows.length === 0) {
      res.status(404).json({ message: "No habits found for the current week." });
      return;
    }

    const originalHabits = current.rows[0].habits;
    const copiedHabits: HabitPlan["habits"] = {};

    for (const habitName in originalHabits) {
      copiedHabits[habitName] = {};
    }

    const exists = await pool.query(
      "SELECT habits FROM habit_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, nextWeek, currentYear]
    );

    if (exists.rows.length > 0) {
      const existingHabits = exists.rows[0].habits;
      const hasHabits = existingHabits && Object.keys(existingHabits).length > 0;
      if (hasHabits && !forceOverwrite) {
        res.status(409).json({ message: "Habits for the next week already exist." });
        return;
      }

      await pool.query(
        "UPDATE habit_plans SET habits = $1 WHERE user_id = $2 AND week = $3 AND year = $4",
        [JSON.stringify(copiedHabits), userId, nextWeek, currentYear]
      );
    } else {
      await pool.query(
        "INSERT INTO habit_plans (user_id, week, year, habits) VALUES ($1, $2, $3, $4)",
        [userId, nextWeek, currentYear, JSON.stringify(copiedHabits)]
      );
    }

    res.json({ success: true, message: `Habits were copied to week ${nextWeek}` });
  } catch (error) {
    console.error("Error copying habits:", error);
    res.status(500).json({ message: "Error while copying habits." });
  }
};

