// src/services/planApi.ts
import serverUrl from "../config";
import { PlanByDay, CalendarMode } from "../types/plan";

function getKey(mode: CalendarMode) {
  return mode === "meals" ? "meals" : "trainings";
}

function getPath(mode: CalendarMode) {
  return mode === "meals" ? "/api/meals" : "/api/trainings";
}

export async function fetchPlan(mode: CalendarMode, week: number, year: number, signal?: AbortSignal) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${serverUrl}${getPath(mode)}?week=${week}&year=${year}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  if (!res.ok) throw new Error("Chyba při načítání plánu");
  const json = await res.json();
  return (json?.[getKey(mode)] as PlanByDay) || {};
}

export async function savePlan(mode: CalendarMode, week: number, year: number, data: PlanByDay) {
  const token = localStorage.getItem("token");
  await fetch(`${serverUrl}${getPath(mode)}?week=${week}&year=${year}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ [getKey(mode)]: data }),
  });
}
