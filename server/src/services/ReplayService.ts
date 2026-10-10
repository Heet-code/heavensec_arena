import { replayStore } from '../data/seed';
import type { ReplayData } from '../types/index';

export const ReplayService = {
  getByExercise(exerciseId: string): ReplayData | undefined {
    return replayStore.get(exerciseId);
  },
};
