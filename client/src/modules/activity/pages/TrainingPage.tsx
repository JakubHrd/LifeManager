import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { Box } from "@mui/material";

import SectionHeader from "../../../components/SectionHeader";
import ActivityMatrix from "../components/ActivityMatrix";
import trainingConfig from "../config/training.matrix.config";

import { toIsoWeek, shiftWeek, weekRangeLabel } from "../../../utils/week";

export default function TrainingPage() {
  const [sp, setSp] = useSearchParams();

  const now = toIsoWeek();
  const week = Number(sp.get("week") ?? now.week);
  const year = Number(sp.get("year") ?? now.year);

  const go = (w: number, y: number) => {
    const p = new URLSearchParams(sp);
    p.set("week", String(w));
    p.set("year", String(y));
    setSp(p, { replace: true });
  };

  const prevWeek = () => { const p = shiftWeek(week, year, -1); go(p.week, p.year); };
  const nextWeek = () => { const p = shiftWeek(week, year, +1); go(p.week, p.year); };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
      <SectionHeader
        title="Trénink"
        subtitle={weekRangeLabel(week, year)}
        onPrev={prevWeek}
        onNext={nextWeek}
      />
      <ActivityMatrix config={trainingConfig} params={{ week, year }} />
    </Box>
  );
}
