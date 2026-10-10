import { Router } from 'express';
import { ExerciseService } from '../services/ExerciseService';
import { TelemetryService } from '../services/TelemetryService';
import { IncidentService } from '../services/IncidentService';
import { ScoringService } from '../services/ScoringService';
import { CoachService } from '../services/CoachService';
import { ReplayService } from '../services/ReplayService';

const router = Router();

router.get('/', (_req, res) => {
  res.json(ExerciseService.getAll());
});

router.post('/', (req, res) => {
  try {
    const exercise = ExerciseService.create(req.body);
    res.status(201).json(exercise);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create exercise' });
  }
});

router.get('/:id', (req, res) => {
  const exercise = ExerciseService.getById(req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
  res.json(exercise);
});

router.post('/:id/start', (req, res) => {
  const exercise = ExerciseService.start(req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
  res.json(exercise);
});

router.post('/:id/stop', (req, res) => {
  const exercise = ExerciseService.stop(req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
  res.json(exercise);
});

router.get('/:id/telemetry', (req, res) => {
  res.json(TelemetryService.getByExercise(req.params.id));
});

router.get('/:id/incidents', (req, res) => {
  res.json(IncidentService.getByExercise(req.params.id));
});

router.get('/:id/score', (req, res) => {
  const score = ScoringService.getByExercise(req.params.id);
  if (!score) return res.status(404).json({ error: 'Score not yet available' });
  res.json(score);
});

router.get('/:id/coach', (req, res) => {
  const coach = CoachService.getByExercise(req.params.id);
  if (!coach) return res.status(404).json({ error: 'Coach recommendation not yet available' });
  res.json(coach);
});

router.get('/:id/replay', (req, res) => {
  const replay = ReplayService.getByExercise(req.params.id);
  if (!replay) return res.status(404).json({ error: 'Replay not yet available' });
  res.json(replay);
});

export default router;
