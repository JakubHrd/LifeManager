import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Container,
  Typography,
  TextField,
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
  CircularProgress,
} from "@mui/material";
import moment from "moment";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import MealCalendar from "../components/MealCalendar";
import ChatGPTAssistant from "../components/ChatGPTAssistant";
import serverUrl from "../config";
import UnifiedPlanCalendar, { type UnifiedPlanRef } from "../components/UnifiedPlanCalendar";
import { mealsConfig } from "../config/calendar.meals";
import { useGlobalLoading } from "../components/GlobalLoadingProvider";


const Diet: React.FC = () => {
  const { withLoading } = useGlobalLoading();
  const [meals, setMeals] = useState<any>({});
  const [evaluation, setEvaluation] = useState<string>("");
  const [suggestion, setSuggestion] = useState<any>(null);
  const [week, setWeek] = useState<number>(moment().isoWeek());
  const [year, setYear] = useState<number>(moment().year());

  const [userSetting, setUserSetting] = useState<any>(null);
  const [loadingUserSetting, setLoadingUserSetting] = useState<boolean>(true);

  const mealCalendarRef = useRef<any>(null);
  const calendarRef = useRef<UnifiedPlanRef>(null);

  const handleWeekChange = (change: number) => {
    setEvaluation("");
    setSuggestion(null);
    setWeek((prevWeek) => prevWeek + change);
  };

  useEffect(() => {
    const fetchUserSetting = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${serverUrl}/api/userSetting`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUserSetting(data);
      } catch (error) {
        console.error("Chyba při načítání uživatelského nastavení:", error);
      } finally {
        setLoadingUserSetting(false);
      }
    };
    withLoading(fetchUserSetting()); // ⬅️ jen obalit
  }, []);

  // --- Prompty: přepočítávají se, když dorazí userSetting ---
  const evaluationPrompt = useMemo(() => {
    const h = userSetting?.height ?? "{height_cm}";
    const w = userSetting?.weight ?? "{weight_kg}";
    const bd = userSetting?.birthDate ?? "{birth_date}";
    const g = userSetting?.gender ?? "{gender}";
    const tw = userSetting?.targetWeight ?? "{target_weight_kg}";
    const goal = userSetting?.mainGoal ?? "{main_goal}";

    return `Jsi certifikovaný odborník na výživu. Vyhodnoť následující týdenní jídelníček s ohledem na tyto parametry uživatele:

- Výška: ${h} cm
- Váha: ${w} kg
- Datum narození: ${bd} (věk si dopočítej)
- Pohlaví: ${g}
- Cílová váha: ${tw} kg
- Hlavní cíl: ${goal}

Tvým úkolem je:
1. Posoudit, zda jídelníček odpovídá energetickým a nutričním potřebám uživatele vzhledem k jeho cíli.
2. Vyhodnotit poměr bílkovin, sacharidů a tuků.
3. Upozornit na možné nedostatky nebo přebytky (např. málo bílkovin, příliš mnoho sacharidů, nedostatek vlákniny apod.).
4. Doporučit konkrétní zlepšení jídelníčku s ohledem na cíl (např. přidat více bílkovin, omezit cukry, zařadit více zeleniny).

Odpověď rozděl na části:
- Celkové hodnocení
- Nedostatky / přebytky
- Doporučené úpravy

Piš v češtině.`;
  }, [userSetting]);

  const suggestionPrompt = useMemo(() => {
    const params = userSetting
      ? `

Parametry uživatele:
- Výška: ${userSetting.height} cm
- Váha: ${userSetting.weight} kg
- Datum narození: ${userSetting.birthDate}
- Pohlaví: ${userSetting.gender}
- Cílová váha: ${userSetting.targetWeight} kg
- Cíl: ${userSetting.mainGoal}`
      : "";

    return `Jsi expert na výživu. Na základě týdenního jídelníčku${
      userSetting ? " a parametrů uživatele" : ""
    } vytvoř UPRAVENÝ jídelníček tak, že:

1. Zachováš všechna již vyplněná jídla – NESMÍŠ je měnit.
2. Doplníš pouze chybějící jídla tak, aby byl plán kompletní a vyvážený.
3. Nepoužiješ žádné prázdné/zástupné hodnoty ("-", "...", "N/A", "nic" atd.).
4. Každé jídlo musí být konkrétní a běžné – např. "ovesná kaše s ovocem", "kuřecí prsa s rýží", "tvaroh s ořechy".
5. Dny převeď do češtiny (např. "Monday" → "Pondělí").
6. Výstup vrať jako VALIDNÍ JSON **bez komentářů** ve formátu:

{
  "Pondělí": {
    "snidane": "...",
    "svacina": "...",
    "obed": "...",
    "svacina_odpoledne": "...",
    "vecere": "..."
  },
  ...
}

Používej **přesně tyto klíče** (bez diakritiky): snidane, svacina, obed, svacina_odpoledne, vecere${params}`;
  }, [userSetting]);

  if (loadingUserSetting) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

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
      <UnifiedPlanCalendar
        ref={calendarRef}
        week={week}
        year={year}
        config={mealsConfig}
        onPlanChange={(data) => setMeals(data)}
      />
      
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

        <Box display="flex" flexDirection="column" gap={4} mt={2}>
          {/* Vyhodnocení jídelníčku */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Vyhodnotit jídelníček
            </Typography>
            <TextField
              multiline
              rows={6}
              fullWidth
              label="Instrukce pro vyhodnocení jídelníčku"
              value={evaluationPrompt}
              onChange={() => {}}
              disabled
              sx={{ mb: 2 }}
            />
            <ChatGPTAssistant
              endpoint="chatgpt"
              data={meals}
              userSetting={userSetting}
              systemPrompt={evaluationPrompt}
              label="Vyhodnotit jídelníček"
              onResponse={(result) => {
                if (typeof result === "string") {
                  setEvaluation(result);
                } else {
                  // objekt -> hezky vypsat
                  setEvaluation(JSON.stringify(result, null, 2));
                }
              }}
            />
          </Box>

          {/* Návrh nového jídelníčku */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Navrhnout vylepšený jídelníček
            </Typography>
            <TextField
              multiline
              rows={6}
              fullWidth
              label="Instrukce pro návrh jídelníčku"
              value={suggestionPrompt}
              onChange={() => {}}
              disabled
              sx={{ mb: 2 }}
            />
            <ChatGPTAssistant
              endpoint="chatgpt"
              data={meals}
              userSetting={userSetting}
              systemPrompt={suggestionPrompt}
              label="Navrhnout jídelníček"
              onResponse={(result) => {
                // Výsledek může být objekt nebo text s JSONem → ChatGPTAssistant už se snaží parsovat.
                if (typeof result === "object" && result) {
                  setSuggestion(result);
                } else if (typeof result === "string") {
                  // poslední pojistka: zkus vyparsovat tady
                  try {
                    const obj = JSON.parse(result);
                    setSuggestion(obj);
                  } catch {
                    // když je to fakt jen text, zobrazíme ho v hodnocení
                    setEvaluation(String(result));
                  }
                }
              }}
            />
          </Box>
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

        {/* Výstup návrhu jídelníčku */}
        {suggestion && (
          <>
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                ✨ Návrh nového jídelníčku
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
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
                    {Object.entries(suggestion).map(([day, mealsObj]: any) => (
                      <TableRow key={day}>
                        <TableCell>{day}</TableCell>
                        <TableCell>{mealsObj.snidane || "-"}</TableCell>
                        <TableCell>{mealsObj.svacina || "-"}</TableCell>
                        <TableCell>{mealsObj.obed || "-"}</TableCell>
                        <TableCell>{mealsObj.svacina_odpoledne || "-"}</TableCell>
                        <TableCell>{mealsObj.vecere || "-"}</TableCell>
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
