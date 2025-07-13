/**
 * Router for handling ChatGPT requests.
 *
 * @packageDocumentation
 */

import express, { Request, Response } from "express";
import { handleChatGPTRequest } from "../controllers/chatgptController";

/**
 * Router for handling ChatGPT requests.
 */
const router = express.Router();

/**
 * Handle a request to generate a response from ChatGPT.
 *
 * @param req The request object containing input message(s) for ChatGPT.
 * @param res The response object used to return the generated reply.
 *
 * @returns JSON response with the ChatGPT-generated content.
 *
 * @swagger
 * /api/chat/chatgpt:
 *   post:
 *     summary: Generate response from ChatGPT
 *     description: Accepts user input and returns a generated response from ChatGPT.
 *     tags: [ChatGPT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *                 description: An array of messages representing the conversation so far
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       example: user
 *                     content:
 *                       type: string
 *                       example: "What is the weather today?"
 *     responses:
 *       200:
 *         description: ChatGPT response generated successfully
 *       400:
 *         description: Invalid input format
 *       500:
 *         description: Error generating ChatGPT response
 */
router.post("/chatgpt", handleChatGPTRequest);

export default router;
