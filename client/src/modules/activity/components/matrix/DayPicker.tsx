import * as React from "react";
import { Box, Button } from "@mui/material";

type Props = {
  days: string[];
  value: number;                // index vybraného dne
  onChange: (index: number) => void;
};

export default function DayPicker({ days, value, onChange }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 0.75,
        mb: 1,
      }}
    >
      {days.map((d, i) => (
        <Button
          key={d}
          size="small"
          variant={i === value ? "contained" : "outlined"}
          onClick={() => onChange(i)}
          sx={{
            borderRadius: 999,
            px: 1.5,
            minWidth: 0,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          {d}
        </Button>
      ))}
    </Box>
  );
}
