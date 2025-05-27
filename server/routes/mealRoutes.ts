import express, { Request, Response } from "express";
import pool from "../db"; // PostgreSQL connection pool
import authMiddleware from "../middleware/authMiddleware"; // Middleware to verify user authentication
import moment from "moment";

const router = express.Router();

// 🔧 Utility function to determine the current calendar week and year
const getCurrentWeekAndYear = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const week = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  return { week, year: now.getFullYear() };
};

// 📌 Default meal structure for each day of the week — repetitive and a candidate for dynamic generation
const defaultMeals = {
  Monday: {
    breakfast: { description: "", eaten: false },
    snack: { description: "", eaten: false },
    launch: { description: "", eaten: false }, // ⚠️ Typo? Possibly meant to be "lunch"
    snack2: { description: "", eaten: false },
    dinner: { description: "", eaten: false },
  },
  Tuesday: {
    breakfast: { description: "", eaten: false },
    snack: { description: "", eaten: false },
    launch: { description: "", eaten: false },
    snack2: { description: "", eaten: false },
    dinner: { description: "", eaten: false },
  },
  Wednesday: {
    breakfast: { description: "", eaten: false },
    snack: { description: "", eaten: false },
    launch: { description: "", eaten: false },
    snack2: { description: "", eaten: false },
    dinner: { description: "", eaten: false },
  },
  Thursday: {
    breakfast: { description: "", eaten: false },
    snack: { description: "", eaten: false },
    launch: { description: "", eaten: false },
    snack2: { description: "", eaten: false },
    dinner: { description: "", eaten: false },
  },
  Friday: {
    breakfast: { description: "", eaten: false },
    snack: { description: "", eaten: false },
    launch: { description: "", eaten: false },
    snack2: { description: "", eaten: false },
    dinner: { description: "", eaten: false },
  },
  Saturday: {
    breakfast: { description: "", eaten: false },
    snack: { description: "", eaten: false },
    launch: { description: "", eaten: false },
    snack2: { description: "", eaten: false },
    dinner: { description: "", eaten: false },
  },
  Sunday: {
    breakfast: { description: "", eaten: false },
    snack: { description: "", eaten: false },
    lunch: { description: "", eaten: false }, // ✅ Correct key name
    snack2: { description: "", eaten: false },
    dinner: { description: "", eaten: false },
  },
};

// 📥 GET / — Retrieves the meal plan for the current user for a specific or current week/year
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    console.log("userId", { userId });

    // 🔁 Try to get week/year from query string, otherwise fallback to current
    const week =
      parseInt(req.query.week as string) || getCurrentWeekAndYear().week;
    const year =
      parseInt(req.query.year as string) || getCurrentWeekAndYear().year;

    const result = await pool.query(
      "SELECT meals,week,year FROM meal_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, week, year]
    );

    console.log("result", { res: result.rows[0] });

    if (result.rows.length === 0) {
      // 🆕 No entry found — create new meal plan from default template
      await pool.query(
        "INSERT INTO meal_plans (user_id, week, year, meals) VALUES ($1, $2, $3, $4)",
        [userId, week, year, JSON.stringify(defaultMeals)]
      );
      res.json({ meals: defaultMeals });
    }

    // ✅ Return existing meal plan (or after insert if created above)
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error while fetching meal plan." });
  }
});

// 💾 POST / — Saves or updates the meal plan for a given week and year
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { meals } = req.body;
    const week =
      parseInt(req.query.week as string) || getCurrentWeekAndYear().week;
    const year =
      parseInt(req.query.year as string) || getCurrentWeekAndYear().year;

    console.log("data", { week, year });

    const existing = await pool.query(
      "SELECT * FROM meal_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, week, year]
    );

    if (existing.rows.length > 0) {
      // 🔄 Update existing plan
      await pool.query(
        "UPDATE meal_plans SET meals = $1 WHERE user_id = $2 AND week = $3 AND year = $4",
        [meals, userId, week, year]
      );
    } else {
      // ➕ Insert new plan
      await pool.query(
        "INSERT INTO meal_plans (user_id, week, year, meals) VALUES ($1, $2, $3, $4)",
        [userId, week, year, meals]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error while saving meal plan." });
  }
});

// 📤 POST /copy — Copies meals from current week to next week, with optional overwrite
router.post("/copy", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const currentWeek = parseInt(req.query.week as string);
    const currentYear = parseInt(req.query.year as string);
    const forceOverwrite = req.query.force === "true";

    if (!currentWeek || !currentYear) {
      res.status(400).json({ message: "Missing 'week' or 'year' parameter." });
      return;
    }

    const nextWeek = currentWeek + 1;

    const currentWeekData = await pool.query(
      "SELECT meals FROM meal_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, currentWeek, currentYear]
    );

    console.log("currentWeekData", { currentWeekData });

    if (currentWeekData?.rows?.length === 0) {
      res
        .status(404)
        .json({ message: "No meal plan found for the selected week." });
      return;
    }

    const mealsFromSelectedWeek = currentWeekData.rows[0].meals;

    const nexttWeekData = await pool.query(
      "SELECT meals FROM meal_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, nextWeek, currentYear]
    );

    if (nexttWeekData?.rows?.length) {
      const nexttWeekMeals = nexttWeekData.rows[0].meals;
      const hasNexttWeekMealsData =
        nexttWeekMeals && Object.keys(nexttWeekMeals)?.length;

      if (hasNexttWeekMealsData && !forceOverwrite) {
        // ❌ Abort if meals exist for next week and no force overwrite allowed
        res
          .status(409)
          .json({ message: "Meal plan for next week already exists." });
        return;
      }

      // 🔁 Overwrite meals in existing plan for next week
      await pool.query(
        "UPDATE meal_plans SET meals = $1 WHERE user_id = $2 AND week = $3 AND year = $4",
        [JSON.stringify(mealsFromSelectedWeek), userId, nextWeek, currentYear]
      );

      res.json({
        success: true,
        message: `Meal plan copied to week ${nextWeek}.`,
      });
      return;
    }

    // ➕ Insert meal plan for next week if it doesn't exist
    await pool.query(
      "INSERT INTO meal_plans (user_id, week, year, habits) VALUES ($1, $2, $3, $4)",
      [userId, nextWeek, currentYear, JSON.stringify(mealsFromSelectedWeek)]
    );

    res.json({
      success: true,
      message: `Meal plan copied to week ${nextWeek}.`,
    });
  } catch (err) {
    console.error("❌ Error copying meal plan:", err);
    res
      .status(500)
      .json({ message: "Server error while copying meal plan." });
  }
});

export default router;