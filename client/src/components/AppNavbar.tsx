import * as React from 'react';
import {
  AppBar, Toolbar, Container, IconButton, Typography, Box, Button,
  Avatar, Menu, MenuItem, Divider, ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Logout from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings';
import Person from '@mui/icons-material/Person';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ThemeSwitch from './ThemeSwitch';
import { useAuthContext } from '../context/AuthContext';
import { logout } from '../auth/logout';

type Props = { onMenuClick?: () => void };

function AppNavbar({ onMenuClick }: Props) {
  const { token } = useAuthContext(); // ⬅️ předpoklad: vrací token nebo prázdno
  const isAuth = !!token;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{ bgcolor: "background.paper" }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 64, gap: 1 }}>
          {/* Mobile menu */}
          <Box sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}>
            <IconButton edge="start" aria-label="menu" onClick={onMenuClick}>
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Logo → vždy na Landing */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: "none",
              color: "text.primary",
              fontWeight: 700,
              mr: 2,
              flexShrink: 0,
            }}
          >
            Life Manager
          </Typography>

          {/* Hlavní navigace (může být vidět klidně i guestům, dle libosti) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            {isAuth && (
              <>
                <Button component={RouterLink} to="/dashboard" color="inherit">
                  Dashboard
                </Button>
                <Button
                  component={RouterLink}
                  to="/dashboard/diet"
                  color="inherit"
                >
                  Meals
                </Button>
                <Button
                  component={RouterLink}
                  to="/dashboard/training"
                  color="inherit"
                >
                  Training
                </Button>
                <Button
                  component={RouterLink}
                  to="/dashboard/habits"
                  color="inherit"
                >
                  Habits
                </Button>
                <Button
                  component={RouterLink}
                  to="/dashboard/finance"
                  color="inherit"
                >
                  Finance
                </Button>
              </>
            )}
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Pravá strana */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ThemeSwitch />
            {!isAuth ? (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="small"
                >
                  Přihlásit
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="small"
                >
                  Registrace
                </Button>
              </>
            ) : (
              <>
                <IconButton
                  onClick={handleAvatarClick}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <Avatar sx={{ width: 32, height: 32 }}>J</Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem component={RouterLink} to="/profile">
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>
                    Profil
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/settings">
                    <ListItemIcon>
                      <Settings fontSize="small" />
                    </ListItemIcon>
                    Nastavení
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={async () => {
                      await logout(); 
                      navigate("/", { replace: true }); 
                    }}
                  >
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Odhlásit
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default AppNavbar;
