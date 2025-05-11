import React from "react";
import { TableRow, TableCell } from "@mui/material";
import { translations } from "../../utils/translations";

interface Props {
  trainingsDefault: string[];
}

// Komponenta pro hlavičku tabulky s tréninky
const TrainingTableHeader: React.FC<Props> = ({ trainingsDefault }) => (
  <TableRow sx={{ backgroundColor: "primary.main" }}>
    <TableCell sx={{ color: "white", fontWeight: "bold" }}></TableCell>
    {trainingsDefault.map((training) => (
      <TableCell
        key={training}
        align="center"
        sx={{ color: "white", fontWeight: "bold" }}
      >
        {translations[training]?.cs || training}
      </TableCell>
    ))}
  </TableRow>
);

export default TrainingTableHeader;
