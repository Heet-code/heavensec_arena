// ============================================================
// API CLIENT
// ============================================================

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Exercises
  getExercises: () => request('/exercises'),
  getExercise: (id: string) => request(`/exercises/${id}`),
  createExercise: (data: Record<string, unknown>) =>
    request('/exercises', { method: 'POST', body: JSON.stringify(data) }),
  startExercise: (id: string) =>
    request(`/exercises/${id}/start`, { method: 'POST' }),
  stopExercise: (id: string) =>
    request(`/exercises/${id}/stop`, { method: 'POST' }),
  getTelemetry: (id: string) => request(`/exercises/${id}/telemetry`),
  getIncidents: (id: string) => request(`/exercises/${id}/incidents`),
  getScore: (id: string) => request(`/exercises/${id}/score`),
  getCoach: (id: string) => request(`/exercises/${id}/coach`),
  getReplay: (id: string) => request(`/exercises/${id}/replay`),

  // Agents
  getAgents: () => request('/agents'),

  // Scenarios
  getScenarios: () => request('/scenarios'),
  getEnvironment: () => request('/scenarios/environment'),
  generateScenario: () => request('/scenarios/generate', { method: 'POST' }),

  // Incidents
  getIncident: (id: string) => request(`/incidents/${id}`),
};
