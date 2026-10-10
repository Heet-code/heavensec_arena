import { v4 as uuidv4 } from 'uuid';
import type { TelemetryEvent, Incident, Score, CoachRecommendation, ReplayData, Exercise, ExercisePhase, IncidentTimelineEntry } from '../types/index';
import { exerciseStore, telemetryStore, incidentStore, scoreStore, coachStore, replayStore, agentStore } from '../data/seed';
import { RedTeamAgent, BlueTeamSentinel, InvestigationAnalyst, ResponseCommander, makeTelemetry } from './agents';

export function runSimulation(exerciseId: string, scenarioId: string): void {
  const exercise = exerciseStore.get(exerciseId);
  if (!exercise) return;

  const now = Date.now();
  const ts = (ms: number) => new Date(now + ms).toISOString();
  
  exercise.status = 'running';
  exercise.currentPhase = 'preparing';
  exercise.startedAt = ts(0);
  exerciseStore.set(exerciseId, exercise);

  const redTeam = new RedTeamAgent();
  const sentinel = new BlueTeamSentinel();
  const analyst = new InvestigationAnalyst();
  const commander = new ResponseCommander();

  let phaseTime = 0;
  
  const interval = setInterval(() => {
    const ex = exerciseStore.get(exerciseId);
    if (!ex || ex.status !== 'running') {
      clearInterval(interval);
      return;
    }

    const t = (msOffset: number) => new Date(Date.now() + msOffset).toISOString();
    
    // Manage phases
    if (phaseTime === 0) ex.currentPhase = 'preparing';
    else if (phaseTime === 2) ex.currentPhase = 'running';
    else if (phaseTime === 6) ex.currentPhase = 'detecting';
    else if (phaseTime === 12) ex.currentPhase = 'investigating';
    else if (phaseTime === 18) ex.currentPhase = 'responding';
    else if (phaseTime === 21) ex.currentPhase = 'containing';
    else if (phaseTime === 24) ex.currentPhase = 'evaluating';
    else if (phaseTime === 30) ex.currentPhase = 'completed';
    
    exerciseStore.set(exerciseId, ex);

    const newTelemetry: TelemetryEvent[] = [];
    const newIncidents: Incident[] = [];

    // Red Team Action
    const redEvents = redTeam.tick(phaseTime * 1000, exerciseId, ex.currentPhase, t);
    newTelemetry.push(...redEvents);

    // Blue Team Sentinel Action
    const sentinelEvents = sentinel.analyze(redEvents, exerciseId, ex.currentPhase, t);
    newTelemetry.push(...sentinelEvents);

    // Investigation Analyst Action
    const analystOutput = analyst.analyze([...redEvents, ...sentinelEvents], exerciseId, ex.currentPhase, t);
    newTelemetry.push(...analystOutput.telemetry);
    newIncidents.push(...analystOutput.incidents);

    // Response Commander Action
    const existingIncidents = incidentStore.get(exerciseId) || [];
    const activeIncidents = [...existingIncidents, ...newIncidents];
    const commanderOutput = commander.analyze(activeIncidents, exerciseId, ex.currentPhase, t);
    newTelemetry.push(...commanderOutput.telemetry);

    // Persist
    if (newTelemetry.length > 0) {
      const allTels = telemetryStore.get(exerciseId) || [];
      telemetryStore.set(exerciseId, [...allTels, ...newTelemetry]);
    }
    
    // Merge updated incidents and new incidents
    const finalIncidents = new Map<string, Incident>();
    for (const inc of activeIncidents) finalIncidents.set(inc.id, inc);
    for (const inc of commanderOutput.updatedIncidents) finalIncidents.set(inc.id, inc);
    
    if (finalIncidents.size > 0) {
      incidentStore.set(exerciseId, Array.from(finalIncidents.values()));
    }

    // Evaluating / Completion
    if (phaseTime === 27 && !scoreStore.has(exerciseId)) {
      const score: Score = {
        overall: 78,
        categories: [
          { category: 'Detection', score: 91, maxScore: 100, details: 'API anomaly detected', weight: 0.25 },
          { category: 'Investigation', score: 84, maxScore: 100, details: 'Attack chain correlated', weight: 0.20 },
          { category: 'Response', score: 72, maxScore: 100, details: 'Response playbook executed', weight: 0.20 },
          { category: 'Containment', score: 61, maxScore: 100, details: 'Endpoint isolated late', weight: 0.20 },
          { category: 'Recovery', score: 78, maxScore: 100, details: 'Environment restored', weight: 0.15 },
        ],
        exerciseId,
        evaluatedAt: t(0),
        summary: 'Detection performance was excellent.',
        strengths: ['API anomaly detection speed'],
        weaknesses: ['Containment response time'],
      };
      scoreStore.set(exerciseId, score);
      ex.score = score;
      exerciseStore.set(exerciseId, ex);
      telemetryStore.set(exerciseId, [...(telemetryStore.get(exerciseId) || []), makeTelemetry(exerciseId, t(0), 'ALERT_CREATED', 'agent-referee', 'agent-referee', 'info', 'evaluating', { action: 'score_generated' })]);
    }

    if (phaseTime === 30) {
      ex.status = 'completed';
      ex.endedAt = t(0);
      ex.duration = 30;
      exerciseStore.set(exerciseId, ex);
      
      const score = scoreStore.get(exerciseId);
      if (score) {
        const coach: CoachRecommendation = {
          id: `coach-${uuidv4().slice(0, 8)}`,
          exerciseId,
          strengths: ['Anomaly detection'],
          weaknesses: ['Containment latency'],
          recommendations: [{ priority: 'critical', area: 'Containment', finding: 'Late', recommendation: 'Automate', rationale: 'Reduces window' }],
          nextExercise: { scenarioId: 'scenario-api-security', scenarioName: 'API Security Containment', difficulty: 'intermediate', focusAreas: ['Containment'], rationale: 'Improve score' },
          generatedAt: t(0),
        };
        coachStore.set(exerciseId, coach);
      }
      clearInterval(interval);
    }

    phaseTime++;
  }, 1000);
}
