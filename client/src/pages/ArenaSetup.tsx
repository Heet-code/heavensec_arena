import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FlaskConical, Zap, Play, RefreshCw, CheckCircle } from 'lucide-react';
import {
  Card, Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent, Skeleton,
} from '@/components/ui';
import { useArena } from '@/contexts/ArenaContext';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ============================================================
// SCENARIO DATA
// ============================================================

const SCENARIOS = [
  { id: 'scenario-suspicious-auth',       name: 'Suspicious Authentication',       category: 'Authentication',     difficulty: 'beginner',     description: 'Simulates credential-based attack patterns including brute force and credential stuffing.' },
  { id: 'scenario-api-security',          name: 'API Security Detection',          category: 'API Security',       difficulty: 'intermediate', description: 'Simulates API abuse patterns including excessive requests and unauthorized data access.' },
  { id: 'scenario-web-misconfig',         name: 'Web Application Misconfiguration', category: 'Web Security',      difficulty: 'beginner',     description: 'Simulates exploitation of common web misconfigurations and exposed admin endpoints.' },
  { id: 'scenario-credential-compromise', name: 'Credential Compromise Simulation',category: 'Privilege Management', difficulty: 'advanced',  description: 'Full credential compromise scenario including lateral movement and privilege escalation.' },
  { id: 'scenario-privilege-escalation',  name: 'Privilege Escalation Simulation', category: 'Privilege Management', difficulty: 'intermediate', description: 'Simulates privilege escalation from service account to admin on critical systems.' },
  { id: 'scenario-data-access-anomaly',   name: 'Data Access Anomaly',             category: 'Data Protection',   difficulty: 'intermediate', description: 'Simulates anomalous bulk data exports and cross-system unauthorized queries.' },
];

const ASSETS    = ['WEB-01', 'API-01', 'AUTH-01', 'DB-01', 'FILE-01'];
const CATEGORIES = ['Authentication', 'API Security', 'Web Security', 'Privilege Management', 'Data Protection', 'Endpoint Security', 'Network Security'];
const CONDITIONS = [
  'Standard synthetic environment conditions',
  'Attacker has valid low-privileged credentials',
  'Attacker has username list from previous exercise',
  'Attacker has valid API credentials',
  'Attacker has internal network access',
];

const DIFF_BADGE: Record<string, 'success' | 'warning' | 'danger'> = {
  beginner: 'success', intermediate: 'warning', advanced: 'danger',
};

interface AutoRec {
  scenario: { id: string; name: string; description: string; difficulty: string; category: string };
  recommendation: { reason: string; focusAreas: string[]; confidence: number; basedOn: string[] };
}

// ============================================================
// PAGE
// ============================================================

