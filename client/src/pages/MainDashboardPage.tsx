// Import potřebných knihoven a komponent
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import moment from "moment";
import { useAuthContext } from "../context/AuthContext";
import serverUrl from "../config";

const MainDashboard: React.FC = () => {
  const { isAuthenticated } = useAuthContext();

  const [week, setWeek] = useState<number>(moment().isoWeek());
  const [year, setYear] = useState<number>(moment().year());

  type MealsForDay = {
    [meal: string]: { description: string; eaten: boolean };
  };
  type MealsForWeek = {
    [day: string]: MealsForDay;
  };

  type TrainingsForDay = {
    [training: string]: { description: string; done: boolean };
  };
  type TrainingsForWeek = {
    [day: string]: TrainingsForDay;
  };

  const [weekMeals, setWeekMeals] = useState<MealsForWeek>({});
  const [todayMeals, setTodayMeals] = useState<MealsForDay>({});
  const [weekTrainings, setWeekTrainings] = useState<TrainingsForWeek>({});
  const [todayTrainings, setTodayTrainings] = useState<TrainingsForDay>({});
  const [habits, setHabits] = useState<Record<string, Record<string, boolean>>>({});

  const orderedMealKeys = ["breakfast", "snack", "lunch", "snack2", "dinner"];
  const mealLabels: Record<string, string> = {
    breakfast: "Snídaně",
    snack: "Svačina",
    lunch: "Oběd",
    snack2: "Odpolední svačina",
    dinner: "Večeře",
  };

  const orderedTrainingKeys = ["morning", "main", "evening"];
  const trainingLabels: Record<string, string> = {
    morning: "Ranní část",
    main: "Hlavní trénink",
    evening: "Večerní protažení",
  };

  function displaySingleDayData<T>(
    weekData: Record<string, T>,
    setter: React.Dispatch<React.SetStateAction<T>>,
    label: string
  ) {
    const day = moment().format("dddd");
    const todayData = weekData[day];
    if (todayData) {
      setter(todayData);
    } else {
      console.warn(`Pro den ${day} nebyla nalezena data (${label}).`);
    }
  }

  useEffect(() => {
    async function getUserData<T>(
      endpoint: string,
      dataKey: string,
      setter: React.Dispatch<React.SetStateAction<T>>
    ) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${serverUrl}/api/${endpoint}?week=${week}&year=${year}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error(`Chyba při načítání dat pro ${endpoint}.`);
        const data = await response.json();
        setter(data[dataKey] || {});
      } catch (error) {
        console.error(`Chyba při načítání dat pro ${endpoint}:`, error);
      }
    }

    getUserData("meals", "meals", setWeekMeals);
    getUserData("trainings", "trainings", setWeekTrainings);
    getUserData("habits", "habits", setHabits);
  }, [isAuthenticated]);

  useEffect(() => {
    if (weekMeals) {
      displaySingleDayData(weekMeals, setTodayMeals, "jídelníček");
    }
    if (weekTrainings) {
      displaySingleDayData(weekTrainings, setTodayTrainings, "trénink");
    }
  }, [weekMeals, weekTrainings]);

  const handleToggleMealEaten = async (mealKey: string) => {
    const updatedMeal = {
      ...todayMeals[mealKey],
      eaten: !todayMeals[mealKey]?.eaten,
    };
    const updated = {
      ...todayMeals,
      [mealKey]: updatedMeal,
    };
    setTodayMeals(updated);
    const token = localStorage.getItem("token");
    const currentDay = moment().format("dddd");
    await fetch(`${serverUrl}/api/meals?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        meals: {
          ...weekMeals,
          [currentDay]: updated,
        },
      }),
    });
    setWeekMeals((prev) => ({ ...prev, [currentDay]: updated }));
  };

  const handleToggleTrainingDone = async (partKey: string) => {
    const updatedPart = {
      ...todayTrainings[partKey],
      done: !todayTrainings[partKey]?.done,
    };
    const updated = {
      ...todayTrainings,
      [partKey]: updatedPart,
    };
    setTodayTrainings(updated);
    const token = localStorage.getItem("token");
    const currentDay = moment().format("dddd");
    await fetch(`${serverUrl}/api/trainings?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        trainings: {
          ...weekTrainings,
          [currentDay]: updated,
        },
      }),
    });
    setWeekTrainings((prev) => ({ ...prev, [currentDay]: updated }));
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🥗 Dnešní jídelníček
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  {orderedMealKeys.map((mealKey) => (
                    <TableCell key={mealKey} align="center">
                      <strong>{mealLabels[mealKey]}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {orderedMealKeys.map((mealKey) => {
                    const meal = todayMeals[mealKey];
                    return (
                      <TableCell
                        key={mealKey}
                        align="center"
                        onClick={() => handleToggleMealEaten(mealKey)}
                        sx={{ cursor: "pointer" }}
                      >
                        {meal ? (
                          <>
                            <Typography variant="body2">{meal.description}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {meal.eaten ? "✅" : "❌"}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🏋️ Dnešní trénink
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  {orderedTrainingKeys.map((partKey) => (
                    <TableCell key={partKey} align="center">
                      <strong>{trainingLabels[partKey]}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {orderedTrainingKeys.map((partKey) => {
                    const part = todayTrainings[partKey];
                    return (
                      <TableCell
                        key={partKey}
                        align="center"
                        onClick={() => handleToggleTrainingDone(partKey)}
                        sx={{ cursor: "pointer" }}
                      >
                        {part ? (
                          <>
                            <Typography variant="body2">
                              {part.description || "Bez zadání"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {part.done ? "✅ Hotovo" : "❌ Nehotovo"}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🧠 Dnešní návyky
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Návyk</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Stav</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(habits).map((habitKey) => {
                  const habit = habits[habitKey];
                  const done = habit?.done ?? false;
                  return (
                    <TableRow key={habitKey}>
                      <TableCell>{habitKey}</TableCell>
                      <TableCell align="center">
                        {done ? "✅ Splněno" : "❌ Nesplněno"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MainDashboard;