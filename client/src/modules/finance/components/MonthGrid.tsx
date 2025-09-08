import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Transaction, Category } from "../types";

export default function MonthGrid({ year, month, txs, categories, onAddAt }:{
  year:number; month:number; // 1-12
  txs: Transaction[]; categories: Category[];
  onAddAt: (isoDate: string)=>void;
}) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const byDay: Record<number, Transaction[]> = {};
  txs.forEach(t => { const d = new Date(t.date).getDate(); (byDay[d]??=[]).push(t); });

  const catMap = new Map(categories.map(c=>[c.id,c]));

  return (
    <Box sx={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:1 }}>
      {Array.from({ length: daysInMonth }, (_,i)=> i+1).map(d => {
        const date = new Date(year, month-1, d).toISOString().slice(0,10);
        const list = byDay[d] ?? [];
        return (
          <Box key={d} sx={{ p:1, border:"1px solid var(--color-border)", borderRadius:2, bgcolor:"var(--lm-surface-variant)" }}>
            <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", mb:0.5 }}>
              <strong>{d}</strong>
              <Tooltip title="Přidat záznam"><IconButton  size="small" onClick={()=>onAddAt(date)}><AddRoundedIcon sx={{bgcolor:"var(--lm-surface-variant)"}} fontSize="small" /></IconButton></Tooltip>
            </Box>
            <Box sx={{ display:"flex", flexWrap:"wrap", gap:0.5 }}>
              {list.map(tx => {
                const cat = catMap.get(tx.categoryId);
                const sign = tx.type === "income" ? "+" : "−";
                return (
                  <Chip key={tx.id} size="small"
                    label={`${sign}${Math.abs(tx.amount).toLocaleString()} ${cat ? "· "+cat.name : ""}`}
                    sx={{ bgcolor:"var(--color-surface)", border:"1px solid var(--color-border)" }}
                  />
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
