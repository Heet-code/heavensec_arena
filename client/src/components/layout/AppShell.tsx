import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Swords, ShieldAlert, Shield,
  Activity, AlertTriangle, Scale, FileText, Settings,
  Menu, X, Play, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/format';
import { StatusDot, Button } from '@/components/ui';
import { useArena } from '@/contexts/ArenaContext';
import { LAB_NOTICE, ORGANIZATION } from '@/data/environment';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  '/app': LayoutDashboard,
  '/app/scenarios': BookOpen,
  '/app/arena': Swords,
  '/app/red-team': ShieldAlert,
  '/app/blue-team': Shield,
  '/app/telemetry': Activity,
  '/app/incidents': AlertTriangle,
  '/app/referee': Scale,
  '/app/reports': FileText,
  '/app/settings': Settings,
};

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-haven-bg">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-haven-navy/40 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          'flex min-h-screen flex-col transition-[margin] duration-200',
          collapsed ? 'lg:ml-16' : 'lg:ml-60'
        )}
      >
        <Topbar
          sidebarCollapsed={collapsed}
          onMenu={() => setMobileOpen(true)}
        />
        <main className="flex-1 pt-14">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-haven-border bg-haven-surface',
        'transition-transform duration-200 lg:translate-x-0',
        collapsed ? 'lg:w-16' : 'lg:w-60',
        'w-60',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="flex h-14 items-center gap-2.5 border-b border-haven-border px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-haven-navy text-white">
          <ShieldCheck size={16} strokeWidth={2.25} />
        </div>
        {(!collapsed || mobileOpen) && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-haven-text">HavenSec Arena</p>
            <p className="text-2xs uppercase tracking-[0.14em] text-haven-muted">Cyber range</p>
          </div>
        )}
        <button
          type="button"
          className="rounded-md p-1 text-haven-muted hover:bg-haven-bg lg:hidden"
          onClick={onMobileClose}
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.to] ?? LayoutDashboard;
          const active = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              onClick={onMobileClose}
              title={collapsed ? item.label : undefined}
              className={cn(
                'mb-0.5 flex items-center gap-2.5 rounded-md text-sm font-medium transition-colors',
                collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
                active
                  ? 'bg-haven-primary-light text-haven-primary'
                  : 'text-haven-secondary hover:bg-haven-bg hover:text-haven-text'
              )}
            >
              <Icon size={16} strokeWidth={active ? 2.25 : 1.75} className="shrink-0" />
              {(!collapsed || mobileOpen) && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="hidden border-t border-haven-border p-2 lg:block">
        <button
          type="button"
          onClick={onToggle}
          className="w-full rounded-md px-2 py-2 text-2xs font-medium text-haven-muted hover:bg-haven-bg"
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>
    </aside>
  );
}

function Topbar({ sidebarCollapsed, onMenu }: { sidebarCollapsed: boolean; onMenu: () => void }) {
  const navigate = useNavigate();
  const { activeExercise, simulationPolling, paused, apiOnline, usingLocalEngine } = useArena();

  const statusLabel = !activeExercise
    ? 'No active simulation'
    : paused
      ? 'Paused'
      : activeExercise.status === 'running'
        ? 'Simulation running'
        : activeExercise.status === 'completed'
          ? 'Evaluation complete'
          : activeExercise.status === 'stopped'
            ? 'Stopped'
            : 'Ready';

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-haven-border bg-haven-surface px-3 sm:px-5',
        'left-0 lg:left-auto',
        sidebarCollapsed ? 'lg:left-16' : 'lg:left-60'
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="rounded-md p-2 text-haven-text hover:bg-haven-bg lg:hidden"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <StatusDot
          color={activeExercise?.status === 'running' && !paused ? 'green' : activeExercise ? 'amber' : 'gray'}
          pulse={!!(simulationPolling && !paused)}
        />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-haven-text">{statusLabel}</p>
          <p className="hidden truncate text-2xs text-haven-muted sm:block">
            {activeExercise ? `${activeExercise.scenarioName} · Exercise #${activeExercise.number}` : ORGANIZATION.environment}
            {usingLocalEngine ? ' · Local prototype engine' : ''}
            {apiOnline === false ? ' · API offline' : ''}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="secondary" size="sm" icon={<Play size={12} />} onClick={() => navigate('/app/scenarios')}>
          <span className="hidden sm:inline">New simulation</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
    </header>
  );
}

export function LabBanner() {
  return (
    <p className="rounded-md border border-haven-border bg-haven-surface px-3 py-2 text-xs text-haven-secondary">
      {LAB_NOTICE}
    </p>
  );
}
