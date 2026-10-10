import { SCENARIOS, SYNTHETIC_ENVIRONMENT } from '../data/seed';
import type { Scenario, SyntheticEnvironment } from '../types/index';

export const ScenarioService = {
  getAll(): Scenario[] {
    return SCENARIOS;
  },

  getById(id: string): Scenario | undefined {
    return SCENARIOS.find((s) => s.id === id);
  },

  getEnvironment(): SyntheticEnvironment {
    return SYNTHETIC_ENVIRONMENT;
  },
};
