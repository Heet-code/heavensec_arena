import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import agentsRouter from './routes/agents';
import scenariosRouter from './routes/scenarios';
import exercisesRouter from './routes/exercises';
import incidentsRouter from './routes/incidents';

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5174,http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'havensec-arena-api', version: '1.0.0' });
});

// API routes
app.use('/api/agents', agentsRouter);
app.use('/api/scenarios', scenariosRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/incidents', incidentsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🛡️  HavenSec Arena API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Docs:   Synthetic environment loaded — Acme Digital Platform\n`);
});

export default app;
