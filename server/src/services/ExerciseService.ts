import { v4 as uuidv4 } from 'uuid';
import type { Exercise, ExerciseConfig, ExerciseDifficulty } from '../types/index';
import {
  exerciseStore,
  SCENARIOS,
  SYNTHETIC_ENVIRONMENT,
  HISTORICAL_EXERCISES,
  getNextExerciseNumber,
} from '../data/seed';
import { runSimulation } from '../simulation/engine';

export const ExerciseService = {
  getAll(): Exercise[] {
    return Array.from(exerciseStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById(id: string): Exercise | undefined {
    return exerciseStore.get(id);
  },

  create(config: Partial<ExerciseConfig> & { mode?: string; scenarioId?: string }): Exercise {
    const scenarioId = config.scenarioId || 'scenario-api-security';
    const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[1];

    const exerciseConfig: ExerciseConfig = {
      scenario: config.scenario || scenario.name,
      attackObjective: config.attackObjective || scenario.expectedOutcome,
      difficulty: (config.difficulty as ExerciseDifficulty) || 'intermediate',
      targetAsset: config.targetAsset || scenario.targetAssets[0],
      techniqueCategory: config.techniqueCategory || scenario.category,
      startingCondition: config.startingCondition || 'Standard synthetic environment conditions',
      redTeamAgents: config.redTeamAgents || ['agent-red-alpha', 'agent-red-beta'],
      blueTeamAgents: config.blueTeamAgents || ['agent-blue-sentinel', 'agent-investigation-analyst', 'agent-response-commander'],
      simulationDuration: config.simulationDuration || 1800,
    };

    const exercise: Exercise = {
      id: `ex-${uuidv4().slice(0, 8)}`,
      number: getNextExerciseNumber() + exerciseStore.size - HISTORICAL_EXERCISES.length,
      scenarioId,
      scenarioName: scenario.name,
      environmentId: SYNTHETIC_ENVIRONMENT.id,
      mode: (config.mode as Exercise['mode']) || 'manual',
      difficulty: exerciseConfig.difficulty,
      status: 'created',
      currentPhase: 'created',
      startedAt: null,
      endedAt: null,
      duration: null,
      score: null,
      createdAt: new Date().toISOString(),
      config: exerciseConfig,
    };

    exerciseStore.set(exercise.id, exercise);
    return exercise;
  },

  start(id: string): Exercise | undefined {
    const exercise = exerciseStore.get(id);
    if (!exercise) return undefined;
    if (exercise.status === 'running') return exercise;

    // Run simulation asynchronously
    runSimulation(id, exercise.scenarioId);
    return exerciseStore.get(id);
  },

  stop(id: string): Exercise | undefined {
    const exercise = exerciseStore.get(id);
    if (!exercise) return undefined;
    exercise.status = 'stopped';
    exercise.endedAt = new Date().toISOString();
    exerciseStore.set(id, exercise);
    return exercise;
  },
};
