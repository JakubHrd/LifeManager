// Import potřebných knihoven a komponent
import React, { useState, useEffect } from "react";
import {
  Box,
  Toolbar,
  CssBaseline,
  Container,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import moment from "moment";

const MainDashboard: React.FC = () => {
  // Získání informace o autentizaci uživatele
  const { isAuthenticated } = useAuthContext();

  // Aktuální týden a rok pro dotazování na data
  const [week, setWeek] = useState<number>(moment().isoWeek());
  const [year, setYear] = useState<number>(moment().year());

  /** ---------- JÍDLA ---------- */

  // Typ pro denní jídla
  type MealsForDay = {
    [meal: string]: { description: string; eaten: boolean };
  };

  // Typ pro celý týden jídel
  type MealsForWeek = {
    [day: string]: MealsForDay;
  };

  const [weekMeals, setWeekMeals] = useState<MealsForWeek>({});
  const [todayMeals, setTodayMeals] = useState<MealsForDay>({});

  // Pořadí a překlady typů jídel
  const orderedMealKeys = ["breakfast", "snack", "lunch", "snack2", "dinner"];
  const mealLabels: Record<string, string> = {
    breakfast: "Snídaně",
    snack: "Svačina",
    lunch: "Oběd",
    snack2: "Odpolední svačina",
    dinner: "Večeře",
  };

  /** ---------- TRÉNINK ---------- */

  // Typy pro denní trénink a týdenní plán
  type TrainingsForDay = {
    [training: string]: { description: string; done: boolean };
  };
  type TrainingsForWeek = {
    [day: string]: TrainingsForDay;
  };

  const [weekTrainings, setWeekTrainings] = useState<TrainingsForWeek>({});
  const [todayTrainings, setTodayTrainings] = useState<TrainingsForDay>({});

  // Pořadí a překlady tréninkových částí
  const orderedTrainingKeys = ["morning", "main", "evening"];
  const trainingLabels: Record<string, string> = {
    morning: "Ranní část",
    main: "Hlavní trénink",
    evening: "Večerní protažení",
  };

  /** ---------- NÁVYKY ---------- */

  // Struktura návyků – název a případný stav
  const [habits, setHabits] = useState<Record<string, Record<string, boolean>>>({});

  /**
   * Obecná funkce pro nastavení dat podle aktuálního dne.
   * Používá se jak pro jídelníček, tak trénink.
   */
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

  /**
   * useEffect pro načtení jídelníčku, tréninků a návyků z API
   * při přihlášení uživatele.
   */
  useEffect(() => {
    async function getUserData<T>(
      endpoint: string,
      dataKey: string,
      setter: React.Dispatch<React.SetStateAction<T>>
    ) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/${endpoint}?week=${week}&year=${year}`,
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

  /**
   * useEffect pro rozdělení jídelníčku a tréninku
   * na základě aktuálního dne.
   */
  useEffect(() => {
    if (weekMeals) {
      displaySingleDayData(weekMeals, setTodayMeals, "jídelníček");
    }
    if (weekTrainings) {
      displaySingleDayData(weekTrainings, setTodayTrainings, "trénink");
    }
  }, [weekMeals, weekTrainings]);

  /** ---------- VÝSTUP ---------- */

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {/* Jídelníček */}
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
                      <TableCell key={mealKey} align="center">
                        {meal ? (
                          <>
                            <Typography variant="body2">
                              {meal.description}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
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

        {/* Trénink */}
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
                      <TableCell key={partKey} align="center">
                        {part ? (
                          <>
                            <Typography variant="body2">
                              {part.description || "Bez zadání"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
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

        {/* Návyky */}
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