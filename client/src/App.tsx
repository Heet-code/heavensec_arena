import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ArenaProvider } from './contexts/ArenaContext';
import { AppShell } from './components/layout/AppShell';
import LandingPage from './pages/Landing';
import OverviewPage from './pages/Overview';
import ScenariosPage from './pages/Scenarios';
import ArenaPage from './pages/Arena';
import RedTeamPage from './pages/RedTeam';
import BlueTeamPage from './pages/BlueTeam';
import TelemetryPage from './pages/Telemetry';
import IncidentsPage from './pages/Incidents';
import RefereePage from './pages/Referee';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';

export default function App() {
  return (
    <ArenaProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="scenarios" element={<ScenariosPage />} />
          <Route path="arena" element={<ArenaPage />} />
          <Route path="red-team" element={<RedTeamPage />} />
          <Route path="blue-team" element={<BlueTeamPage />} />
          <Route path="telemetry" element={<TelemetryPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="incidents/:id" element={<IncidentsPage />} />
          <Route path="referee" element={<RefereePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/setup" element={<Navigate to="/app/scenarios" replace />} />
        <Route path="/arena" element={<Navigate to="/app/arena" replace />} />
        <Route path="/graph" element={<Navigate to="/app/arena" replace />} />
        <Route path="/agents" element={<Navigate to="/app/red-team" replace />} />
        <Route path="/telemetry" element={<Navigate to="/app/telemetry" replace />} />
        <Route path="/incidents" element={<Navigate to="/app/incidents" replace />} />
        <Route path="/replay" element={<Navigate to="/app/arena" replace />} />
        <Route path="/coach" element={<Navigate to="/app/referee" replace />} />
        <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ArenaProvider>
  );
}
