import React from "react";
import { TableRow, TableCell } from "@mui/material";
import EditableCell from "./EditableCell";

interface TableRowGenericProps<T> {
  day: string;
  sectionKeys: string[];
  data: Record<string, Record<string, T>>;
  editingCell: { day: string; section: string } | null;
  onEditCell: (day: string, section: string) => void;
  onToggle: (day: string, section: string) => void;
  onChange: (day: string, section: string, val: string) => void;
  onSave: () => void;
  getDescription: (value: T) => string;
  getDone: (value: T) => boolean;
  translationsMap: Record<string, { cs: string }>;
  itemKey: string;
}

const TableRowGeneric = <T,>({
  day,
  sectionKeys,
  data,
  editingCell,
  onEditCell,
  onToggle,
  onChange,
  onSave,
  getDescription,
  getDone,
  translationsMap,
}: TableRowGenericProps<T>) => {
  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: "medium", pl: 2 }}>
        {translationsMap[day]?.cs || day}
      </TableCell>
      {sectionKeys.map((section) => (
        <TableCell key={section} align="center">
          <EditableCell
            description={getDescription(data[day]?.[section] as T)}
            isDone={getDone(data[day]?.[section] as T)}
            isEditing={editingCell?.day === day && editingCell.section === section}
            onToggle={() => onToggle(day, section)}
            onEdit={() => onEditCell(day, section)}
            onChange={(val) => onChange(day, section, val)}
            onSave={onSave}
          />
        </TableCell>
      ))}
    </TableRow>
  );
};

export default TableRowGeneric;
