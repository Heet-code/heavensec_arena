import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { Card, Badge, Button, ScoreRing, MetricCard, ProgressBar } from '@/components/ui';
import { PageHeader, SimulationTimeline, RoleCard } from '@/components/domain';
import { LabBanner } from '@/components/layout/AppShell';
import { useArena } from '@/contexts/ArenaContext';
import { HISTORICAL_EXERCISES } from '@/data/mockData';
import { RED_ROLES, BLUE_ROLES } from '@/data/roles';

export default function OverviewPage() {
  const navigate = useNavigate();
  const { activeExercise, score, exercises, telemetry, incidents, agents } = useArena();

  const latestCompleted = useMemo(() => {
    const apiDone = exercises.filter((e) => e.status === 'completed' && e.score);
    if (apiDone[0]?.score) return apiDone[0];
    return HISTORICAL_EXERCISES[HISTORICAL_EXERCISES.length - 1];
  }, [exercises]);

  const displayScore = score ?? latestCompleted.score;
  const phase = activeExercise?.currentPhase ?? 'created';
  const detection = displayScore?.categories.find((c) => c.category === 'Detection')?.score ?? 0;
  const containment = displayScore?.categories.find((c) => c.category === 'Containment')?.score ?? 0;
  const recovery = displayScore?.categories.find((c) => c.category === 'Recovery')?.score ?? 0;

  const trend = HISTORICAL_EXERCISES.map((ex) => ({
    exercise: `#${ex.number}`,
    score: ex.score?.overall ?? 0,
  }));
  const radar = displayScore?.categories.map((c) => ({ dimension: c.category, value: c.score })) ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="HavenSec Arena"
        description="Controlled cyber range for Red Team simulation, Blue Team response, and prototype referee scoring."
        actions={
          <Button variant="primary" icon={<Play size={13} />} onClick={() => navigate('/app/scenarios')}>
            Start simulation
          </Button>
        }
      />
      <LabBanner />

      <Card padding="none" className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-haven-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wider text-haven-muted">Active simulation</p>
            <p className="text-sm font-semibold text-haven-text">
              {activeExercise ? `${activeExercise.scenarioName} · #${activeExercise.number}` : 'None — select a scenario to begin'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeExercise && <Badge variant="primary">{activeExercise.currentPhase}</Badge>}
            <Badge variant="outline">{activeExercise?.status ?? 'idle'}</Badge>
            <Button variant="secondary" size="sm" onClick={() => navigate('/app/arena')}>Open arena</Button>
          </div>
        </div>
        <SimulationTimeline phase={phase} />
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Active simulation" value={activeExercise ? 'Yes' : 'No'} sub={activeExercise?.status ?? 'Idle'} accent="blue" />
        <MetricCard label="Detection rate" value={`${detection}`} sub="Prototype category score" accent="green" />
        <MetricCard label="Mean detection time" value="~2.5s" sub="In this 30s lab run" accent="blue" />
        <MetricCard label="Containment" value={`${containment}`} sub="Lowest typical gap" accent="amber" />
        <MetricCard label="Recovery" value={`${recovery}`} sub="Lab restore quality" accent="green" />
        <MetricCard label="Resilience score" value={displayScore ? `${displayScore.overall}` : '—'} sub="Academic prototype metric" accent="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="mb-3 text-sm font-semibold">Performance dimensions</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radar}>
              <PolarGrid stroke="#e6e0d6" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: '#7a8494' }} />
              <Radar dataKey="value" stroke="#3b6ea8" fill="#3b6ea8" fillOpacity={0.1} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <p className="mb-3 text-sm font-semibold">Sample lab history</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece7de" />
              <XAxis dataKey="exercise" tick={{ fontSize: 10, fill: '#7a8494' }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: '#7a8494' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e6e0d6' }} />
              <Line type="monotone" dataKey="score" stroke="#3b6ea8" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Latest evaluation</p>
            {displayScore && <ScoreRing score={displayScore.overall} size={56} strokeWidth={6} />}
          </div>
          <p className="text-xs leading-relaxed text-haven-secondary">
            {displayScore?.summary || 'Complete a simulation to generate a referee summary.'}
          </p>
          {displayScore && (
            <div className="mt-4 space-y-2">
              {displayScore.categories.map((c) => (
                <div key={c.category}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-haven-secondary">{c.category}</span>
                    <span className="font-semibold">{c.score}</span>
                  </div>
                  <ProgressBar value={c.score} height="h-1.5" color={c.score >= 80 ? '#2f8f72' : c.score >= 65 ? '#c4922a' : '#c45c52'} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <p className="mb-2 text-2xs font-bold uppercase tracking-wider text-haven-coral">Red Team</p>
          <div className="space-y-2">
            {RED_ROLES.map((r) => (
              <RoleCard key={r.id} role={r} phase={phase} agents={agents} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-2xs font-bold uppercase tracking-wider text-haven-mint">Blue Team</p>
          <div className="space-y-2">
            {BLUE_ROLES.map((r) => (
              <RoleCard key={r.id} role={r} phase={phase} agents={agents} />
            ))}
          </div>
        </div>
        <Card>
          <p className="mb-2 text-2xs font-bold uppercase tracking-wider text-haven-gold">Referee</p>
          <p className="text-sm font-semibold">Detection · Containment · Damage · Recovery</p>
          <p className="mt-2 text-xs text-haven-secondary">
            Live stream: {telemetry.length} synthetic events · {incidents.length} incident{incidents.length === 1 ? '' : 's'}.
          </p>
          <Button className="mt-4" variant="secondary" size="sm" onClick={() => navigate('/app/referee')}>
            Open evaluation
          </Button>
        </Card>
      </div>
    </div>
  );
}
