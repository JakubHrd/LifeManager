// src/config/calendar.training.ts
import { CalendarConfig } from "../types/plan";

export const trainingConfig: CalendarConfig = {
  mode: "training",
  title: "Tréninkový plán",
  sectionKeys: ["morning","main","evening"],
  doneField: "done",
  dayMapCzToEn: {
    "Pondělí":"Monday","Úterý":"Tuesday","Středa":"Wednesday","Čtvrtek":"Thursday",
    "Pátek":"Friday","Sobota":"Saturday","Neděle":"Sunday"
  },
  sectionMapCzToEn: {
    "rano":"morning",
    "hlavni":"main",
    "vecer":"evening"
  }
};
