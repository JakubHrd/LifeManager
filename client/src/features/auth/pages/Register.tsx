import React, { useState } from "react";
import { Box, Button, Container, TextField, Typography, Alert, Paper } from "@mui/material";
import { registerApi } from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);
    try {
      await registerApi({ username, email, password });
      setOk(true);
      setTimeout(() => navigate("/login", { replace: true }), 800);
    } catch {
      setError("Registrace selhala. Zkus to znovu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Registrace</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {ok && <Alert severity="success" sx={{ mb: 2 }}>Účet vytvořen. Přesměrovávám na přihlášení…</Alert>}
        <Box component="form" onSubmit={onSubmit}>
          <TextField
            label="Uživatelské jméno"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Heslo"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" fullWidth disabled={loading} sx={{ mt: 2 }} variant="contained">
            {loading ? "Zakládám…" : "Zaregistrovat"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
