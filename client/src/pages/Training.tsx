import React, { useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Divider,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import TrainingCalendar from "../components/TrainingCalendar";
import ChatGPTAssistant from "../components/ChatGPTAssistant";

const getCurrentWeek = (): number => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
};

const Training: React.FC = () => {
  const [trainings, setTrainings] = useState<any>({});
  const [evaluation, setEvaluation] = useState<string>("");
  const [suggestion, setSuggestion] = useState<any>(null);
  const [week, setWeek] = useState<number>(getCurrentWeek());
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const trainingCalendarRef = useRef<any>(null);

  const handleWeekChange = (change: number) => {
    setWeek((prevWeek) => {
      setEvaluation("");
      setSuggestion(null);
      return prevWeek + change;
    });
  };

  return (
    <Container maxWidth="xl">
      <Box component="section" sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Tréninkový plán – Týden {week}, Rok {year}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button
            variant="contained"
            sx={{ borderRadius: "16px" }}
            startIcon={<KeyboardArrowLeftIcon />}
            onClick={() => handleWeekChange(-1)}
            disabled={week === 1}
          >
            Předchozí týden
          </Button>
          <Button
            variant="contained"
            sx={{ borderRadius: "16px", ml: 2 }}
            endIcon={<KeyboardArrowRightIcon />}
            onClick={() => handleWeekChange(1)}
          >
            Další týden
          </Button>
        </Box>
      </Box>

      <TrainingCalendar
        ref={trainingCalendarRef}
        week={week}
        year={year}
        onTrainingsChange={(data) => setTrainings(data)}
      />

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          🧠 Pomocník ChatGPT
        </Typography>
        <Box display="flex" gap={2} mt={2} flexWrap="wrap">
          <ChatGPTAssistant
            endpoint="chatgpt"
            data={trainings}
            systemPrompt={`Jsi zkušený fitness trenér. Vyhodnoť následující týdenní tréninkový plán.

              1. Pro KAŽDÝ DEN urč:
                 - **intenzitu** tréninku (nízká / střední / vysoká),
                 - **typ zatížení** (síla, kardio, regenerace, odpočinek),
                 - případně doplň komentář k zátěži nebo kvalitě dne.
              
              2. Na ZÁVĚR poskytn:
                 - celkové zhodnocení týdne (rovnováha zátěže, případná přetížení nebo mezery),
                 - **doporučení** na zlepšení (např. zařadit více kardio, přidat regeneraci, snížit přetížení, atd.),
                 - návrh změn v případě, že něco chybí nebo se opakuje příliš často.
              
              Buď konkrétní a praktický. Vyhodnocení strukturovaně seřaď podle dní (pondělí až neděle) a následně napiš celkový závěr.`}              
            label="Vyhodnotit tréninkový plán"
            onResponse={(result) => {
              if (typeof result === "string") {
                setEvaluation(result);
              } else {
                setEvaluation(JSON.stringify(result, null, 2));
              }
            }}
          />

          <ChatGPTAssistant
            endpoint="chatgpt"
            data={trainings}
            systemPrompt={`Jsi fitness trenér. Na základě níže uvedeného týdenního tréninkového plánu vytvoř UPRAVENÝ plán tak, že:
              1. Zachováš všechny již vyplněné části – NESMÍŠ je měnit.
              2. Doplň pouze chybějící části tak, aby byl plán vyvážený – kombinuj sílu, kardio a regeneraci.
              3. Nepoužívej výplňové znaky jako '-', '...', 'N/A'.
              4. Pokud není aktivita, doplň např. "regenerace", "protažení", "odpočinek", "lehký běh", atd.
              5. Výstup vrať jako validní JSON ve formátu:
              {
                "Pondělí": {
                  "main": "...",
                  "evening": "...",
                  "morning": "..."
                },
                "Úterý": { ... },
                ...
              }`}
            label="Navrhnout vylepšený plán"
            onResponse={(result) => {
              if (typeof result === "object") {
                setSuggestion(result);
              }
            }}
          />
        </Box>

        {evaluation && (
          <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              🧪 Hodnocení tréninkového plánu
            </Typography>
            <Typography variant="body1" whiteSpace="pre-line">
              {evaluation}
            </Typography>
          </Paper>
        )}

        {suggestion && (
          console.log('trainings data',{trainings}),
          console.log('suggestion data',{suggestion}),
          <>
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                ✨ Návrh nového tréninkového plánu
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Den</TableCell>
                      <TableCell>Ráno</TableCell>
                      <TableCell>Hlavní aktivita</TableCell>
                      <TableCell>Večer</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(suggestion).map(([day, trainings]: any) => (
                      <TableRow key={day}>
                        <TableCell>{day}</TableCell>
                        <TableCell>{trainings.morning || "-"}</TableCell>
                        <TableCell>{trainings.main || "-"}</TableCell>
                        <TableCell>{trainings.evening || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Box display="flex" justifyContent="flex-end" mt={3}>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  trainingCalendarRef.current?.applySuggestion(suggestion);
                }}
              >
                ✅ Použít návrh tréninku
              </Button>
            </Box>
          </>
        )}
      </Box>
      <Divider sx={{ my: 3 }} />
    </Container>
  );
};

export default Training;
