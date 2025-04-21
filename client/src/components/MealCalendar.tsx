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
const mealsDefault = ["breakfast", "snack", "lunch", "snack2", "dinner"];

interface MealCalendarProps {
  week: number;
  year: number;
  onMealsChange?: (data: any) => void;
}

const MealCalendar = forwardRef(({ week, year, onMealsChange }: MealCalendarProps, ref) => {
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthContext();
  const [editingCell, setEditingCell] = useState<{ day: string; meal: string } | null>(null);

  const [meals, setMeals] = useState<{
    [day: string]: {
      [meal: string]: { description: string; eaten: boolean };
    };
  }>({});

  useImperativeHandle(ref, () => ({
    getMeals: () => meals,
    applySuggestion: (suggestion: any) => {
      const dayTranslation: Record<string, string> = {
        Pondělí: "Monday",
        Úterý: "Tuesday",
        Středa: "Wednesday",
        Čtvrtek: "Thursday",
        Pátek: "Friday",
        Sobota: "Saturday",
        Neděle: "Sunday",
      };

      const mealTypeMap: Record<string, string> = {
        snidane: "breakfast",
        svacina: "snack",
        obed: "lunch",
        svacina_odpoledne: "snack2",
        vecere: "dinner",
      };

      const finalMeals: typeof meals = {};

      Object.entries(suggestion).forEach(([dayCzech, mealData]) => {
        const dayEnglish = dayTranslation[dayCzech] || dayCzech;
        finalMeals[dayEnglish] = {};

        Object.entries(mealData as Record<string, string | null | undefined>).forEach(([mealKeyCzech, description]) => {
          const mealKeyEnglish = mealTypeMap[mealKeyCzech] || mealKeyCzech;
          finalMeals[dayEnglish][mealKeyEnglish] = {
            description: String(description ?? ""),
            eaten: false,
          };
        });
      });

      setMeals(finalMeals);
      if (onMealsChange) onMealsChange(finalMeals);
    },
  }));

  const fetchData = async (week: number, year: number) => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/meals?week=${week}&year=${year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Chyba při načítání tréninkového plánu.");

      const data = await response.json();
      setMeals(data.meals || {});

      if (onMealsChange) {
        onMealsChange(data.meals || {});
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Neznámá chyba");
      }
    }
  };

  useEffect(() => {
    fetchData(week, year);
  }, [isAuthenticated, week, year]);

  const toggleCompletion = async (day: string, meal: string) => {
    setMeals((prev) => {
      const updated = {
        ...prev,
        [day]: {
          ...prev[day],
          [meal]: {
            ...prev[day]?.[meal],
            eaten: !prev[day]?.[meal]?.eaten,
          },
        },
      };
      if (onMealsChange) onMealsChange(updated);
      return updated;
    });

    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/meals?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ meals }),
    });
  };

  const handleDescriptionChange = (day: string, meal: string, value: string) => {
    setMeals((prev) => {
      const updated = {
        ...prev,
        [day]: {
          ...prev[day],
          [meal]: {
            ...prev[day]?.[meal],
            description: value,
          },
        },
      };
      if (onMealsChange) onMealsChange(updated);
      return updated;
    });
  };

  const savePlan = async () => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/meals?week=${week}&year=${year}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ meals }),
    });
  };

  const translations: Record<string, { cs: string }> = {
    breakfast: { cs: "Snídaně" },
    snack: { cs: "Svačina" },
    snack2: { cs: "Svačina odpoledne" },
    lunch: { cs: "Oběd" },
    dinner: { cs: "Večeře" },
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
              {mealsDefault.map((meal) => (
                <TableCell key={meal} align="center" sx={{ color: "white", fontWeight: "bold" }}>
                  {translations[meal].cs}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {days.map((day) => (
              <TableRow key={day} hover>
                <TableCell sx={{ fontWeight: "medium", pl: 2 }}>{translations[day].cs}</TableCell>
                {mealsDefault.map((meal) => (
                  <TableCell key={meal} align="center">
                    <Button
                      size="small"
                      variant={meals[day]?.[meal]?.eaten ? "contained" : "outlined"}
                      color={meals[day]?.[meal]?.eaten ? "success" : "primary"}
                      onClick={() => toggleCompletion(day, meal)}
                      sx={{ mb: 1, minWidth: 40 }}
                    >
                      {meals[day]?.[meal]?.eaten ? "✔" : "✖"}
                    </Button>
                    {editingCell?.day === day && editingCell.meal === meal ? (
                      <TextField
                        value={meals[day]?.[meal]?.description || ""}
                        onChange={(e) => handleDescriptionChange(day, meal, e.target.value)}
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
                        onClick={() => setEditingCell({ day, meal })}
                        sx={{ cursor: "pointer" }}
                      >
                        {meals[day]?.[meal]?.description || " - "}
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

export default MealCalendar;
