import React, { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuthContext } from "../context/AuthContext";

interface HabitCalendarProps {
  week: number;
  year: number;
}

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
  const [habits, setHabits] = useState<Record<string, Record<string, boolean>>>({});
  const [newHabit, setNewHabit] = useState<string>("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingCopy, setPendingCopy] = useState(false);
  const [deleteHabitName, setDeleteHabitName] = useState<string | null>(null);
useEffect(() => {
  const fetchHabits = async () => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/habits?week=${week}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHabits(data.habits || {});
    } catch (err) {
      console.error("Chyba při načítání návyků:", err);
    }
  }
  fetchHabits();
  }, [week,year,isAuthenticated]);

  const saveHabits = useCallback(async (habitsToSave: typeof habits) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/habits?week=${week}&year=${year}`, {
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
  }, [week, year]);

  const handleToggle = (habit: string, dayKey: string) => {
    setHabits((prev) => {
      const updated = {
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

  const handleAddHabit = () => {
    if (!newHabit.trim()) return;
    const trimmed = newHabit.trim();
    if (habits[trimmed]) return;
    setHabits((prev) => {
      const updated = { ...prev, [trimmed]: {} };
      saveHabits(updated);
      return updated;
    });
    setNewHabit("");
  };

  const confirmDeleteHabit = (habit: string) => {
    setDeleteHabitName(habit);
  };

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

  const copyHabitsToNextWeek = async () => {
    const token = localStorage.getItem("token");
    const url = `http://localhost:5000/api/habits/copy?week=${week}&year=${year}`;
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
    const url = `http://localhost:5000/api/habits/copy?week=${week}&year=${year}&force=true`;

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const habitsArray = Object.entries(habits);
    const oldIndex = habitsArray.findIndex(([key]) => key === active.id);
    const newIndex = habitsArray.findIndex(([key]) => key === over.id);

    const newHabitsArray = arrayMove(habitsArray, oldIndex, newIndex);
    const newHabits = Object.fromEntries(newHabitsArray);

    setHabits(newHabits);
    saveHabits(newHabits);
  };

  // Lokální komponenta Sortable řádku
  const SortableHabitRow: React.FC<{ habit: string }> = ({ habit }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: habit });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <TableCell component="th" scope="row">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <IconButton {...listeners} size="small">
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

  return (
    <Box mt={4}>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={Object.keys(habits)}>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Návyk</TableCell>
                  {days.map((day) => (
                    <TableCell key={day.key} align="center">{day.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(habits).map((habit) => (
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
                      <IconButton onClick={handleAddHabit} color="primary">
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


      <Box mt={4} display="flex" justifyContent="center">
        <Button variant="contained" color="secondary" onClick={copyHabitsToNextWeek}>
          Zkopírovat návyky do týdne {week + 1}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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
