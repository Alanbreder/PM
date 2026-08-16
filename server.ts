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
import { intelligenceRouter } from './server/routes/intelligence.routes.js';

async function startServer() {
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
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('CORS policy: origin not allowed'), false);
      },
      credentials: true,
    })
  );
  app.use(express.json());

  // Mount API Routes
  app.use('/api', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/workspaces', workspaceRouter);
  app.use('/api/researches', researchRouter);
  app.use('/api/evidences', evidenceRouter);
  app.use('/api/problems', problemRouter);
  app.use('/api/opportunities', opportunityRouter);
  app.use('/api/hypotheses', hypothesisRouter);
  app.use('/api/experiments', experimentRouter);
  app.use('/api/decisions', decisionRouter);
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
