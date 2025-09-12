import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {pool} from "../db";
import dotenv from "dotenv";
import { RegisterRequestBody, LoginRequestBody } from "../types/authTypes";
import { issueVerificationForUser } from "../utils/emailVerification";

dotenv.config();

/**
 * Handles user registration.
 *
 * @param req - The request object with the user's data in the body.
 * @param res - The response object.
 *
 * @returns {Promise<void>}
 */
export const registerUser = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response
): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists in the database.
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userExists.rows.length > 0) {
      res.status(400).json({ message: "Uživatel již existuje" });
      return;
    }

    // Hash the user's password.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database.
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    // Generate a JWT token with the user's ID.
    /*const token = jwt.sign(
      { userId: newUser.rows[0].id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    // Return the token and the user's data.
    //res.status(201).json({ token, user: newUser.rows[0] });
    */
    await issueVerificationForUser(newUser.rows[0].id, email, username);
    res.status(201).json({
      message: "Účet vytvořen. Zkontroluj e-mail a dokonči ověření."
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Handles user login.
 *
 * @param req - The request object with the user's email and password in the body.
 * @param res - The response object.
 *
 * @returns {Promise<void>}
 */
export const loginUser = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Find the user in the database.
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      res.status(400).json({ message: "Uživatel neexistuje" });
      return;
    }

    // Get the user from the database result.
    const user = userResult.rows[0];

    // Compare the user's password with the one in the database.
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({ message: "Špatné heslo" });
      return;
    }

    if (!user.email_verified) {
      res.status(403).json({
        code: "EMAIL_NOT_VERIFIED",
        message: "E-mail není ověřen. Zkontroluj schránku nebo si nech poslat nový ověřovací e-mail."
      });
      return;
    }

    // Generate a JWT token with the user's ID.
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    // Return the token and the user's data.
    res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email?: string };
  if (!email) { res.status(400).json({ message: "Chybí e-mail." }); return; }

  try {
    const users = await pool.query(
      "SELECT id, username, email_verified FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );
    // bezpečné odpovědi – neprozrazuj existenci účtu
    if (users.rows.length === 0) { res.json({ message: "Pokud účet existuje, e-mail byl odeslán." }); return; }

    const user = users.rows[0];
    if (user.email_verified) { res.json({ message: "E-mail už je ověřen." }); return; }

    const { verifyLink } = await issueVerificationForUser(user.id, email, user.username);
    // DEV nápověda: vyloguj link (v PROD nebude vadit)
    console.log("[verify] link:", verifyLink);
    res.json({ message: "Ověřovací e-mail odeslán." });
  } catch (e: any) {
    console.error("resendVerification error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const token = String(req.query.token || "");
  if (!token) { res.status(400).json({ message: "Chybí token." }); return; }

  try {
    const r = await pool.query(
      "SELECT id, verification_expires FROM users WHERE verification_token = $1",
      [token]
    );
    if (r.rows.length === 0) { res.status(400).json({ message: "Token je neplatný." }); return; }

    const { id, verification_expires } = r.rows[0];
    if (verification_expires && new Date(verification_expires).getTime() < Date.now()) {
      res.status(400).json({ message: "Token vypršel. Požádej o nový." }); return;
    }

    await pool.query(
      "UPDATE users SET email_verified = true, verification_token = NULL, verification_expires = NULL WHERE id = $1",
      [id]
    );
    res.json({ message: "E-mail ověřen. Můžeš se přihlásit." });
  } catch (e: any) {
    console.error("verifyEmail error:", e);
    res.status(500).json({ message: "Server error" });
  }
};


