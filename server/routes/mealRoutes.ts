import express, { Request, Response } from "express";
import pool from "../db"; // Připojení k PostgreSQL
import authMiddleware from "../middleware/authMiddleware"; // ✅ Importujeme middleware

const router = express.Router();

// 📌 Funkce pro získání aktuálního týdne a roku
const getCurrentWeekAndYear = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
    return { week, year: now.getFullYear() };
  };

  // 📌 Defaultní struktura jídelníčku
const defaultMeals = {
    "Monday": {
        breakfast: {description: "",eaten: false },
        snack: {description: "",eaten: false },
        launch: {description: "",eaten: false },
        snack2: {description: "",eaten: false },
        dinner: {description: "",eaten: false },
    },
    "Tuesday": {
        breakfast: {description: "",eaten: false },
        snack: {description: "",eaten: false },
        launch: {description: "",eaten: false },
        snack2: {description: "",eaten: false },
        dinner: {description: "",eaten: false },
    },
    "Wednesday": {
        breakfast: {description: "",eaten: false },
        snack: {description: "",eaten: false },
        launch: {description: "",eaten: false },
        snack2: {description: "",eaten: false },
        dinner: {description: "",eaten: false },
    },
    "Thursday": {
        breakfast: {description: "",eaten: false },
        snack: {description: "",eaten: false },
        launch: {description: "",eaten: false },
        snack2: {description: "",eaten: false },
        dinner: {description: "",eaten: false },
    },
    "Friday": {
        breakfast: {description: "",eaten: false },
        snack: {description: "",eaten: false },
        launch: {description: "",eaten: false },
        snack2: {description: "",eaten: false },
        dinner: {description: "",eaten: false },
    },
    "Saturday": {
        breakfast: {description: "",eaten: false },
        snack: {description: "",eaten: false },
        launch: {description: "",eaten: false },
        snack2: {description: "",eaten: false },
        dinner: {description: "",eaten: false },
    },
    "Sunday": {
        breakfast : {description: "",eaten: false },
        snack: {description: "",eaten: false },
        lunch: {description: "",eaten: false },
        snack2: {description: "",eaten: false },
        dinner: {description: "",eaten: false },
    },
  };

// 📌 Načíst jídelníček pro aktuální týden a rok
router.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      console.log("userId",{userId});
      // 📌 Získání týdne a roku z query parametrů nebo použití aktuálního
      const week = parseInt(req.query.week as string) || getCurrentWeekAndYear().week;
      const year = parseInt(req.query.year as string) || getCurrentWeekAndYear().year;
  
      const result = await pool.query(
        "SELECT meals,week,year FROM meal_plans WHERE user_id = $1 AND week = $2 AND year = $3",
        [userId, week, year]
      );


      console.log('result',{'res':result.rows[0]});
  
      if (result.rows.length === 0) {
        // Pokud jídelníček neexistuje, vytvoříme nový
        await pool.query(
          "INSERT INTO meal_plans (user_id, week, year, meals) VALUES ($1, $2, $3, $4)",
          [userId, week, year, JSON.stringify(defaultMeals)]
        );
        res.json({ meals: defaultMeals });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Chyba při načítání jídelníčku." });
    }
  });

// 📌 Uložit nebo aktualizovat jídelníček pro aktuální týden a rok
router.post("/", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { meals } = req.body;
      const week = parseInt(req.query.week as string) || getCurrentWeekAndYear().week;
      const year = parseInt(req.query.year as string) || getCurrentWeekAndYear().year;
      console.log('data', {week,year});
      const existing = await pool.query(
        "SELECT * FROM meal_plans WHERE user_id = $1 AND week = $2 AND year = $3",
        [userId, week, year]
      );
  
      if (existing.rows.length > 0) {
        await pool.query(
          "UPDATE meal_plans SET meals = $1 WHERE user_id = $2 AND week = $3 AND year = $4",
          [meals, userId, week, year]
        );
      } else {
        await pool.query(
          "INSERT INTO meal_plans (user_id, week, year, meals) VALUES ($1, $2, $3, $4)",
          [userId, week, year, meals]
        );
      }
  
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Chyba při ukládání jídelníčku." });
    }
  });
  

export default router;
