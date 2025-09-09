import React from "react";
import { Container, Tab, Tabs, Box, Stack, Typography, Paper, Divider } from "@mui/material";
import Settings from "@/pages/Settings";
import UserSettingForm from "@/components/UserSettingForm";
import { useSearchParams } from "react-router-dom";

function SettingsUnifiedPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "account";
  const handleTab = (_: unknown, v: string) => {
    const p = new URLSearchParams(params);
    p.set("tab", v);
    setParams(p, { replace: true });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Nastavení</Typography>
      <Paper elevation={1} sx={{ p: 0 }}>
        <Tabs value={tab} onChange={handleTab} variant="fullWidth">
          <Tab value="account" label="Účet" />
          <Tab value="profile" label="Profil & metriky" />
        </Tabs>
        <Divider />
        <Box sx={{ p: 2 }}>
          {tab === "account" && (
            <Stack spacing={2}>
              <Typography variant="subtitle1">Nastavení účtu</Typography>
              <Settings />
            </Stack>
          )}
          {tab === "profile" && (
            <Stack spacing={2}>
              <Typography variant="subtitle1">Uživatelské metriky & preference</Typography>
              <UserSettingForm />
            </Stack>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default SettingsUnifiedPage; // <- důležité
