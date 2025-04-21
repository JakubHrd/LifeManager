import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Box,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Typography,
  TextField,
} from "@mui/material";
import { useAuthContext } from "../context/AuthContext";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const trainingsDefault = ["morning", "main", "evening"];

interface TrainingCalendarProps {
  week: number;
  year: number;
  onTrainingsChange?: (data: any) => void;
}

const TrainingCalendar = forwardRef(({ week, year, onTrainingsChange }: TrainingCalendarProps, ref) => {
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthContext();
  const [editingCell, setEditingCell] = useState<{ day: string; training: string } | null>(null);
  const [trainings, setTrainings] = useState<{
    [day: string]: {
      [training: string]: { description: string; done: boolean };
    };
  }>({});

  useImperativeHandle(ref, () => ({
    getTrainings: () => trainings,
    applySuggestion: (suggestion: any) => {
      const dayMap: Record<string, string> = {
        Pondělí: "Monday",
        Úterý: "Tuesday",
        Středa: "Wednesday",
        Čtvrtek: "Thursday",
        Pátek: "Friday",
        Sobota: "Saturday",
        Neděle: "Sunday",
      };

      const sectionMap: Record<string, string> = {
        rano: "morning",
        hlavni: "main",
        vecer: "evening",
      };

      const finalTrainings: typeof trainings = {};

      Object.entries(suggestion).forEach(([dayCzech, sectionData]) => {
        const dayEnglish = dayMap[dayCzech] || dayCzech;
        finalTrainings[dayEnglish] = {};

        Object.entries(sectionData as Record<string, string | null | undefined>).forEach(
          ([sectionKey, description]) => {
            const key = sectionMap[sectionKey] || sectionKey;
            finalTrainings[dayEnglish][key] = {
              description: String(description ?? ""),
              done: false,
            };
          }
        );
      });

      setTrainings(finalTrainings);
      if (onTrainingsChange) onTrainingsChange(finalTrainings);
    },
  }));

  const fetchData = async (week: number, year: number) => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/trainings?week=${week}&year=${year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Chyba při načítání tréninkův");

      const data = await response.json();
      setTrainings(data.trainings || {});
      if (onTrainingsChange) onTrainingsChange(data.trainings || {});
    } catch (error) {
      setError(error instanceof Error ? error.message : "Neznámá chyba");
    }
  };

  useEffect(() => {
    fetchData(week, year);
  }, [isAuthenticated, week, year]);

  const toggleCompletion = async (day: string, training: string) => {
    setTrainings((prev) => {
      const updated = {
        ...prev,
        [day]: {
          ...prev[day],
          [training]: {
            ...prev[day]?.[training],
            done: !prev[day]?.[training]?.done,
          },
        },
      };
      if (onTrainingsChange) onTrainingsChange(updated);
      return updated;
    });

    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/trainings?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ trainings }),
    });
  };

  const handleDescriptionChange = (day: string, training: string, value: string) => {
    setTrainings((prev) => {
      const updated = {
        ...prev,
        [day]: {
          ...prev[day],
          [training]: {
            ...prev[day]?.[training],
            description: value,
          },
        },
      };
      return updated;
    });
  };

  const savePlan = async () => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/trainings?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ trainings }),
    });
  };

  const translations: Record<string, { cs: string }> = {
    morning: { cs: "Ráno" },
    main: { cs: "Hlavní aktivita" },
    evening: { cs: "Večer" },
    Monday: { cs: "Pondělí" },
    Tuesday: { cs: "Úterý" },
    Wednesday: { cs: "Středa" },
    Thursday: { cs: "Čtvrtek" },
    Friday: { cs: "Pátek" },
    Saturday: { cs: "Sobota" },
    Sunday: { cs: "Neděle" },
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" variant="outlined">
          ⚠️ {error}
        </Alert>
      )}
      <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}></TableCell>
              {trainingsDefault.map((training) => (
                <TableCell key={training} align="center" sx={{ color: "white", fontWeight: "bold" }}>
                  {translations[training].cs}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {days.map((day) => (
              <TableRow key={day} hover>
                <TableCell sx={{ fontWeight: "medium", pl: 2 }}>{translations[day].cs}</TableCell>
                {trainingsDefault.map((training) => (
                  <TableCell key={training} align="center">
                    <Button
                      size="small"
                      variant={trainings[day]?.[training]?.done ? "contained" : "outlined"}
                      color={trainings[day]?.[training]?.done ? "success" : "primary"}
                      onClick={() => toggleCompletion(day, training)}
                      sx={{ mb: 1, minWidth: 40 }}
                    >
                      {trainings[day]?.[training]?.done ? "✔" : "✖"}
                    </Button>
                    {editingCell?.day === day && editingCell.training === training ? (
                      <TextField
                        value={trainings[day]?.[training]?.description || ""}
                        onChange={(e) => handleDescriptionChange(day, training, e.target.value)}
                        onBlur={() => {
                          setEditingCell(null);
                          savePlan();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setEditingCell(null);
                            savePlan();
                          }
                        }}
                        size="small"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        autoFocus
                      />
                    ) : (
                      <Typography
                        variant="caption"
                        display="block"
                        onClick={() => setEditingCell({ day, training })}
                        sx={{ cursor: "pointer" }}
                      >
                        {trainings[day]?.[training]?.description || " - "}
                      </Typography>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
});

export default TrainingCalendar;