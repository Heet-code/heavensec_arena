import React from 'react';
import { cn } from '@/lib/utils';
import { Card, Badge, ProgressBar, StatusDot, EmptyState, Button, Skeleton } from '@/components/ui';
import { WORKFLOW_STEPS, workflowIndexForPhase } from '@/data/scenarios';
import type { RoleDefinition } from '@/data/roles';
import { roleStatus, roleTask } from '@/data/roles';
import type { Agent, ExercisePhase, TelemetryEvent, TelemetrySeverity } from '@/types';
import { formatTime } from '@/lib/format';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-haven-text">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-haven-secondary">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SimulationTimeline({ phase }: { phase: string }) {
  const idx = workflowIndexForPhase(phase);
  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:flex-wrap sm:items-stretch">
      {WORKFLOW_STEPS.map((step, i) => {
        const done = i < idx || phase === 'completed';
        const current = i === idx && phase !== 'completed';
        return (
          <li key={step.id} className="flex flex-1 items-stretch min-w-[120px]">
            <div
              className={cn(
                'flex w-full flex-col border-b border-haven-border px-3 py-3 sm:border-b-0 sm:border-r last:border-r-0',
                current && 'bg-haven-primary-light',
                done && !current && 'bg-haven-success-light/40'
              )}
            >
              <span className="text-2xs font-semibold uppercase tracking-wider text-haven-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={cn('mt-1 text-sm font-medium', current ? 'text-haven-primary' : 'text-haven-text')}>
                {step.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function RoleCard({
  role,
  phase,
  agents,
}: {
  role: RoleDefinition;
  phase: ExercisePhase | string;
  agents: Agent[];
}) {
  const status = roleStatus(role, phase, agents);
  const task = roleTask(role, phase, agents);
  const team = role.team;
  const accent =
    team === 'red' ? 'border-l-haven-coral' : team === 'blue' ? 'border-l-haven-mint' : 'border-l-haven-gold';
  return (
    <Card className={cn('border-l-4 p-4', accent)}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-haven-text">{role.name}</p>
        <Badge variant={status === 'running' ? 'primary' : status === 'completed' ? 'success' : 'default'}>
          {status}
        </Badge>
      </div>
      <p className="mb-3 text-xs text-haven-secondary">{role.summary}</p>
      <p className="text-2xs font-semibold uppercase tracking-wider text-haven-muted">Current task</p>
      <p className="mt-1 text-xs text-haven-text">{task}</p>
    </Card>
  );
}

const SEV_BADGE: Record<TelemetrySeverity, 'default' | 'info' | 'warning' | 'danger'> = {
  info: 'info',
  low: 'default',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

export function EventTable({ events, empty }: { events: TelemetryEvent[]; empty?: string }) {
  if (events.length === 0) {
    return <p className="py-10 text-center text-sm text-haven-muted">{empty ?? 'No synthetic events yet.'}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-haven-border bg-haven-bg text-2xs font-semibold uppercase tracking-wider text-haven-muted">
            <th className="px-3 py-2">Timestamp</th>
            <th className="px-3 py-2">Source</th>
            <th className="px-3 py-2">Event</th>
            <th className="px-3 py-2">Severity</th>
            <th className="px-3 py-2">Agent</th>
            <th className="px-3 py-2">Phase</th>
          </tr>
        </thead>
        <tbody>
          {events.map((evt) => (
            <tr key={evt.id} className="border-b border-haven-bg hover:bg-haven-bg/80">
              <td className="px-3 py-2 font-mono text-xs text-haven-muted">{formatTime(evt.timestamp)}</td>
              <td className="px-3 py-2 font-mono text-xs text-haven-secondary">{evt.sourceAsset}</td>
              <td className="px-3 py-2 text-xs font-medium text-haven-text">{evt.type}</td>
              <td className="px-3 py-2"><Badge variant={SEV_BADGE[evt.severity]}>{evt.severity}</Badge></td>
              <td className="truncate px-3 py-2 font-mono text-xs text-haven-secondary">{evt.actor}</td>
              <td className="px-3 py-2 text-xs capitalize text-haven-muted">{evt.phase}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TelemetryStream({ events }: { events: TelemetryEvent[] }) {
  return (
    <div className="max-h-64 overflow-y-auto font-mono text-2xs">
      {events.length === 0 ? (
        <p className="py-8 text-center font-sans text-sm text-haven-muted">Waiting for synthetic telemetry.</p>
      ) : (
        events.map((evt) => (
          <div key={evt.id} className="flex gap-3 border-b border-haven-bg px-3 py-1.5 hover:bg-haven-bg">
            <span className="w-16 shrink-0 text-haven-muted">{formatTime(evt.timestamp)}</span>
            <span className="w-16 shrink-0 text-haven-secondary">{evt.severity}</span>
            <span className="w-20 shrink-0 truncate">{evt.sourceAsset}</span>
            <span className="truncate text-haven-text">{evt.type} · {evt.actor}</span>
          </div>
        ))
      )}
    </div>
  );
}

export function LoadingBlock() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export { EmptyState, Button, Card, Badge, ProgressBar, StatusDot };
