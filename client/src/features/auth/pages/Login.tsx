import React, { useState } from "react";
import { Box, Button, Container, TextField, Typography, Alert, Paper } from "@mui/material";
import { loginApi } from "../api";
import { useAuth } from "../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // << místo setToken bereme login z contextu
  const navigate = useNavigate();
  const location = useLocation() as any;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await loginApi({ email: email.trim(), password });
      // pokud backend vrátí token -> uloží se do localStorage
      // pokud nevrátí (cookie-auth), pošleme prázdný string (tvůj context to řeší jako "cookie" fallback)
      login(token ?? "");
      const next = location?.state?.from?.pathname ?? "/";
      navigate(next, { replace: true });
    } catch {
      setError("Přihlášení selhalo. Zkontroluj e-mail a heslo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Přihlášení</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
