import React from 'react';
import { Card, Badge } from '@/components/ui';
import { PageHeader } from '@/components/domain';
import { LabBanner } from '@/components/layout/AppShell';
import { useArena } from '@/contexts/ArenaContext';
import { ORGANIZATION, SYNTHETIC_ASSETS } from '@/data/environment';

export default function SettingsPage() {
  const { apiOnline, usingLocalEngine } = useArena();

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Settings"
        description="Lab configuration for this academic prototype. No production tenants or live targets."
      />
      <LabBanner />

      <Card>
        <h2 className="text-sm font-semibold">Platform</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <Row label="Organization" value={ORGANIZATION.name} />
          <Row label="Environment" value={ORGANIZATION.environment} />
          <Row label="Range" value={ORGANIZATION.range} />
          <Row label="API" value={apiOnline === false ? 'Offline' : apiOnline ? 'Reachable' : 'Checking…'} />
          <Row label="Engine" value={usingLocalEngine ? 'Local prototype fallback' : 'Server simulation engine'} />
          <Row label="Theme" value="Light (enterprise range)" />
        </dl>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold">Synthetic assets</h2>
        <ul className="mt-3 space-y-2">
          {SYNTHETIC_ASSETS.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-haven-bg py-2 text-sm">
              <span className="font-mono font-medium">{a.id}</span>
              <span className="text-haven-secondary">{a.type}</span>
              <span className="font-mono text-xs text-haven-muted">{a.ip}</span>
              <Badge variant="outline">{a.zone}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold">Safety</h2>
        <p className="mt-2 text-sm text-haven-secondary">
          HavenSec Arena does not scan, exploit, or connect to unauthorized systems. Red Team actions are timed records in an in-memory model. Credentials and IPs on screen are dummy values.
        </p>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-2xs font-semibold uppercase text-haven-muted">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
