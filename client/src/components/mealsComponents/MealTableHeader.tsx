import React from "react";
import { TableRow, TableCell } from "@mui/material";
import { translations } from "../../utils/translations";

interface Props {
  mealsDefault: string[];
}

const MealTableHeader: React.FC<Props> = ({ mealsDefault }) => (
  <TableRow sx={{ backgroundColor: "primary.main" }}>
    <TableCell sx={{ color: "white", fontWeight: "bold" }}></TableCell>
    {mealsDefault.map((meal) => (
      <TableCell
        key={meal}
        align="center"
        sx={{ color: "white", fontWeight: "bold" }}
      >
        {translations[meal]?.cs || meal}
      </TableCell>
    ))}
  </TableRow>
);

export default MealTableHeader;
