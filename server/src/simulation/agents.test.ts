import { describe, it, expect, vi } from 'vitest';
import { RedTeamAgent, BlueTeamSentinel, InvestigationAnalyst, ResponseCommander } from './agents';
import type { TelemetryEvent, Incident } from '../types/index';

describe('Agent Components', () => {
  const mockTs = () => new Date().toISOString();

  it('RedTeamAgent generates events based on time', () => {
    const agent = new RedTeamAgent();
    // Step 0 at time 2000
    const events = agent.tick(2000, 'ex-1', 'running', mockTs);
    expect(events.length).toBe(3);
    expect(events[0].type).toBe('HTTP_REQUEST');

    // Doesn't generate again for the same step
    const events2 = agent.tick(3000, 'ex-1', 'running', mockTs);
    expect(events2.length).toBe(0);

    // Step 1 at time 6000
    const events3 = agent.tick(6000, 'ex-1', 'detecting', mockTs);
    expect(events3.length).toBe(5);
    expect(events3[0].type).toBe('LOGIN_FAILED');
  });

  it('BlueTeamSentinel detects brute force', () => {
    const sentinel = new BlueTeamSentinel();
    const events: TelemetryEvent[] = [
      { type: 'LOGIN_FAILED' },
      { type: 'LOGIN_FAILED' },
      { type: 'LOGIN_FAILED' },
    ] as TelemetryEvent[];

    const output = sentinel.analyze(events, 'ex-1', 'detecting', mockTs);
    expect(output.length).toBe(1);
    expect(output[0].type).toBe('ALERT_CREATED');
  });

  it('InvestigationAnalyst correlates alerts and API anomaly into an Incident', () => {
    const analyst = new InvestigationAnalyst();
    const events: TelemetryEvent[] = [
      { type: 'ALERT_CREATED' },
      { type: 'API_ANOMALY' }
    ] as TelemetryEvent[];

    const output = analyst.analyze(events, 'ex-1', 'investigating', mockTs);
    expect(output.incidents.length).toBe(1);
    expect(output.incidents[0].title).toContain('API Data Exfiltration');
    expect(output.telemetry.length).toBe(1);
    expect(output.telemetry[0].type).toBe('ALERT_CREATED');
  });

  it('ResponseCommander applies containment actions on investigating incidents', () => {
    const commander = new ResponseCommander();
    const incidents: Incident[] = [{ status: 'investigating', responseActions: [] } as any];

    // Responding phase
    const res1 = commander.analyze(incidents, 'ex-1', 'responding', mockTs);
    expect(res1.telemetry.length).toBe(1);
    expect(res1.telemetry[0].type).toBe('PRIVILEGE_CHANGE');

    // Containing phase
    const res2 = commander.analyze(incidents, 'ex-1', 'containing', mockTs);
    expect(res2.telemetry.length).toBe(1);
    expect(res2.telemetry[0].type).toBe('CONTAINMENT_ACTION');
    expect(res2.updatedIncidents[0].status).toBe('contained');
  });
});
