export type TxType = "income" | "expense";

export type Transaction = {
  id: string;
  date: string;            // ISO (YYYY-MM-DD)
  type: TxType;
  categoryId: string;
  amount: number;          // v Kč/€
  note?: string;
};

export type Category = { id: string; name: string; color: string };
export type Budget = { id?: string; categoryId: string; limit: number; period: "month" | "week" };

export type FinanceState = {
  txs: Transaction[];
  categories: Category[];
  budgets: Budget[];
};
