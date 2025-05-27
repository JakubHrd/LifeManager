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
  TableBody,
  Paper,
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

import { useAuthContext } from "../../context/AuthContext";
import { MealsByDay } from "../../types/mealTypes";
import MealTableHeader from "./MealTableHeader";
import MealTableRow from "./MealTableRow";
import { translations } from "../../utils/translations";
import serverUrl from "../../config";

// Konstanty pro dny a typy jídel
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealsDefault = ["breakfast", "snack", "lunch", "snack2", "dinner"];

interface MealCalendarProps {
  week: number;
  year: number;
  onMealsChange?: (data: MealsByDay) => void;
}

// Komponenta s refem pro rodiče (např. možnost spustit applySuggestion)
const MealCalendar = forwardRef(({ week, year, onMealsChange }: MealCalendarProps, ref) => {
  const { isAuthenticated } = useAuthContext();

  const [meals, setMeals] = useState<MealsByDay>({});
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ day: string; meal: string } | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingCopy, setPendingCopy] = useState(false);

  // Poskytujeme rodiči možnost použít applySuggestion a získat aktuální meals
  useImperativeHandle(ref, () => ({
    getMeals: () => meals,
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
      const mealMap: Record<string, string> = {
        snidane: "breakfast",
        svacina: "snack",
        obed: "lunch",
        svacina_odpoledne: "snack2",
        vecere: "dinner",
      };

      const result: MealsByDay = {};

      Object.entries(suggestion).forEach(([dayCz, mealData]) => {
        const day = dayMap[dayCz] || dayCz;
        result[day] = {};

        Object.entries(mealData as Record<string, string | null>).forEach(
          ([mealCz, description]) => {
            const meal = mealMap[mealCz] || mealCz;
            result[day][meal] = {
              description: String(description ?? ""),
              eaten: false,
            };
          }
        );
      });

      setMeals(result);
      onMealsChange?.(result);
    },
  }));

  // Načítání dat z API při změně týdne/roku
  useEffect(() => {
    async function fetchMeals() {
      if (!isAuthenticated) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${serverUrl}/api/meals?week=${week}&year=${year}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Chyba při načítání jídelníčku");

        const data = await res.json();
        setMeals(data.meals || {});
        onMealsChange?.(data.meals || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : "Neznámá chyba");
      }
    }

    fetchMeals();
  }, [isAuthenticated, week, year]);

  // Přepínání stavu "snězeno" pro dané jídlo
  const toggleCompletion = async (day: string, meal: string) => {
    const updated = {
      ...meals,
      [day]: {
        ...meals[day],
        [meal]: {
          ...meals[day]?.[meal],
          eaten: !meals[day]?.[meal]?.eaten,
        },
      },
    };

    setMeals(updated);
    onMealsChange?.(updated);

    const token = localStorage.getItem("token");
    await fetch(
      `${serverUrl}/api/meals?week=${week}&year=${year}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ meals: updated }),
      }
    );
  };

  // Změna textového popisu jídla
  const handleDescriptionChange = (day: string, meal: string, val: string) => {
    const updated = {
      ...meals,
      [day]: {
        ...meals[day],
        [meal]: {
          ...meals[day]?.[meal],
          description: val,
        },
      },
    };
    setMeals(updated);
    onMealsChange?.(updated);
  };

  // Uložení aktuálního plánu do databáze
  const savePlan = async () => {
    const token = localStorage.getItem("token");
    await fetch(
      `${serverUrl}/api/meals?week=${week}&year=${year}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ meals }),
      }
    );
  };

  // Zkopírování plánu do následujícího týdne
  const copyMealsToNextWeek = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${serverUrl}/api/meals/copy?week=${week}&year=${year}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.status === 409) {
      setConfirmDialogOpen(true);
      setPendingCopy(true);
      return;
    }

    const result = await res.json();
    setSnackbar({ open: true, message: result.message, severity: "success" });
  };

  // Potvrzení přepsání jídelníčku při kopírování
  const handleConfirmOverwrite = async () => {
    setConfirmDialogOpen(false);
    if (!pendingCopy) return;

    const token = localStorage.getItem("token");
    const res = await fetch(
      `${serverUrl}/api/meals/copy?week=${week}&year=${year}&force=true`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const result = await res.json();
    setSnackbar({ open: true, message: result.message, severity: "success" });
    setPendingCopy(false);
  };

  return (
    <Box>
      {/* Zobrazení případné chyby */}
      {error && (
        <Alert severity="error" variant="outlined">
          ⚠️ {error}
        </Alert>
      )}

      {/* Tabulka s jídelníčkem */}
      <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <MealTableHeader mealsDefault={mealsDefault} />
          </TableHead>
          <TableBody>
            {days.map((day) => (
              <MealTableRow
                key={day}
                day={day}
                mealsDefault={mealsDefault}
                meals={meals}
                editingCell={editingCell}
                onEditCell={(d, m) => setEditingCell({ day: d, meal: m })}
                onToggle={toggleCompletion}
                onChange={handleDescriptionChange}
                onSave={() => {
                  setEditingCell(null);
                  savePlan();
                }}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Tlačítko pro kopírování do dalšího týdne */}
      <Box mt={4} display="flex" justifyContent="center">
        <Button variant="contained" color="secondary" onClick={copyMealsToNextWeek}>
          Zkopírovat jídelníček do týdne {week + 1}
        </Button>
      </Box>

      {/* Snackbar pro úspěch / chybu */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dialog pro potvrzení přepsání plánu */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Přepsat jídelníček?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pro příští týden již jídelníček existuje. Opravdu jej chceš přepsat?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Ne
          </Button>
          <Button onClick={handleConfirmOverwrite} color="primary" autoFocus>
            Ano, přepsat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default MealCalendar;
