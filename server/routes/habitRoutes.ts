import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getHabitPlan,
  saveHabitPlan,
  copyHabitPlan,
} from "../controllers/habitController";

const router = express.Router();

/**
 * Retrieves the habit plan for the authenticated user for the current week.
 * The week and year are passed as query parameters.
 *
 * @param req Request object containing user ID and query parameters (week, year).
 * @param res Response object used to send the JSON response with habit plan.
 *
 * @returns JSON response with the user's habit plan for the selected week.
 *
 * @swagger
 * /api/habits:
 *   get:
 *     summary: Get habit plan for current user and week
 *     description: Retrieves the habit plan for the authenticated user for the given week and year.
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         required: true
 *         description: Week number (1–52)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Full year (e.g., 2025)
 *     responses:
 *       200:
 *         description: Habit plan retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
router.get("/", authMiddleware, getHabitPlan);

/**
 * Saves the habit plan for the authenticated user for the current week.
 * The week and year are passed as query parameters.
 *
 * @param req Request object with user ID, week/year query, and habits in body.
 * @param res Response object used to confirm save.
 *
 * @returns JSON response confirming save or update.
 *
 * @swagger
 * /api/habits:
 *   post:
 *     summary: Save or update habit plan
 *     description: Saves or updates the habit plan for the authenticated user and selected week/year.
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         required: true
 *         description: Week number
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Year
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               habits:
 *                 type: object
 *                 example:
 *                   Monday:
 *                     - "Drink 2L water"
 *                     - "Read 10 pages"
 *                   Tuesday:
 *                     - "Exercise 30 minutes"
 *     responses:
 *       200:
 *         description: Habit plan saved successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized access
 */
router.post("/", authMiddleware, saveHabitPlan);

/**
 * Copies the habit plan from the current week to the next week for a user.
 * If a habit plan already exists for the next week, it can optionally overwrite
 * based on the force overwrite flag.
 *
 * @param req Request object with user ID, current week/year query, and optional force flag in body.
 * @param res Response object confirming copy operation.
 *
 * @returns JSON response with copy result.
 *
 * @swagger
 * /api/habits/copy:
 *   post:
 *     summary: Copy habit plan to next week
 *     description: Copies the habit plan from the current week to the next week. Optionally overwrites if a plan exists.
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         required: true
 *         description: Current week number
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Current year
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               force:
 *                 type: boolean
 *                 description: Overwrite target week if true
 *     responses:
 *       200:
 *         description: Habit plan copied successfully
 *       400:
 *         description: Copy failed or invalid input
 *       401:
 *         description: Unauthorized access
 */
router.post("/copy", authMiddleware, copyHabitPlan);

export default router;
