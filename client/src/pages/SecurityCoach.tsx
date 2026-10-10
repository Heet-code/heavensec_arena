import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, AlertCircle, CheckCircle, ArrowRight,
  Play, ChevronUp, ChevronDown, TrendingUp, TrendingDown,
} from 'lucide-react';
import { Card, Badge, Button, ScoreRing, Skeleton, EmptyState } from '../components/ui';
import { useArena } from '../contexts/ArenaContext';
import type { CoachRecommendation } from '../types';
import { HISTORICAL_EXERCISES } from '../data/mockData';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

const PRIORITY_VARIANT: Record<string, 'danger' | 'warning' | 'default' | 'info'> = {
  critical: 'danger', high: 'danger', medium: 'warning', low: 'default',
};

const PRIORITY_BAR: Record<string, string> = {
  critical: 'bg-red-500', high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-gray-300',
};

export default function SecurityCoachPage() {
  const navigate = useNavigate();
  const { activeExercise, coach: liveCoach } = useArena();

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    activeExercise?.id || HISTORICAL_EXERCISES[2].id
  );
  const [coach, setCoach] = useState<CoachRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedRec, setExpandedRec] = useState<number | null>(0);

  useEffect(() => {
    if (activeExercise?.id === selectedExerciseId && liveCoach) {
      setCoach(liveCoach);
    } else if (selectedExerciseId) {
      loadCoach(selectedExerciseId);
    }
  }, [selectedExerciseId, liveCoach]);

  async function loadCoach(id: string) {
    setLoading(true);
    try {
      const data = await api.getCoach(id) as CoachRecommendation;
      setCoach(data);
    } catch {
      setCoach(null);
    }
    setLoading(false);
  }

  const allExercises = [
    ...(activeExercise ? [activeExercise] : []),
    ...HISTORICAL_EXERCISES.filter((ex) => ex.id !== activeExercise?.id),
  ];

  const latestScore = HISTORICAL_EXERCISES[2].score;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-haven-text">Security Coach</h1>
          <p className="text-xs text-haven-secondary mt-0.5">
            AI-powered improvement recommendations and adaptive exercise planning
          </p>
        </div>
        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-haven-border text-xs font-medium bg-white text-haven-text focus:outline-none focus:ring-2 focus:ring-haven-primary"
        >
          {allExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              Exercise #{ex.number} — {ex.scenarioName}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-[auto_1fr] gap-4">
            <Skeleton className="h-28 w-56" />
            <Skeleton className="h-28 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !coach ? (
        <EmptyState
          icon={<GraduationCap size={40} className="text-haven-border-strong" strokeWidth={1.5} />}
          title="No Recommendations Available"
          description="Complete an exercise to receive Security Coach recommendations."
          action={
            <Button variant="primary" onClick={() => navigate('/setup')}>
              <Play size={14} />
              Start Exercise
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {/* Score summary */}
          {latestScore && (
            <div className="grid grid-cols-[auto_1fr] gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <ScoreRing score={latestScore.overall} size={80} strokeWidth={8} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-haven-text">{latestScore.overall}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-haven-secondary mb-1">
                      Overall Score
                    </p>
                    <p className="text-2xl font-extrabold text-haven-text leading-none">
                      {latestScore.overall}<span className="text-sm font-normal text-haven-secondary">/100</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">Exercise #07</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold text-haven-text mb-2">Exercise Summary</p>
                <p className="text-xs text-haven-secondary leading-relaxed">{latestScore.summary}</p>

                {/* Mini category bars */}
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                  {latestScore.categories.map((cat) => {
                    const color = cat.score >= 80 ? 'bg-haven-success' : cat.score >= 65 ? 'bg-haven-warning' : 'bg-haven-red';
                    return (
                      <div key={cat.category}>
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[10px] text-haven-secondary">{cat.category}</span>
                          <span className={cn('text-[10px] font-bold', cat.score >= 80 ? 'text-haven-success' : cat.score >= 65 ? 'text-amber-600' : 'text-haven-red')}>
                            {cat.score}
                          </span>
                        </div>
                        <div className="h-1 bg-haven-bg rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', color)} style={{ width: `${cat.score}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Strengths / Weaknesses */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-md bg-green-50 flex items-center justify-center">
                  <CheckCircle size={13} className="text-haven-success" />
                </div>
                <span className="text-xs font-semibold text-haven-text">Strengths</span>
              </div>
              <div className="space-y-2">
                {coach.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
                    <CheckCircle size={11} className="text-haven-success flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] text-green-800 leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-md bg-amber-50 flex items-center justify-center">
                  <AlertCircle size={13} className="text-haven-warning" />
                </div>
                <span className="text-xs font-semibold text-haven-text">Needs Improvement</span>
              </div>
              <div className="space-y-2">
                {coach.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-100">
                    <AlertCircle size={11} className="text-haven-warning flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] text-amber-900 leading-relaxed">{w}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recommendations accordion */}
          <Card className="p-4">
            <p className="text-xs font-semibold text-haven-text mb-3">Improvement Recommendations</p>
            <div className="space-y-2">
              {coach.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="border border-haven-border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedRec(expandedRec === i ? null : i)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors',
                      expandedRec === i ? 'bg-haven-bg' : 'bg-white hover:bg-haven-bg/60',
                    )}
                  >
                    <div className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', PRIORITY_BAR[rec.priority] || 'bg-gray-300')} />
                    <Badge variant={PRIORITY_VARIANT[rec.priority]} className="flex-shrink-0 text-[10px]">
                      {rec.priority}
                    </Badge>
                    <span className="text-[11px] font-semibold text-haven-secondary flex-shrink-0">{rec.area}</span>
                    <span className="text-xs text-haven-text flex-1 min-w-0 truncate">{rec.recommendation}</span>
                    {expandedRec === i
                      ? <ChevronUp size={13} className="text-gray-400 flex-shrink-0" />
                      : <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
                    }
                  </button>
                  {expandedRec === i && (
                    <div className="px-4 py-3 border-t border-haven-border bg-haven-bg/50 space-y-3">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Finding</p>
                        <p className="text-xs text-haven-text leading-relaxed">{rec.finding}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Rationale</p>
                        <p className="text-xs text-haven-secondary leading-relaxed italic">{rec.rationale}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Next exercise recommendation */}
          <div className="rounded-xl border-2 border-indigo-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-haven-ai flex items-center justify-center flex-shrink-0">
                <ArrowRight size={13} className="text-white" />
              </div>
              <span className="text-[11px] font-semibold text-haven-ai uppercase tracking-wider">
                Recommended Next Exercise
              </span>
              <Badge variant="ai" className="ml-auto text-[10px]">Adaptive</Badge>
            </div>

            <div className="flex items-start justify-between gap-5 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-haven-text mb-1">
                  {coach.nextExercise.scenarioName}
                </p>
                <p className="text-xs text-haven-secondary leading-relaxed mb-3">
                  {coach.nextExercise.rationale}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="warning" className="text-[10px]">{coach.nextExercise.difficulty}</Badge>
                  {coach.nextExercise.focusAreas.map((f) => (
                    <Badge key={f} variant="primary" className="text-[10px]">{f}</Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/setup?mode=auto')}
                className="flex-shrink-0"
              >
                <Play size={13} />
                Start Next Exercise
              </Button>
            </div>
          </div>

          {/* Adaptive loop progression */}
          <Card className="p-4">
            <p className="text-xs font-semibold text-haven-text mb-3">Adaptive Improvement Loop</p>
            <div className="flex items-stretch gap-0">
              {HISTORICAL_EXERCISES.map((ex, i) => {
                const score = ex.score?.overall || 0;
                const prev = i > 0 ? HISTORICAL_EXERCISES[i - 1].score?.overall || 0 : null;
                const improved = prev !== null && score > prev;
                const declined = prev !== null && score < prev;
                return (
                  <React.Fragment key={ex.id}>
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2',
                        score >= 80 ? 'bg-green-50 border-haven-success text-haven-success'
                          : score >= 65 ? 'bg-amber-50 border-amber-400 text-amber-600'
                          : 'bg-red-50 border-red-300 text-haven-red',
                      )}>
                        {score}
                      </div>
                      <p className="text-[10px] text-haven-secondary text-center leading-tight">
                        #{ex.number}<br />
                        <span className="text-gray-400">{ex.scenarioName.split(' ').slice(0, 2).join(' ')}</span>
                      </p>
                    </div>
                    {i < HISTORICAL_EXERCISES.length - 1 && (
                      <div className="flex items-start pt-3 px-1">
                        {improved ? (
                          <TrendingUp size={12} className="text-haven-success" />
                        ) : declined ? (
                          <TrendingDown size={12} className="text-haven-red" />
                        ) : (
                          <ArrowRight size={12} className="text-gray-300" />
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              {/* Next (recommended) */}
              <div className="flex items-start pt-3 px-1">
                <ArrowRight size={12} className="text-haven-ai" />
              </div>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-dashed border-haven-ai bg-indigo-50 text-haven-ai">
                  ?
                </div>
                <p className="text-[10px] text-haven-ai text-center leading-tight font-medium">
                  Next<br />
                  <span className="text-gray-400">Adaptive</span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
