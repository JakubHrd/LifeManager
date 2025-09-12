import React, { useEffect, useState } from "react";
import { Container, Paper, Typography, Alert, Button, CircularProgress, Stack } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmailApi } from "../../auth/api"; // uprav cestu pokud máš aliasy

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"loading"|"ok"|"error">("loading");
  const [message, setMessage] = useState("Ověřuji e-mail…");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        if (!token) throw new Error("Chybí ověřovací token.");
        const r = await verifyEmailApi(token);
        setMessage(r.message || "E-mail byl ověřen.");
        setState("ok");
      } catch (e: any) {
        setMessage(e?.message || "Ověření se nezdařilo.");
        setState("error");
      }
    })();
  }, [token]);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Ověření e-mailu</Typography>

        {state === "loading" && (
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography>{message}</Typography>
          </Stack>
        )}
        {state === "ok" && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {state === "error" && <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>}

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => navigate("/login", { replace: true })}>Přihlásit</Button>
          <Button variant="text" onClick={() => navigate("/", { replace: true })}>Domů</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
