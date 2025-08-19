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
  TableContainer,
  Typography,
  Chip,
  Stack,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import moment from "moment";
import "moment/locale/cs";
import { useAuthContext } from "../context/AuthContext";
import serverUrl from "../config";

import RestaurantIcon from "@mui/icons-material/Restaurant";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import TodayIcon from "@mui/icons-material/Today";

moment.locale("cs");

const MainDashboard: React.FC = () => {
  const { isAuthenticated } = useAuthContext();

  const [week, setWeek] = useState<number>(moment().isoWeek());
  const [year, setYear] = useState<number>(moment().year());

  // --- Typy ---
  type MealsForDay = {
    [meal: string]: { description: string; eaten: boolean };
  };
  type MealsForWeek = { [day: string]: MealsForDay };

  type TrainingsForDay = {
    [training: string]: { description: string; done: boolean };
  };
  type TrainingsForWeek = { [day: string]: TrainingsForDay };

  // HABITS: per-week struktura { habitName: { monday:boolean, ... } }
  type HabitsForWeek = Record<string, Record<string, boolean>>;

  // --- Stav ---
  const [weekMeals, setWeekMeals] = useState<MealsForWeek>({});
  const [todayMeals, setTodayMeals] = useState<MealsForDay>({});

  const [weekTrainings, setWeekTrainings] = useState<TrainingsForWeek>({});
  const [todayTrainings, setTodayTrainings] = useState<TrainingsForDay>({});

  const [weekHabits, setWeekHabits] = useState<HabitsForWeek>({});

  // --- Konstanty pro UI ---
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

  // --- Pomocníci ---
  // vrátí možné klíče dne (EN/CS) pro weekMeals/weekTrainings, které máš uložené per-day
  const possibleDayKeys = (): string[] => {
    const en = moment().locale("en").format("dddd"); // Thursday
    const cs = moment().locale("cs").format("dddd"); // čtvrtek
    const variants = new Set<string>([
      en,
      en.toLowerCase(),
      en.toUpperCase(),
      en.charAt(0).toUpperCase() + en.slice(1).toLowerCase(),
      cs,
      cs.toLowerCase(),
      cs.toUpperCase(),
      cs.charAt(0).toUpperCase() + cs.slice(1).toLowerCase(),
    ]);
    return Array.from(variants);
  };

  const pickTodayFromWeek = <T extends Record<string, any>>(
    weekData: Record<string, T[keyof T]>
  ): T[keyof T] | undefined => {
    const keys = possibleDayKeys();
    for (const k of keys) {
      if (weekData && Object.prototype.hasOwnProperty.call(weekData, k)) {
        return weekData[k];
      }
    }
    return undefined;
  };

  // přemapování překlepu launch -> lunch jen pro frontend zobrazení
  const normalizeMealsForDay = (dayMeals?: MealsForDay): MealsForDay => {
    if (!dayMeals) return {};
    const clone: MealsForDay = { ...dayMeals };
    if ((clone as any)["launch"] && !clone["lunch"]) {
      (clone as any)["lunch"] = (clone as any)["launch"];
    }
    return clone;
  };

  // --- Načtení dat pro aktuální týden ---
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
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error(`Chyba při načítání dat pro ${endpoint}.`);
        const data = await response.json();
        setter((data as any)[dataKey] || {});
      } catch (error) {
        console.error(`Chyba při načítání dat pro ${endpoint}:`, error);
      }
    }

    if (!isAuthenticated) return;
    getUserData("meals", "meals", setWeekMeals);
    getUserData("trainings", "trainings", setWeekTrainings);
    getUserData("habits", "habits", setWeekHabits); // <— habits per-week { habitName: { monday:boolean } }
  }, [isAuthenticated, week, year]);

  // --- Odvození dnešních "řezů" z týdenních dat (jen pro zobrazení) ---
  useEffect(() => {
    const todayMealsRaw = pickTodayFromWeek<MealsForWeek>(weekMeals);
    const todayTrainingsRaw = pickTodayFromWeek<TrainingsForWeek>(weekTrainings);

    setTodayMeals(normalizeMealsForDay(todayMealsRaw as MealsForDay | undefined));
    setTodayTrainings((todayTrainingsRaw as TrainingsForDay) || {});
  }, [weekMeals, weekTrainings]);

  // --- Toggle akce (zachovávají strukturu backendu) ---
  const handleToggleMealEaten = async (mealKey: string) => {
    const updatedMeal = {
      ...todayMeals[mealKey],
      eaten: !todayMeals[mealKey]?.eaten,
    };
    const updated = { ...todayMeals, [mealKey]: updatedMeal };
    setTodayMeals(updated);

    const token = localStorage.getItem("token");
    const currentDayEn = moment().locale("en").format("dddd");
    const currentDayCs = moment().locale("cs").format("dddd");
    const dayKeyForPost =
      (weekMeals as any)[currentDayEn] !== undefined
        ? currentDayEn
        : (weekMeals as any)[currentDayCs] !== undefined
        ? currentDayCs
        : currentDayEn;

    await fetch(`${serverUrl}/api/meals?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        meals: { ...weekMeals, [dayKeyForPost]: updated },
      }),
    });
    setWeekMeals((prev) => ({ ...prev, [dayKeyForPost]: updated }));
  };

  const handleToggleTrainingDone = async (partKey: string) => {
    const updatedPart = {
      ...todayTrainings[partKey],
      done: !todayTrainings[partKey]?.done,
    };
    const updated = { ...todayTrainings, [partKey]: updatedPart };
    setTodayTrainings(updated);

    const token = localStorage.getItem("token");
    const currentDayEn = moment().locale("en").format("dddd");
    const currentDayCs = moment().locale("cs").format("dddd");
    const dayKeyForPost =
      (weekTrainings as any)[currentDayEn] !== undefined
        ? currentDayEn
        : (weekTrainings as any)[currentDayCs] !== undefined
        ? currentDayCs
        : currentDayEn;

    await fetch(`${serverUrl}/api/trainings?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        trainings: { ...weekTrainings, [dayKeyForPost]: updated },
      }),
    });
    setWeekTrainings((prev) => ({ ...prev, [dayKeyForPost]: updated }));
  };

  // HABITS toggle – per-week struktura { habitName: { monday:boolean, ... } }
  const handleToggleHabitDone = async (habitName: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // dnešní klíč ve formátu používaném v HabitCalendar: monday..sunday (lowercase EN)
    const todayKey = moment().locale("en").format("dddd").toLowerCase(); // např. "thursday"

    const currentHabitDays = weekHabits[habitName] || {};
    const current = !!currentHabitDays[todayKey];
    const updatedHabitDays = { ...currentHabitDays, [todayKey]: !current };
    const updatedWeek = { ...weekHabits, [habitName]: updatedHabitDays };

    setWeekHabits(updatedWeek);

    await fetch(`${serverUrl}/api/habits?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ week, year, habits: updatedWeek }),
    });
  };

  // --- Vizuální & responzivní část ---
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
  const todayLabel = moment().format("dddd D. M. YYYY");

  const SectionHeader: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
  }> = ({ icon, title, subtitle }) => (
    <Stack
      direction={{ xs: "column", md: "row" }}
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={1.5}
      sx={{ mb: 2 }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ display: "inline-flex", alignItems: "center" }}>{icon}</Box>
        <Typography variant={isSmDown ? "h6" : "h5"} fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ ml: { md: "auto" } }}>
        {subtitle && (
          <Chip
            icon={<TodayIcon />}
            label={subtitle}
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
        <Chip label={`Týden ${week}, ${year}`} color="primary" variant="outlined" size="small" />
      </Stack>
    </Stack>
  );

  const EmptyState: React.FC<{ text: string }> = ({ text }) => (
    <Box sx={{ py: 3, textAlign: "center" }}>
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );

  const clickableCellSx = {
    cursor: "pointer",
    "&:hover": { backgroundColor: "action.hover" },
    transition: "background-color 0.15s ease",
  };

  // Dnešní „výřez“ návyků pro render: převod weekHabits -> { habitName: booleanForToday }
  const todayHabitMap: Record<string, boolean> = (() => {
    const key = moment().locale("en").format("dddd").toLowerCase();
    const entries = Object.entries(weekHabits).map(([habitName, days]) => [
      habitName,
      !!days?.[key],
    ]);
    return Object.fromEntries(entries);
  })();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Hlavička dashboardu */}
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 3, bgcolor: "transparent" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", md: "center" }}>
          <Typography variant={isSmDown ? "h5" : "h4"} fontWeight={800}>
            Přehled dne
          </Typography>
          <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" }, mx: 2 }} />
          <Chip label={todayLabel} color="primary" sx={{ fontWeight: 600 }} variant="outlined" />
        </Stack>
      </Paper>

      <Grid container spacing={4}>
        {/* Jídelníček */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
            <SectionHeader
              icon={<RestaurantIcon color="primary" />}
              title="Dnešní jídelníček"
              subtitle="Klepnutím přepínáš snědeno/nesnědeno"
            />

            <TableContainer sx={{ borderRadius: 2 }}>
              <Table size={isSmDown ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    {orderedMealKeys.map((mealKey) => (
                      <TableCell key={mealKey} align="center" sx={{ fontWeight: 700 }}>
                        {mealLabels[mealKey]}
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
                          sx={clickableCellSx}
                        >
                          {meal ? (
                            <Stack spacing={0.5} alignItems="center">
                              <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                {meal.description || "-"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color={meal.eaten ? "success.main" : "text.secondary"}
                                sx={{ fontWeight: meal.eaten ? 700 : 400 }}
                              >
                                {meal.eaten ? "✅ Snědeno" : "❌ Nesnědeno"}
                              </Typography>
                            </Stack>
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
            </TableContainer>

            {!orderedMealKeys.some((k) => todayMeals[k]) && (
              <EmptyState text="Pro dnešek zde zatím nejsou položky jídelníčku." />
            )}
          </Paper>
        </Grid>

        {/* Trénink */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
            <SectionHeader
              icon={<FitnessCenterIcon color="primary" />}
              title="Dnešní trénink"
              subtitle="Klepnutím přepínáš hotovo/nehotovo"
            />

            <TableContainer sx={{ borderRadius: 2 }}>
              <Table size={isSmDown ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    {orderedTrainingKeys.map((partKey) => (
                      <TableCell key={partKey} align="center" sx={{ fontWeight: 700 }}>
                        {trainingLabels[partKey]}
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
                          sx={clickableCellSx}
                        >
                          {part ? (
                            <Stack spacing={0.5} alignItems="center">
                              <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                {part.description || "Bez zadání"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color={part.done ? "success.main" : "text.secondary"}
                                sx={{ fontWeight: part.done ? 700 : 400 }}
                              >
                                {part.done ? "✅ Hotovo" : "❌ Nehotovo"}
                              </Typography>
                            </Stack>
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
            </TableContainer>

            {!orderedTrainingKeys.some((k) => todayTrainings[k]) && (
              <EmptyState text="Pro dnešek zde zatím nejsou položky tréninku." />
            )}
          </Paper>
        </Grid>

        {/* Návyky (per-week -> výřez pro dnešek) */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
            <SectionHeader
              icon={<TaskAltIcon color="primary" />}
              title="Dnešní návyky"
              subtitle="Klepnutím přepínáš splněno/nesplněno"
            />

            <TableContainer sx={{ borderRadius: 2 }}>
              <Table size={isSmDown ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Návyk</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Stav
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(todayHabitMap).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Zatím tu nic není.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    Object.keys(todayHabitMap).map((habitName) => {
                      const done = todayHabitMap[habitName];
                      return (
                        <TableRow
                          key={habitName}
                          hover
                          onClick={() => handleToggleHabitDone(habitName)}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell sx={{ wordBreak: "break-word" }}>{habitName}</TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              color={done ? "success.main" : "text.secondary"}
                              sx={{ fontWeight: done ? 700 : 400 }}
                            >
                              {done ? "✅ Splněno" : "❌ Nesplněno"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MainDashboard;
