import { FinanceState, Transaction, Category, Budget } from "../types";

let db: FinanceState = { txs: [], categories: [], budgets: [] };

const delay = (ms = 200) => new Promise(res => setTimeout(res, ms));

export async function getAll(): Promise<FinanceState> { await delay(); return structuredClone(db); }
export async function addTx(tx: Omit<Transaction,"id">): Promise<Transaction> {
  await delay(); const row = { ...tx, id: crypto.randomUUID() }; db.txs.push(row); return structuredClone(row);
}
export async function updateTx(id: string, patch: Partial<Transaction>): Promise<Transaction> {
  await delay(); const i = db.txs.findIndex(t => t.id === id); if (i>=0) db.txs[i] = { ...db.txs[i], ...patch }; return structuredClone(db.txs[i]);
}
export async function deleteTx(id: string): Promise<void> { await delay(); db.txs = db.txs.filter(t => t.id !== id); }

export async function upsertCategory(cat: Category): Promise<void> { await delay(); const i=db.categories.findIndex(c=>c.id===cat.id); if(i>=0) db.categories[i]=cat; else db.categories.push(cat); }
export async function upsertBudget(b: Budget): Promise<void> { await delay(); const i=db.budgets.findIndex(x=>x.categoryId===b.categoryId&&x.period===b.period); if(i>=0) db.budgets[i]=b; else db.budgets.push(b); }

// init pár dat
(function seed(){
  db.categories = [
    { id:"food", name:"Jídlo", color:"#60a5fa" },
    { id:"sport", name:"Sport", color:"#34d399" },
    { id:"rent", name:"Nájem", color:"#f59e0b" },
  ];
  db.budgets = [{ categoryId:"food", period:"month", limit:6000 }];
})();
