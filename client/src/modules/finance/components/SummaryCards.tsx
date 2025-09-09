import { Card, CardContent, Typography, Box } from "@mui/material";

export default function SummaryCards({ income, expense }: { income: number; expense: number }) {
  const net = income - expense;
  const fmt = (n:number) => n.toLocaleString(undefined,{style:"currency",currency:"CZK",maximumFractionDigits:0});
  return (
    <Box sx={{ display:"grid", gridTemplateColumns:{ xs:"1fr", sm:"repeat(3,1fr)" }, gap:1.5, mb:2 }}>
      <Card sx={{ bgcolor:"var(--lm-surface-variant)" }}><CardContent><Typography variant="overline">Příjmy</Typography><Typography variant="h5">{fmt(income)}</Typography></CardContent></Card>
      <Card sx={{ bgcolor:"var(--lm-surface-variant)" }}><CardContent><Typography variant="overline">Výdaje</Typography><Typography variant="h5">{fmt(expense)}</Typography></CardContent></Card>
      <Card sx={{ bgcolor:"var(--lm-surface-variant)" }}><CardContent><Typography variant="overline">Čisté</Typography><Typography variant="h5">{fmt(net)}</Typography></CardContent></Card>
    </Box>
  );
}
