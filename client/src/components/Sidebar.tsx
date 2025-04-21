import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Paper,
  IconButton,
} from "@mui/material";
import {
  Dashboard,
  AccountBalanceWallet,
  Fastfood,
  FitnessCenter,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { text: "Dashboard", path: "/dashboard", icon: <Dashboard /> },
  { text: "Finance", path: "/dashboard/finance", icon: <AccountBalanceWallet /> },
  { text: "Jídelníček", path: "/dashboard/diet", icon: <Fastfood /> },
  { text: "Tréninkový plán", path: "/dashboard/training", icon: <FitnessCenter /> },
  { text: "Habit Tracker", path: "/dashboard/habits", icon: <CheckCircle /> },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        width: collapsed ? "60px" : "240px",
        p: 1,
        transition: "width 0.3s ease",
        height: "100vh",
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
      className="animate__animated animate__fadeIn" // pokud máš animate.css
    >

      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                transition: "background-color 0.3s ease",
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.08)" },
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1 : 2,
              }}
            >
              <ListItemIcon
                sx={{
                  color: "primary.main",
                  minWidth: 0,
                  mr: collapsed ? 0 : 1,
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: "medium" }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box display="flex" justifyContent="flex-end">
        <IconButton onClick={toggleSidebar} size="small">
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default Sidebar;
