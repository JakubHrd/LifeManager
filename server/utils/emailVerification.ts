import crypto from "crypto";
import { pool } from "../db";
import { FRONTEND_URL } from "../config/env";
import { sendMail } from "./mailer";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function appFrontendUrl() {
  return (FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
}

export async function issueVerificationForUser(userId: number, toEmail: string, username?: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + VERIFY_TTL_MS);

  await pool.query(
    "UPDATE users SET verification_token = $1, verification_expires = $2 WHERE id = $3",
    [token, expires, userId]
  );

  const verifyLink = `${appFrontendUrl()}/auth/verify?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto;line-height:1.5">
      <h2>Ahoj${username ? " " + username : ""} 👋</h2>
      <p>Potvrď prosím svůj e-mail pro aplikaci <b>LifeManager</b>.</p>
      <p><a href="${verifyLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">Ověřit e-mail</a></p>
      <p>Odkaz vyprší za 24 hodin. Pokud jsi to nebyl ty, ignoruj tento e-mail.</p>
    </div>
  `;

  await sendMail(toEmail, "Ověření e-mailu – LifeManager", html);

  // vrátíme token (hodí se pro DEV test)
  return { token, verifyLink };
}
