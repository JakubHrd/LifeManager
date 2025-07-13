import React from "react";
import { TableRow, TableCell } from "@mui/material";
import EditableTrainingCell from "./EditableTrainingCell";
import { translations } from "../../utils/translations";

interface TrainingRowProps {
  day: string;
  trainingsDefault: string[];
  trainings: {
    [day: string]: {
      [training: string]: { description: string; done: boolean };
    };
  };
  editingCell: { day: string; training: string } | null;
  onEditCell: (day: string, training: string) => void;
  onToggle: (day: string, training: string) => void;
  onChange: (day: string, training: string, val: string) => void;
  onSave: () => void;
}

// Jeden řádek v tabulce s buňkami pro každou část dne
const TrainingTableRow: React.FC<TrainingRowProps> = ({
  day,
  trainingsDefault,
  trainings,
  editingCell,
  onEditCell,
  onToggle,
  onChange,
  onSave,
}) => {
  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: "medium", pl: 2 }}>
        {translations[day]?.cs || day}
      </TableCell>
      {trainingsDefault.map((training) => (
        <TableCell key={training} align="center">
          <EditableTrainingCell
            day={day}
            training={training}
            description={trainings[day]?.[training]?.description || ""}
            done={trainings[day]?.[training]?.done || false}
            isEditing={
              editingCell?.day === day && editingCell.training === training
            }
            onToggle={() => onToggle(day, training)}
            onEdit={() => onEditCell(day, training)}
            onChange={(val) => onChange(day, training, val)}
            onSave={onSave}
          />
        </TableCell>
      ))}
    </TableRow>
  );
};

export default TrainingTableRow;
