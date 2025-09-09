import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import {
  Box,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  Paper,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import { useTheme } from "@mui/material/styles";

import { useAuthContext } from "../../src/context/AuthContext";
import TableHeader from "./TableHeader";
import TableRowGeneric from "./TableRowGeneric";
import { translations } from "../../src/utils/translations";
import serverUrl from "../../src/config";

// Konstanty pro dny a sekce jídel
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealsDefault = ["breakfast", "snack", "lunch", "snack2", "dinner"];

// Typy
export type MealsByDay = {
  [day: string]: {
    [meal: string]: { description: string; eaten: boolean };
  };
};

interface MealCalendarProps {
  week: number;
  year: number;
  onMealsChange?: (data: MealsByDay) => void;
}

type MealsChangeCb = (data: MealsByDay) => void;

const MealCalendar = forwardRef(({ week, year, onMealsChange }: MealCalendarProps, ref) => {
  const { isAuthenticated } = useAuthContext();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md")); // >= md -> desktop tabulka, < md -> mobil akordeon

  const [meals, setMeals] = useState<MealsByDay>({});
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ day: string; section: string } | null>(null);

  // Stabilní reference na callback (bez re-render smyček)
  const latestOnMealsChange = useRef<MealsChangeCb | null>(null);
  useEffect(() => {
    latestOnMealsChange.current = onMealsChange ?? null;
  }, [onMealsChange]);

  // Externí API pro rodiče (getMeals, applySuggestion)
  useImperativeHandle(ref, () => ({
    getMeals: () => meals,
    applySuggestion: (suggestion: any) => {
      const dayMap: Record<string, string> = {
        "Pondělí": "Monday",
        "Úterý": "Tuesday",
        "Středa": "Wednesday",
        "Čtvrtek": "Thursday",
        "Pátek": "Friday",
        "Sobota": "Saturday",
        "Neděle": "Sunday",
      };
      const mealMap: Record<string, string> = {
        snidane: "breakfast",
        svacina: "snack",
        obed: "lunch",
        svacina_odpoledne: "snack2",
        vecere: "dinner",
      };

      const result: MealsByDay = {};
      Object.entries(suggestion).forEach(([dayCz, mealData]) => {
        const dayEn = dayMap[dayCz] || dayCz;
        result[dayEn] = {};
        Object.entries(mealData as Record<string, string | null>).forEach(([mealCz, description]) => {
          const mealEn = mealMap[mealCz] || mealCz;
          result[dayEn][mealEn] = {
            description: String(description ?? ""),
            eaten: false,
          };
        });
      });

      setMeals(result);
      latestOnMealsChange.current?.(result);
    },
  }));

  // Načítání z API
  useEffect(() => {
    if (!isAuthenticated) return;

    const ac = new AbortController();
    const load = async () => {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        const res = await fetch(`${serverUrl}/api/meals?week=${week}&year=${year}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("Chyba při načítání jídelníčku");
        const data = await res.json();
        const next = (data?.meals as MealsByDay) || {};
        setMeals(next);
        latestOnMealsChange.current?.(next);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Neznámá chyba");
        }
      }
    };

    load();
    return () => ac.abort();
  }, [isAuthenticated, week, year]);

  const postMeals = async (payload: MealsByDay) => {
    const token = localStorage.getItem("token");
    await fetch(`${serverUrl}/api/meals?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ meals: payload }),
    });
  };

  // Toggle eaten
  const toggleCompletion = async (day: string, mealKey: string) => {
    const updated: MealsByDay = {
      ...meals,
      [day]: {
        ...meals[day],
        [mealKey]: {
          ...(meals[day]?.[mealKey] ?? { description: "", eaten: false }),
          eaten: !meals[day]?.[mealKey]?.eaten,
        },
      },
    };
    setMeals(updated);
    latestOnMealsChange.current?.(updated);
    await postMeals(updated);
  };

  // Change description (optimistic; POST při uložení/blur)
  const handleDescriptionChange = (day: string, mealKey: string, value: string) => {
    const updated: MealsByDay = {
      ...meals,
      [day]: {
        ...meals[day],
        [mealKey]: {
          ...(meals[day]?.[mealKey] ?? { eaten: false, description: "" }),
          description: value,
        },
      },
    };
    setMeals(updated);
  };

  const savePlan = async () => {
    await postMeals(meals);
    latestOnMealsChange.current?.(meals);
  };

  // --- Mobilní renderer (Accordion) ---
  const MobileMeals = () => {
    return (
      <Box sx={{ mt: 2 }}>
        {days.map((day) => {
          const dayLabel = translations[day]?.cs || day;
          const dayMeals = meals[day] || {};
          return (
            <Accordion key={day} disableGutters sx={{ mb: 1, borderRadius: 2, overflow: "hidden" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 700 }}>{dayLabel}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {mealsDefault.map((mealKey) => {
                    const title = translations[mealKey]?.cs || mealKey;
                    const item = dayMeals[mealKey] || { description: "", eaten: false };
                    return (
                      <ListItem key={mealKey} sx={{ alignItems: "flex-start" }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {title}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <TextField
                              value={item.description}
                              onChange={(e) => handleDescriptionChange(day, mealKey, e.target.value)}
                              onBlur={savePlan}
                              size="small"
                              fullWidth
                              multiline
                              minRows={1}
                              placeholder="Popis jídla…"
                              sx={{ mt: 1 }}
                            />
                          }
                        />
                        <ListItemSecondaryAction>
                          <Checkbox
                            edge="end"
                            checked={!!item.eaten}
                            onChange={() => toggleCompletion(day, mealKey)}
                            color="primary"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                  <Button variant="outlined" size="small" startIcon={<SaveIcon />} onClick={savePlan}>
                    Uložit den
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" onClick={savePlan} startIcon={<SaveIcon />}>
            Uložit celý týden
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          ⚠️ {error}
        </Alert>
      )}

      {isMdUp ? (
        // ===== Desktop (původní tabulka) =====
        <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2, boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableHeader sectionKeys={mealsDefault} translationsMap={translations} />
            </TableHead>
            <TableBody>
              {days.map((day) => (
                <TableRowGeneric
                  key={day}
                  day={day}
                  sectionKeys={mealsDefault}
                  data={meals}
                  editingCell={editingCell}
                  onEditCell={(d, s) => setEditingCell({ day: d, section: s })}
                  onToggle={toggleCompletion}
                  onChange={handleDescriptionChange}
                  onSave={() => {
                    setEditingCell(null);
                    savePlan();
                  }}
                  translationsMap={translations}
                  getDescription={(val) => (val ? (val as any).description || "" : "")}
                  getDone={(val) => (val ? !!(val as any).eaten : false)}
                  itemKey="meals"
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        // ===== Mobil / tablet (nový accordion) =====
        <MobileMeals />
      )}
    </Box>
  );
});

export default MealCalendar;
