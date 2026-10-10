import type {
  Agent,
  CoachRecommendation,
  Exercise,
  ExercisePhase,
  Incident,
  Score,
  TelemetryEvent,
  TelemetrySeverity,
} from '../types';
import { MOCK_AGENTS } from '../data/mockData';

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface LocalSimulationState {
  exercise: Exercise;
  telemetry: TelemetryEvent[];
  incidents: Incident[];
  agents: Agent[];
  score: Score | null;
  coach: CoachRecommendation | null;
}

type Listener = (state: LocalSimulationState) => void;

const PHASE_ORDER: ExercisePhase[] = [
  'preparing',
  'running',
  'detecting',
  'investigating',
  'responding',
  'containing',
  'evaluating',
  'completed',
];

export class LocalSimulationEngine {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private paused = false;
  private stopped = false;
  private listeners = new Set<Listener>();
  private state: LocalSimulationState;

  constructor(exercise: Exercise) {
    this.state = {
      exercise: { ...exercise, status: 'running', currentPhase: 'preparing', startedAt: new Date().toISOString() },
      telemetry: [],
      incidents: [],
      agents: MOCK_AGENTS.map((a) => ({ ...a })),
      score: null,
      coach: null,
    };
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  stop() {
    this.stopped = true;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.patchExercise({ status: 'stopped', endedAt: new Date().toISOString() });
  }

  start() {
    this.schedule(0, () => this.setPhase('preparing'));
    this.schedule(2000, () => {
      this.setPhase('running');
      this.setAgent('agent-red-alpha', 'running', 'Reconnaissance simulation on WEB-01');
      this.setAgent('agent-orchestrator', 'running', 'Monitoring isolated range');
      this.pushTel('HTTP_REQUEST', 'WEB-01', '10.0.0.1', 'info', 'running', { path: '/robots.txt' });
      this.pushTel('SCAN_DETECTED', 'WEB-01', '10.0.0.1', 'medium', 'running', { scanType: 'directory-enumeration' });
    });
    this.schedule(6000, () => {
      this.setPhase('detecting');
      this.setAgent('agent-red-alpha', 'running', 'Authentication anomaly simulation');
      this.setAgent('agent-blue-sentinel', 'running', 'Monitoring AUTH-01 telemetry');
      this.pushTel('LOGIN_FAILED', 'AUTH-01', 'employee_002', 'high', 'detecting', { attemptNumber: 3 });
      this.pushTel('LOGIN_SUCCESS', 'AUTH-01', 'employee_002', 'high', 'detecting', { suspicious: true });
    });
    this.schedule(8500, () => {
      this.setAgent('agent-blue-sentinel', 'running', 'Brute-force pattern detected');
      this.pushTel('ALERT_CREATED', 'AUTH-01', 'agent-blue-sentinel', 'high', 'detecting', { confidence: 94 });
    });
    this.schedule(10000, () => {
      this.setAgent('agent-red-beta', 'running', 'Simulated impact telemetry on API-01 / FILE-01');
      this.pushTel('API_ANOMALY', 'API-01', 'employee_002', 'high', 'detecting', { anomalyScore: 0.94 });
      this.pushTel('DATA_EXFIL_ATTEMPT', 'FILE-01', 'employee_002', 'critical', 'detecting', { note: 'synthetic encryption-intent marker' });
    });
    this.schedule(12000, () => {
      this.setPhase('investigating');
      this.setAgent('agent-investigation-analyst', 'running', 'Correlating AUTH-01 and API-01');
      const incident = this.makeIncident();
      this.state.incidents = [incident];
      this.emit();
    });
    this.schedule(18000, () => {
      this.setPhase('responding');
      this.setAgent('agent-response-commander', 'running', 'Account lockout and session revocation');
      this.pushTel('PRIVILEGE_CHANGE', 'AUTH-01', 'agent-response-commander', 'high', 'responding', { action: 'lockout' });
      this.updateIncident('investigating', ['Account employee_002 locked']);
    });
    this.schedule(21000, () => {
      this.setPhase('containing');
      this.setAgent('agent-response-commander', 'running', 'Rate limit, IP block, MFA policy');
      this.pushTel('CONTAINMENT_ACTION', 'API-01', 'agent-response-commander', 'high', 'containing', { action: 'rate_limit' });
      this.updateIncident('contained', ['Rate limiting applied', 'Source IP blocked']);
    });
    this.schedule(24000, () => {
      this.setPhase('evaluating');
      this.setAgent('agent-referee', 'running', 'Scoring detection, containment, recovery');
    });
    this.schedule(27000, () => {
      this.state.score = this.makeScore();
      this.setAgent('agent-referee', 'completed', `Overall ${this.state.score.overall}/100 (prototype metric)`);
      this.patchExercise({ score: this.state.score });
    });
    this.schedule(30000, () => {
      this.setPhase('completed');
      this.patchExercise({ status: 'completed', endedAt: new Date().toISOString(), duration: 30 });
      this.state.coach = this.makeCoach();
      this.setAgent('agent-security-coach', 'completed', 'Improvement recommendations ready');
      this.setAgent('agent-orchestrator', 'completed', 'Exercise complete');
    });
  }

  private schedule(ms: number, fn: () => void) {
    const t = setTimeout(() => {
      if (this.stopped) return;
      if (this.paused) {
        this.schedule(400, fn);
        return;
      }
      fn();
    }, ms);
    this.timers.push(t);
  }

  private emit() {
    this.listeners.forEach((l) => l(this.state));
  }

  private patchExercise(partial: Partial<Exercise>) {
    this.state.exercise = { ...this.state.exercise, ...partial };
    this.emit();
  }

  private setPhase(phase: ExercisePhase) {
    this.patchExercise({ currentPhase: phase, status: phase === 'completed' ? 'completed' : 'running' });
  }

  private setAgent(id: string, status: Agent['status'], task: string) {
    this.state.agents = this.state.agents.map((a) =>
      a.id === id
        ? { ...a, status, currentTask: task, lastAction: task, lastActionAt: new Date().toISOString() }
        : a
    );
    this.emit();
  }

  private pushTel(
    type: TelemetryEvent['type'] | string,
    sourceAsset: string,
    actor: string,
    severity: TelemetrySeverity,
    phase: ExercisePhase,
    data: Record<string, unknown>
  ) {
    const event: TelemetryEvent = {
      id: uid('tel'),
      timestamp: new Date().toISOString(),
      type: type as TelemetryEvent['type'],
      sourceAsset,
      actor,
      severity,
      data,
      correlationId: uid('cor'),
      exerciseId: this.state.exercise.id,
      phase,
    };
    this.state.telemetry = [...this.state.telemetry, event];
    this.emit();
  }

  private makeIncident(): Incident {
    const t = new Date().toISOString();
    return {
      id: uid('inc'),
      title: 'Simulated impact following authentication compromise',
      description:
        'Synthetic exercise: brute-force telemetry on AUTH-01 was followed by anomalous API/file activity. No real data left the lab.',
      severity: 'critical',
      status: 'investigating',
      source: 'Monitoring + Detection agents',
      sourceAsset: 'AUTH-01',
      detectedAt: t,
      resolvedAt: null,
      assignedAgent: 'agent-investigation-analyst',
      evidence: [
        'Repeated failed logins from synthetic source 10.0.0.1',
        'Suspicious successful login for employee_002',
        'API/file access volume above lab baseline',
      ],
      timeline: [
        { id: uid('tl'), timestamp: t, event: 'Incident opened', agentId: 'agent-investigation-analyst', agentName: 'Investigation Analyst', details: 'Correlated auth and impact telemetry' },
      ],
      exerciseId: this.state.exercise.id,
      affectedAssets: ['AUTH-01', 'API-01', 'FILE-01'],
      responseActions: [],
    };
  }

  private updateIncident(status: Incident['status'], actions: string[]) {
    this.state.incidents = this.state.incidents.map((inc, i) =>
      i === 0
        ? {
            ...inc,
            status,
            resolvedAt: status === 'contained' ? new Date().toISOString() : inc.resolvedAt,
            responseActions: [...inc.responseActions, ...actions],
          }
        : inc
    );
    this.emit();
  }

  private makeScore(): Score {
    return {
      overall: 78,
      categories: [
        { category: 'Detection', score: 91, maxScore: 100, details: 'Anomaly flagged quickly in the synthetic stream', weight: 0.25 },
        { category: 'Investigation', score: 84, maxScore: 100, details: 'Auth and impact events were correlated', weight: 0.20 },
        { category: 'Response', score: 72, maxScore: 100, details: 'Playbook ran with some delay', weight: 0.20 },
        { category: 'Containment', score: 61, maxScore: 100, details: 'Containment lagged the detection target', weight: 0.20 },
        { category: 'Recovery', score: 78, maxScore: 100, details: 'Lab restored with updated controls', weight: 0.15 },
      ],
      exerciseId: this.state.exercise.id,
      evaluatedAt: new Date().toISOString(),
      summary: 'Prototype academic score: detection was strong; containment is the primary improvement area. Not a validated scientific metric.',
      strengths: ['Detection speed', 'Event correlation'],
      weaknesses: ['Containment latency'],
    };
  }

  private makeCoach(): CoachRecommendation {
    return {
      id: uid('coach'),
      exerciseId: this.state.exercise.id,
      strengths: ['Authentication anomaly detection', 'Incident identification'],
      weaknesses: ['Containment time vs. target'],
      recommendations: [
        {
          priority: 'critical',
          area: 'Containment',
          finding: 'Containment lagged detection in this synthetic run',
          recommendation: 'Practice pre-authorized rate-limiting playbooks in the next lab',
          rationale: 'Reduces simulated exposure window in the range.',
        },
      ],
      nextExercise: {
        scenarioId: 'scenario-api-security',
        scenarioName: 'API Security Detection',
        difficulty: 'intermediate',
        focusAreas: ['Containment Automation'],
        rationale: 'Lowest category in the prototype score was containment.',
      },
      generatedAt: new Date().toISOString(),
    };
  }
}

export { PHASE_ORDER };
