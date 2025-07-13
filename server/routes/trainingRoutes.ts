/**
 * Router for training routes.
 *
 * @remarks
 * This router handles the following endpoints:
 * - GET /api/trainings: Retrieves the training plan for the current user for a specific week and year.
 * - POST /api/trainings: Saves the training plan for the current user for a specific week and year.
 */

import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getTrainingPlan,
  saveTrainingPlan,
} from "../controllers/trainingController";

const router = express.Router();

/**
 * Retrieves the training plan for the current user for a specific week and year.
 * 
 * @param req Request object containing user ID and query parameters (week, year).
 * @param res Response object used to send the JSON training plan.
 * 
 * @returns JSON response with the training plan for the selected week.
 * 
 * @swagger
 * /api/trainings:
 *   get:
 *     summary: Get training plan for current user and week
 *     description: Retrieves the training plan for the current user for a specific week and year. If no plan exists, an empty/default plan is returned.
 *     tags: [Trainings]
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
 *         description: Training plan retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
router.get("/", authMiddleware, getTrainingPlan);

/**
 * Saves the training plan for the current user for a specific week and year.
 * 
 * @param req Request object containing user ID, query parameters (week, year), and training data in the body.
 * @param res Response object used to confirm save operation.
 * 
 * @returns JSON response with save confirmation.
 * 
 * @swagger
 * /api/trainings:
 *   post:
 *     summary: Save or update training plan
 *     description: Saves or updates the training plan for the current user and selected week/year.
 *     tags: [Trainings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trainings
 *             properties:
 *               trainings:
 *                 type: object
 *                 description: Training schedule for the week
 *                 example:
 *                   Monday:
 *                     morning: "Stretching"
 *                     main: "Chest + Triceps"
 *                     evening: "Walk"
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
 *     responses:
 *       200:
 *         description: Training plan saved successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized access
 */
router.post("/", authMiddleware, saveTrainingPlan);

export default router;
