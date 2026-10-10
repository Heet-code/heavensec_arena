import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Square, Activity, Clock, Zap, BarChart2, Eye, CheckCircle } from 'lucide-react';
import { Badge, Button, PhaseLabel, StatusDot, Card, ScoreRing, ScrollArea } from '@/components/ui';
import { useArena } from '@/contexts/ArenaContext';
import type { Agent, TelemetryEvent, Incident, Exercise } from '@/types';
import { cn } from '@/lib/utils';

// ============================================================
// LIVE ARENA
// ============================================================

const SEVERITY_DOT: Record<string, string> = {
  info: 'bg-haven-muted', low: 'bg-haven-warning', medium: 'bg-haven-warning',
  high: 'bg-haven-red', critical: 'bg-haven-red',
};

export default function LiveArenaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const exerciseIdParam = searchParams.get('exerciseId');

  const { activeExercise, telemetry, incidents, score, coach, agents,
    loadExercise, startExercise, stopExercise, pollExercise, stopPolling, loadAgents } = useArena();

  const [elapsed, setElapsed] = useState(0);
  const [displayTelemetry, setDisplayTelemetry] = useState<TelemetryEvent[]>([]);
  const telemetryEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (exerciseIdParam) loadExercise(exerciseIdParam);
    loadAgents();
  }, [exerciseIdParam]);

  useEffect(() => {
    if (activeExercise?.status === 'running' && exerciseIdParam) pollExercise(exerciseIdParam);
    return () => stopPolling();
  }, [activeExercise?.id, activeExercise?.status]);

  useEffect(() => {
    if (activeExercise?.status !== 'running') return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [activeExercise?.status]);

  useEffect(() => {
    // Stagger new telemetry events for visual effect
    const existing = new Set(displayTelemetry.map(e => e.id));
    const newEvents = telemetry.filter(e => !existing.has(e.id));
    newEvents.forEach((evt, i) => {
      setTimeout(() => {
        setDisplayTelemetry(prev => {
          if (prev.find(e => e.id === evt.id)) return prev;
          return [...prev, evt].slice(-60);
        });
      }, i * 60);
    });
  }, [telemetry.length]);

  useEffect(() => {
    telemetryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayTelemetry.length]);

  async function handleStart() {
    if (!activeExercise) return;
    await startExercise(activeExercise.id);
    pollExercise(activeExercise.id);
  }

  const redAgents = agents.filter(a => a.type === 'red-team');
  const blueAgents = agents.filter(a => a.type === 'blue-team');
  const isRunning = activeExercise?.status === 'running';
  const isCompleted = activeExercise?.status === 'completed';
  const phase = activeExercise?.currentPhase ?? 'created';
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  if (!activeExercise) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-haven-text mb-1">Live Arena</h1>
        <p className="text-sm text-haven-secondary mb-6">No active exercise running.</p>
        <Card className="p-16 flex flex-col items-center text-center">
          <Activity size={40} className="text-haven-muted mb-4" strokeWidth={1} />
          <p className="text-base font-semibold text-haven-text mb-1.5">No Exercise Running</p>
          <p className="text-sm text-haven-secondary mb-5 max-w-xs">
            Create a new exercise from Arena Setup to see the live simulation here.
          </p>
          <Button variant="primary" icon={<Play size={13} />} onClick={() => navigate('/setup')}>
            Create Exercise
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* ---- HEADER ---- */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-haven-text">Exercise #{activeExercise.number}</h1>
          <PhaseLabel phase={phase} />
          {isRunning && <StatusDot color="green" pulse />}
          <span className="text-sm text-haven-muted">{activeExercise.scenarioName}</span>
          <Badge variant="default">{activeExercise.difficulty}</Badge>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-haven-bg border border-haven-border">
              <Clock size={13} className="text-haven-muted" />
              <span className="font-mono text-sm font-semibold text-haven-text">{mm}:{ss}</span>
            </div>
          )}
          {activeExercise.status === 'created' && (
            <Button variant="primary" icon={<Play size={13} />} onClick={handleStart}>Start Simulation</Button>
          )}
          {isRunning && (
            <Button variant="danger" size="sm" icon={<Square size={13} />} onClick={() => { stopPolling(); stopExercise(activeExercise.id); }}>
              Stop
            </Button>
          )}
          {isCompleted && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={<Eye size={13} />} onClick={() => navigate('/replay')}>Replay</Button>
              <Button variant="primary" size="sm" icon={<BarChart2 size={13} />} onClick={() => navigate('/reports')}>Report</Button>
            </div>
          )}
        </div>
      </div>

      {/* ---- SCORE BANNER ---- */}
      {isCompleted && score && (
        <div className="rounded-lg border border-blue-200/60 bg-gradient-to-br from-blue-50/60 to-violet-50/50 p-5 flex items-center gap-5 flex-wrap">
          <div className="relative flex-shrink-0">
            <ScoreRing score={score.overall} size={72} strokeWidth={7} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-haven-text">{score.overall}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-haven-text mb-1">Exercise Complete — Score: {score.overall}/100</p>
            <p className="text-xs text-haven-secondary leading-relaxed mb-2">{score.summary}</p>
            <div className="flex gap-1.5 flex-wrap">
              {score.categories.map(c => (
                <span key={c.category} className={cn(
                  'text-2xs font-semibold px-2 py-0.5 rounded border',
                  c.score >= 80 ? 'bg-green-50 text-green-700 border-green-200'
                    : c.score >= 65 ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                )}>
                  {c.category}: {c.score}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="primary" size="sm" icon={<Zap size={12} />} onClick={() => navigate('/coach')}>Coach Recommendations</Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/setup?mode=auto')}>Next Exercise</Button>
          </div>
        </div>
      )}

      {/* ---- MAIN 3-COLUMN ---- */}
      <div className="grid grid-cols-[220px_1fr_220px] gap-4">
        {/* RED TEAM */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-haven-red" />
            <span className="text-2xs font-bold text-haven-red uppercase tracking-wider">Red Team</span>
          </div>
          <div className="space-y-2">
            {redAgents.length === 0
              ? <Card className="p-3 text-center text-xs text-haven-muted">Agents idle</Card>
              : redAgents.map(a => <AgentCard key={a.id} agent={a} team="red" />)
            }
          </div>
        </div>

        {/* CENTER — Environment */}
        <Card className="p-0 overflow-hidden">
          <div className="border-b border-haven-border px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-haven-text">Synthetic Environment — Acme Web Platform</span>
            <Badge variant="success" dot>Active</Badge>
          </div>
          <EnvironmentGraph phase={phase} incidents={incidents} />
        </Card>

        {/* BLUE TEAM */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-haven-primary" />
            <span className="text-2xs font-bold text-haven-primary uppercase tracking-wider">Blue Team</span>
          </div>
          <div className="space-y-2">
            {blueAgents.length === 0
              ? <Card className="p-3 text-center text-xs text-haven-muted">Agents idle</Card>
              : blueAgents.map(a => <AgentCard key={a.id} agent={a} team="blue" />)
            }
          </div>
        </div>
      </div>

      {/* ---- TELEMETRY STREAM ---- */}
      <Card className="p-0 overflow-hidden">
        <div className="border-b border-haven-border px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={13} className="text-haven-muted" />
            <span className="text-xs font-semibold text-haven-text">Live Telemetry Stream</span>
            {isRunning && <StatusDot color="green" pulse size="sm" />}
          </div>
          <span className="text-2xs text-haven-muted">{displayTelemetry.length} events</span>
        </div>
        <div className="h-48 overflow-y-auto">
          {displayTelemetry.length === 0 ? (
            <p className="text-xs text-haven-muted text-center py-10">
              {isRunning ? 'Waiting for telemetry…' : 'Start simulation to see telemetry'}
            </p>
          ) : (
            <>
              {displayTelemetry.map(evt => <TelemetryRow key={evt.id} event={evt} />)}
              <div ref={telemetryEndRef} />
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

// ---- AGENT CARD ----

function AgentCard({ agent, team }: { agent: Agent; team: 'red' | 'blue' }) {
  const activeColor = team === 'red' ? 'border-red-200 bg-red-50/40' : 'border-blue-200 bg-blue-50/40';
  const dotColor = team === 'red' ? 'bg-haven-red' : 'bg-haven-primary';
  const barColor = team === 'red' ? '#dc2626' : '#3b82d4';
  const isActive = agent.status === 'running';

  return (
    <Card className={cn('p-3 transition-all duration-200', isActive && activeColor)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-haven-text leading-tight">{agent.name}</span>
        <div className="flex items-center gap-1">
          <span className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotColor,
            isActive && 'animate-pulse'
          )} />
          <span className="text-2xs text-haven-muted capitalize">{agent.status}</span>
        </div>
      </div>
      {agent.currentTask && (
        <p className="text-2xs text-haven-secondary leading-snug mb-2">{agent.currentTask}</p>
      )}
      {agent.confidence > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-haven-bg rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${agent.confidence}%`, backgroundColor: barColor, transition: 'width 0.5s ease' }} />
          </div>
          <span className="text-2xs text-haven-muted w-7 text-right">{agent.confidence}%</span>
        </div>
      )}
    </Card>
  );
}

// ---- ENVIRONMENT GRAPH (SVG) ----

function EnvironmentGraph({ phase, incidents }: { phase: string; incidents: Incident[] }) {
  const affected  = new Set(incidents.flatMap(i => i.affectedAssets));
  const contained = new Set(incidents.filter(i => ['contained','resolved'].includes(i.status)).flatMap(i => i.affectedAssets));

  const nodes = [
    { id: 'internet', label: 'Internet', sub: 'external',  x: 340, y: 32,  type: 'ext' },
    { id: 'WEB-01',  label: 'WEB-01',  sub: '10.0.1.10',  x: 340, y: 115, type: 'web' },
    { id: 'AUTH-01', label: 'AUTH-01', sub: '10.0.2.10',  x: 190, y: 205, type: 'auth' },
    { id: 'API-01',  label: 'API-01',  sub: '10.0.1.20',  x: 340, y: 205, type: 'api' },
    { id: 'FILE-01', label: 'FILE-01', sub: '10.0.3.20',  x: 490, y: 205, type: 'file' },
    { id: 'DB-01',   label: 'DB-01',   sub: '10.0.3.10',  x: 340, y: 295, type: 'db' },
  ];
  const edges = [
    ['internet','WEB-01'],['WEB-01','AUTH-01'],['WEB-01','API-01'],['WEB-01','FILE-01'],['API-01','DB-01'],
  ];

  const ATTACK_PHASES: Record<string,string[]> = {
    running: ['WEB-01'], detecting: ['WEB-01','AUTH-01'],
    investigating: ['AUTH-01','API-01'], responding: ['AUTH-01','API-01'],
    containing: ['API-01'], evaluating: [], completed: [],
  };
  const inAttack = new Set(ATTACK_PHASES[phase] ?? []);

  const fill  = (id: string) => contained.has(id) ? '#f0fdf4' : affected.has(id) ? '#fff1f2' : '#fff';
  const stroke= (id: string) => contained.has(id) ? '#16a34a' : inAttack.has(id) ? '#ef4444' : '#e5e7eb';

  return (
    <div className="flex justify-center p-4">
      <svg viewBox="0 0 680 340" className="w-full max-h-72">
        <defs>
          <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill="#d1d5db" />
          </marker>
          <marker id="arr-att" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill="#fca5a5" />
          </marker>
        </defs>

        {edges.map(([f, t]) => {
          const fn = nodes.find(n => n.id === f)!;
          const tn = nodes.find(n => n.id === t)!;
          const atk = inAttack.has(f) && (affected.has(t) || inAttack.has(t));
          const dx = tn.x - fn.x, dy = tn.y - fn.y;
          const len = Math.sqrt(dx*dx + dy*dy);
          return (
            <line key={`${f}-${t}`}
              x1={fn.x + dx/len*44} y1={fn.y + dy/len*20}
              x2={tn.x - dx/len*44} y2={tn.y - dy/len*20}
              stroke={atk ? '#fca5a5' : '#e5e7eb'} strokeWidth={atk ? 2 : 1.5}
              strokeDasharray={atk ? '6,4' : undefined}
              markerEnd={atk ? 'url(#arr-att)' : 'url(#arr)'}
            />
          );
        })}

        {nodes.map(n => (
          <g key={n.id} transform={`translate(${n.x},${n.y})`}>
            {inAttack.has(n.id) && (
              <rect x="-52" y="-22" width="104" height="44" rx="10" fill="none" stroke="#fca5a5" strokeWidth="1.5">
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
              </rect>
            )}
            <rect x="-48" y="-20" width="96" height="40" rx="8"
              fill={fill(n.id)} stroke={stroke(n.id)} strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.05))' }}
            />
            <text textAnchor="middle" dy="-4" fontSize="11" fontWeight="600"
              fill={n.id === 'internet' ? '#9ca3af' : '#1f2328'} fontFamily="Inter,sans-serif">
              {n.label}
            </text>
            <text textAnchor="middle" dy="10" fontSize="9" fill="#9ca3af" fontFamily="'JetBrains Mono',monospace">
              {n.sub}
            </text>
            {contained.has(n.id) && <circle cx="44" cy="-14" r="5" fill="#16a34a" />}
            {affected.has(n.id) && !contained.has(n.id) && (
              <circle cx="44" cy="-14" r="5" fill="#ef4444">
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ---- TELEMETRY ROW ----

function TelemetryRow({ event }: { event: TelemetryEvent }) {
  const time = new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false });
  return (
    <div className="grid grid-cols-[80px_60px_110px_1fr] gap-2 items-center px-4 py-1 border-b border-haven-bg hover:bg-haven-bg/50 animate-slide-in-right">
      <span className="font-mono text-2xs text-haven-muted">{time}</span>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0 justify-self-start mt-px', SEVERITY_DOT[event.severity])} />
      <span className="font-mono text-2xs text-haven-secondary truncate">{event.sourceAsset}</span>
      <span className="font-mono text-2xs text-haven-text truncate">{event.type} · {event.actor}</span>
    </div>
  );
}
