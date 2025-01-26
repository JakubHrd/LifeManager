import { Router, Response, NextFunction, Request } from "express";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

interface AuthRequest extends Request {
  user?: { id: number };
}

// Chráněný endpoint pro dashboard
router.get("/", authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthRequest; // Přetypování req na AuthRequest
    if (!authReq.user) {
      res.status(401).json({ message: "Neautorizovaný přístup" });
      return;
    }

    res.json({ message: "Vítejte na dashboardu!", userId: authReq.user.id });
  } catch (error) {
    next(error);
  }
});

export default router;
