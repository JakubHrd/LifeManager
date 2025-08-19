import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const EMAIL_REGEX =
  // konzervativní kontrola e-mailu
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const Settings: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const [topAlert, setTopAlert] = useState<{
    message: string;
    severity: "success" | "error" | "info";
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // živá validace
    if (name === "email" && value && !EMAIL_REGEX.test(value)) {
      setErrors((p) => ({ ...p, email: "Neplatný formát e-mailu" }));
    } else if (name === "email") {
      setErrors((p) => ({ ...p, email: undefined }));
    }

    if (name === "password" && value && value.length < 6) {
      setErrors((p) => ({ ...p, password: "Heslo musí mít alespoň 6 znaků" }));
    } else if (name === "password") {
      setErrors((p) => ({ ...p, password: undefined }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateBeforeSubmit = () => {
    const newErrors: typeof errors = {};
    if (formData.email && !EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "Neplatný formát e-mailu";
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Heslo musí mít alespoň 6 znaků";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nothingFilled =
    !formData.username.trim() &&
    !formData.email.trim() &&
    !formData.password.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopAlert(null);

    if (nothingFilled) {
      setTopAlert({
        message: "Vyplň alespoň jedno pole, které chceš změnit.",
        severity: "info",
      });
      return;
    }

    if (!validateBeforeSubmit()) return;

    const token = localStorage.getItem("token");
    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        // může vrátit JSON i plain text — bezpečně zkusíme JSON -> fallback na text
        let serverMessage = "Chyba při ukládání změn.";
        try {
          const data = await res.json();
          serverMessage = data.message || serverMessage;
        } catch {
          const text = await res.text();
          if (text) serverMessage = text;
        }
        setTopAlert({ message: serverMessage, severity: "error" });
        setSnack({ open: true, message: serverMessage, severity: "error" });
      } else {
        setTopAlert({
          message: "Údaje byly úspěšně aktualizovány.",
          severity: "success",
        });
        setSnack({
          open: true,
          message: "Uloženo ✅",
          severity: "success",
        });
        // necháme vyplněné hodnoty, ať uživatel vidí co měnil
        // pokud bys chtěl vyčistit, odkomentuj:
        // setFormData({ username: "", email: "", password: "" });
      }
    } catch (error) {
      console.error("Chyba při aktualizaci:", error);
      const msg = "Chyba připojení k serveru.";
      setTopAlert({ message: msg, severity: "error" });
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
        }}
      >
        <Stack spacing={2} alignItems="stretch">
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Nastavení účtu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Vyplň jen ta pole, která chceš změnit. Ostatní nech prázdná.
            </Typography>
          </Box>

          {topAlert && (
            <Alert
              severity={topAlert.severity}
              onClose={() => setTopAlert(null)}
            >
              {topAlert.message}
            </Alert>
          )}

          <Divider sx={{ my: 1 }} />

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: "grid", gap: 2 }}
          >
            <TextField
              label="Nové uživatelské jméno"
              name="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              autoComplete="username"
              inputProps={{ maxLength: 40 }}
            />

            <TextField
              label="Nový e-mail"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email || " "}
              fullWidth
              autoComplete="email"
            />

            <TextField
              label="Nové heslo"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              error={Boolean(errors.password)}
              helperText={errors.password || "Min. 6 znaků"}
              fullWidth
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "Skrýt heslo" : "Zobrazit heslo"
                      }
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              sx={{
                mt: 1,
                borderRadius: 2,
              }}
            >
              {submitting ? (
                <>
                  <CircularProgress
                    size={20}
                    sx={{ mr: 1, color: "inherit" }}
                  />
                  Ukládání…
                </>
              ) : (
                "Uložit změny"
              )}
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
