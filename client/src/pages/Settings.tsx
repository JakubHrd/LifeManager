import React, { useState } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";

const Settings: React.FC = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

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
        const data = await res.json();
        setMessage(data.message || "Chyba při ukládání změn.");
        return;
      }

      setMessage("Údaje byly úspěšně aktualizovány.");
    } catch (error) {
      setMessage("Chyba připojení k serveru.");
      console.error("Chyba při aktualizaci:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5} textAlign="center">
        <Typography variant="h4" gutterBottom>Nastavení účtu</Typography>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Nové uživatelské jméno" name="username" onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Nový e-mail" name="email" type="email" onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Nové heslo" name="password" type="password" onChange={handleChange} margin="normal" />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>Uložit změny</Button>
        </form>
        {message && <Typography color="green">{message}</Typography>}
      </Box>
    </Container>
  );
};

export default Settings;
