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
      <TableCell sx={{ fontWeight: 600, pl: 2, whiteSpace: "nowrap" }}>
        {translationsMap[day]?.cs || day}
      </TableCell>

      {sectionKeys.map((section) => {
        const value = data[day]?.[section] as T;
        const isEditing = editingCell?.day === day && editingCell.section === section;

        return (
          <TableCell key={`${day}-${section}`} align="center" sx={{ minWidth: 160 }}>
            <EditableCell
              description={getDescription(value)}
              isDone={getDone(value)}
              isEditing={isEditing}
              onToggle={() => onToggle(day, section)}
              onEdit={() => onEditCell(day, section)}
              onChange={(val) => onChange(day, section, val)}
              onSave={onSave}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
};

export default TableRowGeneric;
