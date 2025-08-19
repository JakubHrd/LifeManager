import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  useMediaQuery,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import serverUrl from "../config";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${serverUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Přihlášení se nezdařilo");
        return;
      }

      const data = await res.json();
      login(data.token);
      navigate("/dashboard");
    } catch {
      setError("Chyba serveru. Zkuste to prosím znovu.");
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

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="E-mail"
            name="email"
            type="email"
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Heslo"
            name="password"
            type="password"
            onChange={handleChange}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: isSmallScreen ? 1 : 1.5,
              fontSize: isSmallScreen ? "1rem" : "1.1rem",
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
            }}
          >
            Přihlásit se
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
