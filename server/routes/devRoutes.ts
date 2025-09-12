import { Router, Request, Response } from "express";
import { sendMail, makeTestHtml, verifySmtp } from "../utils/mailer";

const devRouter = Router();

devRouter.get(
  "/mail-ping",
  async (req: Request, res: Response): Promise<void> => {
    const to = String(req.query.to || "");
    if (!to) {
      res.status(400).json({ message: "Chybí ?to=email@example.com" });
      return;
    }
    try {
      await sendMail(to, "LifeManager – mail ping", makeTestHtml("Ahoj! Tohle je test."));
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e?.message || "sendMail failed" });
    }
  }
);

devRouter.get("/mail-debug", async (_req, res) => {
  const r = await verifySmtp();
  res.json(r);
});

export default devRouter;
