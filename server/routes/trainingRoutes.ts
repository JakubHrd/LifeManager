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
const defaultTrainings = {
    "Monday": {
        morning: {description: "",done: false },
        main: {description: "",done: false },
        evening: {description: "",done: false },
    },
    "Tuesday": {
        morning: {description: "",done: false },
        main: {description: "",done: false },
        evening: {description: "",done: false },
    },
    "Wednesday": {
        morning: {description: "",done: false },
        main: {description: "",done: false },
        evening: {description: "",done: false },
    },
    "Thursday": {
        morning: {description: "",done: false },
        main: {description: "",done: false },
        evening: {description: "",done: false },
    },
    "Friday": {
        morning: {description: "",done: false },
        main: {description: "",done: false },
        evening: {description: "",done: false },
    },
    "Saturday": {
        morning: {description: "",done: false },
        main: {description: "",done: false },
        evening: {description: "",done: false },
    },
    "Sunday": {
        morning: {description: "",done: false },
        main: {description: "",done: false },
        evening: {description: "",done: false },
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
        "SELECT trainings,week,year FROM training_plans WHERE user_id = $1 AND week = $2 AND year = $3",
        [userId, week, year]
      );


      console.log('result',{'res':result.rows[0], length :result.rows.length});
  
      if (result.rows.length === 0) {
        console.log("input data",{userId,week,year, trainings: defaultTrainings});
        // Pokud jídelníček neexistuje, vytvoříme nový
        await pool.query(
          "INSERT INTO training_plans (user_id, week, year, trainings) VALUES ($1, $2, $3, $4)",
          [userId, week, year, JSON.stringify(defaultTrainings)]
        );
        console.log("input response",{res});
        res.json({ trainings: defaultTrainings });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Chyba při načítání tréninkového plánu." });
    }
  });

// 📌 Uložit nebo aktualizovat jídelníček pro aktuální týden a rok
router.post("/", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { trainings } = req.body;
      const week = parseInt(req.query.week as string) || getCurrentWeekAndYear().week;
      const year = parseInt(req.query.year as string) || getCurrentWeekAndYear().year;
      console.log('data', {userId,week,year,trainings, body : req.body});
      const existing = await pool.query(
        "SELECT * FROM training_plans WHERE user_id = $1 AND week = $2 AND year = $3",
        [userId, week, year]
      );
  
      if (existing.rows.length > 0) {
        await pool.query(
          "UPDATE training_plans SET trainings = $1 WHERE user_id = $2 AND week = $3 AND year = $4",
          [trainings, userId, week, year]
        );
      } else {
        await pool.query(
          "INSERT INTO training_plans (user_id, week, year, trainings) VALUES ($1, $2, $3, $4)",
          [userId, week, year, trainings]
        );
      }
  
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Chyba při ukládání tréninkového plánu." });
    }
  });
  

export default router;
