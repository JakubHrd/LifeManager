import * as React from 'react';
import { Container, Box, Toolbar } from '@mui/material';
import AppNavbar from '../components/AppNavbar';

type Props = { children: React.ReactNode };

export default function AppLayout({ children }: Props) {
  // pokud máš Sidebar/Drawer, předáš handler do <AppNavbar onMenuClick={...} />
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppNavbar />
      {/* Offset pod fixed AppBar */}
      <Toolbar />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}
