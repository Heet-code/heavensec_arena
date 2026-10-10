import React from 'react';
import { Card, Badge } from '@/components/ui';
import { PageHeader, RoleCard, EventTable } from '@/components/domain';
import { LabBanner } from '@/components/layout/AppShell';
import { useArena } from '@/contexts/ArenaContext';
import { BLUE_ROLES } from '@/data/roles';
import { formatTime } from '@/lib/format';

export default function BlueTeamPage() {
  const { agents, activeExercise, telemetry, incidents } = useArena();
  const phase = activeExercise?.currentPhase ?? 'created';
  const inc = incidents[0];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Blue Team"
        description="Teaching SOC layout: monitor the synthetic stream, detect, respond, recover. Educational, not a commercial SIEM clone."
      />
      <LabBanner />

      <div className="grid gap-4 lg:grid-cols-4">
        {BLUE_ROLES.map((role) => (
          <RoleCard key={role.id} role={role} phase={phase} agents={agents} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="none">
          <p className="border-b border-haven-border px-4 py-3 text-sm font-semibold">Incoming telemetry</p>
          <EventTable events={telemetry.slice(-20)} />
        </Card>
        <Card>
          <p className="text-sm font-semibold">Detected incident</p>
          {!inc ? (
            <p className="mt-3 text-sm text-haven-muted">No incident in the current run. Start a simulation to populate this panel.</p>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-sm font-medium text-haven-text">{inc.title}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="danger">{inc.severity}</Badge>
                <Badge variant="warning">{inc.status}</Badge>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-haven-muted">Detected</dt>
                  <dd>{formatTime(inc.detectedAt)}</dd>
                </div>
                <div>
                  <dt className="text-haven-muted">Response state</dt>
                  <dd className="capitalize">{inc.status}</dd>
                </div>
                <div>
                  <dt className="text-haven-muted">Containment</dt>
                  <dd>{['contained', 'resolved'].includes(inc.status) ? 'Actions applied in lab' : 'In progress or pending'}</dd>
                </div>
                <div>
                  <dt className="text-haven-muted">Recovery</dt>
                  <dd>{inc.resolvedAt ? formatTime(inc.resolvedAt) : 'Not complete'}</dd>
                </div>
              </dl>
              <p className="text-xs text-haven-secondary">{inc.description}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
