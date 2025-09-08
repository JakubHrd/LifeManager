import * as React from "react";
import { Alert, Box, Snackbar, useMediaQuery, useTheme } from "@mui/material";
import { ActivityMatrixConfig, Matrix } from "../types";
import { ActivityApi } from "../api/base";
import DesktopMatrix from "./matrix/DesktopMatrix";
import MobileDayView from "./matrix/MobileDayView";
import AddRowBar from "./matrix/AddRowBar";

type Props<Cell extends Record<string, any>> = {
  config: ActivityMatrixConfig<Cell>;
  params: Record<string, any>;
  headers?: Record<string, string>;
};

export default function ActivityMatrix<Cell extends Record<string, any>>({
  config,
  params,
  headers = {},
}: Props<Cell>) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [matrix, setMatrix] = React.useState<Matrix<Cell>>({});
  const [meta, setMeta] = React.useState<any>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedToast, setSavedToast] = React.useState(false);

  const api = React.useMemo(
    () => new ActivityApi(config.api.basePath, { credentials: "include", headers }),
    [config.api.basePath, JSON.stringify(headers)]
  );

  const rows = React.useMemo<string[]>(
    () => (meta?.rows as string[]) ?? config.ui.rows,
    [meta?.rows, config.ui.rows]
  );
  const cols = React.useMemo<Array<{ key: string; label: string }>>(
    () => (meta?.cols as Array<{ key: string; label: string }>) ?? config.ui.cols,
    [meta?.cols, config.ui.cols]
  );

  // ---- load ----
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await api.get(params);
      const { matrix: mtx, meta: mta } = config.api.transformIn(raw);

      const effRows = (mta?.rows as string[]) ?? config.ui.rows;
      const effCols = (mta?.cols as Array<{ key: string }>) ?? config.ui.cols;
      const empty = config.ui.cell.empty;
      const filled: Matrix<Cell> = {};
      for (const r of effRows) {
        const src = (mtx[r] ?? {}) as Record<string, Cell>;
        const out: Record<string, Cell> = {};
        for (const c of effCols) out[c.key] = (src[c.key] ?? empty()) as Cell;
        filled[r] = out;
      }
      setMatrix(filled);
      setMeta(mta);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [api, config.ui.rows, config.ui.cols, config.ui.cell.empty, config.api, JSON.stringify(params)]);

  React.useEffect(() => { load(); }, [load]);

  // ---- persist (POST) + toast ----
  const persist = React.useCallback(
    async (nextMatrix?: Matrix<Cell>, nextMeta?: any) => {
      setSaving(true);
      setError(null);
      try {
        const payload = config.api.transformOut(nextMatrix ?? matrix, nextMeta ?? meta);
        await api.post(params, payload);
        setSavedToast(true);
      } catch (e: any) {
        setError(e?.message ?? "Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [api, config.api, matrix, meta, JSON.stringify(params)]
  );

  // ---- cell handlers ----
  const textKey = config.ui.cell.textKey;
  const boolKey = config.ui.cell.booleanKey;

  const setTextInCell = (cell: Cell, value: string) =>
    textKey ? ({ ...(cell as any), [textKey]: value } as Cell) : cell;

  const handleChangeText = (rKey: string, cKey: string, value: string) => {
    setMatrix(prev => {
      const row = prev[rKey] ?? {};
      const cell = (row[cKey] ?? config.ui.cell.empty()) as Cell;
      return { ...prev, [rKey]: { ...row, [cKey]: setTextInCell(cell, value) } };
    });
  };
  const handleCommitText = async () => { await persist(); };

  const handleToggleBool = async (rKey: string, cKey: string) => {
    if (!boolKey) return;
    const current = matrix[rKey]?.[cKey] ?? config.ui.cell.empty();
    const next: Cell = { ...(current as any), [boolKey]: !((current as any)[boolKey]) };
    const nextM: Matrix<Cell> = { ...matrix, [rKey]: { ...(matrix[rKey] ?? {}), [cKey]: next } } as Matrix<Cell>;
    setMatrix(nextM);
    await persist(nextM, meta);
  };

  // ---- dynamic rows (Habits) ----
  const canDynamic = !!config.ui.dynamicRows;

  const addRowByName = React.useCallback(async (name: string) => {
    if (!canDynamic) return;
    const normalize = config.ui.dynamicRows?.normalize ??
      ((s: any) => String(s ?? "").replace(/\s+/g, " ").trim());
    const validate = config.ui.dynamicRows?.validate ??
      ((n: string, existing: string[]) => (existing.includes(n) ? "Název už existuje" : true));

    const norm = normalize(name);
    const existing = (meta?.rows as string[]) ?? config.ui.rows;

    if (!norm) throw new Error("Zadej název");
    const vr = validate(norm, existing);
    if (vr !== true) throw new Error(typeof vr === "string" ? vr : "Neplatný název");

    const effCols = (meta?.cols as Array<{ key: string }>) ?? config.ui.cols;
    const empty = config.ui.cell.empty;
    const newRowObj = Object.fromEntries(effCols.map(c => [c.key, empty()])) as Record<string, Cell>;

    const next: Matrix<Cell> = { ...matrix, [norm]: newRowObj };
    const nextMeta = { ...(meta ?? {}), rows: [...existing, norm] };
    setMatrix(next); setMeta(nextMeta);
    await persist(next, nextMeta);
  }, [canDynamic, config.ui, matrix, meta, persist]);

  const deleteRowByKey = React.useCallback(async (rKey: string) => {
    if (!canDynamic) return;
    const currentRows = (meta?.rows as string[]) ?? config.ui.rows;
    const nextRows = currentRows.filter(r => r !== rKey);
    const { [rKey]: _removed, ...rest } = matrix;
    const next = rest as Matrix<Cell>;
    const nextMeta = { ...(meta ?? {}), rows: nextRows };
    setMatrix(next); setMeta(nextMeta);
    await persist(next, nextMeta);
  }, [canDynamic, matrix, meta, config.ui, persist]);

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      {/* Přidání nového návyku – DESKTOP */}
      {isDesktop && canDynamic && (
        <AddRowBar
          placeholder={config.ui.dynamicRows?.placeholder ?? "Nový návyk…"}
          busy={loading || saving}
          onAdd={addRowByName}
        />
      )}

      {isDesktop ? (
        <DesktopMatrix<Cell>
          rows={rows}
          cols={cols}
          matrix={matrix}
          ui={config.ui}
          loading={loading}
          saving={saving}
          onChangeText={handleChangeText}
          onCommitText={handleCommitText}
          onToggleBool={handleToggleBool}
        />
      ) : (
        <MobileDayView<Cell>
          rows={rows}
          cols={cols}
          matrix={matrix}
          ui={config.ui}
          loading={loading}
          saving={saving}
          onChangeText={handleChangeText}
          onCommitText={handleCommitText}
          onToggleBool={handleToggleBool}
          onAddRow={canDynamic ? addRowByName : undefined}
          onDeleteRow={canDynamic ? deleteRowByKey : undefined}
        />
      )}

      <Snackbar
        open={savedToast}
        autoHideDuration={1400}
        onClose={() => setSavedToast(false)}
        message="Uloženo"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
