import React, { useState } from "react";
import { Box, Button, Container, TextField, Typography, Alert, Paper,Stack } from "@mui/material";
import { loginApi, resendVerificationApi} from "../api";
import { useAuth } from "../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
//import {resendVerificationApi} from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // << místo setToken bereme login z contextu
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowResend(false);
    try {
      const { token } = await loginApi({ email: email.trim(), password });
      // pokud backend vrátí token -> uloží se do localStorage
      // pokud nevrátí (cookie-auth), pošleme prázdný string (tvůj context to řeší jako "cookie" fallback)
      login(token ?? "");
      const next = location?.state?.from?.pathname ?? "/";
      navigate(next, { replace: true });
    } catch(err: any) {
      const msg = err?.message || "Přihlášení selhalo. Zkontroluj e-mail a heslo.";

      // pokud server vrátil 403/EMAIL_NOT_VERIFIED nebo text naráží na ověření
      const textLooksLikeUnverified =
        /EMAIL_NOT_VERIFIED/i.test(msg) || /ověřen/i.test(msg) || /verify/i.test(msg);

      if (textLooksLikeUnverified || err?.status === 403) {
        setError("E-mail není ověřen. Zkontroluj schránku nebo si nech poslat nový ověřovací e-mail.");
        setShowResend(true);
      }else{
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

const resend = async () => {
    setResendMsg(null);
    if (!email.trim()) {
      setResendMsg("Zadej prosím e-mail a zkus to znovu.");
      return;
    }
    try {
      setResendLoading(true);
      const r = await resendVerificationApi(email.trim());
      setResendMsg(r.message || "Ověřovací e-mail byl odeslán.");
    } catch (e: any) {
      setResendMsg(e?.message || "Odeslání se nezdařilo.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Přihlášení
        </Typography>

        {/* ▼ TADY JE ERROR ALERT */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* ▼ A HNED POD NÍM „RESEND“ UI (zobrazí se jen když je to relevantní) */}
        {showResend && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Button onClick={resend} size="small" variant="text" disabled={resendLoading}>
              {resendLoading ? "Odesílám…" : "Poslat znovu ověřovací e-mail"}
            </Button>
            {resendMsg && <Alert severity="info" sx={{ py: 0.5 }}>{resendMsg}</Alert>}
          </Stack>
        )}

        <Box component="form" onSubmit={onSubmit}>
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            autoComplete="email"
            inputMode="email"
            required
          />
          <TextField
            label="Heslo"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            autoComplete="current-password"
            required
          />
          <Button type="submit" fullWidth disabled={loading} sx={{ mt: 2 }} variant="contained">
            {loading ? "Přihlašuji…" : "Přihlásit"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}