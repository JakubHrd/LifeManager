import * as React from "react";
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, IconButton, TextField
} from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import { Matrix } from "../../types";

type Ui = {
  rows: string[];
  cols: Array<{ key: string; label: string }>;
  cell: { textKey?: string; booleanKey?: string; empty: () => any };
  labels?: { rowHeader?: string };
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
};

export default function DesktopMatrix<Cell extends Record<string, any>>(props: Props<Cell>) {
  const { rows, cols, matrix, ui, onChangeText, onCommitText, onToggleBool } = props;

  // fixní layout bez horizontálního scrollu
  const firstColPct = 16; // Den/Habit
  const otherPct = (100 - firstColPct) / Math.max(cols.length, 1);

  const textKey = ui.cell.textKey;
  const boolKey = ui.cell.booleanKey;

  const startEdit = (set: React.Dispatch<React.SetStateAction<{ r?: string; c?: string } | null>>, r: string, c: string) =>
    set({ r, c });
  const stopEdit = (set: React.Dispatch<React.SetStateAction<{ r?: string; c?: string } | null>>) => set(null);

  const [editing, setEditing] = React.useState<{ r?: string; c?: string } | null>(null);

  return (
    <Box sx={{ mx: { xs: 0, md: 1 } }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          backgroundColor: "var(--lm-surface)",
          boxShadow: "var(--lm-shadow-2)",
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{
            tableLayout: "fixed",
            width: "100%",

            /* ===== HEAD ===== */
            "& thead th": {
              fontWeight: 800,
              backgroundColor: "var(--lm-table-header-bg, var(--lm-surface))",
              borderBottom: "1px solid var(--color-border)",
              p: 1.25,
            },

            /* ===== BODY – default & zebra ===== */
            "& tbody tr": { backgroundColor: "var(--lm-table-row-bg, var(--lm-surface))" },
            "& tbody tr:nth-of-type(odd)": {
              backgroundColor: "var(--lm-table-row-alt-bg, var(--lm-surface))",
            },

            "& tbody td": {
              p: 1,
              borderBottom: "1px solid var(--color-border)",
              verticalAlign: "middle",
              fontSize: "0.95rem",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: `${firstColPct}%`,
                  fontWeight: 800,
                  pl: 2,
                  position: "sticky",
                  left: 0,
                  zIndex: 2,
                  backgroundColor: "var(--lm-table-header-bg, var(--lm-surface))",
                  borderRight: "1px solid var(--color-border)",
                }}
              >
                {ui.labels?.rowHeader ?? "Day"}
              </TableCell>
              {cols.map((c) => (
                <TableCell
                  key={c.key}
                  sx={{
                    width: `${otherPct}%`,
                    fontWeight: 800,
                    backgroundColor: "var(--lm-table-header-bg, var(--lm-surface))",
                  }}
                >
                  {c.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((rKey, i) => {
              const rowData = (matrix[rKey] ?? {}) as Record<string, any>;
              const rowBg = i % 2 === 0
                ? "var(--lm-table-row-bg, var(--lm-surface))"
                : "var(--lm-table-row-alt-bg, var(--lm-surface))";

              return (
                <TableRow key={rKey} hover sx={{ "--row-bg": rowBg as any }}>
                  {/* sticky 1. sloupec = název dne/habitu */}
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      pl: 2,
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                      backgroundColor: "var(--row-bg)",
                      borderRight: "1px solid var(--color-border)",
                      boxShadow: "var(--lm-table-sticky-shadow, 10px 0 16px rgba(0,0,0,0.06))",
                    }}
                  >
                    {rKey}
                  </TableCell>

                  {/* buňky dne */}
                  {cols.map((c) => {
                    const cell = (rowData?.[c.key] ?? ui.cell.empty()) as any;
                    const isEditing = editing?.r === rKey && editing?.c === c.key;
                    const textVal = textKey ? String(cell?.[textKey] ?? "") : "";
                    const doneVal = boolKey ? !!cell?.[boolKey] : false;

                    return (
                      <TableCell key={`${rKey}__${c.key}`} sx={{ backgroundColor: "var(--row-bg)" }}>
                        {/* TEXT – display first */}
                        {textKey && !isEditing && (
                          <Box
                            onClick={() => startEdit(setEditing, rKey, c.key)}
                            sx={{
                              cursor: "text",
                              minHeight: 28,
                              lineHeight: 1.3,
                              px: 1,
                              py: 0.5,
                              borderRadius: 2,
                              bgcolor: "var(--lm-input-bg, var(--lm-surface-variant, var(--lm-surface)))",
                              "&:hover": { outline: "1px solid var(--lm-input-border, var(--color-border))" },
                              wordBreak: "break-word",
                            }}
                          >
                            {textVal || <Box sx={{ opacity: 0.5, color: "var(--lm-input-placeholder, var(--color-text-muted))" }}>Popis…</Box>}
                          </Box>
                        )}

                        {textKey && isEditing && (
                          <TextField
                            autoFocus
                            size="small"
                            value={textVal}
                            onChange={(e) => onChangeText(rKey, c.key, e.target.value)}
                            onBlur={() => { stopEdit(setEditing); onCommitText(); }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { (e.target as HTMLInputElement).blur(); }
                              if (e.key === "Escape") { stopEdit(setEditing); }
                            }}
                            fullWidth
                            variant="outlined"
                            InputProps={{
                              sx: {
                                borderRadius: 2,
                                fontSize: "0.95rem",
                                bgcolor: "var(--lm-input-bg, var(--lm-surface-variant, var(--lm-surface)))",
                              },
                            }}
                          />
                        )}

                        {/* TOGGLE – done/undone */}
                        {boolKey && (
                          <Tooltip title={doneVal ? "Odznačit" : "Označit jako hotové"}>
                            <IconButton onClick={() => onToggleBool(rKey, c.key)} size="small" sx={{ ml: 0.5, color: "var(--color-text-muted)" }}>
                              {doneVal
                                ? <CheckCircleOutlineRoundedIcon fontSize="small" />
                                : <RadioButtonUncheckedRoundedIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
