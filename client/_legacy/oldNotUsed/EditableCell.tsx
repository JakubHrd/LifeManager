import React from "react";
import { Button, TextField, Typography, Stack } from "@mui/material";

interface EditableCellProps {
  description: string;
  isDone: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onChange: (val: string) => void;
  onSave: () => void;
  doneLabel?: { done: string; notDone: string };
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
}) => {
  return (
    <Stack spacing={1} alignItems="center">
      <Button
        size="small"
        variant={isDone ? "contained" : "outlined"}
        color={isDone ? "success" : color}
        onClick={onToggle}
        sx={{ minWidth: 44 }}
        aria-label={isDone ? "Označeno jako snědeno" : "Označit jako snědeno"}
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
            if (e.key === "Escape") onSave();
          }}
          size="small"
          variant="outlined"
          fullWidth
          multiline
          minRows={2}
          autoFocus
        />
      ) : (
        <Typography
          variant="caption"
          onClick={onEdit}
          sx={{ cursor: "pointer", width: "100%", wordBreak: "break-word" }}
          title="Kliknutím upravíš"
        >
          {description?.trim() ? description : "—"}
        </Typography>
      )}
    </Stack>
  );
};

export default EditableCell;
