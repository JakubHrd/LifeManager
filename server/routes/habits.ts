import express, { Request, Response } from "express";
import pool from "../db";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// 📌 Funkce pro získání aktuálního týdne a roku
const getCurrentWeekAndYear = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const week = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  return { week, year: now.getFullYear() };
};

// 📌 Výchozí struktura návyků (klidně uprav na {} pokud budeš chtít ukládat návyky podle názvu)
const defaultHabits = {};

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const week =
      parseInt(req.query.week as string) || getCurrentWeekAndYear().week;
    const year =
      parseInt(req.query.year as string) || getCurrentWeekAndYear().year;

    const result = await pool.query(
      "SELECT habits FROM habit_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, week, year]
    );
    console.log("result - SELECT habits FROM habit_plans", { result });
    console.log(`number of founded rows : ${result.rows.length}`);
    if (result.rows.length === 0) {
      console.log("INSERT INTO params", {
        userId,
        week,
        year,
        stringify: JSON.stringify(defaultHabits),
      });
      // Pokud záznam neexistuje, vytvoříme nový s prázdnou strukturou
      await pool.query(
        "INSERT INTO habit_plans (user_id, week, year, habits) VALUES ($1, $2, $3, $4)",
        [userId, week, year, JSON.stringify(defaultHabits)]
      );
      console.log("defaultHabits2", { defaultHabits });
      console.log("JSON.stringify(defaultHabits)2", {
        stringify: JSON.stringify(defaultHabits),
      });
      res.json({ habits: defaultHabits });
      return;
    }

    // Vracíme pouze habits
    res.json({ habits: result.rows[0].habits });
  } catch (err) {
    console.error("❌ Chyba při načítání návyků:", err);
    res.status(500).json({ message: "Chyba serveru při načítání návyků." });
  }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { habits } = req.body;
    const week =
      parseInt(req.query.week as string) || getCurrentWeekAndYear().week;
    const year =
      parseInt(req.query.year as string) || getCurrentWeekAndYear().year;

    const existing = await pool.query(
      "SELECT id FROM habit_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, week, year]
    );

    const serializedHabits = JSON.stringify(habits);

    if (existing.rows.length > 0) {
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
  } catch (err) {
    console.error("❌ Chyba při ukládání návyků:", err);
    res.status(500).json({ message: "Chyba serveru při ukládání návyků." });
  }
});

router.post("/copy", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const currentWeek = parseInt(req.query.week as string);
    const currentYear = parseInt(req.query.year as string);
    const forceOverwrite = req.query.force === "true";

    if (!currentWeek || !currentYear) {
      res.status(400).json({ message: "Chybí parametr 'week' nebo 'year'." });
      return;
    }

    const nextWeek = currentWeek + 1;

    const current = await pool.query(
      "SELECT habits FROM habit_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, currentWeek, currentYear]
    );
    console.log('current',{current})
    if (current.rows.length === 0) {
      res
        .status(404)
        .json({ message: "Pro aktuální týden nejsou žádné návyky." });
      return;
    }

    const originalHabits = current.rows[0].habits;

    const copiedHabits: Record<string, Record<string, boolean>> = {};
    for (const habitName in originalHabits) {
      copiedHabits[habitName] = {};
    }

    const exists = await pool.query(
      "SELECT habits FROM habit_plans WHERE user_id = $1 AND week = $2 AND year = $3",
      [userId, nextWeek, currentYear]
    );
    console.log('exists',{
        exists, 
        stringify : JSON.stringify(exists?.rows), 
        fields : exists.fields,
        habits : exists.rows[0].habits
    });

    if (exists.rows.length > 0) {
        const existingHabits = exists.rows[0].habits;
        const hasHabits = existingHabits && Object.keys(existingHabits).length > 0;
        console.log(`hasHabits: ${hasHabits}`);
      if (hasHabits && !forceOverwrite) {
        res
          .status(409)
          .json({ message: "Návyky pro příští týden už existují." });
        return;
      }

      // Přepisujeme stávající záznam
      await pool.query(
        "UPDATE habit_plans SET habits = $1 WHERE user_id = $2 AND week = $3 AND year = $4",
        [JSON.stringify(copiedHabits), userId, nextWeek, currentYear]
      );

      res.json({
        success: true,
        message: `Návyky byly přepsány pro týden ${nextWeek}`,
      });
      return;
    }

    // Vložení nového záznamu
    await pool.query(
      "INSERT INTO habit_plans (user_id, week, year, habits) VALUES ($1, $2, $3, $4)",
      [userId, nextWeek, currentYear, JSON.stringify(copiedHabits)]
    );

    res.json({
      success: true,
      message: `Návyky byly zkopírovány do týdne ${nextWeek}`,
    });
  } catch (err) {
    console.error("❌ Chyba při kopírování návyků:", err);
    res.status(500).json({ message: "Chyba serveru při kopírování návyků." });
  }
});

export default router;
