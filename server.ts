import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { healthRouter } from './server/routes/health.routes.js';
import { authRouter } from './server/routes/auth.routes.js';
import { workspaceRouter } from './server/routes/workspace.routes.js';
import { researchRouter } from './server/routes/research.routes.js';
import { evidenceRouter } from './server/routes/evidence.routes.js';
import { problemRouter } from './server/routes/problem.routes.js';
import { opportunityRouter } from './server/routes/opportunity.routes.js';
import { hypothesisRouter } from './server/routes/hypothesis.routes.js';
import { experimentRouter } from './server/routes/experiment.routes.js';
import { decisionRouter } from './server/routes/decision.routes.js';
import { roadmapRouter } from './server/routes/roadmap.routes.js';
import { intelligenceRouter } from './server/routes/intelligence.routes.js';
import { devAdminRouter } from './server/routes/devAdmin.routes.js';
import { strategyRouter } from './server/routes/strategy.routes.js';
import { prioritizationRouter } from './server/routes/prioritization.routes.js';
import { personasRouter } from './server/routes/personas.routes.js';
import { prdRouter } from './server/routes/prd.routes.js';
import { outcomeRouter } from './server/routes/outcome.routes.js';
import { collaborationRouter } from './server/routes/collaboration.routes.js';
import { toolkitRouter } from './server/routes/toolkit.routes.js';
import { dashboardRouter } from './server/routes/dashboard.routes.js';
import { dbReadyPromise } from './src/db/index.js';

async function startServer() {
  await dbReadyPromise;
  // In production, DATABASE_URL must be strictly set
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.error('FATAL: A variável de ambiente DATABASE_URL é obrigatória em produção.');
    process.exit(1);
  }

  const app = express();
  const PORT = 3000;

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [process.env.APP_URL || 'http://localhost:3000'].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (such as same-origin, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        // Allow development, Cloud Run preview domains, and localhost
        if (
          origin.startsWith('http://localhost') ||
          origin.startsWith('http://127.0.0.1') ||
          origin.endsWith('.run.app') ||
          origin.endsWith('.googleusercontent.com') ||
          process.env.NODE_ENV !== 'production'
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
    })
  );
  app.use(express.json());

  // Mount API Routes
  app.use('/api', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/dev-admin', devAdminRouter);
  app.use('/api/workspaces', workspaceRouter);
  app.use('/api/researches', researchRouter);
  app.use('/api/evidences', evidenceRouter);
  app.use('/api/problems', problemRouter);
  app.use('/api/opportunities', opportunityRouter);
  app.use('/api/hypotheses', hypothesisRouter);
  app.use('/api/experiments', experimentRouter);
  app.use('/api/decisions', decisionRouter);
  app.use('/api/roadmap', roadmapRouter);
  app.use('/api/strategy', strategyRouter);
  app.use('/api/prioritization', prioritizationRouter);
  app.use('/api/personas', personasRouter);
  app.use('/api/prds', prdRouter);
  app.use('/api/outcomes', outcomeRouter);
  app.use('/api/collaboration', collaborationRouter);
  app.use('/api/toolkit', toolkitRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/workspaces/:workspaceId/intelligence', intelligenceRouter);


  // Vite middleware for dev or static server for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
