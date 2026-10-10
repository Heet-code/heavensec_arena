import { Router } from 'express';
import { AgentService } from '../services/AgentService';

const router = Router();

router.get('/', (_req, res) => {
  res.json(AgentService.getAll());
});

router.get('/:id', (req, res) => {
  const agent = AgentService.getById(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

export default router;
