import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Card, Badge, Button, Skeleton, EmptyState } from '../components/ui';
import { useArena } from '../contexts/ArenaContext';
import type { ReplayData, ReplayEvent } from '../types';
import { HISTORICAL_EXERCISES } from '../data/mockData';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

const PHASE_BG: Record<string, string> = {
  preparing:    'bg-gray-50 text-gray-500',
  running:      'bg-blue-50 text-haven-primary',
  detecting:    'bg-amber-50 text-amber-700',
  investigating:'bg-amber-50 text-amber-700',
  responding:   'bg-red-50 text-haven-red',
  containing:   'bg-red-50 text-haven-red',
  evaluating:   'bg-violet-50 text-haven-ai',
  completed:    'bg-green-50 text-haven-success',
};

const AGENT_DOT: Record<string, string> = {
  orchestrator:   'bg-haven-ai',
  'red-team':     'bg-haven-red',
  'blue-team':    'bg-haven-primary',
  referee:        'bg-haven-warning',
  'security-coach': 'bg-haven-success',
};

const AGENT_TEXT: Record<string, string> = {
  orchestrator:   'text-haven-ai',
  'red-team':     'text-haven-red',
  'blue-team':    'text-haven-primary',
  referee:        'text-haven-warning',
  'security-coach': 'text-haven-success',
};

