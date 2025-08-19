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
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

import { useAuthContext } from "../context/AuthContext";
import { MealsByDay } from "../types/mealTypes";
import TableHeader from "./TableHeader";
import TableRowGeneric from "./TableRowGeneric";
import { translations } from "../utils/translations";
import serverUrl from "../config";

// Backendové klíče dnů
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// Backendové klíče jídel
const mealsDefault = ["breakfast", "snack", "lunch", "snack2", "dinner"];

interface MealCalendarProps {
  week: number;
  year: number;
  onMealsChange?: (data: MealsByDay) => void;
}

// forwardRef – rodič může volat applySuggestion / getMeals
const MealCalendar = forwardRef(({ week, year, onMealsChange }: MealCalendarProps, ref) => {
  const { isAuthenticated } = useAuthContext();

  const [meals, setMeals] = useState<MealsByDay>({});
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ day: string; section: string } | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingCopy, setPendingCopy] = useState(false);

  // ochrana proti závodům fetchů
  const fetchSeq = useRef(0);

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
        const day = dayMap[dayCz] || (dayCz as string);
        result[day] = {};

        Object.entries(mealData as Record<string, string | null>).forEach(([mealCz, description]) => {
          const mealKey = mealMap[mealCz] || mealCz;
          result[day][mealKey] = {
            description: String(description ?? ""),
            // zachovej případný existující eaten flag
            eaten: Boolean(meals[day]?.[mealKey]?.eaten),
          };
        });
      });

      setMeals(result);
      onMealsChange?.(result);
      setSnackbar({ open: true, message: "Návrh vložen do tabulky (zatím neuložen).", severity: "success" });
    },
  }));

  // Načtení jídel pro týden/rok
  useEffect(() => {
    if (!isAuthenticated) return;

    const mySeq = ++fetchSeq.current;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${serverUrl}/api/meals?week=${week}&year=${year}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Chyba při načítání jídelníčku");
        const data = await res.json();

        // nastav jen pokud je to poslední (aktuální) request
        if (mySeq === fetchSeq.current) {
          const incoming = data.meals || {};
          setMeals(incoming);
          onMealsChange?.(incoming);
          setError(null);
        }
      } catch (err) {
        if (mySeq === fetchSeq.current) {
          setError(err instanceof Error ? err.message : "Neznámá chyba");
        }
      }
    })();

    // DŮLEŽITÉ: nezahrnuj `onMealsChange` do dependency array → jinak se to přerenderuje při každé změně reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, week, year]);

  // Toggle snědeno
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
    await fetch(`${serverUrl}/api/meals?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ meals: updated }),
    });
  };

  // Změna popisu
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

  // Uložení aktuálního plánu
  const savePlan = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${serverUrl}/api/meals?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ meals }),
    });
    setSnackbar({ open: true, message: "Jídelníček uložen.", severity: "success" });
  };

  // Kopie do dalšího týdne
  const copyMealsToNextWeek = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${serverUrl}/api/meals/copy?week=${week}&year=${year}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 409) {
      setConfirmDialogOpen(true);
      setPendingCopy(true);
      return;
    }

    const result = await res.json();
    setSnackbar({ open: true, message: result.message, severity: "success" });
  };

  const handleConfirmOverwrite = async () => {
    setConfirmDialogOpen(false);
    if (!pendingCopy) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${serverUrl}/api/meals/copy?week=${week}&year=${year}&force=true`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    setSnackbar({ open: true, message: result.message, severity: "success" });
    setPendingCopy(false);
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          ⚠️ {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2, boxShadow: 3, overflowX: "auto" }}>
        <Table size="small">
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
                getDescription={(val) => (val?.description as string) || ""}
                getDone={(val) => Boolean(val?.eaten)}
                translationsMap={translations}
                itemKey="meals"
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3} display="flex" gap={2} flexWrap="wrap" justifyContent="center">
        <Button variant="contained" color="primary" onClick={savePlan}>
          💾 Uložit jídelníček
        </Button>
        <Button variant="contained" color="secondary" onClick={copyMealsToNextWeek}>
          Zkopírovat jídelníček do týdne {week + 1}
        </Button>
      </Box>

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
