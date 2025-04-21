import React, { useState } from "react";
import { TextField } from "@mui/material";

interface MealItemProps {
  mealName: string;
}

const MealItem: React.FC<MealItemProps> = ({ mealName }) => {
  const [meal, setMeal] = useState(mealName);
  const [calories, setCalories] = useState("");

  return (
    <div>
      <TextField
        label="Jídlo"
        variant="outlined"
        size="small"
        value={meal}
        onChange={(e) => setMeal(e.target.value)}
        sx={{ mr: 1 }}
      />
      <TextField
        label="Kalorie"
        variant="outlined"
        size="small"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
      />
    </div>
  );
};

export default MealItem;
