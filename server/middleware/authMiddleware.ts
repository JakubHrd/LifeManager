import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthRequest } from "../types/authTypes";

dotenv.config();

/**
 * Middleware to verify JWT token in the Authorization header.
 * Adds `user.id` to the request if valid.
 *
 * @param req - AuthRequest object (extended Express request)
 * @param res - Express Response object
 * @param next - Next function to pass control
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized access" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };

    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
}
