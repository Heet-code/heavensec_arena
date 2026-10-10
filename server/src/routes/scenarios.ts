import { Router } from 'express';
import { ScenarioService } from '../services/ScenarioService';

const router = Router();

router.get('/', (_req, res) => {
  res.json(ScenarioService.getAll());
});

router.get('/environment', (_req, res) => {
  res.json(ScenarioService.getEnvironment());
});

router.get('/:id', (req, res) => {
  const scenario = ScenarioService.getById(req.params.id);
  if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
  res.json(scenario);
});

// AI-generated scenario (mock)
router.post('/generate', (_req, res) => {
  // Mock AI provider returns the recommended scenario based on historical weakness
  res.json({
    scenario: ScenarioService.getById('scenario-api-security'),
    recommendation: {
      reason: 'Your previous exercise showed strong authentication detection (91%) but weaker API anomaly investigation and containment (61%). An API-focused exercise will directly address these gaps.',
      focusAreas: ['Containment Automation', 'API Investigation Depth'],
      confidence: 0.94,
      basedOn: [
        'Previous exercises analysis',
        'Containment score trend: 63 → 74 → 61',
        'Current environment: API-01 has exposed endpoints',
        'Agent capability assessment',
        'Threat intelligence: API abuse is a top-3 attack vector for web platforms',
      ],
    },
  });
});

export default router;
