import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Divider,
} from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import HabitCalendar from "../components/HabitCalendar";

// 📌 Získání aktuálního týdne
const getCurrentWeek = (): number => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
};

// 📌 Pomocná funkce pro rozsah týdne (volitelné)
const getWeekRange = (week: number, year: number): string => {
  const firstDayOfYear = new Date(year, 0, 1);
  const daysOffset = (week - 1) * 7;
  const weekStart = new Date(firstDayOfYear.getTime() + daysOffset * 86400000);

  // Najdeme začátek týdne (pondělí)
  const day = weekStart.getDay();
  const diff = (day === 0 ? -6 : 1 - day); // neděle => pondělí
  const monday = new Date(weekStart);
  monday.setDate(weekStart.getDate() + diff);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (d: Date) => d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long" });
  return `${format(monday)} – ${format(sunday)}`;
};

const Habits: React.FC = () => {
  const [week, setWeek] = useState<number>(getCurrentWeek());
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const handleWeekChange = (change: number) => {
    setWeek((prev) => prev + change);
  };

  return (
    <Container maxWidth="xl">
      <Box component="section" sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Habit Tracker – Týden {week}, Rok {year}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button
            variant="contained"
            sx={{ borderRadius: "16px" }}
            startIcon={<KeyboardArrowLeftIcon />}
            onClick={() => handleWeekChange(-1)}
            disabled={week === 1}
          >
            Předchozí týden
          </Button>
          <Button
            variant="contained"
            sx={{ borderRadius: "16px", ml: 2 }}
            endIcon={<KeyboardArrowRightIcon />}
            onClick={() => handleWeekChange(1)}
          >
            Další týden
          </Button>
        </Box>
      </Box>

      <HabitCalendar week={week} year={year} />

      <Divider sx={{ my: 6 }} />
    </Container>
  );
};

export default Habits;
