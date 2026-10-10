import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { Exercise, TelemetryEvent, Incident, Score, CoachRecommendation, Agent } from '../types';
import { api } from '../lib/api';
import { MOCK_AGENTS } from '../data/mockData';
import { LocalSimulationEngine } from '../services/localSimulation';

interface ArenaState {
  activeExercise: Exercise | null;
  exercises: Exercise[];
  telemetry: TelemetryEvent[];
  incidents: Incident[];
  score: Score | null;
  coach: CoachRecommendation | null;
  agents: Agent[];
  loading: boolean;
  error: string | null;
  simulationPolling: boolean;
  paused: boolean;
  apiOnline: boolean | null;
  usingLocalEngine: boolean;
  loadExercises: () => Promise<void>;
  loadExercise: (id: string) => Promise<void>;
  createExercise: (config: Record<string, unknown>) => Promise<Exercise>;
  startExercise: (id: string) => Promise<void>;
  stopExercise: (id: string) => Promise<void>;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  loadAgents: () => Promise<void>;
  pollExercise: (id: string) => void;
  stopPolling: () => void;
  clearError: () => void;
}

const ArenaContext = createContext<ArenaState | null>(null);
const SESSION_KEY = 'haven-active-exercise';

export function ArenaProvider({ children }: { children: React.ReactNode }) {
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [score, setScore] = useState<Score | null>(null);
  const [coach, setCoach] = useState<CoachRecommendation | null>(null);
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationPolling, setSimulationPolling] = useState(false);
  const [paused, setPaused] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [usingLocalEngine, setUsingLocalEngine] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localRef = useRef<LocalSimulationEngine | null>(null);
  const pausedRef = useRef(false);

  const clearError = useCallback(() => setError(null), []);

  const persistId = (id: string | null) => {
    if (id) sessionStorage.setItem(SESSION_KEY, id);
    else sessionStorage.removeItem(SESSION_KEY);
  };

  const loadExercises = useCallback(async () => {
    try {
      const data = (await api.getExercises()) as Exercise[];
      setExercises(data);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    }
  }, []);

  const applyExerciseBundle = useCallback((
    ex: Exercise,
    tel: TelemetryEvent[],
    inc: Incident[],
    agts?: Agent[],
    sc?: Score | null,
    co?: CoachRecommendation | null,
  ) => {
    setActiveExercise(ex);
    setTelemetry(tel);
    setIncidents(inc);
    if (agts) setAgents(agts);
    if (sc !== undefined) setScore(sc);
    if (co !== undefined) setCoach(co);
    persistId(ex.id);
  }, []);

  const loadExercise = useCallback(async (id: string) => {
    try {
      const [ex, tel, inc] = await Promise.all([
        api.getExercise(id) as Promise<Exercise>,
        api.getTelemetry(id) as Promise<TelemetryEvent[]>,
        api.getIncidents(id) as Promise<Incident[]>,
      ]);
      let sc: Score | null = null;
      let co: CoachRecommendation | null = null;
      if (ex.status === 'completed') {
        try {
          [sc, co] = await Promise.all([
            api.getScore(id) as Promise<Score>,
            api.getCoach(id) as Promise<CoachRecommendation>,
          ]);
        } catch { /* not ready */ }
      }
      applyExerciseBundle(ex, tel, inc, undefined, sc, co);
      setApiOnline(true);
    } catch {
      setError('Could not load exercise from API. Start a new lab run to use the local prototype engine.');
      setApiOnline(false);
    }
  }, [applyExerciseBundle]);

  const createExercise = useCallback(async (config: Record<string, unknown>): Promise<Exercise> => {
    setLoading(true);
    setError(null);
    try {
      const ex = (await api.createExercise(config)) as Exercise;
      setExercises((prev) => [ex, ...prev]);
      setActiveExercise(ex);
      setTelemetry([]);
      setIncidents([]);
      setScore(null);
      setCoach(null);
      persistId(ex.id);
      setUsingLocalEngine(false);
      setApiOnline(true);
      return ex;
    } catch {
      setApiOnline(false);
      const local: Exercise = {
        id: `local-${Date.now()}`,
        number: 8,
        scenarioId: String(config.scenarioId || 'scenario-ransomware-controlled'),
        scenarioName: String(config.scenario || 'Controlled Ransomware Simulation'),
        environmentId: 'env-acme-web-platform',
        mode: (config.mode as Exercise['mode']) || 'manual',
        difficulty: (config.difficulty as Exercise['difficulty']) || 'intermediate',
        status: 'created',
        currentPhase: 'created',
        startedAt: null,
        endedAt: null,
        duration: null,
        score: null,
        createdAt: new Date().toISOString(),
        config: {
          scenario: String(config.scenario || 'Controlled Ransomware Simulation'),
          attackObjective: 'Complete simulated kill chain in the isolated range',
          difficulty: (config.difficulty as Exercise['difficulty']) || 'intermediate',
          targetAsset: String(config.targetAsset || 'FILE-01'),
          techniqueCategory: String(config.techniqueCategory || 'Ransomware'),
          startingCondition: 'Isolated synthetic environment',
          redTeamAgents: ['agent-red-alpha', 'agent-red-beta'],
          blueTeamAgents: ['agent-blue-sentinel', 'agent-investigation-analyst', 'agent-response-commander'],
          simulationDuration: Number(config.simulationDuration) || 1800,
        },
      };
      setExercises((prev) => [local, ...prev]);
      setActiveExercise(local);
      setTelemetry([]);
      setIncidents([]);
      setScore(null);
      setCoach(null);
      persistId(local.id);
      setUsingLocalEngine(true);
      return local;
    } finally {
      setLoading(false);
    }
  }, []);

  const startLocal = useCallback((ex: Exercise) => {
    localRef.current?.stop();
    const engine = new LocalSimulationEngine(ex);
    localRef.current = engine;
    setUsingLocalEngine(true);
    engine.subscribe((s) => {
      setActiveExercise(s.exercise);
      setTelemetry(s.telemetry);
      setIncidents(s.incidents);
      setAgents(s.agents);
      setScore(s.score);
      setCoach(s.coach);
    });
    engine.start();
    setSimulationPolling(true);
  }, []);

  const startExercise = useCallback(async (id: string) => {
    setPaused(false);
    pausedRef.current = false;
    if (id.startsWith('local-') || usingLocalEngine) {
      const ex = activeExercise;
      if (ex) startLocal(ex);
      return;
    }
    try {
      const ex = (await api.startExercise(id)) as Exercise;
      setActiveExercise(ex);
      setApiOnline(true);
      setUsingLocalEngine(false);
    } catch {
      setApiOnline(false);
      if (activeExercise) startLocal(activeExercise);
    }
  }, [activeExercise, startLocal, usingLocalEngine]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setSimulationPolling(false);
  }, []);

  const stopExercise = useCallback(async (id: string) => {
    stopPolling();
    localRef.current?.stop();
    setPaused(false);
    pausedRef.current = false;
    if (id.startsWith('local-')) {
      setActiveExercise((prev) => prev ? { ...prev, status: 'stopped', endedAt: new Date().toISOString() } : prev);
      return;
    }
    try {
      const ex = (await api.stopExercise(id)) as Exercise;
      setActiveExercise(ex);
    } catch {
      setActiveExercise((prev) => prev ? { ...prev, status: 'stopped', endedAt: new Date().toISOString() } : prev);
    }
  }, [stopPolling]);

  const pauseSimulation = useCallback(() => {
    pausedRef.current = true;
    setPaused(true);
    localRef.current?.pause();
  }, []);

  const resumeSimulation = useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
    localRef.current?.resume();
  }, []);

  const resetSimulation = useCallback(() => {
    stopPolling();
    localRef.current?.stop();
    localRef.current = null;
    setPaused(false);
    pausedRef.current = false;
    setActiveExercise(null);
    setTelemetry([]);
    setIncidents([]);
    setScore(null);
    setCoach(null);
    setAgents(MOCK_AGENTS);
    setUsingLocalEngine(false);
    persistId(null);
  }, [stopPolling]);

  const loadAgents = useCallback(async () => {
    try {
      const data = (await api.getAgents()) as Agent[];
      setAgents(data);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    }
  }, []);

  const pollExercise = useCallback((id: string) => {
    if (id.startsWith('local-')) {
      setSimulationPolling(true);
      return;
    }
    if (pollRef.current) clearInterval(pollRef.current);
    setSimulationPolling(true);
    const interval = setInterval(async () => {
      if (pausedRef.current) return;
      try {
        const [ex, tel, inc, agts] = await Promise.all([
          api.getExercise(id) as Promise<Exercise>,
          api.getTelemetry(id) as Promise<TelemetryEvent[]>,
          api.getIncidents(id) as Promise<Incident[]>,
          api.getAgents() as Promise<Agent[]>,
        ]);
        setActiveExercise(ex);
        setTelemetry(tel);
        setIncidents(inc);
        setAgents(agts);
        if (ex.status === 'completed') {
          try {
            const [sc, co] = await Promise.all([
              api.getScore(id) as Promise<Score>,
              api.getCoach(id) as Promise<CoachRecommendation>,
            ]);
            setScore(sc);
            setCoach(co);
          } catch { /* pending */ }
          clearInterval(interval);
          pollRef.current = null;
          setSimulationPolling(false);
        }
        if (ex.status === 'stopped' || ex.status === 'failed') {
          clearInterval(interval);
          pollRef.current = null;
          setSimulationPolling(false);
        }
      } catch {
        /* silent poll */
      }
    }, 1500);
    pollRef.current = interval;
  }, []);

  useEffect(() => {
    loadExercises();
    loadAgents();
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved && !saved.startsWith('local-')) {
      loadExercise(saved);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      localRef.current?.stop();
    };
  }, [loadExercises, loadAgents, loadExercise]);

  const value: ArenaState = {
    activeExercise,
    exercises,
    telemetry,
    incidents,
    score,
    coach,
    agents,
    loading,
    error,
    simulationPolling,
    paused,
    apiOnline,
    usingLocalEngine,
    loadExercises,
    loadExercise,
    createExercise,
    startExercise,
    stopExercise,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    loadAgents,
    pollExercise,
    stopPolling,
    clearError,
  };

  return <ArenaContext.Provider value={value}>{children}</ArenaContext.Provider>;
}

export function useArena(): ArenaState {
  const ctx = useContext(ArenaContext);
  if (!ctx) throw new Error('useArena must be used within ArenaProvider');
  return ctx;
}
