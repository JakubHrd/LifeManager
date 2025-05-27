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
  TextField,
  CircularProgress,
} from "@mui/material";
import moment from "moment";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import TrainingCalendar from "../components/trainingComponents/TrainingCalendar";
import ChatGPTAssistant from "../components/ChatGPTAssistant";

const Training: React.FC = () => {
  const [trainings, setTrainings] = useState<any>({});
  const [evaluation, setEvaluation] = useState<string>("");
  const [suggestion, setSuggestion] = useState<any>(null);
  const [week, setWeek] = useState<number>(moment().isoWeek());
  const [year, setYear] = useState<number>(moment().year());
  const [loading, setLoading] = useState(false);
  const trainingCalendarRef = useRef<any>(null);

  const handleWeekChange = (change: number) => {
    setEvaluation("");
    setSuggestion(null);
    setWeek((prev) => prev + change);
  };

  const evaluationPrompt = `Jsi zkušený fitness trenér. Vyhodnoť následující týdenní tréninkový plán:

1. Pro KAŽDÝ DEN urč:
- intenzitu tréninku (nízká / střední / vysoká),
- typ zatížení (síla, kardio, regenerace, odpočinek),
- případně doplň komentář k zátěži nebo kvalitě dne.

2. Na ZÁVĚR poskytn:
- celkové zhodnocení týdne (rovnováha zátěže, případná přetížení nebo mezery),
- doporučení na zlepšení (např. zařadit více kardio, přidat regeneraci, snížit přetížení, atd.),
- návrh změn v případě, že něco chybí nebo se opakuje příliš často.

Buď konkrétní a praktický. Vyhodnocení strukturovaně seřaď podle dní (pondělí až neděle) a následně napiš celkový závěr.`;

  const suggestionPrompt = `Jsi fitness trenér. Na základě týdenního tréninkového plánu vytvoř UPRAVENÝ plán tak, že:
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
}`;

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
        onTrainingsChange={setTrainings}
      />

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          🧠 Pomocník ChatGPT
        </Typography>

        <Box display="flex" flexDirection="column" gap={4} mt={2}>
          {/* Vyhodnocení plánu */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Vyhodnotit tréninkový plán
            </Typography>
            <TextField
              multiline
              rows={6}
              fullWidth
              label="Instrukce pro vyhodnocení"
              value={evaluationPrompt}
              disabled
              sx={{ mb: 2 }}
            />
            <ChatGPTAssistant
              endpoint="chatgpt"
              data={trainings}
              systemPrompt={evaluationPrompt}
              label="Vyhodnotit trénink"
              onResponse={(result) => {
                if (typeof result === "string") {
                  setEvaluation(result);
                } else {
                  setEvaluation(JSON.stringify(result, null, 2));
                }
              }}
            />
          </Box>

          {/* Návrh nového plánu */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Navrhnout vylepšený plán
            </Typography>
            <TextField
              multiline
              rows={6}
              fullWidth
              label="Instrukce pro návrh plánu"
              value={suggestionPrompt}
              disabled
              sx={{ mb: 2 }}
            />
            <ChatGPTAssistant
              endpoint="chatgpt"
              data={trainings}
              systemPrompt={suggestionPrompt}
              label="Navrhnout trénink"
              onResponse={(result) => {
                if (typeof result === "object") {
                  setSuggestion(result);
                }
              }}
            />
          </Box>
        </Box>

        {/* Výstup hodnocení */}
        {evaluation && (
          <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              🧪 Hodnocení tréninku
            </Typography>
            <Typography variant="body1" whiteSpace="pre-line">
              {evaluation}
            </Typography>
          </Paper>
        )}

        {/* Výstup návrhu */}
        {suggestion && (
          <>
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                ✨ Návrh nového tréninku
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
                    {Object.entries(suggestion).map(([day, dayTrainings]: any) => (
                      <TableRow key={day}>
                        <TableCell>{day}</TableCell>
                        <TableCell>{dayTrainings.morning || "-"}</TableCell>
                        <TableCell>{dayTrainings.main || "-"}</TableCell>
                        <TableCell>{dayTrainings.evening || "-"}</TableCell>
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