import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui';
import { PageHeader, EventTable } from '@/components/domain';
import { LabBanner } from '@/components/layout/AppShell';
import { useArena } from '@/contexts/ArenaContext';
import type { TelemetrySeverity } from '@/types';

export default function TelemetryPage() {
  const { telemetry, activeExercise } = useArena();
  const [sev, setSev] = useState<'all' | TelemetrySeverity>('all');
  const filtered = useMemo(
    () => (sev === 'all' ? telemetry : telemetry.filter((e) => e.severity === sev)),
    [telemetry, sev]
  );

  const stats = [
    { label: 'Total', value: telemetry.length },
    { label: 'Critical', value: telemetry.filter((e) => e.severity === 'critical').length },
    { label: 'High', value: telemetry.filter((e) => e.severity === 'high').length },
    { label: 'Alerts', value: telemetry.filter((e) => e.type === 'ALERT_CREATED').length },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Telemetry"
        description={`Synthetic event log${activeExercise ? ` for exercise #${activeExercise.number}` : ''}. Not production traffic.`}
      />
      <LabBanner />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-haven-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="text-xs text-haven-secondary">
          Severity
          <select
            className="ml-2 h-9 rounded-md border border-haven-border bg-haven-surface px-2 text-sm"
            value={sev}
            onChange={(e) => setSev(e.target.value as typeof sev)}
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>
      </div>
      <Card padding="none">
        <EventTable events={filtered} empty="No matching synthetic events. Run a simulation to populate this table." />
      </Card>
    </div>
  );
}
