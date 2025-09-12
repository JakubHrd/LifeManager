import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.MAIL_FROM || "LifeManager <no-reply@lifemanager.app>";
const secure = String(process.env.SMTP_SECURE || (port === 465 ? "true" : "false")).toLowerCase() === "true";

const transporter = (host && user && pass)
  ? nodemailer.createTransport({ host, port, secure, auth: { user, pass }, logger: true, debug: true })
  : null;

export async function verifySmtp() {
  if (!transporter) return { ok: false, message: "SMTP not configured (missing host/user/pass)" };
  try {
    await transporter.verify();
    return { ok: true, message: `SMTP OK (${host}:${port}, secure=${secure})` };
  } catch (e: any) {
    return { ok: false, message: e?.message || "SMTP verify failed" };
  }
}

export async function sendMail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.log("=== DEV MAIL (no SMTP configured) ===");
    console.log("From:", from);
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("HTML:\n", html);
    console.log("=====================================");
    return;
  }
  await transporter.sendMail({ from, to, subject, html });
}

export function makeTestHtml(msg: string) {
  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto;line-height:1.5">
      <h2>LifeManager – test e-mailu</h2>
      <p>${msg}</p>
    </div>
  `;
}
