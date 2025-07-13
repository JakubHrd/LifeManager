/**
 * Router for user routes.
 *
 * @remarks
 * This router handles user profile retrieval and updates.
 */

import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  updateUser,
  getUserProfile,
} from "../controllers/userController";

const router = Router();

/**
 * Updates the profile of the current user.
 *
 * @param req Request object containing user ID and updated profile data in the body.
 * @param res Response object used to send the update result.
 *
 * @returns JSON response confirming the update.
 *
 * @swagger
 * /api/user:
 *   put:
 *     summary: Update user profile
 *     description: Updates the profile information of the currently authenticated user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized access
 */
router.put("/", authMiddleware, updateUser);

/**
 * Retrieves the profile information of the current user.
 *
 * @param req Request object containing user ID.
 * @param res Response object used to return the user profile data.
 *
 * @returns JSON response with the user's profile.
 *
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves profile information for the authenticated user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
router.get("/profile", authMiddleware, getUserProfile);

export default router;
