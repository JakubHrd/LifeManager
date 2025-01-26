import React, { useState } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext"; // ✅ Přidán AuthContext


const Register: React.FC = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuthContext(); // ✅ Použití login funkce


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  
    if (res.ok) {
      const data = await res.json();
      login(data.token); // ✅ Aktualizace stavu přihlášení
      navigate("/dashboard"); // 🔥 Přesměrování na dashboard
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5} textAlign="center">
        <Typography variant="h4" gutterBottom>Registrace</Typography>
        <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Uživatelské jméno" name="username" onChange={handleChange} margin="normal" />
        <TextField fullWidth label="E-mail" name="email" type="email" onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Heslo" name="password" type="password" onChange={handleChange} margin="normal" />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>Registrovat</Button>
        </form>
      </Box>
    </Container>
  );
};

export default Register;
