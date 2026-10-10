import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FlaskConical, Swords, Network,
  Bot, Activity, AlertTriangle, History,
  GraduationCap, FileText, Shield, Bell,
  ChevronLeft, ChevronRight, Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusDot, Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui';
import { useArena } from '@/contexts/ArenaContext';

// ============================================================
// NAV ITEMS
// ============================================================

const NAV_ITEMS = [
  { to: '/',         label: 'Overview',        icon: LayoutDashboard, exact: true },
  { to: '/setup',    label: 'Arena Setup',      icon: FlaskConical },
  { to: '/arena',    label: 'Live Arena',       icon: Swords },
  { to: '/graph',    label: 'Attack Graph',     icon: Network },
  { to: '/agents',   label: 'Agents',           icon: Bot },
  { to: '/telemetry',label: 'Telemetry',        icon: Activity },
  { to: '/incidents',label: 'Incidents',        icon: AlertTriangle },
  { to: '/replay',   label: 'Replay',           icon: History },
  { to: '/coach',    label: 'Security Coach',   icon: GraduationCap },
  { to: '/reports',  label: 'Reports',          icon: FileText },
];

// ============================================================
// SIDEBAR
// ============================================================

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50',
          'bg-white border-r border-haven-border',
          'flex flex-col overflow-x-hidden',
          'transition-[width] duration-200 ease-in-out',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className="h-14 px-4 border-b border-haven-border flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-haven-primary to-haven-ai flex items-center justify-center flex-shrink-0">
            <Shield size={14} className="text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-haven-text leading-none">HavenSec</p>
              <p className="text-2xs text-haven-muted font-semibold tracking-widest mt-0.5">ARENA</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname.startsWith(to);

            const linkEl = (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-2.5 rounded-md mb-0.5 transition-all duration-100',
                  'text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haven-primary',
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
                  isActive
                    ? 'bg-haven-primary-light text-haven-primary'
                    : 'text-haven-secondary hover:bg-haven-bg hover:text-haven-text'
                )}
              >
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className="flex-shrink-0"
                />
                {!collapsed && label}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={to}>
                  <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              );
            }
            return linkEl;
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-haven-border">
          <button
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'w-full flex items-center rounded-md p-2 transition-colors duration-100',
              'text-haven-muted hover:bg-haven-bg hover:text-haven-secondary',
              collapsed ? 'justify-center' : 'justify-end'
            )}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

// ============================================================
// TOPBAR
// ============================================================

interface TopBarProps {
  sidebarCollapsed: boolean;
}

export function TopBar({ sidebarCollapsed }: TopBarProps) {
  const navigate = useNavigate();
  const { activeExercise, simulationPolling } = useArena();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-14 z-40',
        'bg-white border-b border-haven-border',
        'flex items-center justify-between px-5',
        'transition-[left] duration-200 ease-in-out',
        sidebarCollapsed ? 'left-16' : 'left-60'
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0">
        <StatusDot color="green" pulse />
        <span className="text-xs font-medium text-haven-secondary truncate">
          Acme Digital Platform
        </span>
        {activeExercise && (
          <>
            <span className="text-haven-border-strong text-xs">·</span>
            <span className={cn(
              'text-xs font-medium truncate',
              activeExercise.status === 'running' ? 'text-haven-primary' : 'text-haven-muted'
            )}>
              Exercise #{activeExercise.number}
              {simulationPolling && (
                <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-haven-primary animate-pulse" />
              )}
            </span>
          </>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* New Exercise shortcut */}
        <button
          onClick={() => navigate('/setup')}
          className="h-8 px-3 flex items-center gap-1.5 rounded-md text-xs font-medium text-haven-secondary border border-haven-border hover:bg-haven-bg hover:text-haven-text transition-colors duration-100 mr-2"
        >
          <Play size={11} />
          New Exercise
        </button>

        {/* Notification */}
        <button
          aria-label="Notifications"
          className="relative w-8 h-8 flex items-center justify-center rounded-md text-haven-secondary hover:bg-haven-bg transition-colors duration-100"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-haven-red border border-white" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2 pl-2 ml-1 border-l border-haven-border">
          <div className="w-7 h-7 rounded-full bg-haven-primary flex items-center justify-center text-white text-2xs font-bold select-none">
            AD
          </div>
          <span className="text-xs font-medium text-haven-text hidden sm:block">Acme Digital</span>
        </div>
      </div>
    </header>
  );
}
