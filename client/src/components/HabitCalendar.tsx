import React, { useState, useEffect } from "react";
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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingCopy, setPendingCopy] = useState(false);
  const [deleteHabitName, setDeleteHabitName] = useState<string | null>(null);

  const fetchHabits = async () => {
    setHabits({});
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
  };

  const saveHabits = async (updatedHabits: typeof habits) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ week, year, habits: updatedHabits }),
      });
    } catch (err) {
      console.error("Chyba při ukládání návyků:", err);
    }
  };

  const handleToggle = (habit: string, dayKey: string) => {
    const updatedHabits = {
      ...habits,
      [habit]: {
        ...habits[habit],
        [dayKey]: !habits[habit]?.[dayKey],
      },
    };
    setHabits(updatedHabits);
    saveHabits(updatedHabits);
  };

  const handleAddHabit = () => {
    if (!newHabit.trim()) return;
    const trimmed = newHabit.trim();
    if (habits[trimmed]) return;

    const updatedHabits = {
      ...habits,
      [trimmed]: {},
    };
    setHabits(updatedHabits);
    setNewHabit("");
    saveHabits(updatedHabits);
  };

  const confirmDeleteHabit = (habit: string) => {
    setDeleteHabitName(habit);
  };

  const handleDeleteHabit = () => {
    if (!deleteHabitName) return;
    const updatedHabits = { ...habits };
    delete updatedHabits[deleteHabitName];
    setHabits(updatedHabits);
    saveHabits(updatedHabits);
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

  useEffect(() => {
    console.log("📆 Změna týdne:", week, year);
    setHabits({});
    fetchHabits();
  }, [week, year, isAuthenticated]);

  return (
    <Box mt={4}>
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
              <TableRow key={habit}>
                <TableCell component="th" scope="row">
                  <Box display="flex" justifyContent="space-between" alignItems="center">
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
            ))}
            <TableRow>
              <TableCell colSpan={days.length + 1}>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    label="Nový návyk"
                    size="small"
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
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

      <Box mt={4} display="flex" justifyContent="center">
        <Button variant="contained" color="secondary" onClick={copyHabitsToNextWeek}>
          Zkopírovat návyky do týdne {week + 1}
        </Button>
      </Box>

      {/* Snackbar */}
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

      {/* Confirm delete dialog */}
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
