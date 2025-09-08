import * as React from "react";
import { Box, Checkbox, FormControlLabel, TextField } from "@mui/material";

type Props<Cell> = {
  cell: Cell;
  textKey?: string;
  booleanKey?: string;
  onTextChange: (value: string) => void;
  onTextBlur: () => void;
  onToggle: () => void;
};

export default function CellEditor<Cell extends Record<string, any>>({
  cell,
  textKey,
  booleanKey,
  onTextChange,
  onTextBlur,
  onToggle,
}: Props<Cell>) {
  const hasText = !!textKey;
  const hasBool = !!booleanKey;
  const textVal = hasText ? String(cell?.[textKey as string] ?? "") : "";

  return (
    <Box>
      {hasText && (
        <TextField
          value={textVal}
          onChange={(e) => onTextChange(e.target.value)}
          onBlur={onTextBlur}
          placeholder="Popis…"
          size="small"
          fullWidth
          multiline
          minRows={1}
          variant="outlined"
          InputProps={{
            sx: {
              borderRadius: 3, // měkké rohy (ne extrémní pill)
              bgcolor: (t) => (t.palette.mode === "light" ? t.palette.grey[100] : "rgba(255,255,255,.06)"),
              "& fieldset": {
                borderColor: (t) => t.palette.divider,
              },
              "&:hover fieldset": {
                borderColor: (t) => t.palette.text.secondary,
              },
              "&.Mui-focused fieldset": {
                borderColor: (t) => t.palette.primary.main,
              },
            },
          }}
        />
      )}

      {hasBool && (
        <FormControlLabel
          sx={{ mt: hasText ? 0.75 : 0, mb: 0, userSelect: "none" }}
          control={<Checkbox checked={!!cell?.[booleanKey as string]} onChange={onToggle} />}
          label="Done"
        />
      )}
    </Box>
  );
}
