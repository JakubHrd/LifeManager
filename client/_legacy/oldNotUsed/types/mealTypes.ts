// Jedno konkrétní jídlo – např. "Kuřecí maso s rýží"
export interface MealItem {
    description: string;
    eaten: boolean;
  }
  
  // Všechna jídla v jednom dni – např. "snídaně", "oběd", "večeře"
  export interface DailyMeals {
    [mealName: string]: MealItem;
  }
  
  // Kompletní jídelníček pro celý týden (např. "Monday" -> DailyMeals)
  export interface MealsByDay {
    [dayName: string]: DailyMeals;
  }