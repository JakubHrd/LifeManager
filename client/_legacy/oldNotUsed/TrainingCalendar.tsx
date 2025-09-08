// src/components/TrainingCalendar.tsx
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

// Dny + sekce tréninku
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const trainingsDefault = ["morning", "main", "evening"];

// Typy
type TrainingCell = { description: string; done: boolean };
export type TrainingsByDay = {
  [day: string]: {
    [section: string]: TrainingCell;
  };
};

interface TrainingCalendarProps {
  week: number;
  year: number;
  onTrainingsChange?: (data: TrainingsByDay) => void;
}

type TrainingsChangeCb = (data: TrainingsByDay) => void;

const TrainingCalendar = forwardRef(({ week, year, onTrainingsChange }: TrainingCalendarProps, ref) => {
  const { isAuthenticated } = useAuthContext();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md")); // desktop tabulka vs. mobil akordeon

  const [trainings, setTrainings] = useState<TrainingsByDay>({});
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ day: string; section: string } | null>(null);

  // stabilní ref na prop callback, aby nevznikaly smyčky
  const latestOnChange = useRef<TrainingsChangeCb | null>(null);
  useEffect(() => {
    latestOnChange.current = onTrainingsChange ?? null;
  }, [onTrainingsChange]);

  // Externí API pro rodiče (Training page)
  useImperativeHandle(ref, () => ({
    getTrainings: () => trainings,
    applySuggestion: (suggestion: any) => {
      // CZ -> EN mapování
      const dayMap: Record<string, string> = {
        "Pondělí": "Monday",
        "Úterý": "Tuesday",
        "Středa": "Wednesday",
        "Čtvrtek": "Thursday",
        "Pátek": "Friday",
        "Sobota": "Saturday",
        "Neděle": "Sunday",
      };
      const sectionMap: Record<string, string> = {
        rano: "morning",
        hlavni: "main",
        vecer: "evening",
      };

      const finalTrainings: TrainingsByDay = {};
      Object.entries(suggestion).forEach(([dayCz, sections]) => {
        const dayEn = dayMap[dayCz] || dayCz;
        finalTrainings[dayEn] = {};
        Object.entries(sections as Record<string, string | null | undefined>).forEach(
          ([sectionCz, description]) => {
            const key = sectionMap[sectionCz] || sectionCz;
            finalTrainings[dayEn][key] = {
              description: String(description ?? ""),
              done: false,
            };
          }
        );
      });

      setTrainings(finalTrainings);
      latestOnChange.current?.(finalTrainings);
    },
  }));

  // Načtení z API (bez smyček)
  useEffect(() => {
    if (!isAuthenticated) return;

    const ac = new AbortController();
    const load = async () => {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        const res = await fetch(`${serverUrl}/api/trainings?week=${week}&year=${year}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("Chyba při načítání tréninků");
        const data = await res.json();
        const next = (data?.trainings as TrainingsByDay) || {};
        setTrainings(next);
        latestOnChange.current?.(next);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Neznámá chyba");
        }
      }
    };

    load();
    return () => ac.abort();
  }, [isAuthenticated, week, year]);

  const postTrainings = async (payload: TrainingsByDay) => {
    const token = localStorage.getItem("token");
    await fetch(`${serverUrl}/api/trainings?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ trainings: payload }),
    });
  };

  // Toggle done
  const toggleCompletion = async (day: string, section: string) => {
    const updated: TrainingsByDay = {
      ...trainings,
      [day]: {
        ...trainings[day],
        [section]: {
          ...(trainings[day]?.[section] ?? { description: "", done: false }),
          done: !trainings[day]?.[section]?.done,
        },
      },
    };
    setTrainings(updated);
    latestOnChange.current?.(updated);
    await postTrainings(updated);
  };

  // Změna popisu (optimistic, uložíme na blur/tlačítko)
  const handleDescriptionChange = (day: string, section: string, value: string) => {
    const updated: TrainingsByDay = {
      ...trainings,
      [day]: {
        ...trainings[day],
        [section]: {
          ...(trainings[day]?.[section] ?? { done: false, description: "" }),
          description: value,
        },
      },
    };
    setTrainings(updated);
  };

  const savePlan = async () => {
    await postTrainings(trainings);
    latestOnChange.current?.(trainings);
  };

  // --- Mobilní renderer (Accordion) ---
  const MobileTrainings = () => {
    return (
      <Box sx={{ mt: 2 }}>
        {days.map((day) => {
          const dayLabel = translations[day]?.cs || day;
          const dayData = trainings[day] || {};
          return (
            <Accordion key={day} disableGutters sx={{ mb: 1, borderRadius: 2, overflow: "hidden" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 700 }}>{dayLabel}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {trainingsDefault.map((sec) => {
                    const title = translations[sec]?.cs || sec;
                    const item = dayData[sec] || { description: "", done: false };
                    return (
                      <ListItem key={sec} sx={{ alignItems: "flex-start" }}>
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
                              onChange={(e) => handleDescriptionChange(day, sec, e.target.value)}
                              onBlur={savePlan}
                              size="small"
                              fullWidth
                              multiline
                              minRows={1}
                              placeholder="Popis aktivity…"
                              sx={{ mt: 1 }}
                            />
                          }
                        />
                        <ListItemSecondaryAction>
                          <Checkbox
                            edge="end"
                            checked={!!item.done}
                            onChange={() => toggleCompletion(day, sec)}
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
                  getDescription={(it) => (it ? (it as any).description || "" : "")}
                  getDone={(it) => (it ? !!(it as any).done : false)}
                  itemKey="trainings"
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        // ===== Mobil / tablet (akordeon) =====
        <MobileTrainings />
      )}
    </Box>
  );
});

export default TrainingCalendar;
