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

const getCurrentWeek = (): number => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
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
          ✅ Habit Tracker – Týden {week}, Rok {year}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<KeyboardArrowLeftIcon />}
            onClick={() => handleWeekChange(-1)}
            disabled={week === 1}
          >
            Předchozí týden
          </Button>
          <Button
            variant="contained"
            endIcon={<KeyboardArrowRightIcon />}
            onClick={() => handleWeekChange(1)}
          >
            Další týden
          </Button>
        </Box>
      </Box>

      <HabitCalendar week={week} year={year} />

      <Divider sx={{ my: 4 }} />
    </Container>
  );
};

export default Habits;
