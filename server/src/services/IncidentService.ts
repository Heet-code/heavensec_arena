import { incidentStore } from '../data/seed';
import type { Incident } from '../types/index';

export const IncidentService = {
  getByExercise(exerciseId: string): Incident[] {
    return incidentStore.get(exerciseId) || [];
  },

  getById(id: string): Incident | undefined {
    for (const incidents of incidentStore.values()) {
      const found = incidents.find((i) => i.id === id);
      if (found) return found;
    }
    return undefined;
  },
};
