import type { Agent, ExercisePhase, TelemetryEvent } from '../types';

export type RoleTeam = 'red' | 'blue' | 'referee' | 'coach' | 'orchestrator';

export interface RoleDefinition {
  id: string;
  name: string;
  team: RoleTeam;
  summary: string;
  mapsTo: string[];
  phasesActive: ExercisePhase[];
}

export const RED_ROLES: RoleDefinition[] = [
  {
    id: 'recon',
    name: 'Recon Simulator',
    team: 'red',
    summary: 'Produces synthetic reconnaissance against WEB-01 (HTTP probes, directory enumeration telemetry).',
    mapsTo: ['agent-red-alpha'],
    phasesActive: ['running', 'detecting'],
  },
  {
    id: 'path',
    name: 'Attack Path Planner',
    team: 'red',
    summary: 'Selects the next simulated stage in the isolated range. Does not execute real-world attacks.',
    mapsTo: ['agent-orchestrator', 'agent-red-alpha'],
    phasesActive: ['preparing', 'running', 'detecting'],
  },
  {
    id: 'executor',
    name: 'Simulation Executor',
    team: 'red',
    summary: 'Emits credential-abuse and API/file-impact telemetry on synthetic assets.',
    mapsTo: ['agent-red-alpha', 'agent-red-beta'],
    phasesActive: ['detecting', 'investigating'],
  },
  {
    id: 'objective',
    name: 'Objective Agent',
    team: 'red',
    summary: 'Tracks whether simulated objectives (access, disruption telemetry) were reached in the lab.',
    mapsTo: ['agent-red-beta'],
    phasesActive: ['detecting', 'investigating', 'responding'],
  },
];

export const BLUE_ROLES: RoleDefinition[] = [
  {
    id: 'monitor',
    name: 'Monitoring Agent',
    team: 'blue',
    summary: 'Watches the synthetic telemetry stream for threshold breaches.',
    mapsTo: ['agent-blue-sentinel'],
    phasesActive: ['running', 'detecting', 'investigating', 'responding', 'containing'],
  },
  {
    id: 'detect',
    name: 'Detection Agent',
    team: 'blue',
    summary: 'Raises alerts from authentication and API/file anomalies.',
    mapsTo: ['agent-blue-sentinel'],
    phasesActive: ['detecting', 'investigating'],
  },
  {
    id: 'respond',
    name: 'Response Agent',
    team: 'blue',
    summary: 'Executes playbook actions: lockouts, session revocation, incident handoff.',
    mapsTo: ['agent-investigation-analyst', 'agent-response-commander'],
    phasesActive: ['investigating', 'responding', 'containing'],
  },
  {
    id: 'recover',
    name: 'Recovery Agent',
    team: 'blue',
    summary: 'Applies containment, rate limits, MFA policy, and lab recovery steps.',
    mapsTo: ['agent-response-commander'],
    phasesActive: ['containing', 'evaluating', 'completed'],
  },
];

export function roleStatus(
  role: RoleDefinition,
  phase: ExercisePhase | string,
  agents: Agent[],
): Agent['status'] {
  const mapped = agents.filter((a) => role.mapsTo.includes(a.id));
  const live = mapped.find((a) => a.status === 'running') || mapped.find((a) => a.status === 'thinking');
  if (live) return live.status;
  if (role.phasesActive.includes(phase as ExercisePhase)) {
    if (phase === 'completed' || phase === 'evaluating') return mapped[0]?.status ?? 'completed';
    return 'running';
  }
  if (phase === 'completed') return 'completed';
  return mapped[0]?.status ?? 'idle';
}

export function roleTask(role: RoleDefinition, phase: ExercisePhase | string, agents: Agent[]): string {
  const mapped = agents.filter((a) => role.mapsTo.includes(a.id));
  const withTask = mapped.find((a) => a.currentTask);
  if (withTask?.currentTask) return withTask.currentTask;
  if (!role.phasesActive.includes(phase as ExercisePhase) && phase !== 'completed') {
    return 'Standing by for assigned simulation phase.';
  }
  return role.summary;
}

export function eventsForRole(role: RoleDefinition, events: TelemetryEvent[]): TelemetryEvent[] {
  const actors = new Set(role.mapsTo);
  return events.filter((e) => actors.has(e.actor) || role.mapsTo.some((id) => e.actor.includes(id.split('-').pop() || '')));
}
