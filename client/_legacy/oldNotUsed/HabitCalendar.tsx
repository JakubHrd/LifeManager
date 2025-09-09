// src/components/HabitCalendar.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  IconButton,
  TextField,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useTheme } from "@mui/material/styles";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuthContext } from "../../src/context/AuthContext";
import serverUrl from "../../src/config";

interface HabitCalendarProps {
  week: number;
  year: number;
}

type Habits = Record<string, Record<string, boolean>>;

// Dny – klíče jak je ukládáš do DB (lowercase EN), ale v UI ukazujeme CZ labely
const days = [
  { label: "Pondělí", key: "monday" },
  { label: "Úterý", key: "tuesday" },
  { label: "Středa", key: "wednesday" },
  { label: "Čtvrtek", key: "thursday" },
  { label: "Pátek", key: "friday" },
  { label: "Sobota", key: "saturday" },
  { label: "Neděle", key: "sunday" },
];

const HabitCalendar: React.FC<HabitCalendarProps> = ({ week, year }) => {
  const { isAuthenticated } = useAuthContext();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [habits, setHabits] = useState<Habits>({});
  const [newHabit, setNewHabit] = useState<string>("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingCopy, setPendingCopy] = useState(false);
  const [deleteHabitName, setDeleteHabitName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---- LOAD ----
  useEffect(() => {
    if (!isAuthenticated) return;

    const ac = new AbortController();
    const load = async () => {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        const res = await fetch(`${serverUrl}/api/habits?week=${week}&year=${year}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("Chyba při načítání návyků");
        const data = await res.json();
        setHabits((data?.habits as Habits) || {});
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Neznámá chyba");
        }
      }
    };

    load();
    return () => ac.abort();
  }, [isAuthenticated, week, year]);

  // ---- SAVE helper ----
  const saveHabits = useCallback(
    async (habitsToSave: Habits) => {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${serverUrl}/api/habits?week=${week}&year=${year}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ week, year, habits: habitsToSave }),
        });
      } catch (err) {
        console.error("Chyba při ukládání návyků:", err);
      }
    },
    [week, year]
  );

  // ---- TOGGLE ----
  const handleToggle = (habit: string, dayKey: string) => {
    setHabits((prev) => {
      const updated: Habits = {
        ...prev,
        [habit]: {
          ...prev[habit],
          [dayKey]: !prev[habit]?.[dayKey],
        },
      };
      // optimistic
      saveHabits(updated);
      return updated;
    });
  };

  // ---- ADD (opraveno duplikování) ----
  const handleAddHabit = () => {
    const trimmed = newHabit.trim();
    if (!trimmed) return;
    if (habits[trimmed]) {
      setSnackbar({ open: true, message: "Tento návyk už existuje.", severity: "error" });
      return;
    }
    const draft: Habits = { ...habits, [trimmed]: {} };
    setHabits(draft); // zobraz jednou
    saveHabits(draft);
    setNewHabit("");
  };

  // ---- DELETE ----
  const confirmDeleteHabit = (habit: string) => setDeleteHabitName(habit);
  const handleDeleteHabit = () => {
    if (!deleteHabitName) return;
    setHabits((prev) => {
      const updated = { ...prev };
      delete updated[deleteHabitName];
      saveHabits(updated);
      return updated;
    });
    setDeleteHabitName(null);
  };

  // ---- COPY next week ----
  const copyHabitsToNextWeek = async () => {
    const token = localStorage.getItem("token");
    const url = `${serverUrl}/api/habits/copy?week=${week}&year=${year}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 409) {
        setConfirmDialogOpen(true);
        setPendingCopy(true);
        return;
      }

      const result = await res.json();
      setSnackbar({ open: true, message: result.message, severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Chyba při kopírování návyků.", severity: "error" });
    }
  };

  const handleConfirmOverwrite = async () => {
    setConfirmDialogOpen(false);
    if (!pendingCopy) return;

    const token = localStorage.getItem("token");
    const url = `${serverUrl}/api/habits/copy?week=${week}&year=${year}&force=true`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      setSnackbar({ open: true, message: result.message, severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Nepodařilo se přepsat návyky.", severity: "error" });
    } finally {
      setPendingCopy(false);
    }
  };

  // ---- DnD (desktop only) ----
  const SortableHabitRow: React.FC<{ habit: string }> = ({ habit }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: habit });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    return (
      <TableRow ref={setNodeRef} style={style} {...attributes}>
        <TableCell component="th" scope="row">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <IconButton {...listeners} size="small" aria-label="Přesunout řádek">
              <DragHandleIcon fontSize="small" />
            </IconButton>
            <span>{habit}</span>
            <IconButton onClick={() => confirmDeleteHabit(habit)} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </TableCell>
        {days.map(({ key }) => (
          <TableCell key={key} align="center">
            <Checkbox
              checked={!!habits[habit]?.[key]}
              onChange={() => handleToggle(habit, key)}
              color="primary"
            />
          </TableCell>
        ))}
      </TableRow>
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const entries = Object.entries(habits);
    const oldIndex = entries.findIndex(([key]) => key === active.id);
    const newIndex = entries.findIndex(([key]) => key === over.id);

    const newEntries = arrayMove(entries, oldIndex, newIndex);
    const ordered = Object.fromEntries(newEntries) as Habits;

    setHabits(ordered);
    saveHabits(ordered);
  };

  // ---- Mobile renderer ----
  const MobileHabits = () => {
    const habitNames = Object.keys(habits);
    return (
      <Box sx={{ mt: 2 }}>
        {/* Add row */}
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
          <Stack direction="row" spacing={1}>
            <TextField
              label="Nový návyk"
              size="small"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
              fullWidth
            />
            <IconButton onClick={handleAddHabit} color="primary" aria-label="Přidat návyk">
              <AddIcon />
            </IconButton>
          </Stack>
        </Paper>

        {habitNames.length === 0 && (
          <Paper variant="outlined" sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Zatím tu žádné návyky nejsou. Přidej první nahoře. 🙂
            </Typography>
          </Paper>
        )}

        {/* Accordions per habit */}
        {habitNames.map((habit) => (
          <Accordion key={habit} disableGutters sx={{ mb: 1, borderRadius: 2, overflow: "hidden" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
                <Typography sx={{ fontWeight: 700, flexGrow: 1 }}>{habit}</Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDeleteHabit(habit);
                  }}
                  aria-label="Smazat návyk"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {days.map((d) => {
                  const checked = !!habits[habit]?.[d.key];
                  return (
                    <Chip
                      key={d.key}
                      label={d.label}
                      variant={checked ? "filled" : "outlined"}
                      color={checked ? "primary" : "default"}
                      onClick={() => handleToggle(habit, d.key)}
                      sx={{ borderRadius: 2 }}
                    />
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between", flexWrap: "wrap" }}>
          <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => saveHabits(habits)}>
            Uložit
          </Button>
          <Button variant="contained" color="secondary" onClick={copyHabitsToNextWeek}>
            Zkopírovat do týdne {week + 1}
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box mt={4}>
      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          ⚠️ {error}
        </Alert>
      )}

      {isMdUp ? (
        // ===== Desktop tabulka (původní zážitek) =====
        <>
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={1}>
              <TextField
                label="Nový návyk"
                size="small"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
                fullWidth
              />
              <IconButton onClick={handleAddHabit} color="primary" aria-label="Přidat návyk">
                <AddIcon />
              </IconButton>
            </Stack>
          </Paper>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={Object.keys(habits)}>
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Návyk</TableCell>
                      {days.map((day) => (
                        <TableCell key={day.key} align="center" sx={{ fontWeight: 700 }}>
                          {day.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(habits).map((habit) => (
                      <SortableHabitRow key={habit} habit={habit} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </SortableContext>
          </DndContext>

          <Box mt={2} display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => saveHabits(habits)}>
              Uložit
            </Button>
            <Button variant="contained" color="secondary" onClick={copyHabitsToNextWeek}>
              Zkopírovat do týdne {week + 1}
            </Button>
          </Box>
        </>
      ) : (
        // ===== Mobil / tablet =====
        <MobileHabits />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirm overwrite dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Přepsat návyky?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pro příští týden již existují návyky. Opravdu je chceš přepsat?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Ne
          </Button>
          <Button onClick={handleConfirmOverwrite} color="primary" autoFocus>
            Ano, přepsat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteHabitName} onClose={() => setDeleteHabitName(null)}>
        <DialogTitle>Odstranit návyk?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Opravdu chceš odstranit návyk „{deleteHabitName}“?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteHabitName(null)} color="inherit">
            Ne
          </Button>
          <Button onClick={handleDeleteHabit} color="error" autoFocus>
            Ano, odstranit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HabitCalendar;
