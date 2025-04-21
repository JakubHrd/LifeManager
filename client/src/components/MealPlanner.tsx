import React, { useState, useEffect } from "react";
import { Grid, Typography, Paper, Button } from "@mui/material";
import MealDay from "./MealDay";
import { useAuthContext } from "../context/AuthContext"; 

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealsDefault = ["breakfast", "snack", "lunch", "snack2", "dinner"];

interface MealPlannerProps {
  week: number;
  year: number;
}

const MealPlanner: React.FC<MealPlannerProps> = ({ week, year }) => {
  console.log(`MealPlanner year: ${year}`);
  console.log(`MealPlanner week: ${week}`);

  const { isAuthenticated } = useAuthContext();
  const [meals, setMeals] = useState<{ 
    [day: string]: { 
      [meal: string]: { description: string; eaten: boolean }; 
    }; 
  }>({});

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/meals?week=${week}&year=${year}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('data',{data});
        setMeals(data.meals || {})
      });
      
  }, [isAuthenticated]);

  const handleMealChange = (day: string, meal: string, field: "description" | "eaten", value: string | boolean) => {
    setMeals((prevMeals) => ({
      ...prevMeals,
      [day]: {
        ...prevMeals[day],
        [meal]: { 
          ...prevMeals[day]?.[meal], 
          [field]: value 
        },
      },
    }));
  };

  const saveMealPlan = () => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/meals?week=${week}&year=${year}`, {  
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ meals }),
    }).then((res) => res.json()).then((data) => {
        console.log('POST data',{data})
        if (data.success) alert("Jídelníček byl úspěšně uložen!");
      });
  };

  const translations: {[key: string]: { cs: string; en: string; default: string }} = {
    breakfast: { cs: "Snídaně", en: "Breakfast", default: "Breakfast", },
    snack: { cs: "Svačina", en: "Snack", default: "Snack" },
    snack2: { cs: "Svačina", en: "Snack", default: "Snack" },
    lunch: { cs: "Oběd", en: "Lunch", default: "Lunch" },
    dinner: { cs: "Večeře", en: "Dinner", default: "Dinner" },
    Monday: { cs: "Pondělí", en: "Monday", default: "Monday", },
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
            <MealDay day={day} meals={meals} onMealChange={handleMealChange} />
          </Paper>
        </Grid>
      ))}
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={saveMealPlan}>
          Uložit jídelníček
        </Button>
      </Grid>
    </Grid>
  );
};

export default MealPlanner;
