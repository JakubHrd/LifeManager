import React, { useState, useEffect, useRef } from "react";
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



const Diet: React.FC = () => {
  const [meals, setMeals] = useState<any>({});
  const [evaluation, setEvaluation] = useState<string>("");
  const [suggestion, setSuggestion] = useState<any>(null);
  const [week, setWeek] = useState<number>(moment().isoWeek());
  const [year, setYear] = useState<number>(moment().year());
  const [userSetting, setUserSetting] = useState<any>(null);
  const [loadingUserSetting, setLoadingUserSetting] = useState<boolean>(true);
  const [evaluationPrompt, setEvaluationPrompt] = useState<string>(`
    Jsi certifikovaný odborník na výživu. Vyhodnoť následující týdenní jídelníček s ohledem na tyto parametry uživatele:
    
    - Výška: {height_cm} cm
    - Váha: {weight_kg} kg
    - Datum narození: {birth_date} (věk si dopočítej)
    - Pohlaví: {gender}
    - Cílová váha: {target_weight_kg} kg
    - Hlavní cíl: {main_goal} (např. zhubnout, udržet váhu, nabrat svalovou hmotu, zlepšit zdraví)
    
    Tvým úkolem je:
    1. Posoudit, zda jídelníček odpovídá energetickým a nutričním potřebám uživatele vzhledem k jeho cíli.
    2. Vyhodnotit poměr bílkovin, sacharidů a tuků.
    3. Upozornit na možné nedostatky nebo přebytky (např. málo bílkovin, příliš mnoho sacharidů, nedostatek vlákniny apod.).
    4. Doporučit konkrétní zlepšení jídelníčku s ohledem na cíl (např. přidat více bílkovin, omezit cukry, zařadit více zeleniny).
    
    Odpověď strukturovaně rozděl na tyto části:
    - Celkové hodnocení
    - Identifikované nedostatky / přebytky
    - Doporučené úpravy jídelníčku
    
    Piš v češtině.
    `);
     
const [suggestionPrompt, setSuggestionPrompt] = useState<string>(() => {
  const userParamsExist = !!userSetting;
  const basePrompt = `Jsi expert na výživu. Na základě týdenního jídelníčku${userParamsExist ? " a parametrů uživatele" : ""} vytvoř UPRAVENÝ jídelníček tak, že:

1. Zachováš všechna již vyplněná jídla – NESMÍŠ je měnit.
2. Doplníš pouze chybějící jídla tak, aby byl plán kompletní a vyvážený.
3. **Nepoužiješ žádné prázdné, zástupné nebo bezvýznamné hodnoty** – jako "-", "...", "N/A", "nic", "žádné", atd.
4. Každé jídlo musí být konkrétní a běžné – např. "ovesná kaše s ovocem", "kuřecí prsa s rýží", "tvaroh s ořechy".
5. Dny převeď z angličtiny do češtiny (např. "Monday" → "Pondělí").
6. Výstup vrať jako **validní JSON bez komentářů** ve formátu:

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

Používej přesně tyto klíče (bez diakritiky): snidane, svacina, obed, svacina_odpoledne, vecere
`;

  const params = userParamsExist
    ? `

Parametry uživatele:
- Výška: ${userSetting.height} cm
- Váha: ${userSetting.weight} kg
- Datum narození: ${userSetting.birthDate}
- Pohlaví: ${userSetting.gender}
- Cílová váha: ${userSetting.targetWeight} kg
- Cíl: ${userSetting.mainGoal}
`
    : "";

  return basePrompt + params;
});



  const mealCalendarRef = useRef<any>(null);

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log('res data userSetting',{data});
        setUserSetting(data);
      } catch (error) {
        console.error("Chyba při načítání uživatelského nastavení:", error);
      } finally {
        setLoadingUserSetting(false);
      }
    };

    fetchUserSetting();
    console.log('userSetting',{userSetting});
  }, []);

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
              onChange={(e) => setEvaluationPrompt(e.target.value)}
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
              label="Instrukce pro návrh nového jídelníčku"
              value={suggestionPrompt}
              onChange={(e) => setSuggestionPrompt(e.target.value)}
              sx={{ mb: 2 }}
            />
            <ChatGPTAssistant
              endpoint="chatgpt"
              data={meals}
              userSetting={userSetting}
              systemPrompt={suggestionPrompt}
              label="Navrhnout vylepšený jídelníček"
              onResponse={(result) => {
                if (typeof result === "object") {
                  setSuggestion(result);
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
