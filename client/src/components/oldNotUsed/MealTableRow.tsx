import React from "react";
import { TableRow, TableCell } from "@mui/material";
import EditableMealCell from "./EditableMealCell";
import { translations } from "../../utils/translations";
import { MealsByDay } from "../../types/mealTypes";

interface Props {
  day: string;
  mealsDefault: string[];
  meals: MealsByDay;
  editingCell: { day: string; meal: string } | null;
  onEditCell: (day: string, meal: string) => void;
  onToggle: (day: string, meal: string) => void;
  onChange: (day: string, meal: string, val: string) => void;
  onSave: () => void;
}

const MealTableRow: React.FC<Props> = ({
  day,
  mealsDefault,
  meals,
  editingCell,
  onEditCell,
  onToggle,
  onChange,
  onSave,
}) => {
  return (
    <TableRow key={day} hover>
      <TableCell sx={{ fontWeight: "medium", pl: 2 }}>
        {translations[day]?.cs || day}
      </TableCell>
      {mealsDefault.map((meal) => (
        <TableCell key={meal} align="center">
          <EditableMealCell
            day={day}
            meal={meal}
            description={meals[day]?.[meal]?.description || ""}
            eaten={meals[day]?.[meal]?.eaten || false}
            isEditing={editingCell?.day === day && editingCell.meal === meal}
            onToggle={() => onToggle(day, meal)}
            onEdit={() => onEditCell(day, meal)}
            onChange={(val) => onChange(day, meal, val)}
            onSave={onSave}
          />
        </TableCell>
      ))}
    </TableRow>
  );
};

export default MealTableRow;
