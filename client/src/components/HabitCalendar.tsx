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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface HabitCalendarProps {
  week: number;
  year: number;
}

const days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

const HabitCalendar: React.FC<HabitCalendarProps> = ({ week, year }) => {
  const [habits, setHabits] = useState<string[]>(["Ranní běh", "Studium", "Meditace"]);
  const [newHabit, setNewHabit] = useState<string>("");
  const [completed, setCompleted] = useState<Record<string, Record<string, boolean>>>({});

  // 🧠 Budoucí hook pro načtení dat z DB
  useEffect(() => {
    console.log("Aktuální týden/rok:", week, year);
    // Tady později načti data podle týdne a roku z backendu
  }, [week, year]);

  const handleToggle = (habit: string, day: string) => {
    setCompleted((prev) => ({
      ...prev,
      [habit]: {
        ...prev[habit],
        [day]: !prev[habit]?.[day],
      },
    }));
  };

  const handleAddHabit = () => {
    if (!newHabit.trim()) return;
    setHabits((prev) => [...prev, newHabit.trim()]);
    setNewHabit("");
  };

  return (
    <Box mt={4}>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Návyk</TableCell>
              {days.map((day) => (
                <TableCell key={day} align="center">{day}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {habits.map((habit) => (
              <TableRow key={habit}>
                <TableCell component="th" scope="row">{habit}</TableCell>
                {days.map((day) => (
                  <TableCell key={day} align="center">
                    <Checkbox
                      checked={!!completed[habit]?.[day]}
                      onChange={() => handleToggle(habit, day)}
                      color="primary"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {/* Řádek pro přidání nového návyku */}
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
    </Box>
  );
};

export default HabitCalendar;
