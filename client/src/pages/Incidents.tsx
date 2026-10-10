import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, Badge, EmptyState, Button } from '@/components/ui';
import { PageHeader } from '@/components/domain';
import { LabBanner } from '@/components/layout/AppShell';
import { useArena } from '@/contexts/ArenaContext';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function IncidentsPage() {
  const navigate = useNavigate();
  const { incidents } = useArena();
  const [selectedId, setSelectedId] = useState<string | null>(incidents[0]?.id ?? null);
  const selected = incidents.find((i) => i.id === selectedId) ?? incidents[0] ?? null;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Incidents"
        description="Incidents created from correlated synthetic telemetry during a lab exercise."
      />
      <LabBanner />
      {incidents.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle size={36} strokeWidth={1} />}
          title="No incidents"
          description="Start a simulation. The Investigation Analyst opens an incident when auth and impact events correlate."
          action={<Button variant="primary" onClick={() => navigate('/app/scenarios')}>Open scenarios</Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {incidents.map((inc) => (
              <button
                key={inc.id}
                type="button"
                onClick={() => setSelectedId(inc.id)}
                className={cn(
                  'w-full rounded-lg border p-3 text-left',
                  selected?.id === inc.id ? 'border-haven-primary bg-haven-primary-light' : 'border-haven-border bg-haven-surface'
                )}
              >
                <p className="text-sm font-semibold">{inc.title}</p>
                <div className="mt-2 flex gap-1">
                  <Badge variant="danger">{inc.severity}</Badge>
                  <Badge variant="warning">{inc.status}</Badge>
                </div>
              </button>
            ))}
          </div>
          {selected && (
            <Card>
              <h2 className="text-base font-semibold">{selected.title}</h2>
              <p className="mt-2 text-sm text-haven-secondary">{selected.description}</p>
              <p className="mt-4 text-2xs font-semibold uppercase text-haven-muted">Evidence</p>
              <ul className="mt-2 list-disc pl-4 text-sm text-haven-secondary">
                {selected.evidence.map((e) => <li key={e}>{e}</li>)}
              </ul>
              <p className="mt-4 text-2xs font-semibold uppercase text-haven-muted">Timeline</p>
              <ul className="mt-2 space-y-2">
                {selected.timeline.map((t) => (
                  <li key={t.id} className="text-sm">
                    <span className="font-mono text-xs text-haven-muted">{formatTime(t.timestamp)}</span>
                    {' '}{t.event} <span className="text-haven-muted">· {t.agentName}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
