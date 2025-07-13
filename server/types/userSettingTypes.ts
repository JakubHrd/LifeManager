export interface UserSettingInput {
  height_cm?: number | null;
  weight_kg?: number | null;
  birth_date?: string | null;
  gender?: "male" | "female" | "other" | null;
  target_weight_kg?: number | null;
  main_goal?: "lose_weight" | "maintain_weight" | "gain_muscle" | "improve_health" | null;
}
