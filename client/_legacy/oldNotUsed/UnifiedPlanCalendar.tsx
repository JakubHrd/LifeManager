/** @deprecated - archived in _legacy, not part of build */
/*
import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  Box, Alert, TableContainer, Table, TableHead, TableBody, Paper,
  useMediaQuery, Accordion, AccordionSummary, AccordionDetails, Checkbox,
  TextField, List, ListItem, ListItemText, Typography, Button
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import { useTheme } from "@mui/material/styles";
import TableHeader from "./TableHeader";
import TableRowGeneric from "./TableRowGeneric";
import { translations } from "../../src/utils/translations";
import { CalendarConfig, PlanByDay } from "../../src/types/plan";
import { usePlanUnified } from "../../src/hooks/usePlanUnified";
import { DAYS } from "../../src/utils/makeEmptyPlan";

type Props = {
  week: number;
  year: number;
  config: CalendarConfig;
  onPlanChange?: (d: PlanByDay) => void;
};

export type UnifiedPlanRef = {
  getData: () => PlanByDay;
  applySuggestion: (suggestion: any) => void;
};

const UnifiedPlanCalendar = forwardRef<UnifiedPlanRef, Props>(({ week, year, config, onPlanChange }, ref) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const { data, setData, persist, loading, error } = usePlanUnified(week, year, config);
  const [editingCell, setEditingCell] = useState<{ day: string; section: string } | null>(null);

  useImperativeHandle(ref, () => ({
    getData: () => data,
    applySuggestion: (suggestion: any) => {
      const next: PlanByDay = {};
      Object.entries(suggestion || {}).forEach(([dayCz, sections]) => {
        const dayEn = config.dayMapCzToEn[dayCz] || (dayCz as string);
        next[dayEn as any] = next[dayEn as any] || {};
        Object.entries(sections as Record<string, string | null | undefined>).forEach(([sectionCz, description]) => {
          const key = config.sectionMapCzToEn[sectionCz] || sectionCz;
          const old = (data?.[dayEn as any]?.[key] as any) || {};
          (next[dayEn as any] as any)[key] = {
            description: String(description ?? ""),
            [config.doneField]: old?.[config.doneField] ?? false,
          };
        });
      });
      setData(next);
      onPlanChange?.(next);
    },
  }), [data, config]);

  const sectionKeys = config.sectionKeys;

  const toggleCompletion = (day: string, section: string) => {
    const prev = (data?.[day as any]?.[section] as any) || { description: "", [config.doneField]: false };
    const patch = { ...prev, [config.doneField]: !prev[config.doneField] };
    const next: PlanByDay = { ...(data || {}) };
    next[day as any] = { ...(next[day as any] || {}) };
    (next[day as any] as any)[section] = patch;
    setData(next);
  };

  const handleDescriptionChange = (day: string, section: string, val: string) => {
    const prev = (data?.[day as any]?.[section] as any) || { description: "", [config.doneField]: false };
    const patch = { ...prev, description: val };
    const next: PlanByDay = { ...(data || {}) };
    next[day as any] = { ...(next[day as any] || {}) };
    (next[day as any] as any)[section] = patch;
    setData(next);
  };

  const savePlan = async () => {
    await persist(data || {});
    onPlanChange?.(data || {});
  };

  const MobileList = () => (
    <Box sx={{ mt: 2 }}>
      {DAYS.map((day) => {
        const dayLabel = translations[day]?.cs || day;
        const dayData = (data as any)?.[day] || {};
        return (
          <Accordion key={day} disableGutters sx={{ mb: 1, borderRadius: 2, overflow: "hidden" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>{dayLabel}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List sx={{ py: 0 }}>
                {sectionKeys.map((section) => {
                  const item = dayData?.[section] || { description: "", [config.doneField]: false };
                  const sectionLabel = translations[section]?.cs || section;
                  return (
                    <ListItem
                      key={`${day}-${section}`}
                      alignItems="flex-start"
                      disableGutters
                      secondaryAction={
                        <Checkbox
                          edge="end"
                          checked={!!item[config.doneField]}
                          onChange={() => toggleCompletion(day, section)}
                        />
                      }
                    >
                      <ListItemText
                        primary={sectionLabel}
                        secondary={
                          <TextField
                            value={item.description || ""}
                            onChange={(e) => handleDescriptionChange(day, section, e.target.value)}
                            onBlur={() => savePlan()}
                            size="small"
                            fullWidth
                            multiline
                            minRows={2}
                            placeholder="Popis..."
                          />
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
              <Box display="flex" justifyContent="flex-end">
                <Button startIcon={<SaveIcon />} variant="contained" color="success" onClick={savePlan}>
                  Uložit
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );

  if (error) {
    return (
      <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
        ⚠️ {error}
      </Alert>
    );
  }
  if (loading) return null;

  return (
    <Box>
      {isMdUp ? (
        <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2, boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableHeader sectionKeys={sectionKeys} translationsMap={translations} />
            </TableHead>
            <TableBody>
              {DAYS.map((day) => (
                <TableRowGeneric<any>
                  key={day}
                  day={day}
                  sectionKeys={sectionKeys}
                  data={data as any}
                  editingCell={editingCell}
                  onEditCell={(d, s) => setEditingCell({ day: d, section: s })}
                  onToggle={toggleCompletion}
                  onChange={handleDescriptionChange}
                  onSave={() => {
                    setEditingCell(null);
                    savePlan();
                  }}
                  translationsMap={translations}
                  getDescription={(val) => (val ? (val as any).description || "" : "")}
                  getDone={(val) => (val ? !!(val as any)[config.doneField] : false)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <MobileList />
      )}
    </Box>
  );
});

export default UnifiedPlanCalendar;
*/
