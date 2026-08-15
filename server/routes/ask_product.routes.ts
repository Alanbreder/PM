import { Router, Request, Response } from 'express';
import { authenticate, requireWorkspace } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rate_limit.js';
import { dbStore } from '../db/store.js';
import { askProductAssistant } from '../services/gemini.service.js';
import { askProductSchema } from '../schemas/index.js';

export const askProductRouter = Router();

askProductRouter.post(
  '/ask-product',
  authenticate,
  requireWorkspace,
  aiRateLimiter,
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;

    const parseResult = askProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: parseResult.error.issues[0]?.message || 'A pergunta informada é inválida.',
      });
      return;
    }

    const { prompt } = parseResult.data;

    try {
      const ws = await dbStore.getWorkspaceById(workspaceId);
      const problems = await dbStore.listProblems(workspaceId);
      const opportunities = await dbStore.listOpportunities(workspaceId);
      const evidences = await dbStore.listEvidences(workspaceId);

      // Bound contextual lists to prevent prompt inflation
      const topProblems = problems.slice(0, 5).map((p) => p.title.substring(0, 120));

      const answer = await askProductAssistant(prompt, ws?.name || 'SIP Workspace', {
        problemsCount: Math.min(problems.length, 1000),
        opportunitiesCount: Math.min(opportunities.length, 1000),
        evidencesCount: Math.min(evidences.length, 1000),
        topProblems,
      });

      res.json({
        success: true,
        answer,
      });
    } catch (error: any) {
      console.error('Ask Product error:', error instanceof Error ? error.message : 'Erro no processamento de IA');
      res.status(500).json({
        success: false,
        error: 'AI_SERVICE_ERROR',
        message: error instanceof Error ? error.message : 'Erro ao processar consulta no assistente de produto.',
      });
    }
  }
);

