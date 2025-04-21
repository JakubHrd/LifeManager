import React, { useState, useRef } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
} from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import MealCalendar from "../components/MealCalendar";
import ChatGPTAssistant from "../components/ChatGPTAssistant";

const getCurrentWeek = (): number => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
};

const Diet: React.FC = () => {
  const [meals, setMeals] = useState<any>({});
  const [evaluation, setEvaluation] = useState<string>("");
  const [suggestion, setSuggestion] = useState<any>(null);
  const [week, setWeek] = useState<number>(getCurrentWeek());
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const mealCalendarRef = useRef<any>(null); // ⬅️ Důležité

  const handleWeekChange = (change: number) => {
    setEvaluation("");        
    setSuggestion(null);       
    setWeek((prevWeek) => prevWeek + change);
  };

  return (
    <Container maxWidth="xl">
      <Box component="section" sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Jídelníček – Týden {week}, Rok {year}
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

      <MealCalendar
        ref={mealCalendarRef}
        week={week}
        year={year}
        onMealsChange={(data) => setMeals(data)}
      />
      <Divider sx={{ my: 3 }} />
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          🧠 Pomocník ChatGPT
        </Typography>
        <Box display="flex" gap={2} mt={2} flexWrap="wrap">
          <ChatGPTAssistant
            endpoint="chatgpt"
            data={meals}
            systemPrompt="Jsi odborník na výživu. Vyhodnoť jídelníček a navrhni zlepšení."
            label="Vyhodnotit jídelníček"
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
            data={meals}
            systemPrompt={`Jsi expert na výživu. Na základě níže uvedeného týdenního jídelníčku, ve kterém mohou některá jídla chybět, vytvoř UPRAVENÝ jídelníček tak, že:
1. Zachováš všechna již vyplněná jídla.
2. Chybějící jídla **doplň tak, aby jídelníček byl nutričně vyvážený** (vhodný poměr bílkovin, sacharidů a tuků).
3. **Nepoužívej výplňové znaky** jako '...', '-', 'N/A' nebo prázdné hodnoty.
4. Všechny položky musí být vyplněné smysluplnými jídly (např. "kuřecí maso s rýží a zeleninou", "řecký jogurt s ovocem", atd.)
5. Výsledek vrať **pouze jako validní JSON** ve formátu:

{
  "Pondělí": {
    "snidane": "...",
    "svacina": "...",
    "obed": "...",
    "svacina_odpoledne": "...",
    "vecere": "..."
  },
  "Úterý": { ... },
  ...
}

Dny převeď z angličtiny do češtiny:
Monday = Pondělí, Tuesday = Úterý, Wednesday = Středa, Thursday = Čtvrtek, Friday = Pátek, Saturday = Sobota, Sunday = Neděle.`}
            label="Navrhnout vylepšený jídelníček"
            onResponse={(result) => {
              if (typeof result === "object") {
                setSuggestion(result);
              }
            }}
          />
        </Box>

        {/* Výstup vyhodnocení */}
        {evaluation && (
          <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              🧪 Hodnocení jídelníčku
            </Typography>
            <Typography variant="body1" whiteSpace="pre-line">
              {evaluation}
            </Typography>
          </Paper>
        )}
        {suggestion && (
          <>
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                ✨ Návrh nového jídelníčku
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Den</TableCell>
                      <TableCell>Snídaně</TableCell>
                      <TableCell>Svačina</TableCell>
                      <TableCell>Oběd</TableCell>
                      <TableCell>Svačina odpoledne</TableCell>
                      <TableCell>Večeře</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(suggestion).map(([day, meals]: any) => (
                      <TableRow key={day}>
                        <TableCell>{day}</TableCell>
                        <TableCell>{meals.snidane || "-"}</TableCell>
                        <TableCell>{meals.svacina || "-"}</TableCell>
                        <TableCell>{meals.obed || "-"}</TableCell>
                        <TableCell>{meals.svacina_odpoledne || "-"}</TableCell>
                        <TableCell>{meals.vecere || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Tlačítko na převzetí návrhu */}
            <Box display="flex" justifyContent="flex-end" mt={3}>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  mealCalendarRef.current?.applySuggestion(suggestion);
                }}
              >
                ✅ Použít návrh jídelníčku
              </Button>
            </Box>
          </>
        )}
      </Box>
      <Divider sx={{ my: 3 }} />
    </Container>
  );
};

export default Diet;
