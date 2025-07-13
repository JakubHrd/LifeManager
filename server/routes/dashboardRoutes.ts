import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getDashboard } from "../controllers/dashboardController";

/**
 * Router for dashboard-related routes.
 *
 * @remarks
 * Provides access to the authenticated user's dashboard data.
 */
const router = Router();

/**
 * Retrieves dashboard information for the authenticated user.
 *
 * @param req Request object containing user ID.
 * @param res Response object returning the dashboard data.
 *
 * @returns JSON object with user's dashboard details.
 *
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     description: Returns dashboard information for the currently authenticated user.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
router.get("/", authMiddleware, getDashboard);

export default router;
