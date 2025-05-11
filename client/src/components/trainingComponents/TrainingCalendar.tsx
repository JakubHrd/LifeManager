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
} from "@mui/material";

import { useAuthContext } from "../../context/AuthContext";
import TrainingTableHeader from "./TrainingTableHeader";
import TrainingTableRow from "./TrainingTableRow";
import { translations } from "../../utils/translations";

// Konstanty pro dny a části dne
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const trainingsDefault = ["morning", "main", "evening"];

interface TrainingCalendarProps {
  week: number;
  year: number;
  onTrainingsChange?: (data: TrainingsByDay) => void;
}

// Typ pro strukturu tréninkového plánu
type TrainingsByDay = {
  [day: string]: {
    [training: string]: { description: string; done: boolean };
  };
};

const TrainingCalendar = forwardRef(({ week, year, onTrainingsChange }: TrainingCalendarProps, ref) => {
  const { isAuthenticated } = useAuthContext();

  const [trainings, setTrainings] = useState<TrainingsByDay>({});
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ day: string; training: string } | null>(null);

  // Poskytuje rodičovské komponentě funkce pro získání/plnění plánů
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

      const finalTrainings: TrainingsByDay = {};

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
      onTrainingsChange?.(finalTrainings);
    },
  }));

  // Načte tréninkový plán při změně týdne nebo roku
  useEffect(() => {
    async function fetchData() {
      if (!isAuthenticated) return;
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/trainings?week=${week}&year=${year}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Chyba při načítání tréninků");

        const data = await response.json();
        setTrainings(data.trainings || {});
        onTrainingsChange?.(data.trainings || {});
      } catch (error) {
        setError(error instanceof Error ? error.message : "Neznámá chyba");
      }
    }

    fetchData();
  }, [isAuthenticated, week, year]);

  // Přepíná stav "splněno" pro danou buňku
  const toggleCompletion = async (day: string, training: string) => {
    const updated = {
      ...trainings,
      [day]: {
        ...trainings[day],
        [training]: {
          ...trainings[day]?.[training],
          done: !trainings[day]?.[training]?.done,
        },
      },
    };

    setTrainings(updated);
    onTrainingsChange?.(updated);

    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/trainings?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` },
      body: JSON.stringify({ trainings: updated }),
    });
  };

  // Upravuje popis aktivity v buňce
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

  // Uloží tréninkový plán na server
  const savePlan = async () => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/trainings?week=${week}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` },
      body: JSON.stringify({ trainings }),
    });
  };

  return (
    <Box>
      {/* Zobrazení chybové hlášky */}
      {error && (
        <Alert severity="error" variant="outlined">
          ⚠️ {error}
        </Alert>
      )}

      {/* Tabulka s tréninkovým plánem */}
      <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TrainingTableHeader trainingsDefault={trainingsDefault} />
          </TableHead>
          <TableBody>
            {days.map((day) => (
              <TrainingTableRow
                key={day}
                day={day}
                trainingsDefault={trainingsDefault}
                trainings={trainings}
                editingCell={editingCell}
                onEditCell={(d, t) => setEditingCell({ day: d, training: t })}
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
    </Box>
  );
});

export default TrainingCalendar;
