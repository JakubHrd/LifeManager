// src/config/calendar.meals.ts
import { CalendarConfig } from "../types/plan";

export const mealsConfig: CalendarConfig = {
  mode: "meals",
  title: "Jídelníček",
  sectionKeys: ["breakfast","snack","lunch","snack2","dinner"],
  doneField: "eaten",
  dayMapCzToEn: {
    "Pondělí":"Monday","Úterý":"Tuesday","Středa":"Wednesday","Čtvrtek":"Thursday",
    "Pátek":"Friday","Sobota":"Saturday","Neděle":"Sunday"
  },
  sectionMapCzToEn: {
    "snidane":"breakfast",
    "svacina":"snack",
    "obed":"lunch",
    "svacina_odpoledne":"snack2",
    "vecere":"dinner"
  }
};
