/**
 * Controller for user operations.
 */

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../db";
import { UpdateUserRequest } from "../types/userTypes";

/**
 * Updates user data.
 *
 * This function handles updating a user's username, email, and password.
 * It first checks for the user's authentication, then updates the provided fields.
 *
 * @param {Request<{}, {}, UpdateUserRequest>} req - The request object containing the user data to update.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
export const updateUser = async (
  req: Request<{}, {}, UpdateUserRequest>,
  res: Response
): Promise<void> => {
  const { username, email, password } = req.body;
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized access." });
    return;
  }

  try {
    if (username) {
      // Update the user's username
      await pool.query("UPDATE users SET username = $1 WHERE id = $2", [username, userId]);
    }

    if (email) {
      // Check if the email is already taken by another user
      const emailCheck = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
      if (emailCheck.rows.length > 0) {
        res.status(400).json({ message: "Email is already taken by another account." });
        return;
      }
      // Update the user's email
      await pool.query("UPDATE users SET email = $1 WHERE id = $2", [email, userId]);
    }

    if (password) {
      // Generate salt and hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // Update the user's password
      await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);
    }

    res.json({ message: "Data was successfully updated." });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * Gets user profile.
 *
 * This function retrieves the profile information of an authenticated user,
 * specifically the username.
 *
 * @param {Request} req - The request object containing the user ID.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized access." });
    return;
  }

  try {
    // Retrieve the user's username from the database
    const userResult = await pool.query("SELECT username FROM users WHERE id = $1", [userId]);

    if (userResult.rows.length === 0) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.json({ username: userResult.rows[0].username });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Server error." });
  }
};

