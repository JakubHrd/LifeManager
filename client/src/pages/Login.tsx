import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  useMediaQuery,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import serverUrl from "../config";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation() as any;
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const safeJson = async (res: Response) => {
    try { return await res.json(); } catch { return null; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${serverUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // pro httpOnly cookie scénář
        body: JSON.stringify(formData),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setError((data && (data.message || data.error)) || "Přihlášení se nezdařilo");
        setLoading(false);
        return;
      }

      // 1) Token v těle odpovědi (Bearer tok)
      if (data?.token) {
        login(data.token); // uloží token (localStorage/ctx)
      } else {
        // 2) Cookie-based (httpOnly) – ověříme, že jsme přihlášeni
        const me = await fetch(`${serverUrl}/api/user/profile`, { credentials: "include" });
        if (!me.ok) {
          setError("Nelze ověřit přihlášení.");
          setLoading(false);
          return;
        }
        // pokud máš AuthContext, můžeš sem případně doplnit login("") nebo setUser(...)
        login(""); // označí stav jako přihlášený i bez explicitního tokenu
      }

      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch {
      setError("Chyba serveru. Zkuste to prosím znovu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          p: isSmallScreen ? 3 : 5,
          boxShadow: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography
          variant={isSmallScreen ? "h5" : "h4"}
          textAlign="center"
          gutterBottom
        >
          Přihlášení
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            required
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            onChange={handleChange}
            margin="normal"
            disabled={loading}
          />
          <TextField
            fullWidth
            required
            label="Heslo"
            name="password"
            type="password"
            autoComplete="current-password"
            onChange={handleChange}
            margin="normal"
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              py: isSmallScreen ? 1 : 1.5,
              fontSize: isSmallScreen ? "1rem" : "1.1rem",
            }}
          >
            {loading ? <CircularProgress size={22} /> : "Přihlásit se"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
