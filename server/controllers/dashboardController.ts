import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authTypes";

/**
 * Retrieves the dashboard data for the authenticated user.
 *
 * @param req - Authenticated request with user ID
 * @param res - Response object
 * @param next - Next middleware
 */
export const getDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }

    res.json({
      message: "Welcome to the dashboard!",
      userId: req.user.id,
    });
  } catch (error) {
    next(error);
  }
};
