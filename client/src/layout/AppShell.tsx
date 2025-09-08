import { PropsWithChildren, useState } from "react";
import { Box, Container, Drawer, List, ListItemButton, ListItemText, Divider, Typography,LinearProgress } from "@mui/material";
import { useGlobalLoading } from "../components/GlobalLoadingProvider";
import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";

const NAV = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Meals", to: "/dashboard/diet" },
  { label: "Training", to: "/dashboard/training" },
  { label: "Habits", to: "/dashboard/habits" },
  // { label: "Finance", to: "/dashboard/finance" },
  { label: "Settings", to: "/settings" },
];

export default function AppShell({ children }: PropsWithChildren) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { isLoading } = useGlobalLoading();

  const close = () => setMobileOpen(false);

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <AppNavbar onMenuClick={() => setMobileOpen(true)} />
      {/* offset pod fixed AppBar */}
      <Box sx={{ height: { xs: 56, sm: 64, md: 64 } }} />
        
      {isLoading && <LinearProgress sx={{ position: "sticky", top: 0, zIndex: 1100 }} />}
      {/* Mobile-only nav menu */}
      <Drawer
        open={mobileOpen}
        onClose={close}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <Box sx={{ width: 280, p: 1 }} role="presentation" onClick={close}>
          <Typography variant="h6" sx={{ px: 2, py: 1.5 }}>Navigace</Typography>
          <Divider />
          <List>
            {NAV.map((n) => (
              <ListItemButton
                key={n.to}
                component={RouterLink}
                to={n.to}
                selected={pathname === n.to}
              >
                <ListItemText primary={n.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children ?? <Outlet />}
      </Container>
    </Box>
  );
}
