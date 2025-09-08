import dayjs from "../lib/dayjs";

/** {week, year} z libovolného data (default: dnes) */
export function toIsoWeek(date: Date = new Date()) {
  const d = dayjs(date);
  return { week: d.isoWeek(), year: d.year() };
}

/** Date = začátek ISO týdne (pondělí) */
export function fromWeekYear(week: number, year: number): Date {
  return dayjs().year(year).isoWeek(week).startOf("isoWeek").toDate();
}

/** Posun o delta týdnů a vrať {week, year} */
export function shiftWeek(week: number, year: number, delta: number) {
  const d = dayjs().year(year).isoWeek(week).add(delta, "week");
  return { week: d.isoWeek(), year: d.year() };
}

/** Rozsah ISO týdne jako {start, end} (Date) */
export function weekRange(week: number, year: number) {
  const start = dayjs().year(year).isoWeek(week).startOf("isoWeek");
  const end = start.endOf("isoWeek");
  return { start: start.toDate(), end: end.toDate() };
}

/** "Týden 36 (2.–8. září 2025)" */
export function weekRangeLabel(week: number, year: number) {
  const { start, end } = weekRange(week, year);
  const s = dayjs(start);
  const e = dayjs(end);
  const sameMonth = s.month() === e.month() && s.year() === e.year();

  if (sameMonth) {
    const range = `${s.format("D.")}–${e.format("D.")} ${e.format("MMMM")} ${e.format("YYYY")}`;
    return `Týden ${week} (${range})`;
  }
  const range = `${s.format("D. MMMM YYYY")} – ${e.format("D. MMMM YYYY")}`;
  return `Týden ${week} (${range})`;
}
