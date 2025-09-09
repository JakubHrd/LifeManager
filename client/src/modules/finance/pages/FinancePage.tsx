import * as React from "react";
import SectionHeader from "@/components/SectionHeader";
import { getAll, addTx } from "../api/finance.api";
import { FinanceState, TxType } from "../types";
import SummaryCards from "../components/SummaryCards";
import MonthGrid from "../components/MonthGrid";
import TransactionModal from "../components/TransactionModal";

export default function FinancePage() {
  const [state,setState] = React.useState<FinanceState>({ txs:[], categories:[], budgets:[] });
  const today = new Date();
  const [y,m] = [today.getFullYear(), today.getMonth()+1];
  const [modalDate, setModalDate] = React.useState<string | null>(null);

  React.useEffect(()=>{ getAll().then(setState); }, []);

  const income = state.txs.filter(t=>t.type==="income").reduce((a,b)=>a+b.amount,0);
  const expense = state.txs.filter(t=>t.type==="expense").reduce((a,b)=>a+b.amount,0);

  async function handleAdd(p:{date:string; type:TxType; categoryId:string; amount:number; note?:string}) {
    const optimistic = { id: "tmp-"+Math.random(), ...p };
    setState(s => ({ ...s, txs:[...s.txs, optimistic]}));
    const saved = await addTx(p);
    setState(s => ({ ...s, txs: s.txs.map(t => t.id===optimistic.id ? saved : t) }));
  }

  return (
    <div>
      <SectionHeader title="Finance" subtitle={`Měsíc ${m}/${y}`} />
      <SummaryCards income={income} expense={expense} />
      <MonthGrid year={y} month={m} txs={state.txs} categories={state.categories}
        onAddAt={(iso)=> setModalDate(iso)} />
      <TransactionModal open={!!modalDate} onClose={()=>setModalDate(null)} defaultDate={modalDate ?? new Date().toISOString().slice(0,10)}
        categories={state.categories} onSubmit={handleAdd} />
    </div>
  );
}
