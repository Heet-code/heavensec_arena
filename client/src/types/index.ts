// Client-side type definitions — mirrors server types
// These are duplicated here for now; in a monorepo with shared packages
// they would live in packages/shared/types

export type AgentType =
  | 'orchestrator'
  | 'research'
  | 'scenario-planner'
  | 'red-team'
  | 'blue-team'
  | 'intelligence'
  | 'referee'
  | 'security-coach';

export type AgentStatus = 'idle' | 'thinking' | 'running' | 'waiting' | 'completed' | 'error';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  status: AgentStatus;
  capabilities: string[];
  currentTask: string | null;
  confidence: number;
  lastAction: string | null;
  lastActionAt: string | null;
}

export type ExerciseMode = 'manual' | 'automatic' | 'adaptive';

export type ExercisePhase =
  | 'created'
  | 'preparing'
  | 'running'
  | 'detecting'
  | 'investigating'
  | 'responding'
  | 'containing'
  | 'evaluating'
  | 'completed';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseStatus = 'created' | 'running' | 'completed' | 'failed' | 'stopped';

export interface ExerciseConfig {
  scenario: string;
  attackObjective: string;
  difficulty: ExerciseDifficulty;
  targetAsset: string;
  techniqueCategory: string;
  startingCondition: string;
  redTeamAgents: string[];
  blueTeamAgents: string[];
  simulationDuration: number;
}

export interface Exercise {
  id: string;
  number: number;
  scenarioId: string;
  scenarioName: string;
  environmentId: string;
  mode: ExerciseMode;
  difficulty: ExerciseDifficulty;
  status: ExerciseStatus;
  currentPhase: ExercisePhase;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  score: Score | null;
  createdAt: string;
  config: ExerciseConfig;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: ExerciseDifficulty;
  techniques: string[];
  targetAssets: string[];
  expectedOutcome: string;
  mitreTactics: string[];
}

export interface SyntheticAsset {
  id: string;
  name: string;
  type: 'web' | 'api' | 'database' | 'auth' | 'file' | 'network';
  ip: string;
  services: string[];
  vulnerabilities: string[];
  status: 'normal' | 'anomalous' | 'compromised' | 'contained' | 'recovered';
}

export interface SyntheticEnvironment {
  id: string;
  name: string;
  organization: string;
  assets: SyntheticAsset[];
  users: { id: string; username: string; role: string; department: string }[];
  networkRanges: string[];
  securityControls: string[];
}

export type TelemetrySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: string;
  sourceAsset: string;
  destinationAsset?: string;
  actor: string;
  severity: TelemetrySeverity;
  data: Record<string, unknown>;
  correlationId: string;
  exerciseId: string;
  phase: ExercisePhase;
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'false-positive';

export interface IncidentTimelineEntry {
  id: string;
  timestamp: string;
  event: string;
  agentId: string;
  agentName: string;
  details: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  source: string;
  sourceAsset: string;
  detectedAt: string;
  resolvedAt: string | null;
  assignedAgent: string;
  evidence: string[];
  timeline: IncidentTimelineEntry[];
  exerciseId: string;
  affectedAssets: string[];
  responseActions: string[];
}

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  details: string;
  weight: number;
}

export interface Score {
  overall: number;
  categories: CategoryScore[];
  exerciseId: string;
  evaluatedAt: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export interface RecommendationItem {
  priority: 'critical' | 'high' | 'medium' | 'low';
  area: string;
  finding: string;
  recommendation: string;
  rationale: string;
}

export interface NextExerciseRecommendation {
  scenarioId: string;
  scenarioName: string;
  difficulty: ExerciseDifficulty;
  focusAreas: string[];
  rationale: string;
}

export interface CoachRecommendation {
  id: string;
  exerciseId: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: RecommendationItem[];
  nextExercise: NextExerciseRecommendation;
  generatedAt: string;
}

export interface ReplayEvent {
  id: string;
  time: number;
  phase: ExercisePhase;
  title: string;
  description: string;
  agentId: string;
  agentName: string;
  agentType: AgentType;
  telemetryIds: string[];
  whatHappened: string;
  whyItHappened: string;
  whatHappenedNext: string;
  severity: TelemetrySeverity;
}

export interface ReplayData {
  exerciseId: string;
  events: ReplayEvent[];
  totalDuration: number;
}
