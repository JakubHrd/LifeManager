import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SettingsIcon from "@mui/icons-material/Settings";
import TuneIcon from "@mui/icons-material/Tune";
import LogoutIcon from "@mui/icons-material/Logout";

const Navbar = () => {
  const { isAuthenticated, username, logout } = useAuthContext();
  const navigate = useNavigate();

  // Responsivita
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  // Anchor pro uživatelské menu
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const handleUserMenuOpen = (e: React.MouseEvent<HTMLElement>) => setUserAnchor(e.currentTarget);
  const handleUserMenuClose = () => setUserAnchor(null);

  // Anchor pro hamburger menu
  const [navAnchor, setNavAnchor] = useState<null | HTMLElement>(null);
  const handleNavMenuOpen = (e: React.MouseEvent<HTMLElement>) => setNavAnchor(e.currentTarget);
  const handleNavMenuClose = () => setNavAnchor(null);

  // Společné navigační akce
  const go = (to: string) => {
    handleNavMenuClose();
    handleUserMenuClose();
    navigate(to);
  };

  // Navigační položky (stejné pro desktop i mobil)
  const navItems = [
    { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon fontSize="small" /> },
    { text: "Jídelníček", path: "/dashboard/diet", icon: <FastfoodIcon fontSize="small" /> },
    { text: "Trénink", path: "/dashboard/training", icon: <FitnessCenterIcon fontSize="small" /> },
    { text: "Habits", path: "/dashboard/habits", icon: <CheckCircleIcon fontSize="small" /> },
  ];

  return (
    <AppBar
      position="sticky"
      enableColorOnDark
      sx={{
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 72 },
          px: { xs: 2, md: 3 },
          gap: 1,
        }}
      >
        {/* Brand */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            flexGrow: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <Link
            to="/"
            style={{ textDecoration: "none", color: "inherit" }}
            aria-label="Přejít na úvod"
          >
            LifeManager
          </Link>
        </Typography>

        {/* ---- Desktop (md a výš) ---- */}
        {isMdUp ? (
          <>
            {isAuthenticated ? (
              <>
                {navItems.map((item) => (
                  <Button
                    key={item.text}
                    color="inherit"
                    startIcon={item.icon}
                    onClick={() => go(item.path)}
                  >
                    {item.text}
                  </Button>
                ))}

                {/* Username + avatar */}
                <Box
                  sx={{ display: "flex", alignItems: "center", cursor: "pointer", ml: 1 }}
                  onClick={handleUserMenuOpen}
                  aria-controls={userAnchor ? "user-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(userAnchor) ? "true" : undefined}
                >
                  <Typography
                    variant="body1"
                    sx={{ mr: 1, display: { xs: "none", sm: "block" } }}
                    title={username || "Uživatel"}
                  >
                    {username || "Uživatel"}
                  </Typography>
                  <IconButton color="inherit" size="large" aria-label="Uživatelské menu">
                    <AccountCircleIcon />
                  </IconButton>
                </Box>

                {/* User dropdown */}
                <Menu
                  id="user-menu"
                  anchorEl={userAnchor}
                  open={Boolean(userAnchor)}
                  onClose={handleUserMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem onClick={() => go("/settings")}>
                    <SettingsIcon fontSize="small" style={{ marginRight: 8 }} />
                    Nastavení účtu
                  </MenuItem>
                  <MenuItem onClick={() => go("/userSetting")}>
                    <TuneIcon fontSize="small" style={{ marginRight: 8 }} />
                    Nastavení uživatele
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      logout();
                      go("/login");
                    }}
                  >
                    <LogoutIcon fontSize="small" style={{ marginRight: 8 }} />
                    Odhlásit
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}>
                  Přihlášení
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/register"
                  startIcon={<PersonAddIcon />}
                  sx={{ ml: 1 }}
                >
                  Registrace
                </Button>
              </>
            )}
          </>
        ) : (
          /* ---- Mobil / tablet ---- */
          <>
            {isAuthenticated ? (
              <>
                {/* User menu */}
                <IconButton
                  color="inherit"
                  size="large"
                  aria-label="Uživatelské menu"
                  onClick={handleUserMenuOpen}
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  id="user-menu"
                  anchorEl={userAnchor}
                  open={Boolean(userAnchor)}
                  onClose={handleUserMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  {username && (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        {username}
                      </Typography>
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={() => go("/settings")}>
                    <SettingsIcon fontSize="small" style={{ marginRight: 8 }} />
                    Nastavení účtu
                  </MenuItem>
                  <MenuItem onClick={() => go("/userSetting")}>
                    <TuneIcon fontSize="small" style={{ marginRight: 8 }} />
                    Nastavení uživatele
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      logout();
                      go("/login");
                    }}
                  >
                    <LogoutIcon fontSize="small" style={{ marginRight: 8 }} />
                    Odhlásit
                  </MenuItem>
                </Menu>

                {/* Hamburger */}
                <IconButton
                  color="inherit"
                  size="large"
                  aria-label="Navigační menu"
                  onClick={handleNavMenuOpen}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="nav-menu"
                  anchorEl={navAnchor}
                  open={Boolean(navAnchor)}
                  onClose={handleNavMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  {navItems.map((item) => (
                    <MenuItem key={item.text} onClick={() => go(item.path)}>
                      {item.icon}
                      <Box component="span" ml={1}>
                        {item.text}
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <>
                {/* Nepřihlášený – hamburger */}
                <IconButton
                  color="inherit"
                  size="large"
                  aria-label="Navigační menu"
                  onClick={handleNavMenuOpen}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="nav-menu"
                  anchorEl={navAnchor}
                  open={Boolean(navAnchor)}
                  onClose={handleNavMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem onClick={() => go("/login")}>
                    <LoginIcon fontSize="small" style={{ marginRight: 8 }} />
                    Přihlášení
                  </MenuItem>
                  <MenuItem onClick={() => go("/register")}>
                    <PersonAddIcon fontSize="small" style={{ marginRight: 8 }} />
                    Registrace
                  </MenuItem>
                </Menu>
              </>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
