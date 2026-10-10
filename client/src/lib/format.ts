export const NAV_ITEMS = [
  { to: '/app', label: 'Overview', end: true },
  { to: '/app/scenarios', label: 'Scenarios' },
  { to: '/app/arena', label: 'Simulation Arena' },
  { to: '/app/red-team', label: 'Red Team' },
  { to: '/app/blue-team', label: 'Blue Team' },
  { to: '/app/telemetry', label: 'Telemetry' },
  { to: '/app/incidents', label: 'Incidents' },
  { to: '/app/referee', label: 'Referee' },
  { to: '/app/reports', label: 'Reports' },
  { to: '/app/settings', label: 'Settings' },
] as const;

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour12: false });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

export function mmss(seconds: number) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function scoreTone(score: number): 'good' | 'ok' | 'weak' {
  if (score >= 80) return 'good';
  if (score >= 65) return 'ok';
  return 'weak';
}
