import React from 'react';
import { Download, Printer } from 'lucide-react';
import { Card, Badge, Button, ScoreRing, EmptyState } from '@/components/ui';
import { PageHeader, SimulationTimeline, EventTable } from '@/components/domain';
import { useArena } from '@/contexts/ArenaContext';
import { ORGANIZATION } from '@/data/environment';
import { formatDate } from '@/lib/format';
import { HISTORICAL_EXERCISES } from '@/data/mockData';

export default function ReportsPage() {
  const { activeExercise, score, coach, telemetry, incidents } = useArena();
  const fallback = HISTORICAL_EXERCISES[HISTORICAL_EXERCISES.length - 1];
  const exercise = activeExercise ?? fallback;
  const reportScore = score ?? exercise.score;

  function exportJson() {
    const blob = new Blob([JSON.stringify({
      notice: 'Synthetic academic exercise report. Not real incident data.',
      generated: new Date().toISOString(),
      exercise,
      score: reportScore,
      coach,
      incidentCount: incidents.length,
      eventCount: telemetry.length,
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `havensec-arena-exercise-${exercise.number}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!reportScore) {
    return (
      <div>
        <PageHeader title="Reports" description="Printable simulation summary." />
        <EmptyState title="Nothing to print yet" description="Complete a lab run to generate a report." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 print:space-y-4">
      <PageHeader
        title="Simulation report"
        description="Professional summary of a synthetic exercise. Suitable for course demonstration."
        actions={
          <div className="no-print flex gap-2">
            <Button variant="secondary" size="sm" icon={<Printer size={13} />} onClick={() => window.print()}>Print</Button>
            <Button variant="primary" size="sm" icon={<Download size={13} />} onClick={exportJson}>Export JSON</Button>
          </div>
        }
      />

      <Card className="border-haven-navy/20">
        <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-haven-muted">HavenSec Arena · Academic prototype</p>
        <h2 className="mt-1 text-xl font-semibold">Exercise #{exercise.number}: {exercise.scenarioName}</h2>
        <p className="mt-1 text-sm text-haven-secondary">
          {ORGANIZATION.name} · {ORGANIZATION.environment} · Isolated range
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="relative">
            <ScoreRing score={reportScore.overall} size={80} strokeWidth={7} />
            <div className="absolute inset-0 flex items-center justify-center font-bold">{reportScore.overall}</div>
          </div>
          <div className="text-sm">
            <p><span className="text-haven-muted">Duration: </span>{exercise.duration ? `${exercise.duration}s lab clock` : '—'}</p>
            <p><span className="text-haven-muted">Started: </span>{exercise.startedAt ? formatDate(exercise.startedAt) : '—'}</p>
            <p><span className="text-haven-muted">Ended: </span>{exercise.endedAt ? formatDate(exercise.endedAt) : '—'}</p>
            <p className="mt-2 max-w-xl text-xs text-haven-muted">Resilience score is a prototype teaching metric, not a validated scientific score.</p>
          </div>
        </div>
      </Card>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Simulation summary</h3>
        <Card>
          <p className="text-sm text-haven-secondary">{reportScore.summary}</p>
          <SimulationTimeline phase={exercise.currentPhase} />
        </Card>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold">Red Team activity</h3>
          <p className="mt-2 text-sm text-haven-secondary">
            Recon, path planning, simulation execution, and objective tracking produced synthetic HTTP, auth, and impact telemetry against {exercise.config.targetAsset}.
          </p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold">Blue Team response</h3>
          <p className="mt-2 text-sm text-haven-secondary">
            Monitoring and detection raised alerts; response and recovery applied lockout, rate limits, and lab restore steps.
          </p>
          {incidents[0] && (
            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="danger">{incidents[0].severity}</Badge>
              <Badge variant="success">{incidents[0].status}</Badge>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-semibold">Referee evaluation</h3>
        <ul className="space-y-2 text-sm">
          {reportScore.categories.map((c) => (
            <li key={c.category} className="flex justify-between gap-4 border-b border-haven-bg py-1">
              <span>{c.category}</span>
              <span className="font-semibold">{c.score}/100</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-2xs font-semibold uppercase text-haven-muted">Strengths</p>
            <ul className="mt-1 list-disc pl-4 text-sm text-haven-secondary">
              {reportScore.strengths.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-2xs font-semibold uppercase text-haven-muted">Improvement recommendations</p>
            <ul className="mt-1 list-disc pl-4 text-sm text-haven-secondary">
              {(coach?.recommendations.map((r) => r.recommendation) ?? reportScore.weaknesses).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {telemetry.length > 0 && (
        <Card padding="none" className="overflow-hidden">
          <p className="border-b border-haven-border px-4 py-3 text-sm font-semibold">Incident timeline (synthetic events)</p>
          <EventTable events={telemetry} />
        </Card>
      )}
    </div>
  );
}
