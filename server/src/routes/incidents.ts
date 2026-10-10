import { Router } from 'express';
import { IncidentService } from '../services/IncidentService';

const router = Router();

router.get('/:id', (req, res) => {
  const incident = IncidentService.getById(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json(incident);
});

export default router;
