import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Paper,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import serverUrl from "../config";

type Gender = "male" | "female" | "other" | null;
type MainGoal = "lose_weight" | "maintain_weight" | "gain_muscle" | "improve_health" | null;

interface UserSetting {
  height_cm: number | null;
  weight_kg: number | null;
  birth_date: string | null;
  gender: Gender;
  target_weight_kg: number | null;
  main_goal: MainGoal;
}

const emptySetting: UserSetting = {
  height_cm: null,
  weight_kg: null,
  birth_date: null,
  gender: null,
  target_weight_kg: null,
  main_goal: null,
};

const UserSettingForm: React.FC = () => {
  const [userSetting, setUserSetting] = useState<UserSetting>(emptySetting);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof UserSetting, string>>>({});
  const [topAlert, setTopAlert] = useState<{ message: string; severity: "success" | "error" | "info" } | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // 🔄 Načtení nastavení z API
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${serverUrl}/api/userSetting`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // ošetření případných chybějících klíčů
        setUserSetting({
          height_cm: data?.height_cm ?? null,
          weight_kg: data?.weight_kg ?? null,
          birth_date: data?.birth_date ?? null,
          gender: (data?.gender as Gender) ?? null,
          target_weight_kg: data?.target_weight_kg ?? null,
          main_goal: (data?.main_goal as MainGoal) ?? null,
        });
      } catch (e) {
        console.error("Chyba při načítání nastavení", e);
        setTopAlert({ message: "Nepodařilo se načíst tvoje nastavení.", severity: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 👉 Live validace
  const validate = (state: UserSetting) => {
    const next: Partial<Record<keyof UserSetting, string>> = {};

    if (state.height_cm != null) {
      if (state.height_cm <= 0) next.height_cm = "Zadej kladnou výšku";
      if (state.height_cm > 280) next.height_cm = "Tohle asi nebude správná výška 🙂";
    }
    if (state.weight_kg != null) {
      if (state.weight_kg <= 0) next.weight_kg = "Zadej kladnou váhu";
      if (state.weight_kg > 500) next.weight_kg = "Tohle asi nebude správná váha 🙂";
    }
    if (state.target_weight_kg != null) {
      if (state.target_weight_kg <= 0) next.target_weight_kg = "Zadej kladnou cílovou váhu";
      if (state.target_weight_kg > 500) next.target_weight_kg = "Cílová váha je mimo realistický rozsah";
    }
    // birth_date: povolíme prázdné; když vyplněné, tak do budoucna ne
    if (state.birth_date) {
      const today = new Date();
      const d = new Date(state.birth_date);
      if (Number.isNaN(d.getTime())) next.birth_date = "Neplatné datum";
      else if (d > today) next.birth_date = "Datum narození nemůže být v budoucnu";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  useEffect(() => {
    validate(userSetting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSetting.height_cm, userSetting.weight_kg, userSetting.target_weight_kg, userSetting.birth_date]);

  const handleInputNumber = (name: keyof UserSetting) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const val = raw === "" ? null : Number(raw);
    setUserSetting((p) => ({ ...p, [name]: Number.isNaN(val) ? null : val }));
  };

  const handleInputDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUserSetting((p) => ({ ...p, birth_date: value || null }));
  };

  const handleSelect =
    (name: "gender" | "main_goal") =>
    (e: SelectChangeEvent<string>) => {
      const value = e.target.value as Gender | MainGoal | "";
      setUserSetting((p) => ({ ...p, [name]: value === "" ? null : (value as any) }));
    };

  const canSubmit = useMemo(() => {
    // můžeš uložit i prázdná pole => backend si je drží jako null
    // jen nesmí být validační chyba a nesmí probíhat ukládání
    return Object.keys(errors).length === 0 && !saving;
  }, [errors, saving]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopAlert(null);

    if (!validate(userSetting)) {
      setTopAlert({ message: "Zkontroluj prosím zvýrazněná pole.", severity: "error" });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${serverUrl}/api/userSetting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userSetting),
      });

      if (!res.ok) {
        let msg = "Chyba při ukládání.";
        try {
          const data = await res.json();
          msg = data.message || msg;
        } catch {
          const t = await res.text();
          if (t) msg = t;
        }
        setTopAlert({ message: msg, severity: "error" });
        setSnack({ open: true, message: msg, severity: "error" });
      } else {
        setTopAlert({ message: "Nastavení bylo úspěšně uloženo.", severity: "success" });
        setSnack({ open: true, message: "Uloženo ✅", severity: "success" });
      }
    } catch (error) {
      console.error("Chyba při odesílání dat", error);
      const msg = "Chyba serveru.";
      setTopAlert({ message: msg, severity: "error" });
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Načítám tvoje nastavení…
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Moje nastavení
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Vyplň, co chceš používat pro výpočty jídelníčku a tréninku. Všechna pole jsou volitelná.
            </Typography>
          </Box>

          {topAlert && (
            <Alert severity={topAlert.severity} onClose={() => setTopAlert(null)}>
              {topAlert.message}
            </Alert>
          )}

          <Divider />

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "grid", gap: 2 }}>
            <TextField
              label="Výška"
              type="number"
              name="height_cm"
              value={userSetting.height_cm ?? ""}
              onChange={handleInputNumber("height_cm")}
              fullWidth
              error={Boolean(errors.height_cm)}
              helperText={errors.height_cm || " "}
              InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
              inputProps={{ min: 0, max: 280 }}
            />

            <TextField
              label="Váha"
              type="number"
              name="weight_kg"
              value={userSetting.weight_kg ?? ""}
              onChange={handleInputNumber("weight_kg")}
              fullWidth
              error={Boolean(errors.weight_kg)}
              helperText={errors.weight_kg || " "}
              InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
              inputProps={{ min: 0, max: 500, step: "0.1" }}
            />

            <TextField
              label="Datum narození"
              type="date"
              name="birth_date"
              value={userSetting.birth_date ?? ""}
              onChange={handleInputDate}
              fullWidth
              error={Boolean(errors.birth_date)}
              helperText={errors.birth_date || " "}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <InputLabel id="gender-label">Pohlaví</InputLabel>
              <Select
                labelId="gender-label"
                label="Pohlaví"
                name="gender"
                value={userSetting.gender ?? ""}
                onChange={handleSelect("gender")}
              >
                <MenuItem value="">— vyber —</MenuItem>
                <MenuItem value="male">Muž</MenuItem>
                <MenuItem value="female">Žena</MenuItem>
                <MenuItem value="other">Jiné</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Cílová váha"
              type="number"
              name="target_weight_kg"
              value={userSetting.target_weight_kg ?? ""}
              onChange={handleInputNumber("target_weight_kg")}
              fullWidth
              error={Boolean(errors.target_weight_kg)}
              helperText={errors.target_weight_kg || " "}
              InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
              inputProps={{ min: 0, max: 500, step: "0.1" }}
            />

            <FormControl fullWidth>
              <InputLabel id="main-goal-label">Hlavní cíl</InputLabel>
              <Select
                labelId="main-goal-label"
                label="Hlavní cíl"
                name="main_goal"
                value={userSetting.main_goal ?? ""}
                onChange={handleSelect("main_goal")}
              >
                <MenuItem value="">— vyber —</MenuItem>
                <MenuItem value="lose_weight">Zhubnout</MenuItem>
                <MenuItem value="maintain_weight">Udržet váhu</MenuItem>
                <MenuItem value="gain_muscle">Nabrat svaly</MenuItem>
                <MenuItem value="improve_health">Zlepšit zdraví</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!canSubmit}
              sx={{ mt: 1, borderRadius: 2 }}
            >
              {saving ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
                  Ukládání…
                </>
              ) : (
                "Uložit nastavení"
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

export default UserSettingForm;
