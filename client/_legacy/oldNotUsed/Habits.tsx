import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Divider,
} from "@mui/material";
import moment from "moment";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import HabitCalendar from "./HabitCalendar";

const Habits: React.FC = () => {
  const [week, setWeek] = useState<number>(moment().isoWeek());
  const [year, setYear] = useState<number>(moment().year());

  const handleWeekChange = (change: number) => {
    setWeek((prev) => prev + change);
  };

  return (
    <Container maxWidth="xl">
      <Box component="section" sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom align="center" fontWeight={800}>
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
