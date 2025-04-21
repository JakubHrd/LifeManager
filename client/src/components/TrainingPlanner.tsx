import React, { useState, useEffect } from "react";
import { Grid, Typography, Paper, Button, TextField } from "@mui/material";
import MealDay from "./MealDay";
import { useAuthContext } from "../context/AuthContext"; 

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const trainingsDefault = ["morning", "main", "evening"];

interface TrainingPlannerProps {
  week: number;
  year: number;
}

const TrainingPlanner: React.FC<TrainingPlannerProps> = ({ week, year }) => {
  console.log(`MealPlanner year: ${year}`);
  console.log(`MealPlanner week: ${week}`);

  const { isAuthenticated } = useAuthContext();
  const [trainings, setTrainings] = useState<{ 
    [day: string]: { 
      [trainings: string]: { description: string; eaten: boolean }; 
    }; 
  }>({});

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/trainings?week=${week}&year=${year}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('data',{data});
        setTrainings(data.trainings || {})
      });
      
  }, [isAuthenticated]);

  const handleChange = (day: string, training: string, field: "description" | "done", value: string | boolean) => {
    console.log('trainings',{trainings});
    setTrainings((prevTrainings) => ({
      ...prevTrainings,
      [day]: {
        ...prevTrainings[day],
        [training]: { 
          ...prevTrainings[day]?.[training], 
          [field]: value 
        },
      },
    }));
  };

  const savePlan = () => {
    console.log('POST trainings',{trainings})
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/trainings?week=${week}&year=${year}`, {  
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ trainings }),
    }).then((res) => res.json()).then((data) => {
        console.log('POST data',{data})
        if (data.success) alert("Jídelníček byl úspěšně uložen!");
      });
  };

  const translations: {
    [key: string]: { cs: string; en: string; default: string };
  } = {
    morning: { cs: "Ráno", en: "Morning", default: "Morning" },
    main: { cs: "Hlavní aktivita", en: "Main activity", default: "Main activity" },
    evening: { cs: "Večer", en: "Evening", default: "Evening" },
    Monday: { cs: "Pondělí", en: "Monday", default: "Monday" },
    Tuesday: { cs: "Úterý", en: "Tuesday", default: "Tuesday" },
    Wednesday: { cs: "Středa", en: "Wednesday", default: "Wednesday" },
    Thursday: { cs: "Čtvrtek", en: "Thursday", default: "Thursday" },
    Friday: { cs: "Pátek", en: "Friday", default: "Friday" },
    Saturday: { cs: "Sobota", en: "Saturday", default: "Saturday" },
    Sunday: { cs: "Neděle", en: "Sunday", default: "Sunday" },
  };

  return (
    <Grid container spacing={2}>
      {days.map((day) => (
        <Grid item lg={12} key={day}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6">{translations[day].cs}</Typography>
                <Grid container spacing={2}>
                  {trainingsDefault.map((training) => (
                    <Grid item lg={2} xs={12} key={training}>
                      <Typography variant="subtitle1">{translations[training].cs}</Typography>
                      <TextField
                        multiline
                        rows={2}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={trainings[day]?.[training]?.description || ""}
                        onChange={(e) => handleChange(day, training, "description", e.target.value)}
                      />
                    </Grid>
                  ))}
                </Grid>
          </Paper>
        </Grid>
      ))}
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={savePlan}>
          Uložit jídelníček
        </Button>
      </Grid>
    </Grid>
  );
};

export default TrainingPlanner;
