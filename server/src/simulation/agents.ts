import { v4 as uuidv4 } from 'uuid';
import type { TelemetryEvent, Incident, ExercisePhase, TelemetrySeverity } from '../types/index';

export function makeTelemetry(
  exerciseId: string,
  timestamp: string,
  type: TelemetryEvent['type'],
  sourceAsset: string,
  actor: string,
  severity: TelemetrySeverity,
  phase: ExercisePhase,
  data: Record<string, unknown>
): TelemetryEvent {
  return {
    id: `tel-${uuidv4().slice(0, 8)}`,
    timestamp,
    type,
    sourceAsset,
    actor,
    severity,
    data,
    correlationId: uuidv4(),
    exerciseId,
    phase,
  };
}

export class RedTeamAgent {
  private step = 0;

  tick(currentTime: number, exerciseId: string, phase: ExercisePhase, ts: (ms: number) => string): TelemetryEvent[] {
    const events: TelemetryEvent[] = [];
    
    // Simulate Reconnaissance at step 0 (Time 2s)
    if (this.step === 0 && currentTime >= 2000) {
      events.push(makeTelemetry(exerciseId, ts(2000), 'HTTP_REQUEST', 'WEB-01', '10.0.0.1', 'info', phase, { method: 'GET', path: '/robots.txt', responseCode: 200 }));
      events.push(makeTelemetry(exerciseId, ts(2500), 'HTTP_REQUEST', 'WEB-01', '10.0.0.1', 'low', phase, { method: 'GET', path: '/.env', responseCode: 404 }));
      events.push(makeTelemetry(exerciseId, ts(3000), 'HTTP_REQUEST', 'WEB-01', '10.0.0.1', 'low', phase, { method: 'GET', path: '/admin', responseCode: 403 }));
      this.step++;
    }
    // Simulate Auth Anomaly at step 1 (Time 6s)
    else if (this.step === 1 && currentTime >= 6000) {
      events.push(makeTelemetry(exerciseId, ts(6000), 'LOGIN_FAILED', 'AUTH-01', 'employee_002', 'medium', phase, { ip: '10.0.0.1', reason: 'invalid_password', attemptNumber: 1 }));
      events.push(makeTelemetry(exerciseId, ts(6500), 'LOGIN_FAILED', 'AUTH-01', 'employee_002', 'medium', phase, { ip: '10.0.0.1', reason: 'invalid_password', attemptNumber: 2 }));
      events.push(makeTelemetry(exerciseId, ts(7000), 'LOGIN_FAILED', 'AUTH-01', 'employee_002', 'high', phase, { ip: '10.0.0.1', reason: 'invalid_password', attemptNumber: 3 }));
      events.push(makeTelemetry(exerciseId, ts(7500), 'AUTH_FAILURE', 'AUTH-01', 'employee_002', 'high', phase, { ip: '10.0.0.1', reason: 'brute_force_threshold_exceeded', lockout: false }));
      events.push(makeTelemetry(exerciseId, ts(8000), 'LOGIN_SUCCESS', 'AUTH-01', 'employee_002', 'high', phase, { ip: '10.0.0.1', reason: 'correct_credentials', suspicious: true }));
      this.step++;
    }
    // Simulate API Anomaly at step 2 (Time 10s)
    else if (this.step === 2 && currentTime >= 10000) {
      events.push(makeTelemetry(exerciseId, ts(10000), 'API_ANOMALY', 'API-01', 'employee_002', 'high', phase, { endpoint: '/api/v1/users', requestRate: 120, anomalyScore: 0.94 }));
      events.push(makeTelemetry(exerciseId, ts(10500), 'API_ANOMALY', 'API-01', 'employee_002', 'high', phase, { endpoint: '/api/v1/reports', requestRate: 85, anomalyScore: 0.91 }));
      events.push(makeTelemetry(exerciseId, ts(11000), 'DATA_EXFIL_ATTEMPT', 'API-01', 'employee_002', 'critical', phase, { recordsAccessed: 2847, dataSize: '4.2MB', destination: '10.0.0.1' }));
      this.step++;
    }

    return events;
  }
}

