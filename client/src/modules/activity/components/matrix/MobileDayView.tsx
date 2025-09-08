import * as React from "react";
import {
  Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  List, ListItem, ListItemSecondaryAction, ListItemText, Slide, Button, Tooltip, TextField
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DayPicker from "./DayPicker";
import { Matrix } from "../../types";

const UpTransition = React.forwardRef(function UpTransition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});


type Ui = {
  rows: string[];
  cols: Array<{ key: string; label: string }>;
  cell: { textKey?: string; booleanKey?: string; empty: () => any };
  dynamicRows?: {
    placeholder?: string;
  };
};

type Props<Cell extends Record<string, any>> = {
  rows: string[];
  cols: Array<{ key: string; label: string }>;
  matrix: Matrix<Cell>;
  ui: Ui;
  loading: boolean;
  saving: boolean;
  onChangeText: (rKey: string, cKey: string, value: string) => void;
  onCommitText: () => void;
  onToggleBool: (rKey: string, cKey: string) => void;
  // dynamic rows (Habits)
  onAddRow?: (name: string) => Promise<void> | void;
  onDeleteRow?: (rKey: string) => Promise<void> | void;
};

export default function MobileDayView<Cell extends Record<string, any>>(props: Props<Cell>) {
  const { rows, cols, matrix, ui, onChangeText, onCommitText, onToggleBool, onAddRow } = props;

  const [idx, setIdx] = React.useState(0); // index dne
  const [edit, setEdit] = React.useState<{ cKey: string; value: string } | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");

  const textKey = ui.cell.textKey;
  const boolKey = ui.cell.booleanKey;

  const day = rows[idx] ?? rows[0];
  const row = (matrix[day] ?? {}) as Record<string, any>;

  const openEditor = (cKey: string, value: string) => setEdit({ cKey, value });
  const closeEditor = () => setEdit(null);

  const canDynamic = typeof onAddRow === "function";

  return (
    <Box>
      {/* výběr dne bez horizontálního scrollu */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <DayPicker days={rows} value={idx} onChange={setIdx} />
        {canDynamic && (
          <Tooltip title={ui.dynamicRows?.placeholder ?? "Nový návyk"}>
            <IconButton size="small" onClick={() => setAddOpen(true)}>
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <List dense>
        {cols.map((c) => {
          const cell = row?.[c.key] ?? ui.cell.empty();
          const textVal = textKey ? String(cell?.[textKey as string] ?? "") : "";
          const doneVal = boolKey ? !!cell?.[boolKey as string] : false;

          return (
            <ListItem key={c.key} divider sx={{ px: 1 }}>
              <ListItemText
                primaryTypographyProps={{ fontWeight: 700 }}
                primary={c.label}
                secondary={textKey ? (textVal || "—") : undefined}
                onClick={() => textKey && openEditor(c.key, textVal)}
              />
              <ListItemSecondaryAction sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {textKey && (
                  <Tooltip title="Upravit">
                    <IconButton size="small" onClick={() => openEditor(c.key, textVal)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {boolKey && (
                  <IconButton size="small" onClick={() => onToggleBool(day, c.key)}>
                    {doneVal
                      ? <CheckCircleOutlineRoundedIcon fontSize="small" />
                      : <RadioButtonUncheckedRoundedIcon fontSize="small" />}
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>

      {/* Modální editor textu */}
      <Dialog open={!!edit} TransitionComponent={UpTransition} onClose={closeEditor}fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EditRoundedIcon /> Upravit
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            value={edit?.value ?? ""}
            onChange={(e) => setEdit((s) => (s ? { ...s, value: e.target.value } : s))}
          />
        </DialogContent>
        <DialogActions>
          <Button startIcon={<CloseRoundedIcon />} onClick={closeEditor}>Zrušit</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!edit) return;
              onChangeText(day, edit.cKey, edit.value);
              closeEditor();
              await onCommitText();
            }}
          >
            Uložit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Přidání návyku (pokud je zapnuto dynamicRows) */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth>
        <DialogTitle>Nový návyk</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            placeholder={ui.dynamicRows?.placeholder ?? "Nový návyk…"}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Zrušit</Button>
          <Button
            variant="contained"
            onClick={async () => {
              const name = String(newName ?? "").replace(/\s+/g, " ").trim();
              if (!name) return;
              setAddOpen(false);
              setNewName("");
              if (onAddRow) await onAddRow(name);
            }}
          >
            Přidat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