export default function ArenaSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createExercise } = useArena();

  const defaultTab = searchParams.get('mode') === 'auto' ? 'auto' : 'manual';

  const [selectedScenarioId, setSelectedScenarioId] = useState('scenario-api-security');
  const [difficulty, setDifficulty]   = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [targetAsset, setTargetAsset] = useState('API-01');
  const [category, setCategory]       = useState('API Security');
  const [condition, setCondition]     = useState(CONDITIONS[3]);
  const [duration, setDuration]       = useState(1800);
  const [creating, setCreating]       = useState(false);

  const [autoRec,      setAutoRec]     = useState<AutoRec | null>(null);
  const [autoLoading,  setAutoLoading] = useState(false);

  useEffect(() => {
    if (defaultTab === 'auto' && !autoRec) fetchAuto();
  }, []);

  async function fetchAuto() {
    setAutoLoading(true);
    try {
      const data = await api.generateScenario() as AutoRec;
      setAutoRec(data);
    } catch {
      // use fallback
      setAutoRec({
        scenario: { id: 'scenario-api-security', name: 'API Security Detection', difficulty: 'intermediate', category: 'API Security',
          description: 'Simulates API abuse patterns including excessive requests, parameter tampering, and data extraction.' },
        recommendation: {
          reason: 'Your previous exercises show strong authentication detection (91%) but weaker API anomaly investigation and containment (61%). This exercise directly addresses those gaps.',
          focusAreas: ['Containment Automation', 'API Investigation Depth'],
          confidence: 0.94,
          basedOn: ['3 previous exercises analyzed', 'Containment trend: 63→74→61 (declining)', 'API-01 has exposed endpoints', 'API abuse is top-3 attack vector for web platforms'],
        },
      });
    }
    setAutoLoading(false);
  }

  async function startManual() {
    setCreating(true);
    try {
      const s = SCENARIOS.find(sc => sc.id === selectedScenarioId)!;
      const ex = await createExercise({
        scenarioId: s.id, scenario: s.name, difficulty, targetAsset,
        techniqueCategory: category, startingCondition: condition,
        simulationDuration: duration, mode: 'manual',
        redTeamAgents: ['agent-red-alpha', 'agent-red-beta'],
        blueTeamAgents: ['agent-blue-sentinel', 'agent-investigation-analyst', 'agent-response-commander'],
      });
      navigate(`/arena?exerciseId=${ex.id}`);
    } catch { setCreating(false); }
  }

  async function startAuto() {
    if (!autoRec) return;
    setCreating(true);
    try {
      const ex = await createExercise({
        scenarioId: autoRec.scenario.id, scenario: autoRec.scenario.name,
        difficulty: autoRec.scenario.difficulty as 'intermediate', targetAsset: 'API-01',
        techniqueCategory: autoRec.scenario.category, startingCondition: CONDITIONS[3],
        simulationDuration: 1800, mode: 'adaptive',
        redTeamAgents: ['agent-red-alpha', 'agent-red-beta'],
        blueTeamAgents: ['agent-blue-sentinel', 'agent-investigation-analyst', 'agent-response-commander'],
      });
      navigate(`/arena?exerciseId=${ex.id}`);
    } catch { setCreating(false); }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-haven-text">Create Exercise</h1>
        <p className="text-sm text-haven-secondary mt-1">Configure a controlled cyber-resilience exercise in the synthetic environment</p>
      </div>

      <Tabs defaultValue={defaultTab} onValueChange={(v) => { if (v === 'auto' && !autoRec) fetchAuto(); }}>
        <TabsList className="mb-6">
          <TabsTrigger value="manual" className="gap-1.5">
            <FlaskConical size={13} /> Manual
          </TabsTrigger>
          <TabsTrigger value="auto" className="gap-1.5">
            <Zap size={13} className="text-haven-ai" /> AI Auto
          </TabsTrigger>
        </TabsList>

        {/* ========== MANUAL ========== */}
        <TabsContent value="manual">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Scenario picker */}
            <div className="lg:col-span-3">
              <Card className="p-5">
                <p className="text-sm font-semibold text-haven-text mb-4">Threat Scenario</p>
                <div className="space-y-2">
                  {SCENARIOS.map(s => {
                    const active = selectedScenarioId === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedScenarioId(s.id); setCategory(s.category); }}
                        className={cn(
                          'w-full text-left rounded-lg border p-3.5 transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haven-primary',
                          active
                            ? 'border-haven-primary bg-haven-primary-light'
                            : 'border-haven-border bg-white hover:border-haven-border-strong hover:bg-haven-bg'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-haven-text leading-tight">{s.name}</p>
                            <p className="text-xs text-haven-muted mt-0.5">{s.category}</p>
                            {active && <p className="text-xs text-haven-secondary mt-1.5 leading-relaxed">{s.description}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={DIFF_BADGE[s.difficulty]}>{s.difficulty}</Badge>
                            {active && <CheckCircle size={14} className="text-haven-primary" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Config panel */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-5">
                <p className="text-sm font-semibold text-haven-text mb-4">Exercise Parameters</p>
                <div className="space-y-3.5">
                  <SelectField label="Difficulty" value={difficulty} onChange={v => setDifficulty(v as typeof difficulty)}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </SelectField>
                  <SelectField label="Target Asset" value={targetAsset} onChange={setTargetAsset}>
                    {ASSETS.map(a => <option key={a}>{a}</option>)}
                  </SelectField>
                  <SelectField label="Technique Category" value={category} onChange={setCategory}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </SelectField>
                  <SelectField label="Starting Condition" value={condition} onChange={setCondition}>
                    {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                  </SelectField>
                  <SelectField label="Duration" value={String(duration)} onChange={v => setDuration(Number(v))}>
                    <option value="900">15 minutes</option>
                    <option value="1800">30 minutes</option>
                    <option value="3600">60 minutes</option>
                  </SelectField>
                </div>
              </Card>

              {/* Agents */}
              <Card className="p-5">
                <p className="text-sm font-semibold text-haven-text mb-3">Agent Deployment</p>
                <div className="space-y-1.5">
                  <p className="text-2xs font-bold text-haven-red uppercase tracking-wider mb-1">Red Team</p>
                  {['Red Team Alpha', 'Red Team Beta'].map(a => <AgentRow key={a} name={a} color="#dc2626" />)}
                  <div className="pt-2">
                    <p className="text-2xs font-bold text-haven-primary uppercase tracking-wider mb-1">Blue Team</p>
                    {['Blue Team Sentinel', 'Investigation Analyst', 'Response Commander'].map(a => <AgentRow key={a} name={a} color="#3b82d4" />)}
                  </div>
                </div>
              </Card>

              <Button
                variant="primary" size="lg" className="w-full"
                icon={<Play size={14} />} loading={creating}
                onClick={startManual}
              >
                Configure &amp; Start Simulation
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ========== AUTO ========== */}
        <TabsContent value="auto">
          {autoLoading ? (
            <AutoLoadingState />
          ) : autoRec ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Recommendation */}
              <div className="lg:col-span-3 space-y-4">
                <Card className="p-5 border-haven-ai/30 bg-gradient-to-br from-violet-50/40 to-blue-50/30">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-haven-ai flex items-center justify-center">
                      <Zap size={12} className="text-white" />
                    </div>
                    <span className="text-2xs font-bold text-haven-ai uppercase tracking-wider">AI-Generated Exercise</span>
                    <Badge variant="ai">{Math.round(autoRec.recommendation.confidence * 100)}% confidence</Badge>
                  </div>
                  <p className="text-xs font-semibold text-haven-muted uppercase tracking-wider mb-2">Based on:</p>
                  <div className="space-y-1.5 mb-4">
                    {autoRec.recommendation.basedOn.map((b, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={11} className="text-haven-ai flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-haven-secondary">{b}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/80 rounded-md p-3 border border-haven-border">
                    <p className="text-xs text-haven-secondary leading-relaxed italic">"{autoRec.recommendation.reason}"</p>
                  </div>
                </Card>

                <Card className="p-5 border-haven-primary/30">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-lg font-bold text-haven-text">{autoRec.scenario.name}</p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        <Badge variant="default">{autoRec.scenario.category}</Badge>
                        <Badge variant={DIFF_BADGE[autoRec.scenario.difficulty] ?? 'warning'}>{autoRec.scenario.difficulty}</Badge>
                        <Badge variant="ai">AI Recommended</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-haven-secondary leading-relaxed mb-3">{autoRec.scenario.description}</p>
                  <p className="text-2xs font-bold text-haven-ai uppercase tracking-wider mb-2">Recommended Focus Areas</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {autoRec.recommendation.focusAreas.map(f => <Badge key={f} variant="ai">{f}</Badge>)}
                  </div>
                </Card>
              </div>

              {/* Actions panel */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="p-5">
                  <p className="text-sm font-semibold text-haven-text mb-3">Synthetic Environment</p>
                  <div className="space-y-1.5">
                    {ASSETS.map(asset => (
                      <div key={asset} className="flex items-center justify-between">
                        <span className="font-mono text-xs text-haven-text">{asset}</span>
                        <Badge variant="success" dot>Normal</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <p className="text-sm font-semibold text-haven-text mb-3">Agent Deployment</p>
                  <div className="space-y-1.5">
                    {['Red Team Alpha', 'Red Team Beta'].map(a => <AgentRow key={a} name={a} color="#dc2626" label="Red" />)}
                    {['Blue Team Sentinel', 'Investigation Analyst', 'Response Commander'].map(a => <AgentRow key={a} name={a} color="#3b82d4" label="Blue" />)}
                    <AgentRow name="Referee" color="#d97706" label="Eval" />
                  </div>
                </Card>

                <div className="space-y-2">
                  <Button variant="primary" size="lg" className="w-full" icon={<Play size={14} />} loading={creating} onClick={startAuto}>
                    Accept &amp; Start Simulation
                  </Button>
                  <Button variant="secondary" size="md" className="w-full" icon={<RefreshCw size={13} />} onClick={fetchAuto}>
                    Generate Another
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---- HELPERS ----

function SelectField({ label, value, onChange, children }: {
  label: string; value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-haven-secondary mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-9 px-3 rounded-md border border-haven-border bg-white text-sm text-haven-text focus:outline-none focus:ring-2 focus:ring-haven-primary cursor-pointer"
      >
        {children}
      </select>
    </div>
  );
}

function AgentRow({ name, color, label }: { name: string; color: string; label?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs text-haven-secondary">{name}</span>
      </div>
      {label && <span className="text-2xs font-bold uppercase" style={{ color }}>{label}</span>}
    </div>
  );
}

function AutoLoadingState() {
  const steps = ['Analyzing environment...', 'Reviewing exercise history...', 'Identifying weaknesses...', 'Selecting optimal scenario...'];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 700);
    return () => clearInterval(t);
  }, []);

  return (
    <Card className="p-12">
      <div className="flex flex-col items-center text-center max-w-sm mx-auto">
        <div className="w-12 h-12 rounded-full border-2 border-haven-ai border-t-transparent animate-spin mb-6" />
        <p className="text-base font-semibold text-haven-text mb-2">AI Exercise Planner</p>
        <p className="text-sm text-haven-secondary mb-6">Analyzing your environment and history to generate the optimal exercise.</p>
        <div className="space-y-2 w-full text-left">
          {steps.map((s, i) => (
            <div key={s} className={cn('flex items-center gap-2.5 transition-opacity duration-300', i > step ? 'opacity-30' : 'opacity-100')}>
              {i < step ? (
                <CheckCircle size={14} className="text-haven-success flex-shrink-0" />
              ) : i === step ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-haven-ai border-t-transparent animate-spin flex-shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-haven-border flex-shrink-0" />
              )}
              <span className="text-xs text-haven-secondary">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
