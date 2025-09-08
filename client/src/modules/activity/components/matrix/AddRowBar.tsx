import * as React from "react";
import { Box, Button, TextField } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

type Props = {
  placeholder?: string;
  busy?: boolean;
  onAdd: (name: string) => Promise<void> | void;
};

export default function AddRowBar({ placeholder = "Nový návyk…", busy, onAdd }: Props) {
  const [value, setValue] = React.useState("");

  const submit = async () => {
    const name = String(value ?? "").replace(/\s+/g, " ").trim();
    if (!name) return;
    await onAdd(name);
    setValue("");
  };

  const onKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1.25 }}>
      <TextField
        size="small"
        value={value}
        onChange={(e) => setValue(String(e.target.value ?? ""))}
        onKeyDown={onKey}
        placeholder={placeholder}
        sx={{ minWidth: 260 }}
        InputProps={{ sx: { borderRadius: 999 } }}
        disabled={!!busy}
      />
      <Button
        variant="contained"
        size="small"
        startIcon={<AddRoundedIcon />}
        onClick={submit}
        disabled={!!busy || !value.trim()}
        sx={{ borderRadius: 999 }}
      >
        Přidat
      </Button>
    </Box>
  );
}
