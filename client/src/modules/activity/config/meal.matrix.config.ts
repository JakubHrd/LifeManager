import { ActivityMatrixConfig, Matrix } from '../types';
import serverUrl from '../../../config';

// Buňka pro meals: { description, eaten }
export type MealCell = { description: string; eaten: boolean };

// Dny + sloupce
const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const cols = [
  { key: 'breakfast', label: 'Snídaně' },
  { key: 'snack',     label: 'Svačina' },
  { key: 'lunch',     label: 'Oběd' },           // POZOR: BE někdy posílá "launch"
  { key: 'snack2',    label: 'Svačina odpoledne' },
  { key: 'dinner',    label: 'Večeře' },
];

type LunchKey = 'lunch' | 'launch';

function emptyCell(): MealCell {
  return { description: '', eaten: false };
}

const mealConfig: ActivityMatrixConfig<MealCell> = {
  domain: 'meals',
  title: 'Meals',
  api: {
    basePath: `${serverUrl}/api/meals`,

    // raw = { meals: { Monday: { breakfast: {...}, launch: {...} ...}, ... } }
    transformIn: (raw: any) => {
      const src = raw?.meals ?? {};
      const matrix: Matrix<MealCell> = {};
      const lunchKeyByDay: Record<string, LunchKey> = {};

      for (const day of days) {
        const dsrc = src?.[day] ?? {};
        const hasLaunch = Object.prototype.hasOwnProperty.call(dsrc, 'launch');
        const hasLunch  = Object.prototype.hasOwnProperty.call(dsrc, 'lunch');
        const lk: LunchKey = hasLaunch && !hasLunch ? 'launch' : 'lunch';
        lunchKeyByDay[day] = lk;

        matrix[day] = {
          breakfast: toCell(dsrc['breakfast']),
          snack:     toCell(dsrc['snack']),
          lunch:     toCell(dsrc[lk]),  // sjednoceno do "lunch"
          snack2:    toCell(dsrc['snack2']),
          dinner:    toCell(dsrc['dinner']),
        };
      }

      return { matrix, meta: { lunchKeyByDay } };

      function toCell(x: any): MealCell {
        return {
          description: String(x?.description ?? ''),
          eaten: !!x?.eaten
        };
      }
    },

    // zpět: { meals: { Monday: { breakfast: {...}, launch|lunch: {...}, ... } } }
    transformOut: (matrix, meta) => {
      const out: any = { meals: {} };
      const lunchKeyByDay: Record<string, LunchKey> = meta?.lunchKeyByDay ?? {};

      for (const day of days) {
        const row = matrix[day] ?? {};
        const lk: LunchKey = lunchKeyByDay[day] || 'lunch';
        const dayObj: any = {
          breakfast: fromCell(row['breakfast']),
          snack:     fromCell(row['snack']),
          snack2:    fromCell(row['snack2']),
          dinner:    fromCell(row['dinner']),
        };
        dayObj[lk] = fromCell(row['lunch']); // ulož pod původní klíč (launch|lunch)
        out.meals[day] = dayObj;
      }
      return out;

      function fromCell(c: any) {
        return { description: String(c?.description ?? ''), eaten: !!c?.eaten };
      }
    }
  },

  ui: {
    rows: days,
    cols,
    cell: {
      textKey: 'description',
      booleanKey: 'eaten',
      empty: emptyCell
    },
    labels: { rowHeader: 'Day' }
  }
};

export default mealConfig;
