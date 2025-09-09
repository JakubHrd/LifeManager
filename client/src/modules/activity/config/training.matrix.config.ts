import { ActivityMatrixConfig, Matrix } from '../types';
import serverUrl from '../../../config';

export type TrainingCell = { description: string; done: boolean };

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const cols = [
  { key: 'morning', label: 'Ráno' },
  { key: 'main',    label: 'Hlavní' },
  { key: 'evening', label: 'Večer' },
];

const trainingConfig: ActivityMatrixConfig<TrainingCell> = {
  domain: 'training',
  title: 'Trénink',
  api: {
    basePath: `${serverUrl}/api/trainings`,
    transformIn: (raw: any) => {
      const src = (raw?.trainings ?? {}) as Record<string, Record<string, any>>;
      const matrix: Matrix<TrainingCell> = {};
      for (const d of days) {
        const dsrc = src[d] ?? {};
        matrix[d] = {
          morning: { description: String(dsrc.morning?.description ?? ''), done: !!dsrc.morning?.done },
          main:    { description: String(dsrc.main?.description ?? ''),    done: !!dsrc.main?.done },
          evening: { description: String(dsrc.evening?.description ?? ''), done: !!dsrc.evening?.done },
        };
      }
      return { matrix };
    },
    transformOut: (m: Matrix<TrainingCell>) => {
      const trainings: any = {};
      for (const d of days) {
        const row = m[d] ?? {};
        trainings[d] = {
          morning: { description: row.morning?.description ?? '', done: !!row.morning?.done },
          main:    { description: row.main?.description ?? '',    done: !!row.main?.done },
          evening: { description: row.evening?.description ?? '', done: !!row.evening?.done },
        };
      }
      return { trainings };
    }
  },
  ui: {
    rows: days,
    cols,
    cell: {
      textKey: 'description',
      booleanKey: 'done',
      empty: () => ({ description: '', done: false })
    },
    labels: { rowHeader: 'Day' }
  }
};

export default trainingConfig;
