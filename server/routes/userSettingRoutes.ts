/**
 * Router for user setting routes.
 *
 * @remarks
 * This router handles the following endpoints:
 * - GET /api/userSetting: Retrieves the user setting for the current user.
 * - POST /api/userSetting: Upserts the user setting for the current user.
 */

import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getUserSetting,
  upsertUserSetting,
} from "../controllers/userSettingController";

const router = Router();

/**
 * Retrieves the user setting for the current user.
 *
 * @param req Request object containing user information.
 * @param res Response object used to send the response.
 *
 * @returns JSON response with user setting.
 *
 * @swagger
 * /api/userSetting:
 *   get:
 *     summary: Get user setting
 *     description: Retrieves the user setting for the currently authenticated user.
 *     tags: [UserSetting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User setting retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
router.get("/", authMiddleware, getUserSetting);

/**
 * Upserts the user setting for the current user.
 *
 * @param req Request object containing user ID and new user setting data.
 * @param res Response object used to send the response.
 *
 * @returns JSON response confirming insert or update.
 *
 * @swagger
 * /api/userSetting:
 *   post:
 *     summary: Create or update user setting
 *     description: Inserts a new user setting or updates the existing one for the current user.
 *     tags: [UserSetting]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               height:
 *                 type: number
 *                 example: 180
 *               weight:
 *                 type: number
 *                 example: 75
 *               age:
 *                 type: number
 *                 example: 25
 *               goalWeight:
 *                 type: number
 *                 example: 70
 *     responses:
 *       200:
 *         description: User setting upserted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized access
 */
router.post("/", authMiddleware, upsertUserSetting);

export default router;
