import { telemetryStore } from '../data/seed';
import type { TelemetryEvent } from '../types/index';

export const TelemetryService = {
  getByExercise(exerciseId: string): TelemetryEvent[] {
    return (telemetryStore.get(exerciseId) || []).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  },
};
