import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../db";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
}

// 🔥 Oprava typu návratu – Musí vracet `Promise<void>`
router.put("/", authMiddleware, async (req: Request<{}, {}, UpdateUserRequest>, res: Response): Promise<void> => {
  const { username, email, password } = req.body;
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json({ message: "Neautorizovaný přístup." });
    return;
  }

  try {
    if (username) {
      await pool.query("UPDATE users SET username = $1 WHERE id = $2", [username, userId]);
    }

    if (email) {
      const emailCheck = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
      if (emailCheck.rows.length > 0) {
        res.status(400).json({ message: "E-mail je již používán jiným účtem." });
        return;
      }
      await pool.query("UPDATE users SET email = $1 WHERE id = $2", [email, userId]);
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);
    }

    res.json({ message: "Údaje byly úspěšně aktualizovány." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Chyba serveru." });
  }
});

router.get("/profile", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
  
    if (!userId) {
      res.status(401).json({ message: "Neautorizovaný přístup." });
      return;
    }
  
    try {
      const userResult = await pool.query("SELECT username FROM users WHERE id = $1", [userId]);
  
      if (userResult.rows.length === 0) {
        res.status(404).json({ message: "Uživatel nenalezen." });
        return;
      }
  
      res.json({ username: userResult.rows[0].username });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Chyba serveru." });
    }
  });

export default router;
