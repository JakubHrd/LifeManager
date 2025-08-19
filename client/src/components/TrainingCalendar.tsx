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
import TableRowGeneric from "./TableRowGeneric";
import TableHeader from "./TableHeader";
import { translations } from "../utils/translations";
import serverUrl from "../config";

// Dny & sekce tak, jak je očekává backend
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const trainingsDefault = ["morning", "main", "evening"];

interface TrainingCalendarProps {
  week: number;
  year: number;
  onTrainingsChange?: (data: TrainingsByDay) => void;
}

type TrainingsByDay = {
  [day: string]: {
    [training: string]: { description: string; done: boolean };
  };
};

const TrainingCalendar = forwardRef(({ week, year, onTrainingsChange }: TrainingCalendarProps, ref) => {
  const { isAuthenticated } = useAuthContext();

  const [trainings, setTrainings] = useState<TrainingsByDay>({});
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ day: string; section: string } | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingCopy, setPendingCopy] = useState(false);

  // prevence závodů fetchů
  const fetchSeq = useRef(0);

  useImperativeHandle(ref, () => ({
    getTrainings: () => trainings,
    applySuggestion: (suggestion: any) => {
      // Převod CZ dní → EN klíče backendu
      const dayMap: Record<string, string> = {
        "Pondělí": "Monday",
        "Úterý": "Tuesday",
        "Středa": "Wednesday",
        "Čtvrtek": "Thursday",
        "Pátek": "Friday",
        "Sobota": "Saturday",
        "Neděle": "Sunday",
      };

      // Sekce – akceptuj CZ i EN aliasy
      const sectionMap: Record<string, "morning" | "main" | "evening"> = {
        rano: "morning",
        ráno: "morning",
        morning: "morning",
        hlavni: "main",
        hlavní: "main",
        main: "main",
        vecer: "evening",
        večer: "evening",
        evening: "evening",
      };

      const next: TrainingsByDay = { ...trainings };

      Object.entries(suggestion).forEach(([czDay, sections]) => {
        const day = (dayMap[czDay] || czDay) as string;
        next[day] ||= {};

        Object.entries(sections as Record<string, string | null | undefined>).forEach(
          ([secKey, description]) => {
            const backendKey = sectionMap[secKey.toLowerCase()] || (secKey as any);
            // zachovej případný existující done flag
            const prevDone = Boolean(next[day]?.[backendKey]?.done);
            next[day][backendKey] = {
              description: String(description ?? ""),
              done: prevDone,
            };
          }
        );
      });

      setTrainings(next);
      onTrainingsChange?.(next);
      setSnackbar({ open: true, message: "Návrh vložen do tabulky (zatím neuložen).", severity: "success" });
    },
  }));

  // Načti plán pro týden/rok (bez onTrainingsChange v deps!)
  useEffect(() => {
    if (!isAuthenticated) return;
    const mySeq = ++fetchSeq.current;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${serverUrl}/api/trainings?week=${week}&year=${year}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Chyba při načítání tréninků");

        const data = await response.json();
        if (mySeq === fetchSeq.current) {
          const incoming = data.trainings || {};
          setTrainings(incoming);
          onTrainingsChange?.(incoming);
          setError(null);
        }
      } catch (err) {
        if (mySeq === fetchSeq.current) {
          setError(err instanceof Error ? err.message : "Neznámá chyba");
        }
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, week, year]);

  // Toggle hotovo
  const toggleCompletion = async (day: string, section: string) => {
    const updated = {
      ...trainings,
      [day]: {
        ...trainings[day],
        [section]: {
          ...trainings[day]?.[section],
          done: !trainings[day]?.[section]?.done,
        },
      },
    };

    setTrainings(updated);
    onTrainingsChange?.(updated);

    const token = localStorage.getItem("token");
    await fetch(`${serverUrl}/api/trainings?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ trainings: updated }),
    });
  };

  // Změna popisu (lokální), uložíme až na blur/Enter (onSave)
  const handleDescriptionChange = (day: string, section: string, value: string) => {
    setTrainings((prev) => {
      const next = {
        ...prev,
        [day]: {
          ...prev[day],
          [section]: {
            ...prev[day]?.[section],
            description: value,
          },
        },
      };
      return next;
    });
  };

  // Uložení aktuálního plánu
  const savePlan = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${serverUrl}/api/trainings?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ trainings }),
    });
    setSnackbar({ open: true, message: "Tréninkový plán uložen.", severity: "success" });
  };

  // Volitelně – kopie do dalšího týdne (pokud máš endpoint jako u meals)
  const copyToNextWeek = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${serverUrl}/api/trainings/copy?week=${week}&year=${year}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 409) {
      setConfirmDialogOpen(true);
      setPendingCopy(true);
      return;
    }

    const result = await res.json();
    setSnackbar({ open: true, message: result.message || "Zkopírováno.", severity: "success" });
  };

  const handleConfirmOverwrite = async () => {
    setConfirmDialogOpen(false);
    if (!pendingCopy) return;

    const token = localStorage.getItem("token");
    const res = await fetch(
      `${serverUrl}/api/trainings/copy?week=${week}&year=${year}&force=true`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );
    const result = await res.json();
    setSnackbar({ open: true, message: result.message || "Přepsáno.", severity: "success" });
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
            <TableHeader sectionKeys={trainingsDefault} translationsMap={translations} />
          </TableHead>
          <TableBody>
            {days.map((day) => (
              <TableRowGeneric
                key={day}
                day={day}
                sectionKeys={trainingsDefault}
                data={trainings}
                editingCell={editingCell}
                onEditCell={(d, s) => setEditingCell({ day: d, section: s })}
                onToggle={toggleCompletion}
                onChange={handleDescriptionChange}
                onSave={() => {
                  setEditingCell(null);
                  savePlan();
                }}
                translationsMap={translations}
                getDescription={(item) => (item?.description as string) || ""}
                getDone={(item) => Boolean(item?.done)}
                itemKey="trainings"
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3} display="flex" gap={2} flexWrap="wrap" justifyContent="center">
        <Button variant="contained" color="primary" onClick={savePlan}>
          💾 Uložit tréninkový plán
        </Button>
        {/* Pokud endpoint /api/trainings/copy existuje, nech to aktivní; jinak můžeš klidně skrýt */}
        <Button variant="contained" color="secondary" onClick={copyToNextWeek}>
          Zkopírovat plán do týdne {week + 1}
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
        <DialogTitle>Přepsat tréninkový plán?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pro příští týden již tréninkový plán existuje. Opravdu jej chceš přepsat?
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

export default TrainingCalendar;
