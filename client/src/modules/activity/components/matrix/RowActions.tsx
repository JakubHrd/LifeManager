import * as React from "react";
import { IconButton, TableCell, Tooltip } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

export default function RowActions({ onDelete }: { onDelete: () => void }) {
  return (
    <TableCell align="right" width={56}>
      <Tooltip title="Smazat řádek">
        <span>
          <IconButton size="small" onClick={onDelete} sx={{ borderRadius: 10 }}>
            <DeleteOutlineRoundedIcon />
          </IconButton>
        </span>
      </Tooltip>
    </TableCell>
  );
}
