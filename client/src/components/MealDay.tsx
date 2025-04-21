import React from "react";
import { Grid, TextField, Typography, Checkbox, FormControlLabel } from "@mui/material";

interface MealDayProps {
  day: string;
  meals: { 
    [day: string]: { 
      [meal: string]: { description: string; eaten: boolean }; 
    };
  };
  onMealChange: (day: string, meal: string, field: "description" | "eaten", value: string | boolean) => void;
}

const mealTypes = ["breakfast", "snack", "lunch", "snack2", "dinner"];

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

const MealDay: React.FC<MealDayProps> = ({ day, meals, onMealChange }) => {
  return (
    <Grid container spacing={2}>
      {mealTypes.map((meal) => (
        <Grid item lg={2} xs={12} key={meal}>
          <Typography variant="subtitle1">{translations[meal].cs}</Typography>
          <TextField
            multiline
            rows={2}
            variant="outlined"
            size="small"
            fullWidth
            value={meals[day]?.[meal]?.description || ""}
            onChange={(e) => onMealChange(day, meal, "description", e.target.value)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default MealDay;
