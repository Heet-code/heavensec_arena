import { agentStore } from '../data/seed';
import type { Agent } from '../types/index';

export const AgentService = {
  getAll(): Agent[] {
    return Array.from(agentStore.values());
  },

  getById(id: string): Agent | undefined {
    return agentStore.get(id);
  },

  resetAll(): void {
    agentStore.forEach((agent) => {
      agent.status = 'idle';
      agent.currentTask = null;
      agent.lastAction = null;
      agent.lastActionAt = null;
      agentStore.set(agent.id, agent);
    });
  },
};
