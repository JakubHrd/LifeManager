import React from "react";
import { Box, Toolbar, CssBaseline } from "@mui/material";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh" }}>
      <CssBaseline />

      {/* Levý Sidebar */}
      <Sidebar />

      {/* Hlavní obsah */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet /> {/* Dynamický obsah sekcí (Finance, Diet, ...) */}
      </Box>
    </Box>
  );
};

export default Dashboard;
