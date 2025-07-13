import React from "react";
import { Button, TextField, Typography } from "@mui/material";

interface EditableCellProps {
  description: string;
  isDone: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onChange: (val: string) => void;
  onSave: () => void;
  doneLabel?: { done: string; notDone: string }; // volitelné (např. ✔ / ✖)
  color?: "success" | "primary";
}

const EditableCell: React.FC<EditableCellProps> = ({
  description,
  isDone,
  isEditing,
  onToggle,
  onEdit,
  onChange,
  onSave,
  doneLabel = { done: "✔", notDone: "✖" },
  color = "primary",
}) => (
  <>
    <Button
      size="small"
      variant={isDone ? "contained" : "outlined"}
      color={isDone ? "success" : color}
      onClick={onToggle}
      sx={{ mb: 1, minWidth: 40 }}
    >
      {isDone ? doneLabel.done : doneLabel.notDone}
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

export default EditableCell;
