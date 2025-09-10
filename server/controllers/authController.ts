import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {pool} from "../db";
import dotenv from "dotenv";
import { RegisterRequestBody, LoginRequestBody } from "../types/authTypes";

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
    const token = jwt.sign(
      { userId: newUser.rows[0].id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // Return the token and the user's data.
    res.status(201).json({ token, user: newUser.rows[0] });
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

