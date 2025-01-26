import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";
import dotenv from "dotenv";

dotenv.config();

const router: Router = Router();

interface RegisterRequestBody {
    username: string; // Změněno z "name" na "username"
    email: string;
    password: string;
}

// ✅ Explicitní typování `Request` a `Response`
router.post(
    "/register",
    async (req: Request<{}, {}, RegisterRequestBody>, res: Response): Promise<void> => {
        const { username, email, password } = req.body;

        try {
            const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

            if (userExists.rows.length > 0) {
                res.status(400).json({ message: "Uživatel již existuje" });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = await pool.query(
                "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
                [username, email, hashedPassword] // Změň "name" na "username"
            );

            const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET as string, {
                expiresIn: "1h",
            });

            res.status(201).json({ token, user: newUser.rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

interface LoginRequestBody {
    email: string;
    password: string;
  }

  // 🔥 Oprava: Přidání `Promise<void>`
  router.post("/login", async (req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> => {
    const { email, password } = req.body;
  
    try {
      const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  
      if (userResult.rows.length === 0) {
        res.status(400).json({ message: "Uživatel neexistuje" });
        return;
      }
  
      const user = userResult.rows[0];
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ message: "Špatné heslo" });
        return;
      }
  
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
  
      res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Serverová chyba" });
    }
  });

// ✅ Správný export routeru pro TypeScript
export default router;
