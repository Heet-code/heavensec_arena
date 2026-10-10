import React from 'react';
import { Card } from '@/components/ui';
import { PageHeader, RoleCard, EventTable } from '@/components/domain';
import { LabBanner } from '@/components/layout/AppShell';
import { useArena } from '@/contexts/ArenaContext';
import { RED_ROLES, eventsForRole } from '@/data/roles';

export default function RedTeamPage() {
  const { agents, activeExercise, telemetry } = useArena();
  const phase = activeExercise?.currentPhase ?? 'created';

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Red Team"
        description="Four simulation roles. They generate lab telemetry only — no real-world attack execution."
      />
      <LabBanner />
      <div className="grid gap-4 md:grid-cols-2">
        {RED_ROLES.map((role) => (
          <div key={role.id}>
            <RoleCard role={role} phase={phase} agents={agents} />
            <Card padding="none" className="mt-2 overflow-hidden">
              <p className="border-b border-haven-border px-4 py-2 text-2xs font-semibold uppercase tracking-wider text-haven-muted">
                Generated events
              </p>
              <EventTable events={eventsForRole(role, telemetry).slice(-8)} empty="No events from this role yet." />
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
