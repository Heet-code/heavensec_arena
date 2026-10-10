import { scoreStore } from '../data/seed';
import type { Score } from '../types/index';

export const ScoringService = {
  getByExercise(exerciseId: string): Score | undefined {
    return scoreStore.get(exerciseId);
  },
};
