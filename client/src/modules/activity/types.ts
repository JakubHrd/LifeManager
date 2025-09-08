export type Matrix<Cell> = Record<string, Record<string, Cell>>;

export type ActivityMatrixConfig<Cell extends Record<string, any>> = {
  domain: string;
  title: string;
  api: {
    basePath: string;
    transformIn: (raw: any) => { matrix: Matrix<Cell>; meta?: any };
    transformOut: (matrix: Matrix<Cell>, meta?: any) => any;
  };
  ui: {
    rows: string[];
    cols: Array<{ key: string; label: string }>;
    cell: {
      /** klíč textu v buňce (např. "description") */
      textKey?: string;
      /** klíč booleanu v buňce (např. "done") */
      booleanKey?: string;
      /** továrna na prázdnou buňku */
      empty: () => Cell;
    };
    labels?: { rowHeader?: string };
    /**
     * Volitelné – povolí dynamické řádky (např. Návyky).
     * Zobrazí input „Nový …“, umožní mazat řádky a obslouží persist.
     */
    dynamicRows?: {
      /** Placeholder pro input */
      placeholder?: string;
      /** Validace názvu – vrať true nebo text chyby */
      validate?: (name: string, existing: string[]) => true | string;
      /** Normalizace názvu (trim, sloučení whitespace) */
      normalize?: (name: string) => string;
      /** Povolit mazání (default: true) */
      deletable?: boolean;
      /** Vlastní potvrzení mazání; default: window.confirm */
      confirmDelete?: (rowKey: string) => boolean;
      /** Vlastní zobrazení labelu řádku; default: rowKey */
      rowLabel?: (rowKey: string) => string;
    };
  };
};
