import React, { useEffect, useState } from "react";
import { Box, Button, MenuItem, Select, TextField, Typography, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";
import serverUrl from "../config";

interface UserSetting {
  height_cm: number | null;
  weight_kg: number | null;
  birth_date: string | null;
  gender: string | null;
  target_weight_kg: number | null;
  main_goal: string | null;
}

const UserSettingForm = () => {
  const [userSetting, setUserSetting] = useState<UserSetting>({
    height_cm: null,
    weight_kg: null,
    birth_date: null,
    gender: null,
    target_weight_kg: null,
    main_goal: null,
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token"); // pokud ukládáš JWT token

  useEffect(() => {
    const fetchUserSetting = async () => {
      try {
        const res = await fetch(`${serverUrl}/api/userSetting`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log('fetchUserSetting - data',{data});
        setUserSetting(data);
      } catch (error) {
        console.error("Chyba při načítání nastavení", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSetting();
  }, [token]); // přidáno token jako závislost

  // 👇 Oprava: dvě oddělené funkce na input a select
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserSetting((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setUserSetting((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${serverUrl}/api/userSetting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userSetting),
      });

      if (res.ok) {
        setMessage("Nastavení bylo úspěšně uloženo.");
      } else {
        const err = await res.json();
        setMessage(err.message || "Chyba při ukládání.");
      }
    } catch (error) {
      console.error("Chyba při odesílání dat", error);
      setMessage("Chyba serveru.");
    }
  };

  if (loading) return <p>Načítání...</p>;

  return (
    <Box maxWidth="500px" margin="0 auto" padding={2}>
      <Typography variant="h4" align="center" gutterBottom>
        Moje nastavení
      </Typography>

      {message && (
        <Typography color="primary" align="center" gutterBottom>
          {message}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Výška (cm)"
            type="number"
            name="height_cm"
            value={userSetting.height_cm ?? ""}
            onChange={handleInputChange}
            fullWidth
          />

          <TextField
            label="Váha (kg)"
            type="number"
            name="weight_kg"
            value={userSetting.weight_kg ?? ""}
            onChange={handleInputChange}
            fullWidth
          />

          <TextField
            label="Datum narození"
            type="date"
            name="birth_date"
            value={userSetting.birth_date}
            onChange={handleInputChange}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />

          <FormControl fullWidth>
            <InputLabel id="gender-label">Pohlaví</InputLabel>
            <Select
              labelId="gender-label"
              label="Pohlaví"
              name="gender"
              value={userSetting.gender ?? ""}
              onChange={handleSelectChange}
            >
              <MenuItem value="">-- vyber --</MenuItem>
              <MenuItem value="male">Muž</MenuItem>
              <MenuItem value="female">Žena</MenuItem>
              <MenuItem value="other">Jiné</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Cílová váha (kg)"
            type="number"
            name="target_weight_kg"
            value={userSetting.target_weight_kg ?? ""}
            onChange={handleInputChange}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="main-goal-label">Hlavní cíl</InputLabel>
            <Select
              labelId="main-goal-label"
              label="Hlavní cíl"
              name="main_goal"
              value={userSetting.main_goal ?? ""}
              onChange={handleSelectChange}
            >
              <MenuItem value="">-- vyber --</MenuItem>
              <MenuItem value="lose_weight">Zhubnout</MenuItem>
              <MenuItem value="maintain_weight">Udržet váhu</MenuItem>
              <MenuItem value="gain_muscle">Nabrat svaly</MenuItem>
              <MenuItem value="improve_health">Zlepšit zdraví</MenuItem>
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Uložit nastavení
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default UserSettingForm;
