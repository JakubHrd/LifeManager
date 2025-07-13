import { Request, Response } from "express";
import pool from "../db";
import { defaultTrainings, TrainingPlan } from "../models/trainingPlan";
import { getCurrentWeekAndYear } from "../utils/dateUtils";

/**
 * Retrieves the week and year from the request query parameters.
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

/**
 * Retrieves the training plan for the current user for a specific week and year.
 * If no training plan exists, a default one is created.
 *
 * @param req - The request object containing user ID and query parameters for week and year.
 * @param res - The response object used to send the JSON response.
 */
export const getTrainingPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { week, year } = getWeekYearFromRequest(req);

    console.log(`Getting training plan for user ${userId} in week ${week} of year ${year}`);

    const result = await pool.query<{ trainings: TrainingPlan["trainings"] }>(
      "SELECT trainings FROM training_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, week, year]
    );

    if (result.rows.length === 0) {
      console.log("No training plan found, creating a default one.");

      await pool.query(
        "INSERT INTO training_plans (user_id, week, year, trainings) VALUES ($1, $2, $3, $4)",
        [userId, week, year, JSON.stringify(defaultTrainings)]
      );
      res.json({ trainings: defaultTrainings });
      return;
    }

    console.log("Sending training plan to the client.");

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chyba při načítání tréninkového plánu." });
  }
};

/**
 * Saves or updates the training plan for a user for a specific week and year.
 *
 * @param req - The request object containing user ID, trainings data, and query parameters for week and year.
 * @param res - The response object used to send the JSON response.
 */
export const saveTrainingPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { trainings } = req.body;
    const { week, year } = getWeekYearFromRequest(req);

    console.log(`Saving training plan for user ${userId} in week ${week} of year ${year}`);

    const result = await pool.query(
      "SELECT * FROM training_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, week, year]
    );

    if (result.rows.length > 0) {
      console.log("Updating existing training plan.");

      await pool.query(
        "UPDATE training_plans SET trainings = $1 WHERE user_id = $2 AND week = $3 AND year = $4",
        [trainings, userId, week, year]
      );
    } else {
      console.log("Creating new training plan.");

      await pool.query(
        "INSERT INTO training_plans (user_id, week, year, trainings) VALUES ($1, $2, $3, $4)",
        [userId, week, year, trainings]
      );
    }

    console.log("Sending success response.");

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chyba při ukládání tréninkového plánu." });
  }
};