export default function ReplayPage() {
  const { activeExercise } = useArena();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    activeExercise?.id || HISTORICAL_EXERCISES[2].id
  );
  const [replay, setReplay] = useState<ReplayData | null>(null);
  const [currentEventIdx, setCurrentEventIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedExerciseId) loadReplay(selectedExerciseId);
  }, [selectedExerciseId]);

  useEffect(() => {
    if (isPlaying && replay) {
      intervalRef.current = setInterval(() => {
        setCurrentEventIdx((idx) => {
          if (idx >= replay.events.length - 1) {
            setIsPlaying(false);
            return idx;
          }
          return idx + 1;
        });
      }, 1500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, replay]);

  // Auto-scroll timeline to active event
  useEffect(() => {
    if (timelineRef.current) {
      const activeEl = timelineRef.current.querySelector('[data-active="true"]');
      activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentEventIdx]);

  async function loadReplay(id: string) {
    setLoading(true);
    try {
      const data = await api.getReplay(id) as ReplayData;
      setReplay(data);
      setCurrentEventIdx(0);
    } catch {
      setReplay(null);
    }
    setLoading(false);
  }

  const currentEvent = replay?.events[currentEventIdx];
  const allExercises = [
    ...(activeExercise ? [activeExercise] : []),
    ...HISTORICAL_EXERCISES.filter((ex) => ex.id !== activeExercise?.id),
  ];
  const progress = replay ? ((currentEventIdx + 1) / replay.events.length) * 100 : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-haven-text">Exercise Replay</h1>
          <p className="text-xs text-haven-secondary mt-0.5">
            Step through the exercise timeline and inspect agent decisions
          </p>
        </div>
        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-haven-border text-xs font-medium bg-white text-haven-text focus:outline-none focus:ring-2 focus:ring-haven-primary focus:border-transparent"
        >
          {allExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              Exercise #{ex.number} — {ex.scenarioName}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-[1fr_1.4fr] gap-4">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      ) : !replay ? (
        <EmptyState
          icon={<Clock size={36} className="text-haven-border-strong" strokeWidth={1.5} />}
          title="No Replay Available"
          description="Complete a simulation to view its replay here."
        />
      ) : (
        <div className="space-y-4">
          {/* Playback Controls */}
          <Card className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setCurrentEventIdx((i) => Math.max(0, i - 1)); setIsPlaying(false); }}
                  disabled={currentEventIdx === 0}
                  aria-label="Previous event"
                >
                  <ChevronLeft size={14} />
                  Prev
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setCurrentEventIdx((i) => Math.min(replay.events.length - 1, i + 1)); setIsPlaying(false); }}
                  disabled={currentEventIdx === replay.events.length - 1}
                  aria-label="Next event"
                >
                  Next
                  <ChevronRight size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setCurrentEventIdx(0); setIsPlaying(false); }}
                  aria-label="Reset"
                >
                  <RotateCcw size={14} />
                  Reset
                </Button>
              </div>

              {/* Scrubber */}
              <div className="flex-1 min-w-48">
                <input
                  type="range"
                  min={0}
                  max={replay.events.length - 1}
                  value={currentEventIdx}
                  onChange={(e) => { setCurrentEventIdx(Number(e.target.value)); setIsPlaying(false); }}
                  className="w-full accent-haven-primary h-1.5 rounded-full"
                  aria-label="Timeline scrubber"
                />
                <div className="h-1 mt-1 bg-haven-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-haven-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <span className="text-xs text-haven-secondary font-mono tabular-nums flex-shrink-0">
                {currentEventIdx + 1} / {replay.events.length}
              </span>
            </div>
          </Card>

          {/* Timeline + Detail */}
          <div className="grid grid-cols-[1fr_1.4fr] gap-4">
            {/* Timeline list */}
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-haven-border">
                <span className="text-xs font-semibold text-haven-text">Timeline</span>
              </div>
              <div ref={timelineRef} className="max-h-[520px] overflow-y-auto divide-y divide-haven-bg">
                {replay.events.map((evt, i) => {
                  const isActive = i === currentEventIdx;
                  const isPast = i < currentEventIdx;
                  const dotColor = AGENT_DOT[evt.agentType] || 'bg-gray-400';
                  const textColor = AGENT_TEXT[evt.agentType] || 'text-gray-500';

                  return (
                    <button
                      key={evt.id}
                      data-active={isActive}
                      onClick={() => { setCurrentEventIdx(i); setIsPlaying(false); }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 transition-colors duration-100 border-l-2',
                        isActive
                          ? 'bg-haven-bg border-haven-primary'
                          : 'border-transparent hover:bg-haven-bg/60',
                        !isActive && !isPast ? 'opacity-40' : 'opacity-100',
                      )}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider', PHASE_BG[evt.phase] || 'bg-gray-50 text-gray-500')}>
                          T+{evt.time}s
                        </span>
                        <span className={cn('text-[10px] font-semibold', textColor)}>
                          {evt.agentName}
                        </span>
                      </div>
                      <p className={cn('text-xs leading-snug', isActive ? 'font-semibold text-haven-text' : 'font-normal text-haven-text/80')}>
                        {evt.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Event detail */}
            {currentEvent ? (
              <div className="space-y-3">
                {/* Main event card */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn('h-2 w-2 rounded-full flex-shrink-0', AGENT_DOT[currentEvent.agentType] || 'bg-gray-400')} />
                    <span className={cn('text-[10px] font-semibold uppercase tracking-wider font-mono', AGENT_TEXT[currentEvent.agentType] || 'text-gray-500')}>
                      T+{currentEvent.time}s · {currentEvent.agentName}
                    </span>
                    <Badge
                      variant="default"
                      className={cn('ml-auto text-[10px]', PHASE_BG[currentEvent.phase])}
                    >
                      {currentEvent.phase}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-haven-text mb-2">{currentEvent.title}</h3>
                  <p className="text-xs text-haven-secondary leading-relaxed">{currentEvent.description}</p>
                </Card>

                {/* Drill-down details */}
                <Card className="p-4">
                  <div className="space-y-4">
                    {[
                      { label: 'What Happened',      value: currentEvent.whatHappened,    muted: false },
                      { label: 'Why It Happened',    value: currentEvent.whyItHappened,   muted: true  },
                      { label: 'What Happened Next', value: currentEvent.whatHappenedNext, muted: true  },
                    ].map(({ label, value, muted }) => (
                      <div key={label}>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          {label}
                        </p>
                        <p className={cn('text-xs leading-relaxed', muted ? 'text-haven-secondary' : 'text-haven-text')}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="flex items-center justify-center p-12">
                <p className="text-xs text-haven-secondary">Select an event to view details</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
