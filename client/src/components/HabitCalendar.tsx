import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  CircularProgress,
} from "@mui/material";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuthContext } from "../context/AuthContext";
import serverUrl from "../config";

interface HabitCalendarProps {
  week: number;
  year: number;
}

/** Dny ve fixním pořadí + klíče odpovídají uložené struktuře */
const days = [
  { label: "Pondělí", key: "monday" },
  { label: "Úterý", key: "tuesday" },
  { label: "Středa", key: "wednesday" },
  { label: "Čtvrtek", key: "thursday" },
  { label: "Pátek", key: "friday" },
  { label: "Sobota", key: "saturday" },
  { label: "Neděle", key: "sunday" },
];

type HabitsState = Record<string, Record<string, boolean>>;

const HabitCalendar: React.FC<HabitCalendarProps> = ({ week, year }) => {
  const { isAuthenticated } = useAuthContext();

  const [habits, setHabits] = useState<HabitsState>({});
  const [order, setOrder] = useState<string[]>([]);
  const [newHabit, setNewHabit] = useState<string>("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingCopy, setPendingCopy] = useState(false);
  const [deleteHabitName, setDeleteHabitName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<HabitsState>({});

  const normalizeKey = (s: string) => s.trim().toLowerCase();

  // ----- FIX 1: Unikátní, stabilní pořadí bez duplicit -----
  const sortedHabits = useMemo(() => {
    const keys = Object.keys(habits);
    const inOrder = order.filter((k) => keys.includes(k));
    const rest = keys.filter((k) => !order.includes(k));
    // sjednotíme a deduplikujeme
    return Array.from(new Set<string>([...inOrder, ...rest]));
  }, [habits, order]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchHabits = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${serverUrl}/api/habits?week=${week}&year=${year}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const loaded: HabitsState = data.habits || {};
        setHabits(loaded);
        lastSavedRef.current = loaded;

        // inicializuj order bez duplicit
        const initialOrder = Object.keys(loaded);
        setOrder(Array.from(new Set(initialOrder)));
      } catch (err) {
        console.error("Chyba při načítání návyků:", err);
        setSnackbar({
          open: true,
          message: "Nepodařilo se načíst návyky.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();

    return () => setSnackbar((s) => ({ ...s, open: false }));
  }, [week, year, isAuthenticated]);

  const persist = useCallback(
    async (habitsToSave: HabitsState) => {
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
        lastSavedRef.current = habitsToSave;
      } catch (err) {
        console.error("Chyba při ukládání návyků:", err);
        setSnackbar({
          open: true,
          message: "Chyba při ukládání návyků.",
          severity: "error",
        });
      }
    },
    [week, year]
  );

  const scheduleSave = useCallback(
    (habitsToSave: HabitsState) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        persist(habitsToSave);
      }, 350);
    },
    [persist]
  );

  const saveHabits = useCallback(
    (habitsToSave: HabitsState) => {
      scheduleSave(habitsToSave);
    },
    [scheduleSave]
  );

  const handleToggle = (habit: string, dayKey: string) => {
    setHabits((prev) => {
      const updated: HabitsState = {
        ...prev,
        [habit]: {
          ...prev[habit],
          [dayKey]: !prev[habit]?.[dayKey],
        },
      };
      saveHabits(updated);
      return updated;
    });
  };

  // ----- FIX 2: Atomické přidání + deduplikace order -----
  const handleAddHabit = () => {
    const trimmed = newHabit.trim();
    if (!trimmed) return;

    // deduplikace case-insensitive podle klíče v habits
    const exists = Object.keys(habits).some(
      (k) => normalizeKey(k) === normalizeKey(trimmed)
    );
    if (exists) {
      setSnackbar({
        open: true,
        message: "Tento návyk již existuje.",
        severity: "info",
      });
      return;
    }

    // připrav next struktury před renderem
    const nextHabits: HabitsState = { ...habits, [trimmed]: {} };
    const nextOrder = Array.from(new Set([...order, trimmed])); // zabrání duplicitě

    setHabits(nextHabits);
    setOrder(nextOrder);
    saveHabits(nextHabits);
    setNewHabit("");
  };

  const confirmDeleteHabit = (habit: string) => setDeleteHabitName(habit);

  const handleDeleteHabit = () => {
    if (!deleteHabitName) return;
    const name = deleteHabitName;
    const next = { ...habits };
    delete next[name];

    setHabits(next);
    setOrder((old) => old.filter((k) => k !== name));
    saveHabits(next);
    setDeleteHabitName(null);
  };

  const copyHabitsToNextWeek = async () => {
    const token = localStorage.getItem("token");
    const url = `${serverUrl}/api/habits/copy?week=${week}&year=${year}`;
    try {
      setPendingCopy(true);
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 409) {
        setConfirmDialogOpen(true);
        return;
      }

      const result = await res.json();
      setSnackbar({ open: true, message: result.message, severity: "success" });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Chyba při kopírování návyků.",
        severity: "error",
      });
    } finally {
      setPendingCopy(false);
    }
  };

  const handleConfirmOverwrite = async () => {
    setConfirmDialogOpen(false);

    const token = localStorage.getItem("token");
    const url = `${serverUrl}/api/habits/copy?week=${week}&year=${year}&force=true`;

    try {
      setPendingCopy(true);
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      setSnackbar({ open: true, message: result.message, severity: "success" });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Nepodařilo se přepsat návyky.",
        severity: "error",
      });
    } finally {
      setPendingCopy(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrder((old) => {
      const oldIndex = old.findIndex((k) => k === active.id);
      const newIndex = old.findIndex((k) => k === over.id);
      const newOrder = arrayMove(old, oldIndex, newIndex);
      // Pořadí samo o sobě na backend neposíláme (pokud budeš chtít, lze přidat)
      return newOrder;
    });
  };

  // Řádek s dnd
  const SortableHabitRow: React.FC<{ habit: string }> = ({ habit }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: habit,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <TableRow ref={setNodeRef} style={style} {...attributes} hover>
        <TableCell component="th" scope="row">
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
            <IconButton {...listeners} size="small" aria-label="Přesunout řádek">
              <DragHandleIcon fontSize="small" />
            </IconButton>
            <span style={{ flex: 1, overflowWrap: "anywhere" }}>{habit}</span>
            <IconButton
              onClick={() => confirmDeleteHabit(habit)}
              size="small"
              color="error"
              aria-label={`Smazat návyk ${habit}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </TableCell>
        {days.map(({ key }) => (
          <TableCell key={`${habit}-${key}`} align="center">
            <Checkbox
              checked={!!habits[habit]?.[key]}
              onChange={() => handleToggle(habit, key)}
              color="primary"
              inputProps={{ "aria-label": `Přepnout ${habit} pro ${key}` }}
            />
          </TableCell>
        ))}
      </TableRow>
    );
  };

  return (
    <Box mt={4}>
      {loading ? (
        <Box display="flex" alignItems="center" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedHabits}>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
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
                  {sortedHabits.map((habit) => (
                    <SortableHabitRow key={habit} habit={habit} />
                  ))}
                  <TableRow>
                    <TableCell colSpan={days.length + 1}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <TextField
                          label="Nový návyk"
                          size="small"
                          value={newHabit}
                          onChange={(e) => setNewHabit(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddHabit();
                            }
                          }}
                          fullWidth
                        />
                        <IconButton
                          onClick={handleAddHabit}
                          color="primary"
                          aria-label="Přidat návyk"
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </SortableContext>
        </DndContext>
      )}

      <Box mt={4} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="secondary"
          onClick={copyHabitsToNextWeek}
          disabled={pendingCopy}
        >
          {pendingCopy ? "Kopíruji…" : `Zkopírovat návyky do týdne ${week + 1}`}
        </Button>
      </Box>

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

      {/* Confirm přepsání při kopírování */}
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

      {/* Confirm smazání návyku */}
      <Dialog open={!!deleteHabitName} onClose={() => setDeleteHabitName(null)}>
        <DialogTitle>Odstranit návyk?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Opravdu chceš odstranit návyk "{deleteHabitName}"?
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
