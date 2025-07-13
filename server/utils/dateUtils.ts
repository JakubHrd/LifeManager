export const getCurrentWeekAndYear = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const week = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  return { week, year: now.getFullYear() };
};
