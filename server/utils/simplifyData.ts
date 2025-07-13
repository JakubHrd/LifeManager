/**
 * Simplify data structure from database to the one
 * that's easier to work with on the frontend.
 *
 * The data structure from the database is a bit too
 * nested for our needs, so we simplify it a bit.
 *
 * @param data - The data from the database
 * @returns A simplified data structure
 */
export const simplifyData = (
  data: any
): Record<string, Record<string, string>> => {
  const simplified: Record<string, Record<string, string>> = {};
  // Iterate over each day of the week
  for (const [day, entries] of Object.entries(data)) {
    // Create a new empty object for the day
    simplified[day] = {};
    // Iterate over each meal type
    for (const [type, value] of Object.entries(entries as any)) {
      // Set the meal description to the value of the meal
      // or an empty string if the value is undefined
      simplified[day][type] = (value as any).description || "";
    }
  }
  return simplified;
};
