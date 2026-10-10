import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/domain';
import { LabBanner } from '@/components/layout/AppShell';
import { SCENARIO_CATALOG } from '@/data/scenarios';
import { useArena } from '@/contexts/ArenaContext';
import { cn } from '@/lib/utils';

const DIFF: Record<string, 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

export default function ScenariosPage() {
  const navigate = useNavigate();
  const { createExercise, loading } = useArena();
  const [selectedId, setSelectedId] = useState('scenario-ransomware-controlled');
  const selected = SCENARIO_CATALOG.find((s) => s.id === selectedId)!;

  async function launch() {
    if (selected.availability !== 'available' || !selected.backendScenarioId) return;
    const ex = await createExercise({
      scenarioId: selected.backendScenarioId,
      scenario: selected.name,
      difficulty: selected.difficulty,
      targetAsset: selected.targetAssets[0],
      techniqueCategory: selected.category,
      startingCondition: 'Isolated synthetic environment — no real targets',
      simulationDuration: 1800,
      mode: 'manual',
      redTeamAgents: ['agent-red-alpha', 'agent-red-beta'],
      blueTeamAgents: ['agent-blue-sentinel', 'agent-investigation-analyst', 'agent-response-commander'],
    });
    navigate(`/app/arena?exerciseId=${ex.id}`);
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Scenarios"
        description="Choose a lab exercise. Available scenarios run the deterministic synthetic engine. Planned items are catalogued for future work."
      />
      <LabBanner />
      <p className="text-xs text-haven-muted">
        Prototype note: every available scenario currently drives the same timed synthetic event sequence so the demo is repeatable. Labels and learning copy follow the scenario you select.
      </p>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-2 lg:col-span-2">
          {SCENARIO_CATALOG.map((s) => {
            const active = s.id === selectedId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={cn(
                  'w-full rounded-lg border p-4 text-left transition-colors',
                  active ? 'border-haven-primary bg-haven-primary-light' : 'border-haven-border bg-haven-surface hover:border-haven-border-strong'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-haven-text">{s.name}</p>
                  {s.availability === 'planned' ? (
                    <Badge variant="outline">Planned</Badge>
                  ) : (
                    <Badge variant={DIFF[s.difficulty]}>{s.difficulty}</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-haven-secondary">{s.summary}</p>
              </button>
            );
          })}
        </div>

        <Card className="lg:col-span-3">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{selected.name}</h2>
            {selected.availability === 'planned' && <Badge variant="outline">Unavailable in this prototype</Badge>}
          </div>
          <p className="text-sm text-haven-secondary">{selected.description}</p>
          <Detail title="Attack stages" items={selected.attackStages} />
          <Detail title="Expected defensive objectives" items={selected.defensiveObjectives} />
          <Detail title="Telemetry generated" items={selected.telemetryGenerated} />
          <Detail title="Learning objectives" items={selected.learningObjectives} />
          <div className="mt-4 flex flex-wrap gap-2">
            {selected.targetAssets.map((a) => (
              <Badge key={a} variant="default">{a}</Badge>
            ))}
          </div>
          {selected.availability === 'available' ? (
            <Button className="mt-6" variant="primary" icon={<Play size={14} />} loading={loading} onClick={launch}>
              Launch in Simulation Arena
            </Button>
          ) : (
            <p className="mt-6 text-sm text-haven-muted">This scenario is planned and cannot be started yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Detail({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <p className="text-2xs font-semibold uppercase tracking-wider text-haven-muted">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-haven-secondary">
            <CheckCircle size={14} className="mt-0.5 shrink-0 text-haven-mint" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
