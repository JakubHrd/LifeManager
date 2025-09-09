import React from "react";
import {
  Button,
  TextField,
  Typography,
} from "@mui/material";

interface Props {
  day: string;
  meal: string;
  description: string;
  eaten: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onChange: (val: string) => void;
  onSave: () => void;
}

const EditableMealCell: React.FC<Props> = ({
  day,
  meal,
  description,
  eaten,
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
        variant={eaten ? "contained" : "outlined"}
        color={eaten ? "success" : "primary"}
        onClick={onToggle}
        sx={{ mb: 1, minWidth: 40 }}
      >
        {eaten ? "✔" : "✖"}
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

export default EditableMealCell;
