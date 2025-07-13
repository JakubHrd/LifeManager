import React from "react";
import { TableRow, TableCell } from "@mui/material";

interface TableHeaderProps {
  sectionKeys: string[];
  translationsMap: Record<string, { cs: string }>;
}

const TableHeader: React.FC<TableHeaderProps> = ({ sectionKeys, translationsMap }) => (
  <TableRow sx={{ backgroundColor: "primary.main" }}>
    <TableCell sx={{ color: "white", fontWeight: "bold" }}></TableCell>
    {sectionKeys.map((key) => (
      <TableCell key={key} align="center" sx={{ color: "white", fontWeight: "bold" }}>
        {translationsMap[key]?.cs || key}
      </TableCell>
    ))}
  </TableRow>
);

export default TableHeader;
