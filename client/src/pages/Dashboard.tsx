import React from "react";
import { Box, CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <CssBaseline />
      {/* Hlavní obsah */}
      <Box component="main" sx={{ p: { xs: 2, md: 3 } }}>
        <Outlet /> {/* Dynamický obsah sekcí (Finance, Diet, Training, Habits...) */}
      </Box>
    </Box>
  );
};

export default Dashboard;