export class BlueTeamSentinel {
  private loginFailures = 0;
  private hasAlertedBruteForce = false;
  
  analyze(events: TelemetryEvent[], exerciseId: string, phase: ExercisePhase, ts: (ms: number) => string): TelemetryEvent[] {
    const newEvents: TelemetryEvent[] = [];
    for (const evt of events) {
      if (evt.type === 'LOGIN_FAILED') {
        this.loginFailures++;
      }
      if (this.loginFailures >= 3 && !this.hasAlertedBruteForce) {
        this.hasAlertedBruteForce = true;
        newEvents.push(makeTelemetry(exerciseId, ts(0), 'ALERT_CREATED', 'AUTH-01', 'agent-blue-sentinel', 'high', phase, { alertType: 'brute_force_detection', confidence: 94 }));
      }
    }
    return newEvents;
  }
}

export class InvestigationAnalyst {
  private seenAlerts = 0;
  private seenApiAnomaly = false;
  private incidentCreated = false;

  analyze(events: TelemetryEvent[], exerciseId: string, phase: ExercisePhase, ts: (ms: number) => string): { incidents: Incident[], telemetry: TelemetryEvent[] } {
    const newIncidents: Incident[] = [];
    const newTelemetry: TelemetryEvent[] = [];

    for (const evt of events) {
      if (evt.type === 'ALERT_CREATED') this.seenAlerts++;
      if (evt.type === 'API_ANOMALY') this.seenApiAnomaly = true;
    }

    if (this.seenAlerts > 0 && this.seenApiAnomaly && !this.incidentCreated) {
      this.incidentCreated = true;
      const incident: Incident = {
        id: `inc-${uuidv4().slice(0, 8)}`,
        title: 'API Data Exfiltration Following Authentication Compromise',
        description: 'Correlated attack chain.',
        severity: 'critical',
        status: 'investigating',
        source: 'Investigation Analyst',
        sourceAsset: 'AUTH-01',
        detectedAt: ts(0),
        resolvedAt: null,
        assignedAgent: 'agent-investigation-analyst',
        evidence: ['Correlated auth and API abuse'],
        timeline: [],
        exerciseId,
        affectedAssets: ['AUTH-01', 'API-01'],
        responseActions: [],
      };
      newIncidents.push(incident);
      newTelemetry.push(makeTelemetry(exerciseId, ts(0), 'ALERT_CREATED', 'API-01', 'agent-investigation-analyst', 'critical', phase, { alertType: 'incident_created', incidentId: incident.id }));
    }

    return { incidents: newIncidents, telemetry: newTelemetry };
  }
}

export class ResponseCommander {
  private responded = false;
  private contained = false;

  analyze(incidents: Incident[], exerciseId: string, phase: ExercisePhase, ts: (ms: number) => string): { telemetry: TelemetryEvent[], updatedIncidents: Incident[] } {
    const newTelemetry: TelemetryEvent[] = [];
    const updatedIncidents: Incident[] = [];

    for (const inc of incidents) {
      if (inc.status === 'investigating' && !this.responded && phase === 'responding') {
        this.responded = true;
        inc.responseActions.push('Account employee_002 locked out');
        newTelemetry.push(makeTelemetry(exerciseId, ts(0), 'PRIVILEGE_CHANGE', 'AUTH-01', 'agent-response-commander', 'high', phase, { action: 'revoke_session_tokens' }));
        updatedIncidents.push(inc);
      } else if (inc.status === 'investigating' && this.responded && !this.contained && phase === 'containing') {
        this.contained = true;
        inc.status = 'contained';
        inc.resolvedAt = ts(0);
        inc.responseActions.push('Rate limiting applied');
        newTelemetry.push(makeTelemetry(exerciseId, ts(0), 'CONTAINMENT_ACTION', 'API-01', 'agent-response-commander', 'high', phase, { action: 'rate_limit_applied' }));
        updatedIncidents.push(inc);
      }
    }

    return { telemetry: newTelemetry, updatedIncidents };
  }
}
