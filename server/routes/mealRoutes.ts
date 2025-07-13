import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getMealPlan,
  saveMealPlan,
  copyMealPlan,
} from "../controllers/mealController";

/**
 * Router for meal routes.
 */
const mealRoutes = express.Router();

/**
 * Retrieves the meal plan for the current user and week.
 * If no meal plan exists, a default one is created.
 * 
 * @param req Request object containing user ID and query parameters for week and year.
 * @param res Response object used to send the JSON response.
 * 
 * @returns JSON response with the meal plan.
 * 
 * @swagger
 * /api/meals:
 *   get:
 *     summary: Get meal plan for current user and week
 *     description: Retrieves the meal plan for the current user and week. If no meal plan exists, a default one is created.
 *     tags: [Meals]
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
 *         description: Meal plan successfully retrieved
 *       401:
 *         description: Unauthorized access
 */
mealRoutes.get("/", authMiddleware, getMealPlan);

/**
 * Saves the meal plan for the current user and week.
 * If a meal plan already exists, it is updated.
 * 
 * @param req Request object containing user ID, query parameters (week, year), and meals data in the body.
 * @param res Response object used to send the JSON response.
 * 
 * @returns JSON response with status of the operation.
 * 
 * @swagger
 * /api/meals:
 *   post:
 *     summary: Save or update meal plan
 *     description: Saves a new meal plan or updates the existing one for the current user and selected week/year.
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meals
 *             properties:
 *               meals:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                     morning:
 *                       type: string
 *                     main:
 *                       type: string
 *                     evening:
 *                       type: string
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
 *         description: Meal plan saved or updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized access
 */
mealRoutes.post("/", authMiddleware, saveMealPlan);

/**
 * Copies the meal plan from the current week to the next week.
 * Allows optional overwrite of existing plans.
 * 
 * @param req Request object containing user ID, current week and year in query, and optional force flag in body.
 * @param res Response object used to send the JSON response.
 * 
 * @returns JSON response with copy status.
 * 
 * @swagger
 * /api/meals/copy:
 *   post:
 *     summary: Copy meal plan to next week
 *     description: Copies the meal plan from the current week to the following week. Allows optional overwrite if a plan already exists.
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         required: true
 *         description: Source week
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Source year
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               force:
 *                 type: boolean
 *                 description: Overwrite existing plan in the target week if true
 *     responses:
 *       200:
 *         description: Meal plan copied successfully
 *       400:
 *         description: Copy failed due to invalid input
 *       401:
 *         description: Unauthorized access
 */
mealRoutes.post("/copy", authMiddleware, copyMealPlan);

export { mealRoutes };
