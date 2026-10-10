import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, PhaseLabel } from '@/components/ui';
import { useArena } from '@/contexts/ArenaContext';
import type { Incident } from '@/types';

const ATTACK_PHASES: Record<string, string[]> = {
  running: ['WEB-01'], detecting: ['WEB-01','AUTH-01'],
  investigating: ['AUTH-01','API-01'], responding: ['AUTH-01','API-01'],
  containing: ['API-01'], evaluating: [], completed: [],
};

export default function AttackGraphPage() {
  const { activeExercise, incidents } = useArena();
  const phase = activeExercise?.currentPhase ?? 'created';

  const affected  = new Set(incidents.flatMap(i => i.affectedAssets));
  const contained = new Set(incidents.filter(i => ['contained','resolved'].includes(i.status)).flatMap(i => i.affectedAssets));
  const inAttack  = new Set(ATTACK_PHASES[phase] ?? []);

  const nodes = [
    { id: 'internet', label: 'Internet', sub: 'External Origin', x: 400, y: 40,  type: 'ext' },
    { id: 'WEB-01',  label: 'WEB-01',  sub: '10.0.1.10 · HTTPS', x: 400, y: 140, type: 'web' },
    { id: 'AUTH-01', label: 'AUTH-01', sub: '10.0.2.10 · OAuth2', x: 220, y: 250, type: 'auth' },
    { id: 'API-01',  label: 'API-01',  sub: '10.0.1.20 · REST',   x: 400, y: 250, type: 'api' },
    { id: 'FILE-01', label: 'FILE-01', sub: '10.0.3.20 · SMB',    x: 580, y: 250, type: 'file' },
    { id: 'DB-01',   label: 'DB-01',   sub: '10.0.3.10 · Postgres',x:400, y: 360, type: 'db' },
  ];
  const edges = [
    { f: 'internet', t: 'WEB-01',  label: 'HTTP/S' },
    { f: 'WEB-01',  t: 'AUTH-01',  label: 'Auth flow' },
    { f: 'WEB-01',  t: 'API-01',   label: 'API calls' },
    { f: 'WEB-01',  t: 'FILE-01',  label: 'File access' },
    { f: 'API-01',  t: 'DB-01',    label: 'Queries' },
  ];

  const fill  = (id: string) => contained.has(id) ? '#f0fdf4' : affected.has(id) ? '#fff1f2' : '#fff';
  const strokeColor = (id: string) => contained.has(id) ? '#16a34a' : inAttack.has(id) ? '#ef4444' : '#e5e7eb';

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-haven-text">Attack Graph</h1>
          <p className="text-sm text-haven-secondary mt-1">Synthetic environment topology with attack path visualization</p>
        </div>
        {activeExercise && (
          <div className="flex gap-2">
            <PhaseLabel phase={phase} />
            <Badge variant="default">Exercise #{activeExercise.number}</Badge>
          </div>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Legend */}
        <div className="border-b border-haven-border px-5 py-3 flex gap-5 flex-wrap">
          {[
            { color: '#e5e7eb', fill: '#fff',    label: 'Normal' },
            { color: '#fecaca', fill: '#fff1f2',  label: 'Affected' },
            { color: '#16a34a', fill: '#f0fdf4',  label: 'Contained' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: l.fill, border: `1.5px solid ${l.color}` }} />
              <span className="text-xs text-haven-secondary">{l.label}</span>
            </div>
          ))}
          {activeExercise?.status === 'running' && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-300 border-dashed" />
              <span className="text-xs text-haven-red font-medium">Active attack path</span>
            </div>
          )}
        </div>

        {/* SVG graph */}
        <div className="p-6 overflow-x-auto">
          <svg viewBox="0 0 800 440" className="w-full max-h-[440px]">
            <defs>
              <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0,8 3,0 6" fill="#d1d5db" />
              </marker>
              <marker id="arr-att" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0,8 3,0 6" fill="#fca5a5" />
              </marker>
            </defs>

            {edges.map(({ f, t, label }) => {
              const fn = nodes.find(n => n.id === f)!;
              const tn = nodes.find(n => n.id === t)!;
              const atk = inAttack.has(f) && (affected.has(t) || inAttack.has(t));
              const dx = tn.x - fn.x, dy = tn.y - fn.y;
              const len = Math.sqrt(dx*dx + dy*dy);
              const mx = (fn.x + tn.x) / 2;
              const my = (fn.y + tn.y) / 2;
              return (
                <g key={`${f}-${t}`}>
                  <line
                    x1={fn.x + dx/len*52} y1={fn.y + dy/len*22}
                    x2={tn.x - dx/len*52} y2={tn.y - dy/len*22}
                    stroke={atk ? '#fca5a5' : '#e5e7eb'} strokeWidth={atk ? 2 : 1.5}
                    strokeDasharray={atk ? '8,4' : undefined}
                    markerEnd={atk ? 'url(#arr-att)' : 'url(#arr)'}
                  />
                  <text x={mx} y={my - 6} textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="Inter,sans-serif">{label}</text>
                </g>
              );
            })}

            {nodes.map(n => (
              <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                {inAttack.has(n.id) && (
                  <rect x="-56" y="-28" width="112" height="56" rx="12" fill="none" stroke="#fca5a5" strokeWidth="1.5">
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
                  </rect>
                )}
                <rect x="-52" y="-24" width="104" height="48" rx="8"
                  fill={fill(n.id)} stroke={strokeColor(n.id)} strokeWidth="1.5"
                  style={{ filter: 'drop-shadow(0 1px 3px rgb(0 0 0 / 0.07))' }}
                />
                <text textAnchor="middle" dy="-4" fontSize="12" fontWeight="600"
                  fill={n.id === 'internet' ? '#9ca3af' : '#1f2328'} fontFamily="Inter,sans-serif">
                  {n.label}
                </text>
                <text textAnchor="middle" dy="11" fontSize="9" fill="#9ca3af" fontFamily="'JetBrains Mono',monospace">
                  {n.sub}
                </text>
                {contained.has(n.id) && <circle cx="48" cy="-18" r="6" fill="#16a34a" />}
                {affected.has(n.id) && !contained.has(n.id) && (
                  <circle cx="48" cy="-18" r="6" fill="#ef4444">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            ))}
          </svg>
        </div>
      </Card>

      {incidents.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-haven-text mb-3">Active Incidents</p>
          <div className="space-y-2">
            {incidents.map(inc => (
              <Card key={inc.id} className="p-3 flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-medium text-haven-text">{inc.title}</span>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {inc.affectedAssets.map(a => <Badge key={a} variant="default">{a}</Badge>)}
                  </div>
                </div>
                <Badge variant={inc.status === 'contained' ? 'success' : inc.status === 'investigating' ? 'warning' : 'danger'}>
                  {inc.status}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
