// ============================================================
// HAVENSEC ARENA — SHARED TYPES
// ============================================================

// --- Agent System ---

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

export interface AgentAction {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  reasoning: string;
  result: string;
  timestamp: string;
  exerciseId: string;
}

// --- Exercise System ---

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

// --- Scenarios ---

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

// --- Synthetic Environment ---

export interface SyntheticAsset {
  id: string;
  name: string;
  type: 'web' | 'api' | 'database' | 'auth' | 'file' | 'network';
  ip: string;
  services: string[];
  vulnerabilities: string[];
  status: 'normal' | 'anomalous' | 'compromised' | 'contained' | 'recovered';
}

export interface SyntheticUser {
  id: string;
  username: string;
  role: 'employee' | 'admin' | 'service';
  department: string;
}

export interface SyntheticEnvironment {
  id: string;
  name: string;
  organization: string;
  assets: SyntheticAsset[];
  users: SyntheticUser[];
  networkRanges: string[];
  securityControls: string[];
}

// --- Telemetry ---

export type TelemetryEventType =
  | 'HTTP_REQUEST'
  | 'AUTH_FAILURE'
  | 'AUTH_SUCCESS'
  | 'API_ANOMALY'
  | 'PRIVILEGE_CHANGE'
  | 'FILE_ACCESS'
  | 'NETWORK_CONNECTION'
  | 'PROCESS_EVENT'
  | 'ALERT_CREATED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'SCAN_DETECTED'
  | 'DATA_EXFIL_ATTEMPT'
  | 'CONTAINMENT_ACTION'
  | 'RECOVERY_ACTION';

export type TelemetrySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: TelemetryEventType;
  sourceAsset: string;
  destinationAsset?: string;
  actor: string;
  severity: TelemetrySeverity;
  data: Record<string, unknown>;
  correlationId: string;
  exerciseId: string;
  phase: ExercisePhase;
}

// --- Incidents ---

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

// --- Scoring ---

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

// --- Security Coach ---

export interface CoachRecommendation {
  id: string;
  exerciseId: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: RecommendationItem[];
  nextExercise: NextExerciseRecommendation;
  generatedAt: string;
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

// --- Target Modeling (Future) ---

export interface Target {
  id: string;
  name: string;
  url?: string;
  description: string;
  authorizationStatus: 'authorized' | 'pending' | 'unauthorized';
  scope: string[];
  researchStatus: 'not-started' | 'in-progress' | 'completed';
  createdAt: string;
}

export interface TargetProfile {
  targetId: string;
  technologies: string[];
  exposedServices: string[];
  knownVulnerabilities: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  generatedAt: string;
}

// --- AI Provider ---

export interface AIProvider {
  generateScenario(context: GenerateScenarioContext): Promise<Scenario>;
  analyzeTelemetry(events: TelemetryEvent[]): Promise<TelemetryAnalysis>;
  evaluateExercise(exercise: Exercise, events: TelemetryEvent[], incidents: Incident[]): Promise<Score>;
  generateRecommendation(score: Score, history: Score[]): Promise<CoachRecommendation>;
}

export interface GenerateScenarioContext {
  previousScores: Score[];
  weaknesses: string[];
  availableAgents: Agent[];
  environmentAssets: SyntheticAsset[];
}

export interface TelemetryAnalysis {
  anomalies: string[];
  patterns: string[];
  riskLevel: TelemetrySeverity;
  summary: string;
}

// --- Replay ---

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
