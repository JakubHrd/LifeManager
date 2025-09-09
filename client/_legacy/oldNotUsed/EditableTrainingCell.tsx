import React from "react";
import { Button, TextField, Typography } from "@mui/material";

interface Props {
  day: string;
  training: string;
  description: string;
  done: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onChange: (val: string) => void;
  onSave: () => void;
}

// Komponenta pro jednu buňku tabulky, která umožňuje editaci a označení jako "splněno"
const EditableTrainingCell: React.FC<Props> = ({
  description,
  done,
  isEditing,
  onToggle,
  onEdit,
  onChange,
  onSave,
}) => {
  return (
    <>
      <Button
        size="small"
        variant={done ? "contained" : "outlined"}
        color={done ? "success" : "primary"}
        onClick={onToggle}
        sx={{ mb: 1, minWidth: 40 }}
      >
        {done ? "✔" : "✖"}
      </Button>
      {isEditing ? (
        <TextField
          value={description}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
          }}
          size="small"
          variant="outlined"
          fullWidth
          multiline
          rows={2}
          autoFocus
        />
      ) : (
        <Typography
          variant="caption"
          display="block"
          onClick={onEdit}
          sx={{ cursor: "pointer" }}
        >
          {description || " - "}
        </Typography>
      )}
    </>
  );
};

export default EditableTrainingCell;
