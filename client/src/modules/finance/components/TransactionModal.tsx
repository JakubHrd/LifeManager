import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack } from "@mui/material";
import { Category, TxType } from "../types";
import * as React from "react";

export default function TransactionModal({ open, onClose, onSubmit, categories, defaultDate }:{
  open:boolean; onClose:()=>void; onSubmit:(p:{date:string; type:TxType; categoryId:string; amount:number; note?:string})=>void;
  categories: Category[]; defaultDate: string;
}) {
  const [form,setForm] = React.useState({ date: defaultDate, type:"expense" as TxType, categoryId: categories[0]?.id ?? "", amount: 0, note:"" });
  React.useEffect(()=>{ setForm(f=>({ ...f, date: defaultDate, categoryId: categories[0]?.id ?? "" })); },[defaultDate,categories]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Nový záznam</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <TextField type="date" label="Datum" value={form.date} onChange={e=>setForm({ ...form, date:e.target.value })} />
          <TextField select label="Typ" value={form.type} onChange={e=>setForm({ ...form, type:e.target.value as TxType })}>
            <MenuItem value="income">Příjem</MenuItem><MenuItem value="expense">Výdaj</MenuItem>
          </TextField>
          <TextField select label="Kategorie" value={form.categoryId} onChange={e=>setForm({ ...form, categoryId:e.target.value })}>
            {categories.map(c=> <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField type="number" label="Částka" value={form.amount} onChange={e=>setForm({ ...form, amount:Number(e.target.value||0) })} />
          <TextField label="Poznámka" value={form.note} onChange={e=>setForm({ ...form, note:e.target.value })} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zrušit</Button>
        <Button variant="contained" onClick={()=>{ onSubmit(form); onClose(); }}>Přidat</Button>
      </DialogActions>
    </Dialog>
  );
}
