import { Router } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.js';
import { requireRole } from '../middleware/auth.js';
import { AppRequest } from '../types/index.js';

export const outcomeRouter = Router();

const createOutcomeReviewSchema = z.object({
  roadmap_item_id: z.string().optional(),
  prd_id: z.string().optional(),
  title: z.string().min(3, 'O título da revisão deve ter no mínimo 3 caracteres').max(255),
  metric_name: z.string().min(1, 'Nome da métrica é obrigatório'),
  baseline_value: z.string().default(''),
  target_value: z.string().default(''),
  actual_value: z.string().default(''),
  timeframe_days: z.number().min(1).default(30),
  status: z.enum(['exceeded', 'on_target', 'below_target', 'inconclusive']).optional(),
  what_we_expected: z.string().optional(),
  what_happened: z.string().optional(),
  what_we_learned: z.string().optional(),
  next_actions: z.string().optional(),
  refeed_to_discovery: z.boolean().optional(),
});

// GET /api/outcomes
outcomeRouter.get('/', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const list = await dbStore.listOutcomeReviews(workspaceId);
    res.json({ data: list });
  } catch (error) {
    next(error);
  }
});

// POST /api/outcomes (member+)
outcomeRouter.post('/', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = createOutcomeReviewSchema.parse(req.body);
    const created = await dbStore.createOutcomeReview(workspaceId, validated);

    await dbStore.logActivity(workspaceId, {
      entity_type: 'outcome_review',
      entity_id: created.id,
      action: 'reviewed',
      actor: { uid: req.user!.uid, email: req.user!.email, name: req.user!.name },
      details: { title: created.title, status: created.status },
    });

    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/outcomes/:id (admin+)
outcomeRouter.delete('/:id', requireRole(['owner', 'admin']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    await dbStore.deleteOutcomeReview(workspaceId, req.params.id as string);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});
