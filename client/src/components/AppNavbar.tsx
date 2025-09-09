import * as React from 'react';
import {
  AppBar, Toolbar, Container, IconButton, Typography, Box, Button,
  Avatar, Menu, MenuItem, Divider, ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Logout from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings';
import Person from '@mui/icons-material/Person';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import ThemeSwitch from './ThemeSwitch';
import { useAuthContext } from '@/features/auth/context/AuthProvider';
import { logout } from '../features/auth/utils/logout';
import NavLinkButton from './NavLinkButton';

type Props = { onMenuClick?: () => void };

function AppNavbar({ onMenuClick }: Props) {
  const { token } = useAuthContext();
  const isAuth = !!token;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (to: string, exact = false) => exact ? pathname === to : pathname.startsWith(to);

  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar position="fixed" color="default" elevation={0} sx={{ bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 64, gap: 1 }}>
          {/* Mobile menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
            <IconButton edge="start" aria-label="open navigation menu" onClick={onMenuClick}>
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Logo → Landing */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 700, mr: 2, flexShrink: 0 }}
          >
            Life Manager
          </Typography>

          {/* Main nav (desktop) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {isAuth && (
              <>
                <NavLinkButton to="/dashboard" exact>Dashboard</NavLinkButton>
                <NavLinkButton to="/dashboard/diet">Meals</NavLinkButton>
                <NavLinkButton to="/dashboard/training">Training</NavLinkButton>
                <NavLinkButton to="/dashboard/habits">Habits</NavLinkButton>
                <Button component={RouterLink} to="/dashboard/finance" color="inherit"
                  variant={isActive('/dashboard/finance') ? 'contained' : 'text'}>
                  Finance
                </Button>
              </>
            )}
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThemeSwitch />
            {!isAuth ? (
              <>
                <Button component={RouterLink} to="/login" variant="outlined" size="small" aria-label="login">Přihlásit</Button>
                <Button component={RouterLink} to="/register" variant="contained" size="small" aria-label="register">Registrace</Button>
              </>
            ) : (
              <>
                <IconButton id="avatar-btn" onClick={handleAvatarClick} size="small" sx={{ ml: 1 }} aria-label="open user menu">
                  <Avatar sx={{ width: 32, height: 32 }}>J</Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  MenuListProps={{ 'aria-labelledby': 'avatar-btn' }}
                >
                  <MenuItem component={RouterLink} to="/profile">
                    <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                    Profil
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/settings">
                    <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                    Nastavení
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={async () => { await logout(); navigate('/', { replace: true }); }}
                  >
                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
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
