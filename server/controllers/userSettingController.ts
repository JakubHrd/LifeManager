import { Request, Response } from "express";
import {pool} from "../db";
import { UserSettingInput } from "../types/userSettingTypes";

/**
 * Converts a Date object to a string in the format "YYYY-MM-DD".
 * If the input is null, returns null.
 * @param date - Date object to convert to a string.
 * @returns a string in the format "YYYY-MM-DD" if the input is a valid Date object, otherwise null.
 */
const formatDateToString = (date: Date | null): string | null => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Retrieves the user settings for the given user.
 * If the setting does not exist, a new one is created with default values.
 *
 * @param req - Request object containing user information.
 * @param res - Response object used to send the response.
 */
export const getUserSetting = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;

  try {
    // Query the database for user settings
    const result = await pool.query(
      "SELECT height_cm, weight_kg, birth_date, gender, target_weight_kg, main_goal FROM user_setting WHERE user_id = $1",
      [userId]
    );

    // If no settings are found, create default settings
    if (result.rows.length === 0) {
      await pool.query("INSERT INTO user_setting (user_id) VALUES ($1)", [userId]);
      res.json({
        height_cm: null,
        weight_kg: null,
        birth_date: null,
        gender: null,
        target_weight_kg: null,
        main_goal: null,
      });
      return;
    }

    const data = result.rows[0];
    const birth_date = formatDateToString(data.birth_date);

    // Send the retrieved settings with formatted birth date
    res.json({
      ...data,
      birth_date,
    });
  } catch (err) {
    console.error("❌ Error fetching user settings:", err);
    res.status(500).json({ message: "Server error while fetching settings." });
  }
};

/**
 * Saves or updates the user settings.
 *
 * The function validates the input values and then either creates a new setting
 * or updates an existing one. If the setting does not exist, a new one is created
 * with default values.
 *
 * @param req - Request object containing user information and input values.
 * @param res - Response object used to send the response.
 */
export const upsertUserSetting = async (req: Request<{}, {}, UserSettingInput>, res: Response): Promise<void> => {
  const userId = (req as any).user.id;
  const {
    height_cm,
    weight_kg,
    birth_date,
    gender,
    target_weight_kg,
    main_goal,
  } = req.body;

  try {
    // Validate gender value
    if (gender && !["male", "female", "other"].includes(gender)) {
      res.status(400).json({ message: "Invalid value for gender." });
      return;
    }

    // Validate main goal value
    if (main_goal && !["lose_weight", "maintain_weight", "gain_muscle", "improve_health"].includes(main_goal)) {
      res.status(400).json({ message: "Invalid value for main goal." });
      return;
    }

    // Check if settings already exist for the user
    const existing = await pool.query("SELECT id FROM user_setting WHERE user_id = $1", [userId]);

    if (existing.rows.length > 0) {
      // Update existing settings
      await pool.query(
        `UPDATE user_setting
         SET height_cm = $1,
             weight_kg = $2,
             birth_date = $3,
             gender = $4,
             target_weight_kg = $5,
             main_goal = $6
         WHERE user_id = $7`,
        [height_cm, weight_kg, birth_date, gender, target_weight_kg, main_goal, userId]
      );
    } else {
      // Insert new settings
      await pool.query(
        `INSERT INTO user_setting (user_id, height_cm, weight_kg, birth_date, gender, target_weight_kg, main_goal)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, height_cm, weight_kg, birth_date, gender, target_weight_kg, main_goal]
      );
    }

    // Send success response
    res.status(200).json({ message: "Settings saved." });
  } catch (error) {
    console.error("❌ Error saving settings:", error);
    res.status(500).json({ message: "Server error while saving settings." });
  }
};

