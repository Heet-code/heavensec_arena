import React, { useEffect } from 'react';
import { Bot, Cpu, Swords, Shield, Scale, GraduationCap, Eye } from 'lucide-react';
import { Card, Badge, StatusDot, ProgressBar } from '@/components/ui';
import { useArena } from '@/contexts/ArenaContext';
import type { Agent } from '@/types';
import { cn } from '@/lib/utils';

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  orchestrator:    { label: 'Orchestrator',    color: '#7c5cd8', bg: 'bg-violet-50', icon: <Cpu size={14} /> },
  'red-team':      { label: 'Red Team',        color: '#dc2626', bg: 'bg-red-50',    icon: <Swords size={14} /> },
  'blue-team':     { label: 'Blue Team',       color: '#3b82d4', bg: 'bg-blue-50',   icon: <Shield size={14} /> },
  referee:         { label: 'Referee',         color: '#d97706', bg: 'bg-amber-50',  icon: <Scale size={14} /> },
  'security-coach':{ label: 'Security Coach',  color: '#16a34a', bg: 'bg-green-50',  icon: <GraduationCap size={14} /> },
  research:        { label: 'Research',        color: '#0891b2', bg: 'bg-cyan-50',   icon: <Eye size={14} /> },
};

const STATUS_DOT: Record<Agent['status'], 'gray' | 'amber' | 'green' | 'red'> = {
  idle: 'gray', thinking: 'amber', running: 'green', waiting: 'amber', completed: 'green', error: 'red',
};
const STATUS_BADGE: Record<Agent['status'], 'default' | 'warning' | 'primary' | 'success' | 'danger'> = {
  idle: 'default', thinking: 'warning', running: 'primary', waiting: 'warning', completed: 'success', error: 'danger',
};

const GROUPS: [string, string[]][] = [
  ['orchestrator', ['agent-orchestrator']],
  ['red-team',     ['agent-red-alpha', 'agent-red-beta']],
  ['blue-team',    ['agent-blue-sentinel', 'agent-investigation-analyst', 'agent-response-commander']],
  ['referee',      ['agent-referee']],
  ['security-coach',['agent-security-coach']],
];

export default function AgentsPage() {
  const { agents, loadAgents } = useArena();

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 3000);
    return () => clearInterval(interval);
  }, []);

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]));

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-haven-text">Agent System</h1>
        <p className="text-sm text-haven-secondary mt-1">AI agents coordinating the cyber-resilience exercise lifecycle</p>
      </div>

      {GROUPS.map(([type, ids]) => {
        const meta = TYPE_META[type] ?? { label: type, color: '#9ca3af', bg: 'bg-gray-50', icon: <Bot size={14} /> };
        const groupAgents = ids.map(id => agentMap[id]).filter(Boolean) as Agent[];
        if (groupAgents.length === 0) return null;

        return (
          <div key={type}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', meta.bg)} style={{ color: meta.color }}>
                {meta.icon}
              </div>
              <h2 className="text-base font-semibold text-haven-text">{meta.label}</h2>
              <span className="text-xs text-haven-muted">({groupAgents.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {groupAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} meta={meta} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AgentCard({ agent, meta }: { agent: Agent; meta: typeof TYPE_META[string] }) {
  const isActive = agent.status === 'running';

  return (
    <Card className={cn('p-5 transition-all duration-200', isActive && 'border-opacity-60')}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', meta.bg)} style={{ color: meta.color }}>
            <Bot size={15} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-haven-text leading-tight truncate">{agent.name}</p>
            <p className="text-2xs text-haven-muted">{meta.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusDot color={STATUS_DOT[agent.status]} pulse={isActive} />
          <Badge variant={STATUS_BADGE[agent.status]}>{agent.status}</Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-haven-secondary leading-relaxed mb-3 truncate-2">{agent.description}</p>

      {/* Current task */}
      {agent.currentTask && (
        <div className="bg-haven-bg rounded-md px-3 py-2 mb-3">
          <p className="text-2xs font-semibold text-haven-muted uppercase tracking-wider mb-0.5">Current Task</p>
          <p className="text-xs text-haven-text">{agent.currentTask}</p>
        </div>
      )}

      {/* Last action */}
      {agent.lastAction && (
        <div className="mb-3">
          <p className="text-2xs font-semibold text-haven-muted uppercase tracking-wider mb-0.5">Last Action</p>
          <p className="text-xs text-haven-secondary">{agent.lastAction}</p>
        </div>
      )}

      {/* Capabilities */}
      <div className="mb-3">
        <p className="text-2xs font-semibold text-haven-muted uppercase tracking-wider mb-1.5">Capabilities</p>
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.map(cap => (
            <Badge key={cap} variant="outline">{cap}</Badge>
          ))}
        </div>
      </div>

      {/* Confidence */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-2xs font-semibold text-haven-muted uppercase tracking-wider">Confidence</span>
          <span className="text-xs font-bold" style={{ color: meta.color }}>{agent.confidence}%</span>
        </div>
        <ProgressBar value={agent.confidence} color={meta.color} height="h-1.5" />
      </div>
    </Card>
  );
}
