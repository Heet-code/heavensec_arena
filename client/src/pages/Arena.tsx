import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Pause, Square, RotateCcw, Activity, Scale } from 'lucide-react';
import { Card, Badge, Button, PhaseLabel, StatusDot, EmptyState, ScoreRing } from '@/components/ui';
import { PageHeader, SimulationTimeline, RoleCard, TelemetryStream } from '@/components/domain';
import { LabBanner } from '@/components/layout/AppShell';
import { useArena } from '@/contexts/ArenaContext';
import { RED_ROLES, BLUE_ROLES } from '@/data/roles';
import { SYNTHETIC_ASSETS } from '@/data/environment';
import { mmss } from '@/lib/format';
import type { Incident } from '@/types';
import { cn } from '@/lib/utils';

export default function ArenaPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const exerciseId = params.get('exerciseId');
  const {
    activeExercise, telemetry, incidents, score, agents,
    loadExercise, startExercise, stopExercise, pollExercise, stopPolling,
    pauseSimulation, resumeSimulation, resetSimulation, paused, loading,
  } = useArena();

  const [elapsed, setElapsed] = useState(0);
  const [showEvents, setShowEvents] = useState(true);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (exerciseId && !exerciseId.startsWith('local-')) loadExercise(exerciseId);
  }, [exerciseId, loadExercise]);

  useEffect(() => {
    if (activeExercise?.status === 'running' && !paused && activeExercise.id) {
      pollExercise(activeExercise.id);
    }
    return () => stopPolling();
  }, [activeExercise?.id, activeExercise?.status, paused, pollExercise, stopPolling]);

  useEffect(() => {
    if (activeExercise?.status !== 'running' || paused) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [activeExercise?.status, paused]);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' });
  }, [telemetry.length]);

  if (!activeExercise) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Simulation Arena" description="Center of the range: Red Team activity, sandbox assets, telemetry, Blue Team, then referee." />
        <EmptyState
          icon={<Activity size={36} strokeWidth={1} />}
          title="No exercise loaded"
          description="Launch a scenario to run the synthetic simulation here."
          action={<Button variant="primary" icon={<Play size={13} />} onClick={() => navigate('/app/scenarios')}>Choose scenario</Button>}
        />
      </div>
    );
  }

  const phase = activeExercise.currentPhase;
  const isRunning = activeExercise.status === 'running';
  const isCompleted = activeExercise.status === 'completed';

  async function onStart() {
    setElapsed(0);
    await startExercise(activeExercise.id);
  }

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader
        title="Simulation Arena"
        description={`${activeExercise.scenarioName} · Exercise #${activeExercise.number} · synthetic events only`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PhaseLabel phase={phase} />
            {isRunning && (
              <span className="inline-flex h-9 items-center gap-2 rounded-md border border-haven-border bg-haven-surface px-3 font-mono text-sm">
                {mmss(elapsed)}
              </span>
            )}
            {(activeExercise.status === 'created' || activeExercise.status === 'stopped') && (
              <Button variant="primary" icon={<Play size={13} />} loading={loading} onClick={onStart}>Start simulation</Button>
            )}
            {isRunning && !paused && (
              <Button variant="secondary" icon={<Pause size={13} />} onClick={pauseSimulation}>Pause</Button>
            )}
            {isRunning && paused && (
              <Button variant="primary" icon={<Play size={13} />} onClick={resumeSimulation}>Resume</Button>
            )}
            {isRunning && (
              <Button variant="danger" icon={<Square size={13} />} onClick={() => stopExercise(activeExercise.id)}>Stop</Button>
            )}
            <Button variant="ghost" icon={<RotateCcw size={13} />} onClick={() => { resetSimulation(); navigate('/app/scenarios'); }}>Reset</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowEvents((v) => !v)}>
              {showEvents ? 'Hide events' : 'View events'}
            </Button>
            {isCompleted && (
              <Button variant="primary" size="sm" icon={<Scale size={13} />} onClick={() => navigate('/app/referee')}>View evaluation</Button>
            )}
          </div>
        }
      />
      <LabBanner />
      {paused && isRunning && (
        <p className="text-sm text-haven-warning">Simulation paused — polling and the local engine are held. Resume to continue the sequence.</p>
      )}

      {isCompleted && score && (
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <ScoreRing score={score.overall} size={72} strokeWidth={7} />
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">{score.overall}</div>
          </div>
          <div>
            <p className="text-sm font-semibold">Referee evaluation ready (prototype metric)</p>
            <p className="mt-1 text-xs text-haven-secondary">{score.summary}</p>
          </div>
        </Card>
      )}

      <Card padding="none" className="overflow-hidden">
        <SimulationTimeline phase={phase} />
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <p className="mb-2 text-2xs font-bold uppercase tracking-wider text-haven-coral">Red Team</p>
          <div className="space-y-2">
            {RED_ROLES.map((r) => <RoleCard key={r.id} role={r} phase={phase} agents={agents} />)}
          </div>
        </div>

        <Card padding="none">
          <div className="flex items-center justify-between border-b border-haven-border px-4 py-3">
            <p className="text-sm font-semibold">Target / sandbox</p>
            <Badge variant="success" dot>Isolated range</Badge>
          </div>
          <SandboxMap phase={phase} incidents={incidents} />
          <div className="border-t border-haven-border px-4 py-3 text-xs text-haven-secondary">
            Red Team → simulated attack → sandbox → telemetry → Blue Team → response → referee
          </div>
        </Card>

        <div>
          <p className="mb-2 text-2xs font-bold uppercase tracking-wider text-haven-mint">Blue Team</p>
          <div className="space-y-2">
            {BLUE_ROLES.map((r) => <RoleCard key={r.id} role={r} phase={phase} agents={agents} />)}
          </div>
        </div>
      </div>

      {incidents[0] && (
        <Card>
          <p className="text-2xs font-semibold uppercase tracking-wider text-haven-muted">Incident state</p>
          <p className="mt-1 text-sm font-semibold">{incidents[0].title}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="danger">{incidents[0].severity}</Badge>
            <Badge variant="warning">{incidents[0].status}</Badge>
            {incidents[0].affectedAssets.map((a) => <Badge key={a} variant="outline">{a}</Badge>)}
          </div>
        </Card>
      )}

      {showEvents && (
        <Card padding="none">
          <div className="flex items-center justify-between border-b border-haven-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Synthetic event stream</span>
              {isRunning && <StatusDot color="green" pulse={!paused} />}
            </div>
            <span className="text-2xs text-haven-muted">{telemetry.length} events</span>
          </div>
          <div ref={streamRef}>
            <TelemetryStream events={telemetry} />
          </div>
        </Card>
      )}
    </div>
  );
}

function SandboxMap({ phase, incidents }: { phase: string; incidents: Incident[] }) {
  const affected = new Set(incidents.flatMap((i) => i.affectedAssets));
  const contained = new Set(incidents.filter((i) => ['contained', 'resolved'].includes(i.status)).flatMap((i) => i.affectedAssets));
  return (
    <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {SYNTHETIC_ASSETS.map((asset) => {
        const hit = affected.has(asset.id);
        const ok = contained.has(asset.id);
        const hot = ['running', 'detecting', 'investigating'].includes(phase) && (asset.id === 'WEB-01' || asset.id === 'AUTH-01' || hit);
        return (
          <div
            key={asset.id}
            className={cn(
              'rounded-md border px-3 py-3',
              ok ? 'border-haven-mint bg-haven-success-light' : hit ? 'border-haven-coral bg-haven-red-light' : 'border-haven-border bg-haven-bg'
            )}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm font-semibold">{asset.id}</p>
              {hot && !ok && <StatusDot color="red" pulse />}
              {ok && <StatusDot color="green" />}
            </div>
            <p className="text-2xs text-haven-muted">{asset.type} · {asset.ip}</p>
          </div>
        );
      })}
    </div>
  );
}
