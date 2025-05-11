import express, { Request, Response } from "express";
import pool from "../db";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

function formatDateToString(date: Date | null): string | null {
    if (!date) return null;
  
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // měsíc +1 protože 0 = leden
    const day = date.getDate().toString().padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  }

// 📌 Výchozí struktura návyků (klidně uprav na {} pokud budeš chtít ukládat návyky podle názvu)
const defaultUserSetting = {};
router.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      console.log(`userId: ${userId}`);
  
      const result = await pool.query(
        "SELECT height_cm, weight_kg, birth_date, gender, target_weight_kg, main_goal FROM user_setting WHERE user_id = $1",
        [userId]
      );
      console.log('result get userSetting',{result})

      if (result.rows.length === 0) {
        const result = await pool.query(
            "INSERT INTO user_setting (user_id) VALUES ($1)",
            [userId]
          );  
          console.log('result INSERT INTO user_setting',{result})      
        /*await pool.query(
          "INSERT INTO user_setting (user_id, height_cm, weight_kg, birth_date, gender,target_weight_kg,main_goal) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [userId, null, null, null,null,null,null]
        );*/

        res.json({ 
            height_cm: null,
            weight_kg: null,
            birth_date: null,
            gender: null,
            target_weight_kg: null,
            main_goal: null
          });
        return;
      }
      const birthDate = formatDateToString(result.rows[0].birth_date);
      // Vracíme pouze habits
      res.json({ 
        height_cm : result.rows[0].height_cm,
        weight_kg : result.rows[0].weight_kg,
        birth_date : birthDate,
        gender : result.rows[0].gender,
        target_weight_kg : result.rows[0].target_weight_kg,
        main_goal : result.rows[0].main_goal, 
     });
    } catch (err) {
        console.error("❌ Chyba při načítání uživatelského nastavení:", err);
        res.status(500).json({ message: "Chyba serveru při načítání uživatelského nastavení." });
    }
  });
  // POST - vytvoření nebo aktualizace user setting
router.post("/", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const {
        height_cm,
        weight_kg,
        birth_date,
        gender,
        target_weight_kg,
        main_goal,
      } = req.body;
      console.log('data',{
        userId,
        height_cm,
        weight_kg,
        birth_date,
        gender,
        target_weight_kg,
        main_goal
      })
      // Jednoduchá validace vstupů (můžeš si upravit podle potřeby)
      if (!["male", "female", "other"].includes(gender) && gender !== null) {
        res.status(400).json({ message: "Neplatná hodnota pro gender." });
        return;
      }
      if (!["lose_weight", "maintain_weight", "gain_muscle", "improve_health"].includes(main_goal) && main_goal !== null) {
        res.status(400).json({ message: "Neplatná hodnota pro main_goal." });
        return;
      }
  
      // Ověř, jestli už má user záznam v tabulce
      const existing = await pool.query(
        "SELECT id FROM user_setting WHERE user_id = $1",
        [userId]
      );
  
      if (existing.rows.length > 0) {
        console.log('existing',{existing});
        // Pokud existuje ➔ UPDATE
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
        // Pokud neexistuje ➔ INSERT
        await pool.query(
          `INSERT INTO user_setting (user_id, height_cm, weight_kg, birth_date, gender, target_weight_kg, main_goal)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, height_cm, weight_kg, birth_date, gender, target_weight_kg, main_goal]
        );
      }
  
      res.status(200).json({ message: "Uživatelské nastavení bylo úspěšně uloženo." });
    } catch (error) {
      console.error("❌ Chyba při ukládání uživatelského nastavení:", error);
      res.status(500).json({ message: "Chyba serveru při ukládání nastavení." });
    }
  });

  export default router;