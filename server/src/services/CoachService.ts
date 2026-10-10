import { coachStore } from '../data/seed';
import type { CoachRecommendation } from '../types/index';

export const CoachService = {
  getByExercise(exerciseId: string): CoachRecommendation | undefined {
    return coachStore.get(exerciseId);
  },
};
