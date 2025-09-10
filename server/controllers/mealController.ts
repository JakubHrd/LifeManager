import { Request, Response } from "express";
import {pool} from "../db";
import { getCurrentWeekAndYear } from "../utils/dateUtils";
import { defaultMeals, MealPlan } from "../models/mealPlan";

/**
 * Retrieves the meal plan for the current user for a specific week and year.
 * If no meal plan exists, a default one is created.
 *
 * @param req - The request object containing user ID and query parameters for week and year.
 * @param res - The response object used to send the JSON response.
 */
export const getMealPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { week, year } = getWeekYearFromRequest(req);

    // Get the meal plan for the current user and week
    const result = await pool.query(
      "SELECT meals FROM meal_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, week, year]
    );

    // If no meal plan exists, create a default one
    if (result.rows.length === 0) {
      await pool.query(
        "INSERT INTO meal_plans (user_id, week, year, meals) VALUES ($1, $2, $3, $4)",
        [userId, week, year, JSON.stringify(defaultMeals)]
      );
      res.json({ meals: defaultMeals });
      return;
    }

    // Return the meal plan
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error retrieving meal plan:", error);
    res.status(500).json({ error: "Error while fetching meal plan." });
  }
};

/**
 * Saves or updates the meal plan for a user for a specific week and year.
 *
 * @param req - The request object containing user ID, meals data, and query parameters for week and year.
 * @param res - The response object used to send the JSON response.
 */
export const saveMealPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { meals } = req.body;
    const { week, year } = getWeekYearFromRequest(req);

    // Get the meal plan for the current user and week
    const result = await pool.query(
      "SELECT * FROM meal_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, week, year]
    );

    // If the meal plan exists, update it
    if (result.rows.length > 0) {
      await pool.query(
        "UPDATE meal_plans SET meals = $1 WHERE user_id = $2 AND week = $3 AND year = $4",
        [meals, userId, week, year]
      );
    } else {
      // If the meal plan does not exist, create a new one
      await pool.query(
        "INSERT INTO meal_plans (user_id, week, year, meals) VALUES ($1, $2, $3, $4)",
        [userId, week, year, meals]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving meal plan:", error);
    res.status(500).json({ error: "Error while saving meal plan." });
  }
};

/**
 * Copies the meal plan from the current week to the next week.
 * Allows optional overwrite of existing plans.
 *
 * @param req - The request object containing user ID, query parameters for current week and year, and force overwrite flag.
 * @param res - The response object used to send the JSON response.
 */
export const copyMealPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { week: currentWeek, year: currentYear } = getWeekYearFromRequest(req);
    const forceOverwrite = req.query.force === "true";

    if (!currentWeek || !currentYear) {
      res.status(400).json({ message: "Missing week or year." });
      return;
    }

    // Get the meal plan for the current week
    const current = await pool.query<MealPlan>(
      "SELECT meals FROM meal_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, currentWeek, currentYear]
    );

    // If the meal plan does not exist, return an error
    if (current.rows.length === 0) {
      res.status(404).json({ message: "No meal plan found." });
      return;
    }

    const mealsToCopy = current.rows[0].meals as MealPlan["meals"];

    // Get the meal plan for the next week
    const next = await pool.query<MealPlan>(
      "SELECT * FROM meal_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, currentWeek + 1, currentYear]
    );

    // If the meal plan already exists and the force flag is not set, return an error
    if (next.rows.length && !forceOverwrite) {
      res.status(409).json({ message: "Plan already exists." });
      return;
    }

    // If the meal plan already exists and the force flag is set, update it
    if (next.rows.length && forceOverwrite) {
      await pool.query(
        "UPDATE meal_plans SET meals = $1 WHERE user_id = $2 AND week = $3 AND year = $4",
        [mealsToCopy, userId, currentWeek + 1, currentYear]
      );
    } else {
      // If the meal plan does not exist, create a new one
      await pool.query(
        "INSERT INTO meal_plans (user_id, week, year, meals) VALUES ($1, $2, $3, $4)",
        [userId, currentWeek + 1, currentYear, mealsToCopy]
      );
    }

    res.json({ success: true, message: `Meal plan copied.` });
  } catch (error) {
    console.error("Error copying meal plan:", error);
    res.status(500).json({ message: "Error while copying." });
  }
};

/**
 * Extracts week and year from the request query parameters.
 * Defaults to the current week and year if not specified in the request.
 *
 * @param req - The request object containing query parameters for week and year.
 * @returns An object containing the extracted or default week and year.
 */
const getWeekYearFromRequest = (req: Request): { week: number; year: number } => {
  const week = parseInt(req.query.week as string) || getCurrentWeekAndYear().week;
  const year = parseInt(req.query.year as string) || getCurrentWeekAndYear().year;
  return { week, year };
};

