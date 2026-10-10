import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ChevronDown, ChevronUp, Play } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Card, Badge, Button, ScoreRing, EmptyState, ProgressBar } from '@/components/ui';
import { PageHeader, SimulationTimeline } from '@/components/domain';
import { LabBanner } from '@/components/layout/AppShell';
import { useArena } from '@/contexts/ArenaContext';
import { scoreTone } from '@/lib/format';

const TONE_COLOR = { good: '#2f8f72', ok: '#c4922a', weak: '#c45c52' };

export default function RefereePage() {
  const navigate = useNavigate();
  const { score, coach, activeExercise, incidents, telemetry } = useArena();
  const [open, setOpen] = useState(0);

  if (!score) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Referee / Evaluation" description="Prototype academic scoring of the lab exercise. Not a scientifically validated instrument." />
        <EmptyState
          icon={<Scale size={36} strokeWidth={1} />}
          title="No evaluation yet"
          description="Complete a simulation. The referee agent scores detection, containment, response, recovery, and simulated damage after the timed sequence."
          action={<Button variant="primary" icon={<Play size={13} />} onClick={() => navigate('/app/arena')}>Go to arena</Button>}
        />
      </div>
    );
  }

  const bars = score.categories.map((c) => ({ ...c, fill: TONE_COLOR[scoreTone(c.score)] }));
  const damage = 100 - (score.categories.find((c) => c.category === 'Containment')?.score ?? 60);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Referee / Evaluation"
        description="Academic prototype metrics for this isolated exercise. Treat scores as teaching signals, not certification."
      />
      <LabBanner />
      <p className="rounded-md border border-haven-gold/40 bg-haven-warning-light px-3 py-2 text-xs text-haven-secondary">
        Overall resilience score is a weighted heuristic used in this prototype. It is not independently validated.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="relative">
            <ScoreRing score={score.overall} size={88} strokeWidth={8} />
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">{score.overall}</div>
          </div>
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wider text-haven-muted">Overall resilience</p>
            <p className="text-2xl font-semibold">{score.overall}<span className="text-sm font-normal text-haven-muted">/100</span></p>
            <p className="text-xs text-haven-secondary">Exercise #{activeExercise?.number ?? '—'}</p>
          </div>
        </Card>
        <Metric label="Detection time" value="~2.5s lab clock" detail="First high-severity auth alert in the synthetic stream" />
        <Metric label="Containment" value={`${score.categories.find((c) => c.category === 'Containment')?.score ?? '—'}`} detail="Time-to-isolate vs. teaching target" />
        <Metric label="Response quality" value={`${score.categories.find((c) => c.category === 'Response')?.score ?? '—'}`} detail="Playbook completeness in the lab" />
        <Metric label="Recovery" value={`${score.categories.find((c) => c.category === 'Recovery')?.score ?? '—'}`} detail="Restore and control updates" />
        <Metric label="Simulated damage" value={`${damage}`} detail="Inverse teaching proxy (higher = more lab impact). Not real loss." />
      </div>

      <Card padding="none" className="overflow-hidden">
        <p className="border-b border-haven-border px-5 py-3 text-sm font-semibold">Event correlation path</p>
        <SimulationTimeline phase={activeExercise?.currentPhase ?? 'completed'} />
        <p className="px-5 py-3 text-xs text-haven-muted">{telemetry.length} synthetic events · {incidents.length} incident(s)</p>
      </Card>

      <Card>
        <p className="mb-4 text-sm font-semibold">Category scores</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={bars}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ece7de" />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#7a8494' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#7a8494' }} />
            <Tooltip />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {bars.map((e) => <Cell key={e.category} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-3">
          {score.categories.map((c) => (
            <div key={c.category}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{c.category}</span>
                <span className="font-semibold">{c.score}</span>
              </div>
              <ProgressBar value={c.score} color={TONE_COLOR[scoreTone(c.score)]} />
              <p className="mt-1 text-xs text-haven-muted">{c.details}</p>
            </div>
          ))}
        </div>
      </Card>

      {coach && (
        <Card>
          <p className="mb-3 text-sm font-semibold">Improvement recommendations</p>
          <div className="space-y-2">
            {coach.recommendations.map((rec, i) => (
              <div key={rec.finding} className="overflow-hidden rounded-md border border-haven-border">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                  onClick={() => setOpen(open === i ? -1 : i)}
                >
                  <Badge variant={rec.priority === 'critical' ? 'danger' : 'warning'}>{rec.priority}</Badge>
                  <span className="flex-1 font-medium">{rec.area}</span>
                  {open === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {open === i && (
                  <div className="border-t border-haven-border bg-haven-bg px-3 py-3 text-xs text-haven-secondary">
                    <p><span className="font-semibold text-haven-text">Finding. </span>{rec.finding}</p>
                    <p className="mt-2"><span className="font-semibold text-haven-text">Recommendation. </span>{rec.recommendation}</p>
                    <p className="mt-2 italic">{rec.rationale}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button className="mt-4" variant="secondary" onClick={() => navigate('/app/reports')}>Open printable report</Button>
        </Card>
      )}
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <Card>
      <p className="text-2xs font-semibold uppercase tracking-wider text-haven-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-haven-secondary">{detail}</p>
    </Card>
  );
}
